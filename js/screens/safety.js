import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { sendSOS, addSafetyActivity, addEmergencyContact, removeEmergencyContact } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { openSheet, closeSheet } from '../components/sheet.js';
import { escapeHtml, qs, qsa, vibrate } from '../utils/dom.js';
import { relativeTime } from '../utils/dates.js';
import { uid } from '../utils/format.js';
import { setFieldError, clearFieldError } from '../utils/validate.js';

const SOS_HOLD_MS = 2000;
const SOS_COUNTDOWN_S = 5;
let _sosTimer = null;

export function initSafety() {
  Router.register('safety', { onShow: () => renderSafety(Store.getState()) });

  initSosButton();
  initContactForm();
}

export function renderSafety() {
  const state = Store.getState();

  const list = qs('#contact-list');
  if (state.emergencyContacts.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding:24px 12px;">
        <div class="empty-state__icon">🛟</div>
        <p class="empty-state__title">No emergency contacts yet</p>
        <p class="empty-state__sub">Add at least one contact so SOS alerts have somewhere to go.</p>
      </div>
      <button class="contact-row contact-row--add" id="add-contact-row">
        <span class="contact-row__add-icon">+</span><span>Add emergency contact</span>
      </button>`;
  } else {
    list.innerHTML = state.emergencyContacts.map(c => `
      <div class="contact-row">
        <img class="avatar avatar--sm" src="https://i.pravatar.cc/64?img=${c.avatar}" alt="">
        <div class="contact-row__body"><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.relation)}</span></div>
        <button class="icon-btn icon-btn--soft" data-call-contact="${c.id}" aria-label="Call">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" stroke="currentColor" stroke-width="1.6"/></svg>
        </button>
        <button class="contact-row__delete" data-delete-contact="${c.id}" aria-label="Remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>`).join('') + `
      <button class="contact-row contact-row--add" id="add-contact-row">
        <span class="contact-row__add-icon">+</span><span>Add emergency contact</span>
      </button>`;
  }

  qs('#add-contact-row')?.addEventListener('click', () => openSheet('contact'));

  qs('#safety-activity-list').innerHTML = state.safetyActivity
    .slice().sort((a, b) => b.time - a.time).slice(0, 4)
    .map(a => `
      <div class="activity-row">
        <span class="activity-row__icon">${a.icon}</span>
        <div class="activity-row__body"><strong>${escapeHtml(a.text)}</strong><span>${relativeTime(a.time)}</span></div>
      </div>`).join('') || `<p style="font-size:13px;color:var(--color-gray);">No recent activity.</p>`;
}

function initSosButton() {
  const sosBtn = qs('#sos-btn');
  const progressEl = qs('#sos-progress');
  const hintEl = qs('#sos-hint');
  let rafId = null;

  function startHold(e) {
    e.preventDefault();
    if (sosBtn.classList.contains('is-charging')) return;
    const state = Store.getState();
    if (state.emergencyContacts.length === 0) {
      showToast('Add an emergency contact first', { type: 'danger', actionLabel: 'Add', onAction: () => openSheet('contact') });
      return;
    }
    sosBtn.classList.add('is-charging');
    const holdStart = performance.now();
    hintEl.textContent = 'Keep holding…';
    vibrate(20);

    const tick = () => {
      const pct = Math.min(100, ((performance.now() - holdStart) / SOS_HOLD_MS) * 100);
      progressEl.style.setProperty('--sos-p', `${pct}%`);
      if (pct >= 100) { triggerSosFlow(); return; }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  function cancelHold() {
    if (!sosBtn.classList.contains('is-charging')) return;
    cancelAnimationFrame(rafId);
    sosBtn.classList.remove('is-charging');
    progressEl.style.setProperty('--sos-p', '0%');
    hintEl.textContent = 'Press and hold for 2 seconds to alert your contacts';
  }

  function triggerSosFlow() {
    cancelAnimationFrame(rafId);
    sosBtn.classList.remove('is-charging');
    progressEl.style.setProperty('--sos-p', '0%');
    hintEl.textContent = 'Press and hold for 2 seconds to alert your contacts';
    vibrate([30, 60, 30, 60, 30]);
    openSosSheet();
  }

  sosBtn.addEventListener('pointerdown', startHold);
  sosBtn.addEventListener('pointerup', cancelHold);
  sosBtn.addEventListener('pointerleave', cancelHold);
  sosBtn.addEventListener('pointercancel', cancelHold);
}

function openSosSheet() {
  const state = Store.getState();
  const contactNames = state.emergencyContacts.map(c => c.name).join(' and ');

  qs('#sos-sheet-icon').classList.remove('is-sent');
  qs('#sos-sheet-icon').innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="white" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="white" stroke-width="2"/></svg>`;
  qs('#sos-sheet-title').textContent = 'Sending your alert…';
  qs('#sos-sheet-sub').textContent = `Notifying ${contactNames} with your live location in`;
  qs('#sos-countdown').textContent = SOS_COUNTDOWN_S;
  qs('#sos-countdown').style.display = '';

  const cancelBtn = qs('#sos-cancel');
  cancelBtn.style.display = '';
  cancelBtn.textContent = 'Cancel alert';
  cancelBtn.className = 'btn btn--outline-danger btn--block';

  qs('#sos-backdrop').classList.add('is-active');
  qs('#sos-sheet').classList.add('is-active');

  let count = SOS_COUNTDOWN_S;
  _sosTimer = setInterval(() => {
    count -= 1;
    if (count <= 0) { clearInterval(_sosTimer); fireSosAlert(contactNames); }
    else qs('#sos-countdown').textContent = count;
  }, 1000);

  cancelBtn.onclick = () => {
    clearInterval(_sosTimer);
    closeSosSheet();
    showToast('Alert canceled');
  };
}

