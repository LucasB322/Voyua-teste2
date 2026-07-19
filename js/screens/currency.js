import { Router } from '../router/router.js';
import { showToast } from '../components/toast.js';
import { qs, vibrate } from '../utils/dom.js';

const CURRENCIES = [
  { code: 'BRL', name: 'Brazilian Real',   flag: '🇧🇷', symbol: 'R$' },
  { code: 'USD', name: 'US Dollar',        flag: '🇺🇸', symbol: '$'  },
  { code: 'EUR', name: 'Euro',             flag: '🇪🇺', symbol: '€'  },
  { code: 'GBP', name: 'British Pound',    flag: '🇬🇧', symbol: '£'  },
  { code: 'JPY', name: 'Japanese Yen',     flag: '🇯🇵', symbol: '¥'  },
  { code: 'ARS', name: 'Argentine Peso',   flag: '🇦🇷', symbol: '$'  },
  { code: 'AUD', name: 'Australian Dollar',flag: '🇦🇺', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar',  flag: '🇨🇦', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc',      flag: '🇨🇭', symbol: 'Fr' },
  { code: 'MXN', name: 'Mexican Peso',     flag: '🇲🇽', symbol: '$'  },
];

let _selected = 'BRL';

export function initCurrency() {
  Router.register('currency', { onShow: () => renderCurrencies() });

  qs('#save-currency-btn').addEventListener('click', () => {
    const cur = getSelectedCurrency();
    window._activeCurrency = cur;
    vibrate(15);
    showToast(`Currency set to ${cur.name} (${cur.symbol})`);
    Router.back();
  });
}

function renderCurrencies() {
  const list = qs('#currency-list');
  if (!list) return;

  list.innerHTML = CURRENCIES.map(c => `
    <button class="currency-row${c.code === _selected ? ' is-selected' : ''}" data-code="${c.code}">
      <span class="currency-row__flag">${c.flag}</span>
      <span class="currency-row__body">
        <strong>${c.name}</strong>
        <span>${c.code} · ${c.symbol}</span>
      </span>
      <span class="currency-row__check">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </button>`).join('');

  list.querySelectorAll('[data-code]').forEach(btn => {
    btn.addEventListener('click', () => {
      _selected = btn.dataset.code;
      list.querySelectorAll('.currency-row').forEach(r =>
        r.classList.toggle('is-selected', r.dataset.code === _selected)
      );
      vibrate(10);
    });
  });
}

export function getSelectedCurrency() {
  return CURRENCIES.find(c => c.code === _selected) || CURRENCIES[0];
}