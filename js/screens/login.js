import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { showToast } from '../components/toast.js';
import { qs, qsa, vibrate } from '../utils/dom.js';
import { setFieldError, clearFieldError, isValidEmail } from '../utils/validate.js';

export function initLogin() {
  const tabs = qsa('.login__tab');
  const submitBtn = qs('#login-submit');
  const togglePass = qs('#toggle-pass');
  const passInput = qs('#login-pass');
  const emailInput = qs('#login-email');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      submitBtn.querySelector('.btn__label').textContent =
        tab.dataset.loginTab === 'signup' ? 'Create account' : 'Sign in';
    });
  });

  togglePass.addEventListener('click', () => {
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    togglePass.setAttribute('aria-label', isPass ? 'Hide password' : 'Show password');
  });

  emailInput.addEventListener('input', () => clearFieldError('login-email'));
  passInput.addEventListener('input', () => clearFieldError('login-pass'));

  qs('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.classList.contains('is-loading')) return;
    let valid = true;
    if (!isValidEmail(emailInput.value)) { setFieldError('login-email'); valid = false; } else clearFieldError('login-email');
    if (passInput.value.length < 6) { setFieldError('login-pass'); valid = false; } else clearFieldError('login-pass');
    if (!valid) { vibrate(20); return; }

    submitBtn.classList.add('is-loading');
    setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      Router.clearHistory();
      Router.go('home', { pushHistory: false });
      setTimeout(() => showToast(`Welcome back, ${Store.getState().profile.name.split(' ')[0]} 👋`), 350);
    }, 1100);
  });
}