function fireSosAlert(contactNames) {
  qs('#sos-sheet-icon').classList.add('is-sent');
  qs('#sos-sheet-icon').innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  qs('#sos-sheet-title').textContent = 'Your contacts have been alerted';
  qs('#sos-sheet-sub').textContent = `${contactNames} received your live location and a request to check in.`;
  qs('#sos-countdown').style.display = 'none';
  const cancelBtn = qs('#sos-cancel');
  cancelBtn.textContent = 'Done';
  cancelBtn.className = 'btn btn--ghost btn--block';
  cancelBtn.onclick = () => closeSosSheet();
  vibrate([0, 80, 60, 80]);

  sendSOS(contactNames);
  renderSafety();
}

function closeSosSheet() {
  qs('#sos-backdrop').classList.remove('is-active');
  qs('#sos-sheet').classList.remove('is-active');
}

function initContactForm() {
  qs('#contact-backdrop').addEventListener('click', () => closeSheet('contact'));
  qsa('[data-close-sheet="contact"]').forEach(btn => btn.addEventListener('click', () => closeSheet('contact')));

  ['contact-name', 'contact-relation', 'contact-phone'].forEach(id => {
    qs(`#${id}`).addEventListener('input', () => clearFieldError(id));
  });

  qs('#contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = qs('#contact-name');
    const relInput = qs('#contact-relation');
    const phoneInput = qs('#contact-phone');

    let valid = true;
    if (!nameInput.value.trim()) { setFieldError('contact-name'); valid = false; } else clearFieldError('contact-name');
    if (!relInput.value.trim()) { setFieldError('contact-relation'); valid = false; } else clearFieldError('contact-relation');
    if (phoneInput.value.replace(/\D/g, '').length < 7) { setFieldError('contact-phone'); valid = false; } else clearFieldError('contact-phone');
    if (!valid) { vibrate(20); return; }

    addEmergencyContact({
      id: uid('contact'),
      name: nameInput.value.trim(),
      relation: relInput.value.trim(),
      phone: phoneInput.value.trim(),
      avatar: Math.floor(Math.random() * 70) + 1,
    });
    renderSafety();
    closeSheet('contact');
    e.target.reset();
    showToast(`${nameInput.value.trim()} added as an emergency contact`);
  });
}

// Called from global delegation
export function handleDeleteContact(contactId) {
  removeEmergencyContact(contactId);
  renderSafety();
  showToast('Contact removed', { type: 'danger' });
}

export function handleCallContact(contactId) {
  const contact = Store.getState().emergencyContacts.find(c => c.id === contactId);
  if (contact) showToast(`Calling ${contact.name.split(' ')[0]}…`);
}
