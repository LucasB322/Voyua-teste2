export function openSheet(name) {
  document.getElementById(`${name}-backdrop`)?.classList.add('is-active');
  document.getElementById(`${name}-sheet`)?.classList.add('is-active');
}

export function closeSheet(name) {
  document.getElementById(`${name}-backdrop`)?.classList.remove('is-active');
  document.getElementById(`${name}-sheet`)?.classList.remove('is-active');
}
