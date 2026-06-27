import { escapeHtml } from '../utils/dom.js';
import { relativeTime } from '../utils/dates.js';

const AVATAR_URL = 'https://i.pravatar.cc/200?img=44';

export function postCardHtml(post, destinations, profileName) {
  const dest = destinations.find(d => d.id === post.destinationId);
  const destLabel = dest ? `${dest.name}, ${dest.country}` : 'Somewhere wonderful';
  const starsHtml = post.type === 'review'
    ? `<div class="post-card__stars">${'★'.repeat(post.stars)}${'☆'.repeat(5 - post.stars)}</div>` : '';
  const imgHtml = post.img ? `<div class="post-card__img" style="background-image:url('${post.img}')"></div>` : '';
  const avatarSrc = post.authorIsMe ? AVATAR_URL : `https://i.pravatar.cc/64?img=${post.authorAvatar}`;

  return `
    <article class="post-card">
      <div class="post-card__head">
        <img class="avatar avatar--sm" src="${avatarSrc}" alt="">
        <div class="post-card__head-body">
          <strong>${escapeHtml(post.authorIsMe ? profileName : post.authorName)}</strong>
          <span class="post-card__head-meta">📍 ${escapeHtml(destLabel)} · ${relativeTime(post.time)}</span>
        </div>
        <span class="post-card__type-badge post-card__type-badge--${post.type}">${post.type === 'review' ? 'Review' : 'Moment'}</span>
      </div>
      ${starsHtml}
      <p class="post-card__text">${escapeHtml(post.text)}</p>
      ${imgHtml}
      <div class="post-card__footer">
        <button class="post-card__action${post.likedByMe ? ' is-liked' : ''}" data-like-post="${post.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${post.likedByMe ? 'currentColor' : 'none'}"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.4 2.4 5 6 5c2 0 3.4 1 4 2.3C10.6 6 12 5 14 5c3.6 0 5.5 3.4 4 6.7C19.5 16.3 12 21 12 21z" stroke="currentColor" stroke-width="1.8"/></svg>
          <span>${post.likes}</span>
        </button>
        <button class="post-card__action" data-open-detail="${post.destinationId}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <span>View destination</span>
        </button>
      </div>
    </article>`;
}
