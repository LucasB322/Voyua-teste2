import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { showToast } from '../components/toast.js';
import { openSheet, closeSheet } from '../components/sheet.js';
import { escapeHtml, qs, qsa, vibrate } from '../utils/dom.js';
import { uid } from '../utils/format.js';
import { setFieldError, clearFieldError } from '../utils/validate.js';

// Estado local dos cartões
let _cards = [
  { id: 'card-default', brand: 'Visa', last4: '4242', expiry: '12/26', name: 'Amelia Cross', isDefault: true },
];

function brandLabel(number) {
  const n = number.replace(/\s/g, '');
  if (n.startsWith('4')) return 'Visa';
  if (n.startsWith('5') || n.startsWith('2')) return 'Mastercard';
  if (n.startsWith('6')) return 'Elo';
  return 'Cartão';
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

  // Máscara número do cartão
  qs('#card-number').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    clearFieldError('card-number');
  });

  // Máscara validade
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
    if (!/^\d{2}\/\d{2}$/.test(expInput.value)) { setFieldError('card-expiry'); valid = false; } else clearFieldError('card-expiry');
    if (cvvInput.value.length < 3) { setFieldError('card-cvv'); valid = false; } else clearFieldError('card-cvv');
    if (!nameInput.value.trim()) { setFieldError('card-name'); valid = false; } else clearFieldError('card-name');
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

    renderCards();
    closeSheet('card');
    e.target.reset();
    showToast(`Cartão ${brand} •••• ${last4} adicionado`);
  });
}

function renderCards() {
  const list = qs('#cards-list');
  if (!list) return;

  if (_cards.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">💳</div>
        <p class="empty-state__title">Nenhum cartão salvo</p>
        <p class="empty-state__sub">Adicione um cartão para facilitar suas reservas.</p>
      </div>`;
    return;
  }

  list.innerHTML = _cards.map(card => `
    <div class="card-row">
      <div class="card-row__brand payment__brand payment__brand--${brandClass(card.brand)}">${card.brand.slice(0, 4).toUpperCase()}</div>
      <div class="card-row__body">
        <strong>${card.brand} •••• ${card.last4}</strong>
        <span>Válido até ${card.expiry} · ${escapeHtml(card.name)}</span>
      </div>
      <div class="card-row__actions">
        ${card.isDefault
          ? `<span class="card-badge card-badge--default">Padrão</span>`
          : `<button class="card-badge card-badge--set" data-set-default="${card.id}">Definir padrão</button>`
        }
        ${!card.isDefault ? `
          <button class="contact-row__delete" data-delete-card="${card.id}" aria-label="Remover cartão">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>` : ''}
      </div>
    </div>`).join('');

  // Definir padrão
  list.querySelectorAll('[data-set-default]').forEach(btn => {
    btn.addEventListener('click', () => {
      _cards.forEach(c => c.isDefault = c.id === btn.dataset.setDefault);
      renderCards();
      showToast('Cartão padrão atualizado');
      vibrate(10);
    });
  });

  // Remover cartão
  list.querySelectorAll('[data-delete-card]').forEach(btn => {
    btn.addEventListener('click', () => {
      _cards = _cards.filter(c => c.id !== btn.dataset.deleteCard);
      renderCards();
      showToast('Cartão removido', { type: 'danger' });
    });
  });
}