export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function planningPercent(trip) {
  const vals = Object.values(trip.steps);
  return Math.round((vals.filter(Boolean).length / vals.length) * 100);
}
