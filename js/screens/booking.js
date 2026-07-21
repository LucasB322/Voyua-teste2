import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { addTrip } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { simulateAsync } from '../components/loading.js';
import { formatDateRange } from '../utils/dates.js';
import { uid } from '../utils/format.js';
import { qs, vibrate } from '../utils/dom.js';

function formatPrice(price) {
  const cur = window._activeCurrency || { symbol: '$', code: 'USD' };
  return `${cur.symbol}${price}`;
}

let _draft = null;

export function initBooking() {
  Router.register('booking', {
    onShow: ({ destId } = {}) => {
      if (destId) {
        const today = new Date();
        _draft = {
          destinationId: destId,
          start: new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10),
          end:   new Date(today.getTime() + 21 * 86400000).toISOString().slice(0, 10),
          travelers: 1,
          protection: true,
        };
      }
      if (_draft) renderBooking(Store.getState());
    },
  });

  qs('#booking-start').addEventListener('change', (e) => { _draft.start = e.target.value; validateDates(); renderBooking(Store.getState()); });
  qs('#booking-end').addEventListener('change', (e) => { _draft.end = e.target.value; validateDates(); renderBooking(Store.getState()); });
  qs('#travelers-minus').addEventListener('click', () => { if (_draft.travelers > 1) { _draft.travelers--; renderBooking(Store.getState()); } });
  qs('#travelers-plus').addEventListener('click', () => { if (_draft.travelers < 8) { _draft.travelers++; renderBooking(Store.getState()); } });
  qs('#protection-toggle').addEventListener('change', (e) => { _draft.protection = e.target.checked; renderBooking(Store.getState()); });
  qs('#confirm-booking-btn').addEventListener('click', () => { if (!validateDates()) { vibrate(20); return; } confirmBooking(); });
}

function renderBooking(state) {
  const dest = state.destinations.find(d => d.id === _draft.destinationId);
  if (!dest) return;

  qs('#booking-summary').innerHTML = `
    <div class="booking-summary__img" style="background-image:url('${dest.img}')"></div>
    <div class="booking-summary__body">
      <h3>${dest.name}</h3>
      <p>${dest.country} · <span class="rating">★ ${dest.rating}</span></p>
      <p>$${formatPrice(dest.price)} / person</p>
    </div>`;

  qs('#booking-start').value = _draft.start;
  qs('#booking-end').value = _draft.end;
  qs('#travelers-value').textContent = _draft.travelers;
  qs('#travelers-minus').disabled = _draft.travelers <= 1;
  qs('#travelers-plus').disabled = _draft.travelers >= 8;
  qs('#protection-toggle').checked = _draft.protection;
  qs('.protection-card').classList.toggle('is-off', !_draft.protection);

  const subtotal = dest.price * _draft.travelers;
  const protCost = _draft.protection ? Math.round(subtotal * 0.08) : 0;
  
  // Payment method
  const cards = (window._voucherCards && window._voucherCards.length > 0)
    ? window._voucherCards
    : [{ id: 'card-default', brand: 'Visa', last4: '4242', expiry: '12/26', name: 'Amelia Cross', isDefault: true }];
  const def = cards.find(c => c.isDefault) || cards[0];

  // Payment method
  const paymentHtml = `
    <div class="booking-payment-box">
      <div class="booking-payment-method is-selected">
        <div class="booking-payment-method__left">
          <div class="payment__brand payment__brand--${def.brand === 'Visa' ? 'visa' : def.brand === 'Mastercard' ? 'master' : 'generic'}">${def.brand.slice(0,4).toUpperCase()}</div>
          <div class="booking-payment-method__info">
            <strong>${def.brand} •••• ${def.last4}</strong>
            <span>Valid until ${def.expiry}</span>
          </div>
        </div>
        <span class="booking-payment-method__check">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
      <button class="booking-payment-method" id="booking-add-payment">
        <div class="booking-payment-method__left">
          <div class="booking-payment-method__icon">＋</div>
          <div class="booking-payment-method__info">
            <strong>Add payment method</strong>
            <span>Credit card, debit or Pix</span>
          </div>
        </div>
      </button>
    </div>`;

  qs('#booking-payment').innerHTML = paymentHtml;
  qs('#booking-add-payment')?.addEventListener('click', () => Router.go('payment'));

  qs('#booking-total').innerHTML = `
    <div class="booking-total__row"><span>${dest.name} × ${_draft.travelers}</span><span>${formatPrice(subtotal.toLocaleString())}</span></div>
    <div class="booking-total__row"><span>Vouya Shield protection</span><span>${_draft.protection ? formatPrice(protCost.toLocaleString()) : 'Not included'}</span></div>
    <div class="booking-total__row is-total"><span>Total</span><span>${formatPrice((subtotal + protCost).toLocaleString())}</span></div>
  `;
}

function validateDates() {
  const valid = new Date(_draft.end) > new Date(_draft.start);
  qs('#booking-date-error').hidden = valid;
  const startCtrl = qs('#booking-start').closest('.field__control');
  const endCtrl = qs('#booking-end').closest('.field__control');
  if (startCtrl) startCtrl.style.borderColor = valid ? '' : 'var(--color-danger)';
  if (endCtrl) endCtrl.style.borderColor = valid ? '' : 'var(--color-danger)';
  return valid;
}

function confirmBooking() {
  const state = Store.getState();
  const dest = state.destinations.find(d => d.id === _draft.destinationId);
  const btn = qs('#confirm-booking-btn');
  btn.classList.add('is-loading');

  simulateAsync(() => {
    btn.classList.remove('is-loading');
    const newTrip = {
      id: uid('trip'),
      destinationId: dest.id,
      place: `${dest.name}, ${dest.country}`,
      img: dest.img,
      startDate: _draft.start,
      endDate: _draft.end,
      status: 'upcoming',
      steps: { flights: false, hotel: false, activities: false, packing: false },
      companionAvatars: [],
      companionsExtra: Math.max(0, _draft.travelers - 1),
      days: { 1: [] },
    };
    addTrip(newTrip);
    Router.clearHistory();
    Router.go('trips', { pushHistory: false });
    setTimeout(() => showToast(`Added ${dest.name} to your trips`, {
      actionLabel: 'View',
      onAction: () => Router.go('itinerary'),
    }), 350);
  }, 1100);
}