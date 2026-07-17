import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { addTrip } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { simulateAsync } from '../components/loading.js';
import { formatDateRange } from '../utils/dates.js';
import { uid } from '../utils/format.js';
import { qs, vibrate } from '../utils/dom.js';

let _draft = null;
let _listenersAttached = false;

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
      
      attachEventListeners();

      if (_draft) {
        renderBooking(Store.getState());
      }
    },
  });
}

function attachEventListeners() {
  if (_listenersAttached) return; 

  const startInput = qs('#booking-start');
  const endInput = qs('#booking-end');
  const minusBtn = qs('#travelers-minus');
  const plusBtn = qs('#travelers-plus');
  const toggle = qs('#protection-toggle');
  const confirmBtn = qs('#confirm-booking-btn');
  const paymentSlot = qs('#booking-payment-slot');

  if (!startInput || !endInput || !minusBtn || !plusBtn || !toggle || !confirmBtn) {
    return;
  }

  startInput.addEventListener('change', (e) => { 
    if (!_draft) return;
    _draft.start = e.target.value; 
    validateDates(); 
    renderBooking(Store.getState()); 
  });

  endInput.addEventListener('change', (e) => { 
    if (!_draft) return;
    _draft.end = e.target.value; 
    validateDates(); 
    renderBooking(Store.getState()); 
  });

  minusBtn.addEventListener('click', () => { 
    if (_draft && _draft.travelers > 1) { 
      _draft.travelers--; 
      renderBooking(Store.getState()); 
    } 
  });

  plusBtn.addEventListener('click', () => { 
    if (_draft && _draft.travelers < 8) { 
      _draft.travelers++; 
      renderBooking(Store.getState()); 
    } 
  });

  toggle.addEventListener('change', (e) => { 
    if (!_draft) return;
    _draft.protection = e.target.checked; 
    renderBooking(Store.getState()); 
  });

  confirmBtn.addEventListener('click', () => { 
    if (!_draft) return;
    if (!validateDates()) { 
      vibrate(20); 
      return; 
    } 
    confirmBooking(); 
  });

  if (paymentSlot) {
    paymentSlot.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-nav="payment"]');
      if (btn) {
        Router.go('payment'); 
      }
    });
  }

  _listenersAttached = true;
}

function renderBooking(state) {
  const dest = state.destinations.find(d => d.id === _draft.destinationId);
  if (!dest) return;

  const summary = qs('#booking-summary');
  if (summary) {
    summary.innerHTML = `
      <div class="booking-summary__img" style="background-image:url('${dest.img}')"></div>
      <div class="booking-summary__body">
        <h3>${dest.name}</h3>
        <p>${dest.country} · <span class="rating">★ ${dest.rating}</span></p>
        <p>$${dest.price} / person</p>
      </div>`;
  }

  const startEl = qs('#booking-start');
  const endEl = qs('#booking-end');
  const travelersVal = qs('#travelers-value');
  const minusBtn = qs('#travelers-minus');
  const plusBtn = qs('#travelers-plus');
  const toggle = qs('#protection-toggle');
  const card = qs('.protection-card');

  if (startEl) startEl.value = _draft.start;
  if (endEl) endEl.value = _draft.end;
  if (travelersVal) travelersVal.textContent = _draft.travelers;
  if (minusBtn) minusBtn.disabled = _draft.travelers <= 1;
  if (plusBtn) plusBtn.disabled = _draft.travelers >= 8;
  if (toggle) toggle.checked = _draft.protection;
  if (card) card.classList.toggle('is-off', !_draft.protection);

  const paymentSlot = qs('#booking-payment-slot');
  if (paymentSlot) {
    const savedCards = window._voucherCards || [];
    if (savedCards.length > 0) {
      const def = savedCards.find(c => c.isDefault) || savedCards[0];
      paymentSlot.innerHTML = `
        <div class="card-row">
          <div class="payment__brand payment__brand--${def.brand === 'Visa' ? 'visa' : def.brand === 'Mastercard' ? 'master' : 'generic'}">${def.brand.slice(0,4).toUpperCase()}</div>
          <div class="card-row__body">
            <strong>${def.brand} •••• ${def.last4}</strong>
            <span>Válido até ${def.expiry}</span>
          </div>
          <span class="card-badge card-badge--default">Padrão</span>
        </div>`;
    } else {
      paymentSlot.innerHTML = `
        <button class="contact-row contact-row--add" data-nav="payment">
          <span class="contact-row__add-icon">+</span>
          <span>Adicionar método de pagamento</span>
        </button>`;
    }
  }

  const subtotal = dest.price * _draft.travelers;
  const protCost = _draft.protection ? Math.round(subtotal * 0.08) : 0;
  const totalEl = qs('#booking-total');
  
  if (totalEl) {
    totalEl.innerHTML = `
      <div class="booking-total__row"><span>${dest.name} × ${_draft.travelers}</span><span>$${subtotal.toLocaleString()}</span></div>
      <div class="booking-total__row"><span>Vouya Shield protection</span><span>${_draft.protection ? `$${protCost.toLocaleString()}` : 'Not included'}</span></div>
      <div class="booking-total__row is-total"><span>Total</span><span>$${(subtotal + protCost).toLocaleString()}</span></div>`;
  }
}

function validateDates() {
  if (!_draft) return false;
  const valid = new Date(_draft.end) > new Date(_draft.start);
  
  const errorEl = qs('#booking-date-error');
  if (errorEl) errorEl.hidden = valid;

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
  if (btn) btn.classList.add('is-loading');

  simulateAsync(() => {
    if (btn) btn.classList.remove('is-loading');
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