import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { sendSOS, sendMotionAlert, addSafetyActivity, addEmergencyContact, removeEmergencyContact, updateSettings } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { openSheet, closeSheet } from '../components/sheet.js';
import { escapeHtml, qs, qsa, vibrate } from '../utils/dom.js';
import { relativeTime } from '../utils/dates.js';
import { uid } from '../utils/format.js';
import { setFieldError, clearFieldError } from '../utils/validate.js';
import { MotionGuard } from '../utils/motionGuard.js';

const SOS_HOLD_MS = 2000;
const SOS_COUNTDOWN_S = 5;
const MOTION_ALERT_COUNTDOWN_S = 15;
let _sosTimer = null;
let _motionAlertTimer = null;

export function initSafety() {
  Router.register('safety', { onShow: () => renderSafety(Store.getState()) });

  initSosButton();
  initContactForm();
  // initCheckinForm();
  initShareLocation();
  initMotionDetection();
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

  syncMotionGuardToggle(state);
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

function initShareLocation() {
  const btn = qs('#share-location-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const state = Store.getState();
    const trip = state.trips.find(t => t.status === 'upcoming') || state.trips[0];
    const dest = trip ? state.destinations.find(d => d.id === trip.destinationId) : null;

    const data = {
      name: state.profile.name,
      dest: dest ? `${dest.name}, ${dest.country}` : 'On a trip',
      dates: trip ? `${trip.startDate} to ${trip.endDate}` : '',
      status: 'protected',
      ts: Date.now(),
    };

    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    const base = window.location.origin + window.location.pathname.replace('index.html', '');
    const link = `${base}acompanhar.html?v=${encoded}`;

    const urlEl = qs('#sharelink-url');
    urlEl.textContent = link;
    urlEl.href = link;

    qs('#sharelink-copy-btn').onclick = () => {
      navigator.clipboard?.writeText(link);
      showToast('Link copied!');
      vibrate(15);
    };

    qs('#sharelink-whatsapp-btn').onclick = () => {
      const msg = `Hi! I'm traveling and want you to follow my trip on Vouya.\n\nDestination: ${data.dest}\nDates: ${data.dates}\n\nAccess here: ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    openSheet('sharelink');
    addSafetyActivity('🔗', 'Location sharing link generated');
  });

  qs('#sharelink-backdrop')?.addEventListener('click', () => closeSheet('sharelink'));
  qsa('[data-close-sheet="sharelink"]').forEach(b => b.addEventListener('click', () => closeSheet('sharelink')));
}

// ---------------------------------------------------------------------------
// Motion anomaly detection (walking -> running / sudden movement)
//
// Only runs while this tab is open and the screen is on — browsers suspend
// sensor access once the screen locks or the app goes to the background.
// ---------------------------------------------------------------------------
function initMotionDetection() {
  const toggle = qs('#motion-guard-toggle');
  const statusEl = qs('#motion-guard-status');
  if (!toggle) return;

  qs('#motion-alert-backdrop')?.addEventListener('click', () => {
    clearInterval(_motionAlertTimer);
    closeMotionAlertSheet();
  });

  toggle.addEventListener('click', async () => {
    const turningOn = !toggle.classList.contains('is-on');

    if (turningOn) {
      const state = Store.getState();
      if (state.emergencyContacts.length === 0) {
        showToast('Add an emergency contact first', { type: 'danger', actionLabel: 'Add', onAction: () => openSheet('contact') });
        return;
      }
      if (!MotionGuard.isSupported()) {
        showToast('Your browser doesn\'t support motion sensors', { type: 'danger' });
        return;
      }
      const started = await MotionGuard.start({ onAnomaly: openMotionAlertSheet });
      if (!started) {
        showToast('Motion permission denied — enable it in your browser settings', { type: 'danger' });
        return;
      }
      applyMotionGuardUI(true);
      updateSettings({ motionGuardEnabled: true });
      vibrate(15);
      addSafetyActivity('🏃', 'Motion detection turned on');
    } else {
      MotionGuard.stop();
      applyMotionGuardUI(false);
      updateSettings({ motionGuardEnabled: false });
    }
  });
}

function applyMotionGuardUI(on) {
  const toggle = qs('#motion-guard-toggle');
  const statusEl = qs('#motion-guard-status');
  if (!toggle || !statusEl) return;
  toggle.classList.toggle('is-on', on);
  toggle.setAttribute('aria-checked', String(on));
  statusEl.textContent = on
    ? 'On — Vouya will check in if it senses sudden movement'
    : 'Off — works while Vouya is open and the screen is on';
}

let _motionSyncInFlight = false;

// Runs every time the Safety screen is shown (called from renderSafety) so
// the toggle always reflects the saved preference — same idea as Dark Mode.
// If it was left on, we also try to silently resume the sensor listener;
// on iOS this can still require a fresh permission tap each page load, so
// we're honest in the UI if that resume didn't actually succeed.
function syncMotionGuardToggle(state) {
  const on = !!state.settings.motionGuardEnabled;
  applyMotionGuardUI(on);

  if (on && !_motionSyncInFlight) {
    _motionSyncInFlight = true;
    MotionGuard.start({ onAnomaly: openMotionAlertSheet }).then((started) => {
      _motionSyncInFlight = false;
      if (!started) {
        applyMotionGuardUI(false);
        updateSettings({ motionGuardEnabled: false });
      }
    });
  }
}

function openMotionAlertSheet() {
  vibrate([60, 40, 60, 40, 60]);

  const imokBtn = qs('#motion-alert-imok');
  const helpBtn = qs('#motion-alert-help');

  // Reset both buttons every time the sheet opens — avoids leftover
  // styling/text from a previous "alert sent" state.
  imokBtn.style.display = '';
  imokBtn.textContent = "I'm okay, cancel";
  imokBtn.className = 'btn btn--primary btn--block';
  imokBtn.onclick = () => {
    clearInterval(_motionAlertTimer);
    closeMotionAlertSheet();
    showToast("Glad you're okay!");
    vibrate(15);
  };

  helpBtn.style.display = '';
  helpBtn.textContent = 'I need help now';
  helpBtn.className = 'btn btn--outline-danger btn--block';
  helpBtn.onclick = () => {
    clearInterval(_motionAlertTimer);
    fireMotionAlert();
  };

  qs('#motion-alert-sms-actions').innerHTML = '';
  qs('#motion-alert-countdown').style.display = '';
  qs('#motion-alert-sub').textContent = "Are you okay? If you don't respond, we'll send your exact location to your emergency contacts in";
  qs('#motion-alert-icon').classList.add('sos-sheet__icon--warning');
  qs('#motion-alert-icon').classList.remove('is-sent');
  qs('#motion-alert-title').textContent = 'Unusual movement detected';

  qs('#motion-alert-backdrop').classList.add('is-active');
  qs('#motion-alert-sheet').classList.add('is-active');

  let count = MOTION_ALERT_COUNTDOWN_S;
  qs('#motion-alert-countdown').textContent = count;
  _motionAlertTimer = setInterval(() => {
    count -= 1;
    if (count <= 0) { clearInterval(_motionAlertTimer); fireMotionAlert(); }
    else qs('#motion-alert-countdown').textContent = count;
  }, 1000);
}

// Builds an sms: link that opens the phone's own Messages app with the
// number and message pre-filled — works offline, no third-party app needed.
function smsLink(phone, msg) {
  const digits = (phone || '').replace(/[^\d+]/g, '');
  return `sms:${digits}?&body=${encodeURIComponent(msg)}`;
}

function fireMotionAlert() {
  const state = Store.getState();
  const contacts = state.emergencyContacts;
  const contactNames = contacts.map(c => c.name).join(' and ') || 'your contacts';

  getExactLocation().then(({ label, mapsUrl }) => {
    const msg = `⚠️ Vouya automatic alert: unusual movement detected and no response received.\n\nExact location: ${mapsUrl}`;

    qs('#motion-alert-icon').classList.remove('sos-sheet__icon--warning');
    qs('#motion-alert-icon').classList.add('is-sent');
    qs('#motion-alert-icon').innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    qs('#motion-alert-title').textContent = 'Your location has been sent';
    qs('#motion-alert-sub').textContent = `${contactNames} received an alert about the movement we detected, along with your exact location (${label}).`;
    qs('#motion-alert-countdown').style.display = 'none';

    // One real SMS button per contact, using their actual phone number.
    qs('#motion-alert-sms-actions').innerHTML = contacts.map(c => `
      <a class="btn btn--primary btn--block" href="${smsLink(c.phone, msg)}">Send SMS to ${escapeHtml(c.name.split(' ')[0])}</a>
    `).join('');

    // The old "help" button already did its job — hide it, the SMS
    // buttons above replace it.
    qs('#motion-alert-help').style.display = 'none';

    // "I'm okay" button becomes the Done/close action, same pattern the
    // SOS sheet already uses once its alert has been sent.
    const imokBtn = qs('#motion-alert-imok');
    imokBtn.style.display = '';
    imokBtn.textContent = 'Done';
    imokBtn.className = 'btn btn--ghost btn--block';
    imokBtn.onclick = () => closeMotionAlertSheet();

    // Best-effort auto-open of the SMS app for the first contact — this
    // fires from a timer, not a direct tap, so some browsers may block it.
    // The buttons above are the reliable fallback either way.
    if (contacts[0]) {
      try { window.location.href = smsLink(contacts[0].phone, msg); } catch { /* blocked — buttons still work */ }
    }

    vibrate([0, 80, 60, 80, 60, 80]);
    sendMotionAlert(contactNames, label);
    renderSafety();
  });
}

function getExactLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(fallbackLocation());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        resolve({
          label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          mapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
        });
      },
      () => resolve(fallbackLocation()),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}

function fallbackLocation() {
  // Used if location permission is denied/unavailable — falls back to the
  // trip destination, same source of truth as the "share location" feature.
  const state = Store.getState();
  const trip = state.trips.find(t => t.status === 'upcoming') || state.trips[0];
  const dest = trip ? state.destinations.find(d => d.id === trip.destinationId) : null;
  const label = dest ? `near ${dest.name}, ${dest.country}` : 'last known trip area';
  return { label, mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(label)}` };
}

function closeMotionAlertSheet() {
  qs('#motion-alert-backdrop').classList.remove('is-active');
  qs('#motion-alert-sheet').classList.remove('is-active');
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
