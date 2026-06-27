const $overlay = () => document.getElementById('loading-overlay');

export function showLoading() { $overlay().classList.add('is-active'); }
export function hideLoading() { $overlay().classList.remove('is-active'); }

export function simulateAsync(callback, delay = 800) {
  showLoading();
  setTimeout(() => { hideLoading(); callback(); }, delay);
}
