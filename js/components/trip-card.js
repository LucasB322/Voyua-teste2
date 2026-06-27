import { escapeHtml } from '../utils/dom.js';
import { formatDateRange, daysUntil } from '../utils/dates.js';
import { planningPercent } from '../utils/format.js';

export function tripCardHtml(trip) {
  const pct = planningPercent(trip);
  const days = daysUntil(trip.startDate);
  const dayLabel = days <= 0 ? 'Happening now' : days === 1 ? 'Tomorrow' : `In ${days} days`;
  const stepLabels = { flights: 'Flights', hotel: 'Hotel', activities: 'Activities', packing: 'Packing' };
  const entries = Object.entries(trip.steps);
  const firstUndoneIdx = entries.findIndex(([, d]) => !d);
  const stepsHtml = entries.map(([key, done], i) => {
    const cls = done ? 'is-done' : (i === firstUndoneIdx ? 'is-active' : '');
    return `<span class="trip-card__step ${cls}">${stepLabels[key]}</span>`;
  }).join('');

  return `
    <article class="trip-card" data-open-trip="${trip.id}">
      <div class="trip-card__img" style="background-image:url('${trip.img}')"></div>
      <div class="trip-card__body">
        <div class="trip-card__top">
          <h3>${escapeHtml(trip.place)}</h3>
          <span class="badge badge--blue">${dayLabel}</span>
        </div>
        <p class="trip-card__dates">${formatDateRange(trip.startDate, trip.endDate)}</p>
        <div class="progress">
          <div class="progress__bar"><span style="width:${pct}%"></span></div>
          <span class="progress__label">Planning ${pct}% complete</span>
        </div>
        <div class="trip-card__timeline">${stepsHtml}</div>
      </div>
    </article>`;
}

export function pastTripCardHtml(trip) {
  return `
    <article class="trip-card trip-card--past">
      <div class="trip-card__img" style="background-image:url('${trip.img}')"></div>
      <div class="trip-card__body">
        <div class="trip-card__top">
          <h3>${escapeHtml(trip.place)}</h3>
          <span class="badge badge--gray">Completed</span>
        </div>
        <p class="trip-card__dates">${formatDateRange(trip.startDate, trip.endDate)}</p>
        ${trip.reviewed
          ? `<span style="font-size:12px;color:var(--color-secondary);font-weight:600;">✓ Review submitted</span>`
          : `<button class="link-btn" data-leave-review="${trip.id}">Leave a review</button>`}
      </div>
    </article>`;
}
