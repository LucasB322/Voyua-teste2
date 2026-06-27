import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { markNotificationRead, clearNotifications } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { escapeHtml, qs } from '../utils/dom.js';
import { relativeTime } from '../utils/dates.js';

const NOTIF_ICON = { trip: '🧳', safety: '🛟', system: '⚙️' };

export function initNotifications() {
  Router.register('notifications', { onShow: () => render(Store.getState()) });

  qs('#clear-notifications-btn').addEventListener('click', () => {
    if (Store.getState().notifications.length === 0) return;
    clearNotifications();
    render(Store.getState());
    showToast('Notifications cleared');
  });
}

function render(state) {
  const list = qs('#notifications-list');
  if (state.notifications.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🔔</div><p class="empty-state__title">You're all caught up</p><p class="empty-state__sub">New trip and safety updates will show up here.</p></div>`;
    return;
  }

  const sorted = state.notifications.slice().sort((a, b) => b.time - a.time);
  list.innerHTML = sorted.map(n => `
    <div class="notif-row${n.read ? '' : ' is-unread'}" data-mark-read="${n.id}">
      <div class="notif-row__icon notif-row__icon--${n.type}">${NOTIF_ICON[n.type] || '🔔'}</div>
      <div class="notif-row__body"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p></div>
      <span class="notif-row__time">${relativeTime(n.time)}</span>
    </div>`).join('');

  list.querySelectorAll('[data-mark-read]').forEach(row => {
    row.addEventListener('click', () => {
      markNotificationRead(row.dataset.markRead);
      row.classList.remove('is-unread');
    });
  });
}
