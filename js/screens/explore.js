import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { destCardHtml, destRowHtml } from '../components/dest-card.js';
import { escapeHtml, qs, qsa } from '../utils/dom.js';

let _activeFilter = 'all';
let _activeDetailDestId = null;

export function initExplore() {
  Router.register('explore', {
    onShow: () => {
      const state = Store.getState();
      renderTrendingRail(state);
      renderExploreList(state);
    },
  });

  const chips = qsa('.chip-row .chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      _activeFilter = chip.dataset.filter;
      renderExploreList(Store.getState(), qs('#explore-search').value.trim());
    });
  });

  qs('#explore-search').addEventListener('input', (e) => {
    renderExploreList(Store.getState(), e.target.value.trim());
  });
}

function renderTrendingRail(state) {
  const trending = [...state.destinations].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
  qs('#trending-rail').innerHTML = trending.map(d => destCardHtml(d, state.favorites.includes(d.id), { large: true })).join('');
}

function renderExploreList(state, searchTerm = '') {
  let results = _activeFilter === 'all'
    ? state.destinations
    : state.destinations.filter(d => d.tag === _activeFilter);
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    results = results.filter(d => d.name.toLowerCase().includes(term) || d.country.toLowerCase().includes(term));
  }
  const list = qs('#explore-list');
  if (results.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🧭</div>
        <p class="empty-state__title">No destinations found</p>
        <p class="empty-state__sub">${searchTerm ? `No matches for "${escapeHtml(searchTerm)}".` : 'Try a different filter.'}</p>
      </div>`;
    return;
  }
  list.innerHTML = results.map(d => destRowHtml(d)).join('');
}

/* ---- Explore Detail ---- */

export function initExploreDetail() {
  Router.register('explore-detail', {
    onShow: ({ destId }) => {
      if (destId) _activeDetailDestId = destId;
      if (_activeDetailDestId) renderDetail(Store.getState(), _activeDetailDestId);
    },
  });

  qsa('[data-detail-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      qsa('[data-detail-tab]').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      qsa('[data-detail-panel]').forEach(p => p.classList.remove('is-active'));
      qs(`[data-detail-panel="${tab.dataset.detailTab}"]`).classList.add('is-active');
    });
  });

  qs('#detail-book-btn').addEventListener('click', () => {
    if (_activeDetailDestId) Router.go('booking', { params: { destId: _activeDetailDestId } });
  });
}

export function openDestinationDetail(destId) {
  _activeDetailDestId = destId;
  Router.go('explore-detail', { params: { destId } });
}

export function getActiveDetailDestId() {
  return _activeDetailDestId;
}

function renderDetail(state, destId) {
  const dest = state.destinations.find(d => d.id === destId);
  if (!dest) return;

  qs('#detail-hero').style.backgroundImage = `url('${dest.img}')`;
  qs('#detail-name').textContent = dest.name;
  qs('#detail-country').textContent = dest.country;
  qs('#detail-rating').textContent = `★ ${dest.rating}`;
  qs('#detail-review-count').textContent = dest.reviewCount.toLocaleString();
  qs('#detail-price').textContent = `$${dest.price}`;
  qs('#detail-desc').textContent = dest.desc;

  const favBtn = qs('#detail-fav-btn');
  favBtn.dataset.fav = dest.id;
  favBtn.classList.toggle('is-fav', state.favorites.includes(dest.id));

  const ring = qs('#detail-safety-ring');
  ring.style.setProperty('--p', dest.safetyScore);
  qs('#detail-safety-score').textContent = dest.safetyScore;
  qs('#detail-safety-label').textContent = dest.safetyLabel;
  ring.style.background = dest.safetyScore >= 80
    ? `conic-gradient(var(--color-secondary) calc(var(--p) * 1%), var(--color-gray-light) 0)`
    : dest.safetyScore >= 60
      ? `conic-gradient(var(--color-amber) calc(var(--p) * 1%), var(--color-gray-light) 0)`
      : `conic-gradient(var(--color-danger) calc(var(--p) * 1%), var(--color-gray-light) 0)`;

  qs('#detail-thumbs').innerHTML = dest.thumbs.map(src => `<div class="thumb" style="background-image:url('${src}')"></div>`).join('');

  qs('#detail-reviews').innerHTML = dest.reviews.map(r => `
    <div class="review">
      <img class="avatar avatar--sm" src="https://i.pravatar.cc/64?img=${r.avatar}" alt="">
      <div>
        <div class="review__row"><strong>${escapeHtml(r.name)}</strong><span class="rating">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span></div>
        <p>${escapeHtml(r.text)}</p>
      </div>
    </div>`).join('') || '<p style="color:var(--color-gray);font-size:13px;">No reviews yet.</p>';

  qs('#detail-safety-list').innerHTML = dest.safetyPoints.map(p =>
    `<li><span class="dot dot--${p.level}"></span> ${escapeHtml(p.text)}</li>`
  ).join('');

  // Reset to overview tab
  qsa('[data-detail-tab]').forEach(t => t.classList.toggle('is-active', t.dataset.detailTab === 'overview'));
  qsa('[data-detail-panel]').forEach(p => p.classList.toggle('is-active', p.dataset.detailPanel === 'overview'));
}
