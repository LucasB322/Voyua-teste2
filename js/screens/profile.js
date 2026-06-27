import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { updateSettings, updateProfile, addSafetyActivity } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { simulateAsync } from '../components/loading.js';
import { openSheet, closeSheet } from '../components/sheet.js';
import { qs, vibrate } from '../utils/dom.js';
import { setFieldError, clearFieldError } from '../utils/validate.js';

export function initProfile() {
  Router.register('profile', { onShow: () => render(Store.getState()) });

  qs('#dark-mode-toggle').addEventListener('click', () => {
    const s = Store.getState();
    updateSettings({ darkMode: !s.settings.darkMode });
    render(Store.getState());
    showToast(Store.getState().settings.darkMode ? 'Dark mode on' : 'Dark mode off');
  });

  qs('#location-toggle').addEventListener('click', () => {
    const s = Store.getState();
    updateSettings({ locationSharing: !s.settings.locationSharing });
    render(Store.getState());
    const on = Store.getState().settings.locationSharing;
    showToast(on ? 'Location sharing enabled' : 'Location sharing disabled', { type: on ? 'success' : 'danger' });
    if (!on) addSafetyActivity('📍', 'Location sharing turned off');
  });

  qs('#notif-toggle').addEventListener('click', () => {
    const s = Store.getState();
    updateSettings({ pushNotifications: !s.settings.pushNotifications });
    render(Store.getState());
    showToast(Store.getState().settings.pushNotifications ? 'Notifications enabled' : 'Notifications disabled');
  });

  qs('#payment-methods-btn').addEventListener('click', () => {
    const pm = Store.getState().paymentMethods[0];
    showToast(pm ? `${pm.brand} ending in ${pm.last4} is your default card` : 'No payment method on file yet');
  });

  qs('#edit-profile-btn').addEventListener('click', () => {
    const s = Store.getState();
    qs('#profile-name-input').value = s.profile.name;
    qs('#profile-tier-input').value = s.profile.tier;
    openSheet('profile');
  });

  initLogoutModal();
  initResetModal();
  initProfileForm();
}

function render(state) {
  qs('#profile-name').textContent = state.profile.name;
  qs('#profile-meta').textContent = `Member since ${state.profile.memberSince} · ${state.profile.tier} tier`;

  const countries = new Set(state.trips.map(t => state.destinations.find(d => d.id === t.destinationId)?.country).filter(Boolean));
  qs('#stat-countries').textContent = countries.size;
  qs('#stat-trips').textContent = state.trips.length;
  qs('#stat-rating').textContent = state.profile.rating.toFixed(1);

  const { darkMode, locationSharing, pushNotifications } = state.settings;
  setToggle('#dark-mode-toggle', darkMode);
  setToggle('#location-toggle', locationSharing);
  setToggle('#notif-toggle', pushNotifications);

  const pm = state.paymentMethods[0];
  qs('#payment-summary').textContent = pm ? `${pm.brand} •••• ${pm.last4}` : 'No card on file';

  document.getElementById('app').setAttribute('data-theme', darkMode ? 'dark' : 'light');
}

function setToggle(sel, on) {
  const el = qs(sel);
  el.classList.toggle('is-on', on);
  el.setAttribute('aria-checked', String(on));
}

function initLogoutModal() {
  const modal = qs('#logout-modal');
  qs('#logout-btn').addEventListener('click', () => openModal(modal));
  qs('#logout-cancel').addEventListener('click', () => closeModal(modal));
  qs('#logout-confirm').addEventListener('click', () => {
    closeModal(modal);
    simulateAsync(() => {
      Router.clearHistory();
      Router.go('login', { pushHistory: false });
      qs('#login-pass').value = '';
      showToast('You have been logged out');
    }, 700);
  });
}

function initResetModal() {
  const modal = qs('#reset-modal');
  qs('#reset-data-btn').addEventListener('click', () => openModal(modal));
  qs('#reset-cancel').addEventListener('click', () => closeModal(modal));
  qs('#reset-confirm').addEventListener('click', () => {
    closeModal(modal);
    simulateAsync(() => {
      Store.reset();
      render(Store.getState());
      document.getElementById('app').setAttribute('data-theme', 'light');
      showToast('Demo data has been reset');
    }, 900);
  });

  qs('#modal-backdrop').addEventListener('click', () => {
    closeModal(qs('#logout-modal'));
    closeModal(qs('#reset-modal'));
  });
}

function initProfileForm() {
  qs('#profile-backdrop').addEventListener('click', () => closeSheet('profile'));
  qs('[data-close-sheet="profile"]')?.addEventListener('click', () => closeSheet('profile'));
  qs('#profile-name-input').addEventListener('input', () => clearFieldError('profile-name-input'));

  qs('#profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = qs('#profile-name-input');
    if (!nameInput.value.trim()) { setFieldError('profile-name-input'); vibrate(20); return; }
    clearFieldError('profile-name-input');
    updateProfile(nameInput.value.trim(), qs('#profile-tier-input').value);
    render(Store.getState());
    closeSheet('profile');
    showToast('Profile updated');
  });
}

function openModal(el) {
  el.classList.add('is-active');
  qs('#modal-backdrop').classList.add('is-active');
}
function closeModal(el) {
  el.classList.remove('is-active');
  if (!qs('.modal.is-active')) qs('#modal-backdrop').classList.remove('is-active');
}
