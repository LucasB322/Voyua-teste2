import { Store } from '../store/store.js';
import { postReview, postMoment } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { openSheet, closeSheet } from '../components/sheet.js';
import { renderFeed } from './feed.js';
import { renderTrips } from './trips.js';
import { escapeHtml, qs, qsa, vibrate } from '../utils/dom.js';
import { setFieldError, clearFieldError } from '../utils/validate.js';

let _reviewStars = 0;
let _pendingTripId = null;
let _momentPhotoChoice = 'random';

export function initComposer() {
  const fab = qs('#composer-fab');
  fab.addEventListener('click', openComposerChoice);

  qs('#composer-backdrop').addEventListener('click', closeComposerChoice);
  qsa('[data-close-sheet="composer"]').forEach(btn => btn.addEventListener('click', closeComposerChoice));

  qs('#choice-review').addEventListener('click', () => { closeComposerChoice(); openReviewComposer(); });
  qs('#choice-moment').addEventListener('click', () => { closeComposerChoice(); openMomentComposer(); });

  qs('#review-backdrop').addEventListener('click', () => closeSheet('review'));
  qsa('[data-close-sheet="review"]').forEach(btn => btn.addEventListener('click', () => closeSheet('review')));
  qs('#moment-backdrop').addEventListener('click', () => closeSheet('moment'));
  qsa('[data-close-sheet="moment"]').forEach(btn => btn.addEventListener('click', () => closeSheet('moment')));

  // Star picker
  qsa('.star-picker__star').forEach(star => {
    star.addEventListener('click', () => {
      _reviewStars = Number(star.dataset.star);
      qsa('.star-picker__star').forEach(s => s.classList.toggle('is-filled', Number(s.dataset.star) <= _reviewStars));
      qs('#review-star-error').hidden = true;
    });
  });

  // Photo picker
  qsa('.moment-photo-picker__option').forEach(btn => {
    btn.addEventListener('click', () => {
      _momentPhotoChoice = btn.dataset.photo;
      qsa('.moment-photo-picker__option').forEach(b => b.classList.toggle('is-active', b === btn));
    });
  });

  // Review submit
  qs('#review-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const destSelect = qs('#review-destination');
    const textInput = qs('#review-text');
    let valid = true;
    if (!destSelect.value) { setFieldError('review-destination'); valid = false; } else clearFieldError('review-destination');
    if (_reviewStars < 1) { qs('#review-star-error').hidden = false; valid = false; }
    if (!textInput.value.trim()) { setFieldError('review-text'); valid = false; } else clearFieldError('review-text');
    if (!valid) { vibrate(20); return; }

    const state = Store.getState();
    postReview({
      destinationId: destSelect.value,
      stars: _reviewStars,
      text: textInput.value.trim(),
      profileName: state.profile.name,
      pendingTripId: _pendingTripId,
    });
    _pendingTripId = null;
    closeSheet('review');
    renderFeed();
    renderTrips();
    showToast('Review posted — thanks for helping other travelers!', { duration: 3200 });
  });
  qs('#review-text').addEventListener('input', () => clearFieldError('review-text'));
  qs('#review-destination').addEventListener('change', () => clearFieldError('review-destination'));

  // Moment submit
  qs('#moment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const destSelect = qs('#moment-destination');
    const textInput = qs('#moment-text');
    if (!textInput.value.trim()) { setFieldError('moment-text'); vibrate(20); return; }
    clearFieldError('moment-text');

    const state = Store.getState();
    const dest = state.destinations.find(d => d.id === destSelect.value);
    postMoment({
      destinationId: destSelect.value,
      text: textInput.value.trim(),
      img: _momentPhotoChoice === 'random' && dest ? dest.img : null,
      profileName: state.profile.name,
    });
    closeSheet('moment');
    renderFeed();
    showToast('Moment shared to the community feed');
  });
  qs('#moment-text').addEventListener('input', () => clearFieldError('moment-text'));
}

function openComposerChoice() {
  openSheet('composer');
  qs('#composer-fab').classList.add('is-open');
}

function closeComposerChoice() {
  closeSheet('composer');
  qs('#composer-fab').classList.remove('is-open');
}

export function openReviewComposer(prefillDestId = null, prefillTripId = null) {
  const select = qs('#review-destination');
  populateDestSelect(select);
  if (prefillDestId) select.value = prefillDestId;
  _reviewStars = 0;
  _pendingTripId = prefillTripId;
  qsa('.star-picker__star').forEach(s => s.classList.remove('is-filled'));
  qs('#review-text').value = '';
  clearFieldError('review-destination');
  clearFieldError('review-text');
  qs('#review-star-error').hidden = true;
  openSheet('review');
}

function openMomentComposer(prefillDestId = null) {
  const select = qs('#moment-destination');
  populateDestSelect(select);
  if (prefillDestId) select.value = prefillDestId;
  qs('#moment-text').value = '';
  _momentPhotoChoice = 'random';
  qsa('.moment-photo-picker__option').forEach(b => b.classList.toggle('is-active', b.dataset.photo === 'random'));
  clearFieldError('moment-text');
  openSheet('moment');
}

function populateDestSelect(selectEl) {
  const dests = Store.getState().destinations;
  selectEl.innerHTML = dests
    .slice().sort((a, b) => a.name.localeCompare(b.name))
    .map(d => `<option value="${d.id}">${escapeHtml(d.name)}, ${escapeHtml(d.country)}</option>`)
    .join('');
}
