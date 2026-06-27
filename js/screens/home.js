import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { destCardHtml } from '../components/dest-card.js';
import { daysUntil, formatDateRange } from '../utils/dates.js';
import { qs } from '../utils/dom.js';

export function initHome() {
  Router.register('home', { onShow: () => render(Store.getState()) });
}

function render(state) {
  const hour = new Date().getHours();
  qs('#home-greeting').textContent = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';
  qs('#home-name').textContent = `${state.profile.name.split(' ')[0]} ✈️`;

  const unread = state.notifications.filter(n => !n.read).length;
  qs('#notif-dot').hidden = unread === 0;

  const upcoming = state.trips
    .filter(t => t.status === 'upcoming')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const slot = qs('#next-trip-slot');
  if (upcoming.length === 0) {
    slot.innerHTML = `
      <div class="empty-state" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--r-lg);padding:32px 20px;">
        <div class="empty-state__icon">🧳</div>
        <p class="empty-state__title">No upcoming trips yet</p>
        <p class="empty-state__sub">Explore destinations and add one to your trips to see it here.</p>
        <button class="btn btn--primary" data-nav="explore">Explore destinations</button>
      </div>`;
  } else {
    const trip = upcoming[0];
    const days = daysUntil(trip.startDate);
    const dayLabel = days <= 0 ? 'Happening now' : days === 1 ? 'Tomorrow' : `In ${days} days`;
    const avatarsHtml = trip.companionAvatars.map(n => `<img class="avatar avatar--xs" src="https://i.pravatar.cc/64?img=${n}" alt="">`).join('');
    const extraHtml = trip.companionsExtra > 0 ? `<span class="avatar avatar--xs avatar--more">+${trip.companionsExtra}</span>` : '';
    slot.innerHTML = `
      <div class="trip-hero" data-open-trip="${trip.id}">
        <div class="trip-hero__img" style="background-image:url('${trip.img}')"></div>
        <div class="trip-hero__overlay"></div>
        <div class="trip-hero__body">
          <span class="badge badge--light">${dayLabel}</span>
          <h3 class="trip-hero__place">${trip.place}</h3>
          <p class="trip-hero__dates">${formatDateRange(trip.startDate, trip.endDate)}</p>
          <div class="trip-hero__avatars">${avatarsHtml}${extraHtml}</div>
        </div>
      </div>`;
  }

  const destForWeather = upcoming.length
    ? state.destinations.find(d => d.id === upcoming[0].destinationId)
    : null;
  if (destForWeather) {
    qs('#weather-city').textContent = `${destForWeather.name} now`;
    const seed = destForWeather.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const temp = 12 + (seed % 18);
    qs('#weather-temp').textContent = `${temp}°C`;
    qs('#weather-desc').textContent = temp > 22 ? 'Sunny · feels warm' : temp > 14 ? 'Clear · pleasant' : 'Cool · pack a layer';
  } else {
    qs('#weather-city').textContent = 'Weather';
    qs('#weather-temp').textContent = '—';
    qs('#weather-desc').textContent = 'Add a trip to see local weather';
  }

  const resCount = upcoming.reduce((sum, t) => sum + Object.values(t.steps).filter(Boolean).length, 0);
  qs('#reservations-count').textContent = resCount;
  qs('#reservations-sub').textContent = resCount === 0 ? 'Nothing booked yet' : 'Across your upcoming trips';

  const favDests = state.favorites.map(id => state.destinations.find(d => d.id === id)).filter(Boolean);
  const fillers = state.destinations.filter(d => !state.favorites.includes(d.id)).sort((a, b) => b.rating - a.rating);
  const curated = [...favDests, ...fillers].slice(0, 6);
  qs('#curated-rail').innerHTML = curated.map(d => destCardHtml(d, state.favorites.includes(d.id))).join('');
}
