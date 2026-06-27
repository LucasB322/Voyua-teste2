import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { removeStop, addStop, reorderStops } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { openSheet, closeSheet } from '../components/sheet.js';
import { escapeHtml, qs, qsa, vibrate } from '../utils/dom.js';
import { uid } from '../utils/format.js';
import { setFieldError, clearFieldError } from '../utils/validate.js';

const STOP_ICON_EMOJI = { food: '🍴', sight: '📍', stay: '🏨', transit: '🚆' };
const STOP_ICON_CLASS = { food: 'food', sight: 'sight', stay: 'stay', transit: 'sight' };

let _activeDay = 1;

function activeTrip(state) {
  return state.trips.find(t => t.id === state.activeTripId) || state.trips[0];
}

export function initItinerary() {
  Router.register('itinerary', { onShow: () => renderItinerary(Store.getState()) });

  qs('#day-row').addEventListener('click', (e) => {
    const chip = e.target.closest('.day-chip');
    if (!chip) return;
    _activeDay = Number(chip.dataset.day);
    qsa('.day-chip').forEach(c => c.classList.toggle('is-active', c === chip));
    const state = Store.getState();
    renderTimeline(activeTrip(state), _activeDay);
  });

  qs('#itinerary-share-btn').addEventListener('click', () => showToast('Itinerary link copied to clipboard'));
  qs('#add-stop-btn').addEventListener('click', () => openSheet('stop'));

  initDragDrop();
  initStopForm();
}

function renderItinerary(state) {
  const trip = activeTrip(state);
  if (!trip) return;
  const dest = state.destinations.find(d => d.id === trip.destinationId);
  qs('#itinerary-title').textContent = `${dest ? dest.name : trip.place.split(',')[0]} Itinerary`;

  const dayKeys = Object.keys(trip.days).map(Number).sort((a, b) => a - b);
  if (!dayKeys.includes(_activeDay)) _activeDay = dayKeys[0] || 1;

  const start = new Date(trip.startDate + 'T00:00:00');
  qs('#day-row').innerHTML = dayKeys.map(dayNum => {
    const d = new Date(start);
    d.setDate(d.getDate() + (dayNum - 1));
    return `<button class="day-chip${dayNum === _activeDay ? ' is-active' : ''}" data-day="${dayNum}">
      <span>${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
      <strong>${d.getDate()}</strong>
    </button>`;
  }).join('');

  renderTimeline(trip, _activeDay);
}

