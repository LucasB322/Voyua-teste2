import { Router } from '../router/router.js';
import { showToast } from '../components/toast.js';
import { openSheet, closeSheet } from '../components/sheet.js';
import { escapeHtml, qs, qsa, vibrate } from '../utils/dom.js';
import { uid } from '../utils/format.js';
import { setFieldError, clearFieldError } from '../utils/validate.js';

let _cards = [
  { id: 'card-default', brand: 'Visa', last4: '4242', expiry: '12/26', name: 'Amelia Cross', isDefault: true },
];

// Expõe cartões globalmente para outras telas
window._voucherCards = _cards;

function brandLabel(number) {
  const n = number.replace(/\s/g, '');
  if (n.startsWith('4')) return 'Visa';
  if (n.startsWith('5') || n.startsWith('2')) return 'Mastercard';
  if (n.startsWith('6')) return 'Elo';
  return 'Card';
}

function brandClass(brand) {
  const map = { 'Visa': 'visa', 'Mastercard': 'master', 'Elo': 'elo' };
  return map[brand] || 'generic';
}

export function initPayment() {
  Router.register('payment', { onShow: () => renderCards() });

  qs('#add-card-btn').addEventListener('click', () => openSheet('card'));
  qs('#card-backdrop').addEventListener('click', () => closeSheet('card'));
  qsa('[data-close-sheet="card"]').forEach(b => b.addEventListener('click', () => closeSheet('card')));

  qs('#card-number').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    clearFieldError('card-number');
  });

  qs('#card-expiry').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    e.target.value = v;
    clearFieldError('card-expiry');
  });

  qs('#card-cvv').addEventListener('input', () => clearFieldError('card-cvv'));
  qs('#card-name').addEventListener('input', () => clearFieldError('card-name'));

  qs('#card-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const numInput  = qs('#card-number');
    const expInput  = qs('#card-expiry');
    const cvvInput  = qs('#card-cvv');
    const nameInput = qs('#card-name');

    let valid = true;
    if (numInput.value.replace(/\s/g, '').length < 16) { setFieldError('card-number'); valid = false; } else clearFieldError('card-number');
    if (!/^\d{2}\/\d{2}$/.test(expInput.value))        { setFieldError('card-expiry'); valid = false; } else clearFieldError('card-expiry');
    if (cvvInput.value.length < 3)                      { setFieldError('card-cvv');    valid = false; } else clearFieldError('card-cvv');
    if (!nameInput.value.trim())                        { setFieldError('card-name');   valid = false; } else clearFieldError('card-name');
    if (!valid) { vibrate(20); return; }

    const brand = brandLabel(numInput.value);
    const last4 = numInput.value.replace(/\s/g, '').slice(-4);

    _cards.push({
      id: uid('card'),
      brand,
      last4,
      expiry: expInput.value,
      name: nameInput.value.trim(),
      isDefault: _cards.length === 0,
    });

    window._voucherCards = _cards;
    renderCards();
    closeSheet('card');
    e.target.reset();
    showToast(`${brand} card •••• ${last4} added`);
  });
}

export function getCards() { return _cards; }

function renderCards() {
  window._voucherCards = _cards;
  const list = qs('#cards-list');
  if (!list) return;

  list.innerHTML = `
    <div class="pay-methods">
      <button class="pay-method" id="pay-pix">
        <div class="pay-method__icon" style="background:#32BCAD">PIX</div>
        <div class="pay-method__info">
          <strong>Pay with Pix</strong>
          <span>Instant approval</span>
        </div>
        <svg class="pay-method__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      ${_cards.map(card => `
        <button class="pay-method${card.isDefault ? ' pay-method--active' : ''}" data-card-select="${card.id}">
          <div class="pay-method__icon payment__brand--${brandClass(card.brand)}" style="font-size:10px;font-weight:800">${card.brand.slice(0,4).toUpperCase()}</div>
          <div class="pay-method__info">
            <strong>${card.brand} •••• ${card.last4}</strong>
            <span>${card.isDefault ? 'Default card' : 'Valid until ' + card.expiry}</span>
          </div>
          ${card.isDefault
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--color-primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            : `<svg class="pay-method__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          }
        </button>`).join('')}

      <button class="pay-method" id="pay-new-card">
        <div class="pay-method__icon" style="background:#6366f1;color:#fff;font-size:20px">+</div>
        <div class="pay-method__info">
          <strong>Add new card</strong>
          <span>Credit or debit card</span>
        </div>
        <svg class="pay-method__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <button class="pay-method" id="pay-boleto">
        <div class="pay-method__icon" style="background:#374151;color:#fff;font-size:13px;font-weight:700">BOL</div>
        <div class="pay-method__info">
          <strong>Pay with Boleto</strong>
          <span>Processing up to 3 business days</span>
        </div>
        <svg class="pay-method__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <div class="pay-coupon">
      <h3 class="pay-coupon__title">Apply discount</h3>
      <div class="pay-coupon__row">
        <input id="coupon-input" type="text" placeholder="Enter your coupon code" class="pay-coupon__input">
        <button class="pay-coupon__btn" id="coupon-apply-btn">Apply</button>
      </div>
      <p id="coupon-msg" class="pay-coupon__msg" hidden></p>
    </div>
  `;

  qs('#pay-pix')?.addEventListener('click', () => {
    openSheet('pix');
    startPixCountdown();
  });
  qs('#pix-backdrop')?.addEventListener('click', () => closeSheet('pix'));
  qsa('[data-close-sheet="pix"]').forEach(b => b.addEventListener('click', () => closeSheet('pix')));

  qs('#pix-copy-btn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText('vouya@pagamentos.io');
    showToast('Pix key copied!');
    vibrate(10);
  });
  qs('#pay-new-card')?.addEventListener('click', () => openSheet('card'));
  qs('#pay-boleto')?.addEventListener('click', () => showToast('Boleto selected — you will receive it by email'));

  list.querySelectorAll('[data-card-select]').forEach(btn => {
    btn.addEventListener('click', () => {
      _cards.forEach(c => c.isDefault = c.id === btn.dataset.cardSelect);
      window._voucherCards = _cards;
      renderCards();
      showToast('Default card updated');
      vibrate(10);
    });
  });

  qs('#coupon-apply-btn')?.addEventListener('click', () => {
    const code = qs('#coupon-input').value.trim().toUpperCase();
    const msg = qs('#coupon-msg');
    if (code === 'VOUYA10') {
      msg.textContent = '✅ 10% discount applied!';
      msg.style.color = 'var(--color-secondary)';
    } else if (code === '') {
      msg.textContent = 'Please enter a coupon code.';
      msg.style.color = 'var(--color-danger)';
    } else {
      msg.textContent = '❌ Invalid or expired coupon.';
      msg.style.color = 'var(--color-danger)';
    }
    msg.hidden = false;
  });
  
}

let _pixTimer = null;

function startPixCountdown() {
  if (_pixTimer) clearInterval(_pixTimer);
  let seconds = 600; // 10 minutos
  const el = qs('#pix-countdown');
  if (!el) return;

  _pixTimer = setInterval(() => {
    seconds--;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    if (el) el.textContent = `${m}:${s}`;
    if (seconds <= 0) {
      clearInterval(_pixTimer);
      if (el) el.textContent = 'Expired';
    }
  }, 1000);
}
