import { escapeHtml } from '../utils/dom.js';

function formatPrice(price) {
  const cur = window._activeCurrency || { symbol: '$', code: 'USD' };
  return `${cur.symbol}${price}`;
}

export function destCardHtml(dest, isFav, { large = false } = {}) {
  return `
    <div class="dest-card${large ? ' dest-card--lg' : ''}" data-open-detail="${dest.id}">
      <div class="dest-card__img" style="background-image:url('${dest.img}')">
        <span class="badge badge--light dest-card__price">${formatPrice(dest.price)}</span>
        <button class="dest-card__fav${isFav ? ' is-fav' : ''}" data-fav="${dest.id}" aria-label="Save to favorites">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.4 2.4 5 6 5c2 0 3.4 1 4 2.3C10.6 6 12 5 14 5c3.6 0 5.5 3.4 4 6.7C19.5 16.3 12 21 12 21z" stroke="currentColor" stroke-width="1.8"/></svg>
        </button>
      </div>
      <div class="dest-card__body">
        <h4>${escapeHtml(dest.name)}</h4>
        <p>${escapeHtml(dest.country)} · <span class="rating">★ ${dest.rating}</span></p>
      </div>
    </div>`;
}

export function destRowHtml(dest) {
  return `
    <button class="dest-row" data-open-detail="${dest.id}">
      <div class="dest-row__img" style="background-image:url('${dest.img}')"></div>
      <div class="dest-row__body">
        <h4>${escapeHtml(dest.name)}</h4>
        <p>${escapeHtml(dest.country)} · <span class="rating">★ ${dest.rating}</span></p>
      </div>
      <div class="dest-row__price"><strong>${formatPrice(dest.price)}</strong><span>/ person</span></div>
    </button>`;
}