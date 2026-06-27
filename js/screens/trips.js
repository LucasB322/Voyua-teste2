import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { showToast } from '../components/toast.js';
import { tripCardHtml, pastTripCardHtml } from '../components/trip-card.js';
import { qs, qsa } from '../utils/dom.js';

export function initTrips() {
  Router.register('trips', { onShow: () => render(Store.getState()) });

  qsa('[data-trips-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('[data-trips-tab]').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      qsa('[data-trips-panel]').forEach(p => p.classList.remove('is-active'));
      qs(`[data-trips-panel="${tab.dataset.tripsTab}"]`).classList.add('is-active');
    });
  });

  qs('#add-trip-btn').addEventListener('click', () => {
    Router.go('explore');
    showToast('Pick a destination to start a new trip');
  });
}

export function renderTrips() {
  render(Store.getState());
}

function render(state) {
  const upcoming = state.trips.filter(t => t.status === 'upcoming').sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const past = state.trips.filter(t => t.status === 'past').sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  qs('#trips-upcoming').innerHTML = upcoming.length
    ? upcoming.map(tripCardHtml).join('')
    : `<div class="empty-state"><div class="empty-state__icon">🧳</div><p class="empty-state__title">No upcoming trips</p><p class="empty-state__sub">Browse Explore and add a destination to start planning.</p><button class="btn btn--primary" data-nav="explore">Explore destinations</button></div>`;

  qs('#trips-past').innerHTML = past.length
    ? past.map(pastTripCardHtml).join('')
    : `<div class="empty-state"><div class="empty-state__icon">📷</div><p class="empty-state__title">No past trips yet</p><p class="empty-state__sub">Completed trips will show up here.</p></div>`;
}
