import { Store } from './store.js';
import { uid } from '../utils/format.js';
import { formatDateRange } from '../utils/dates.js';

export function toggleFavorite(destId) {
  Store.setState(s => {
    const has = s.favorites.includes(destId);
    return { favorites: has ? s.favorites.filter(id => id !== destId) : [...s.favorites, destId] };
  });
}

export function addTrip(trip) {
  Store.setState(s => ({
    trips: [...s.trips, trip],
    activeTripId: trip.id,
    notifications: [
      { id: uid('notif'), type: 'trip', title: `${trip.place} trip confirmed`, body: `${formatDateRange(trip.startDate, trip.endDate)}`, time: Date.now(), read: false },
      ...s.notifications,
    ].slice(0, 30),
  }));
}

export function setActiveTrip(tripId) {
  Store.setState({ activeTripId: tripId });
}

export function removeStop(tripId, dayNum, stopId) {
  Store.setState(s => ({
    trips: s.trips.map(t => {
      if (t.id !== tripId) return t;
      return { ...t, days: { ...t.days, [dayNum]: (t.days[dayNum] || []).filter(st => st.id !== stopId) } };
    }),
  }));
}

export function addStop(tripId, dayNum, stop) {
  Store.setState(s => ({
    trips: s.trips.map(t => {
      if (t.id !== tripId) return t;
      const stops = [...(t.days[dayNum] || [])];
      const insertAt = stops.findIndex(st => st.time > stop.time);
      if (insertAt === -1) stops.push(stop); else stops.splice(insertAt, 0, stop);
      return { ...t, days: { ...t.days, [dayNum]: stops } };
    }),
  }));
}

export function reorderStops(tripId, dayNum, orderedIds) {
  Store.setState(s => ({
    trips: s.trips.map(t => {
      if (t.id !== tripId) return t;
      const byId = new Map((t.days[dayNum] || []).map(st => [st.id, st]));
      return { ...t, days: { ...t.days, [dayNum]: orderedIds.map(id => byId.get(id)).filter(Boolean) } };
    }),
  }));
}

export function addEmergencyContact(contact) {
  Store.setState(s => ({ emergencyContacts: [...s.emergencyContacts, contact] }));
}

export function removeEmergencyContact(contactId) {
  Store.setState(s => ({ emergencyContacts: s.emergencyContacts.filter(c => c.id !== contactId) }));
}

export function sendSOS(contactNames) {
  const msg = `SOS alert sent to ${contactNames}`;
  Store.setState(s => ({
    safetyActivity: [{ id: uid('act'), icon: '🆘', text: msg, time: Date.now() }, ...s.safetyActivity].slice(0, 20),
    notifications: [
      { id: uid('notif'), type: 'safety', title: 'SOS alert sent', body: `Your live location was shared with ${contactNames}.`, time: Date.now(), read: false },
      ...s.notifications,
    ].slice(0, 30),
  }));
}

export function addSafetyActivity(icon, text) {
  Store.setState(s => ({
    safetyActivity: [{ id: uid('act'), icon, text, time: Date.now() }, ...s.safetyActivity].slice(0, 20),
  }));
}

export function postReview({ destinationId, stars, text, profileName, pendingTripId }) {
  Store.setState(s => {
    const post = {
      id: uid('post'), type: 'review', destinationId, authorIsMe: true,
      authorName: profileName, authorAvatar: null,
      stars, text, img: null, time: Date.now(), likes: 0, likedByMe: false,
    };
    const destinations = s.destinations.map(d =>
      d.id !== destinationId ? d : {
        ...d,
        reviews: [{ name: profileName, avatar: 44, stars, text }, ...d.reviews],
        reviewCount: d.reviewCount + 1,
      }
    );
    const trips = pendingTripId
      ? s.trips.map(t => t.id === pendingTripId ? { ...t, reviewed: true } : t)
      : s.trips;
    return { posts: [post, ...s.posts], destinations, trips };
  });
}

export function postMoment({ destinationId, text, img, profileName }) {
  Store.setState(s => ({
    posts: [{
      id: uid('post'), type: 'moment', destinationId, authorIsMe: true,
      authorName: profileName, authorAvatar: null,
      stars: null, text, img, time: Date.now(), likes: 0, likedByMe: false,
    }, ...s.posts],
  }));
}

export function toggleLikePost(postId) {
  Store.setState(s => ({
    posts: s.posts.map(p => {
      if (p.id !== postId) return p;
      return { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) };
    }),
  }));
}

export function markNotificationRead(notifId) {
  Store.setState(s => ({
    notifications: s.notifications.map(n => n.id === notifId ? { ...n, read: true } : n),
  }));
}

export function clearNotifications() {
  Store.setState({ notifications: [] });
}

export function updateSettings(patch) {
  Store.setState(s => ({ settings: { ...s.settings, ...patch } }));
}

export function updateProfile(name, tier) {
  Store.setState(s => ({ profile: { ...s.profile, name, tier } }));
}
