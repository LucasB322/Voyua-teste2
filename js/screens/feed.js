import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { toggleLikePost } from '../store/actions.js';
import { postCardHtml } from '../components/post-card.js';
import { qs, qsa } from '../utils/dom.js';

let _filter = 'all';

export function initFeed() {
  Router.register('feed', { onShow: () => render(Store.getState()) });

  qsa('[data-feed-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      qsa('[data-feed-filter]').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      _filter = chip.dataset.feedFilter;
      render(Store.getState());
    });
  });
}

export function renderFeed() {
  render(Store.getState());
}

function render(state) {
  const list = qs('#feed-list');
  if (!list) return;

  let posts = state.posts.slice().sort((a, b) => b.time - a.time);
  if (_filter === 'mine') posts = posts.filter(p => p.authorIsMe);

  if (posts.length === 0) {
    list.innerHTML = _filter === 'mine'
      ? `<div class="empty-state"><div class="empty-state__icon">✍️</div><p class="empty-state__title">You haven't posted yet</p><p class="empty-state__sub">Tap the + button to write a review or share a moment.</p></div>`
      : `<div class="empty-state"><div class="empty-state__icon">🌍</div><p class="empty-state__title">No posts yet</p><p class="empty-state__sub">Be the first to share something.</p></div>`;
    return;
  }
  list.innerHTML = posts.map(p => postCardHtml(p, state.destinations, state.profile.name)).join('');

  // Like buttons
  list.querySelectorAll('[data-like-post]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLikePost(btn.dataset.likePost);
      render(Store.getState());
    });
  });
}
