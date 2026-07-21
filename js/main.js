import { Store } from './store/store.js';
import { Router } from './router/router.js';
import { toggleFavorite, setActiveTrip } from './store/actions.js';
import { showToast } from './components/toast.js';

import { initLogin } from './screens/login.js';
import { initHome } from './screens/home.js';
import { initExplore, initExploreDetail, openDestinationDetail } from './screens/explore.js';
import { initBooking } from './screens/booking.js';
import { initTrips } from './screens/trips.js';
import { initFeed } from './screens/feed.js';
import { initItinerary, handleDeleteStop } from './screens/itinerary.js';
import { initSafety, handleDeleteContact, handleCallContact } from './screens/safety.js';
import { initProfile } from './screens/profile.js';
import { initNotifications } from './screens/notifications.js';
import { initComposer, openReviewComposer } from './screens/composer.js';
import { initPayment } from './screens/payment.js';
import { vibrate, qsa } from './utils/dom.js';
import { initCurrency } from './screens/currency.js';
import { initAIPlanner } from './screens/ai-planner.js';



document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  // Apply persisted theme before first render — prevents flash
  const { darkMode } = Store.getState().settings;
  document.getElementById('app').setAttribute('data-theme', darkMode ? 'dark' : 'light');

  // Inject profile avatar placeholders
  qsa('[data-avatar]').forEach(img => { img.src = 'https://i.pravatar.cc/200?img=44'; });

  // Register & init all screens
  initLogin();
  initHome();
  initExplore();
  initExploreDetail();
  initBooking();
  initTrips();
  initFeed();
  initItinerary();
  initSafety();
  initProfile();
  initNotifications();
  initPayment();
  initCurrency();
  initComposer();
  initAIPlanner();


  // ── Global event delegation ──────────────────────────────────────────────
  // Handles generic data-* attributes that are used across multiple screens.
  document.addEventListener('click', (e) => {
    // Favorites — must run before data-nav since fav buttons can live inside nav cards
    const favTarget = e.target.closest('[data-fav]');
    if (favTarget) {
      e.stopPropagation();
      const destId = favTarget.dataset.fav;
      if (destId) {
        toggleFavorite(destId);
        const isFav = Store.getState().favorites.includes(destId);
        // Sync all visible fav buttons for this destination
        document.querySelectorAll(`[data-fav="${destId}"]`).forEach(b => b.classList.toggle('is-fav', isFav));
        vibrate(12);
        showToast(isFav ? 'Saved to favorites' : 'Removed from favorites');
      }
      return;
    }

    // Open destination detail
    const detailTarget = e.target.closest('[data-open-detail]');
    if (detailTarget) { openDestinationDetail(detailTarget.dataset.openDetail); return; }

    // Open trip itinerary
    const tripTarget = e.target.closest('[data-open-trip]');
    if (tripTarget) {
      setActiveTrip(tripTarget.dataset.openTrip);
      Router.go('itinerary');
      return;
    }

    // Delete itinerary stop
    const stopTarget = e.target.closest('[data-delete-stop]');
    if (stopTarget) { e.stopPropagation(); handleDeleteStop(stopTarget.dataset.deleteStop); return; }

    // Delete emergency contact
    const delContactTarget = e.target.closest('[data-delete-contact]');
    if (delContactTarget) { e.stopPropagation(); handleDeleteContact(delContactTarget.dataset.deleteContact); return; }

    // Call emergency contact
    const callTarget = e.target.closest('[data-call-contact]');
    if (callTarget) { e.stopPropagation(); handleCallContact(callTarget.dataset.callContact); return; }

    // Leave a review from past trip card
    const reviewTarget = e.target.closest('[data-leave-review]');
    if (reviewTarget) {
      const trip = Store.getState().trips.find(t => t.id === reviewTarget.dataset.leaveReview);
      if (trip) openReviewComposer(trip.destinationId, trip.id);
      return;
    }

    // Back button
    if (e.target.closest('[data-back]')) { Router.back(); return; }

    // Bottom nav / data-nav links
    const navTarget = e.target.closest('[data-nav]');
    if (navTarget) {
      Router.go(navTarget.dataset.nav);
      if (navTarget.dataset.toast) showToast(navTarget.dataset.toast);
      return;
    }

    // Standalone data-toast (not on a nav button)
    const toastTarget = e.target.closest('[data-toast]');
    if (toastTarget && !toastTarget.closest('[data-nav]')) {
      showToast(toastTarget.dataset.toast);
    }
  });

  // ── Splash sequence ──────────────────────────────────────────────────────
  Router.go('splash', { pushHistory: false });
  const bar = document.getElementById('splash-progress');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => Router.go('login', { pushHistory: false }), 280);
    }
    bar.style.width = `${progress}%`;
  }, 220);
});