function renderTimeline(trip, dayNum) {
  const stops = trip.days[dayNum] || [];
  const list = qs('#timeline-list');

  if (stops.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🗺️</div><p class="empty-state__title">Nothing planned yet</p><p class="empty-state__sub">Add your first stop for this day.</p></div>`;
    return;
  }

  list.innerHTML = stops.map((stop, i) => `
    <li class="timeline__item" draggable="true" data-id="${stop.id}">
      <div class="timeline__rail">
        <span class="timeline__time">${stop.time || '--:--'}</span>
        <span class="timeline__line${i === stops.length - 1 ? ' timeline__line--end' : ''}"></span>
      </div>
      <div class="timeline__card">
        <span class="timeline__drag" aria-hidden="true">⠿</span>
        <div class="timeline__icon timeline__icon--${STOP_ICON_CLASS[stop.icon] || 'sight'}">${STOP_ICON_EMOJI[stop.icon] || '📍'}</div>
        <div class="timeline__body">
          <h4>${escapeHtml(stop.title)}</h4>
          <p>${escapeHtml(stop.note || '')}</p>
        </div>
        <button class="contact-row__delete" data-delete-stop="${stop.id}" aria-label="Remove stop">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </li>`).join('');
}

function initDragDrop() {
  const list = qs('#timeline-list');
  let dragEl = null;

  list.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.timeline__item');
    if (!item) return;
    dragEl = item;
    item.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragend', () => {
    dragEl?.classList.remove('is-dragging');
    qsa('.timeline__item', list).forEach(i => i.classList.remove('drag-over'));
    dragEl = null;
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const over = e.target.closest('.timeline__item');
    qsa('.timeline__item', list).forEach(i => i.classList.remove('drag-over'));
    if (over && over !== dragEl) over.classList.add('drag-over');
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const over = e.target.closest('.timeline__item');
    if (!over || !dragEl || over === dragEl) return;
    over.after(dragEl);
    saveReorder(list);
    over.classList.remove('drag-over');
    showToast('Itinerary order updated');
    vibrate(10);
  });

  // Touch long-press drag
  let touchItem = null, touchStartY = 0, longPressTimer = null;

  list.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.timeline__item');
    if (!item) return;
    touchStartY = e.touches[0].clientY;
    longPressTimer = setTimeout(() => { touchItem = item; item.classList.add('is-dragging'); vibrate(15); }, 350);
  }, { passive: true });

  list.addEventListener('touchmove', (e) => {
    if (!touchItem) { if (Math.abs(e.touches[0].clientY - touchStartY) > 10) clearTimeout(longPressTimer); return; }
    const touchY = e.touches[0].clientY;
    qsa('.timeline__item', list).forEach(i => i.classList.remove('drag-over'));
    for (const item of qsa('.timeline__item', list)) {
      if (item === touchItem) continue;
      const rect = item.getBoundingClientRect();
      if (touchY > rect.top && touchY < rect.bottom) { item.classList.add('drag-over'); break; }
    }
  }, { passive: true });

  list.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
    if (!touchItem) return;
    const target = qs('.timeline__item.drag-over', list);
    if (target) {
      const items = qsa('.timeline__item', list);
      if (items.indexOf(touchItem) < items.indexOf(target)) target.after(touchItem);
      else target.before(touchItem);
      saveReorder(list);
      showToast('Itinerary order updated');
      vibrate(10);
    }
    touchItem.classList.remove('is-dragging');
    qsa('.timeline__item', list).forEach(i => i.classList.remove('drag-over'));
    touchItem = null;
  });
}

function saveReorder(listEl) {
  const state = Store.getState();
  const trip = activeTrip(state);
  if (!trip) return;
  const orderedIds = qsa('.timeline__item', listEl).map(li => li.dataset.id);
  reorderStops(trip.id, _activeDay, orderedIds);
}

function initStopForm() {
  qs('#stop-backdrop').addEventListener('click', () => closeSheet('stop'));
  qsa('[data-close-sheet="stop"]').forEach(btn => btn.addEventListener('click', () => closeSheet('stop')));

  qs('#stop-name').addEventListener('input', () => clearFieldError('stop-name'));
  qs('#stop-time').addEventListener('input', () => clearFieldError('stop-time'));

  qs('#stop-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = qs('#stop-name');
    const timeInput = qs('#stop-time');
    const iconSelect = qs('#stop-icon');
    const noteInput = qs('#stop-note');

    let valid = true;
    if (!nameInput.value.trim()) { setFieldError('stop-name'); valid = false; } else clearFieldError('stop-name');
    if (!timeInput.value) { setFieldError('stop-time'); valid = false; } else clearFieldError('stop-time');
    if (!valid) { vibrate(20); return; }

    const state = Store.getState();
    const trip = activeTrip(state);
    addStop(trip.id, _activeDay, {
      id: uid('stop'),
      time: timeInput.value,
      icon: iconSelect.value,
      title: nameInput.value.trim(),
      note: noteInput.value.trim(),
    });

    renderTimeline(activeTrip(Store.getState()), _activeDay);
    closeSheet('stop');
    e.target.reset();
    qs('#stop-icon').value = 'sight';
    showToast('Stop added to your day');
  });
}

// Called from global event delegation for delete-stop
export function handleDeleteStop(stopId) {
  const state = Store.getState();
  const trip = activeTrip(state);
  if (!trip) return;
  removeStop(trip.id, _activeDay, stopId);
  renderTimeline(activeTrip(Store.getState()), _activeDay);
  showToast('Stop removed', { type: 'danger' });
}
