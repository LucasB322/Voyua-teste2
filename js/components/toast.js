import { escapeHtml } from '../utils/dom.js';

const $stack = () => document.getElementById('toast-stack');

export function showToast(message, { type = 'success', duration = 2800, actionLabel = null, onAction = null } = {}) {
  const toast = document.createElement('div');
  toast.className = `toast${type === 'danger' ? ' toast--danger' : ''}`;
  toast.innerHTML = `<span class="toast__dot"></span><span>${escapeHtml(message)}</span>`;
  if (actionLabel) {
    const btn = document.createElement('button');
    btn.className = 'toast__action';
    btn.textContent = actionLabel;
    btn.addEventListener('click', () => { onAction?.(); remove(); });
    toast.appendChild(btn);
  }
  $stack().appendChild(toast);
  function remove() { toast.classList.add('is-leaving'); setTimeout(() => toast.remove(), 280); }
  const timer = setTimeout(remove, duration);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
}
