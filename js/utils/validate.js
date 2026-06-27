import { qs } from './dom.js';

export function setFieldError(inputId, message) {
  qs(`#${inputId}`)?.closest('.field')?.classList.add('has-error');
  const el = qs(`[data-error-for="${inputId}"]`);
  if (el) { if (message) el.textContent = message; el.hidden = false; }
}

export function clearFieldError(inputId) {
  qs(`#${inputId}`)?.closest('.field')?.classList.remove('has-error');
  const el = qs(`[data-error-for="${inputId}"]`);
  if (el) el.hidden = true;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
