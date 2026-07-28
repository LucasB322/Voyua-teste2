// Detecta mudanças bruscas de movimento (ex: de "andando" para "correndo")
// usando o acelerômetro do celular via DeviceMotion API.
//
// LIMITAÇÃO IMPORTANTE: só funciona com a aba/app em primeiro plano e a tela
// ligada. Navegadores suspendem sensores quando a tela apaga ou o app vai para segundo plano.
//
// Uso básico:
//   import { MotionGuard } from './motionGuard.js';
//   MotionGuard.start({ onAnomaly: () => openSheet('motion-alert') });
//   MotionGuard.stop();

const WINDOW_SIZE = 30;        // ~2s de amostras a 15Hz
const CALM_THRESHOLD = 1.2;    // desvio padrão "normal" (andando/parado)
const RUN_THRESHOLD = 3.2;     // desvio padrão que indica corrida/movimento brusco
const SUSTAIN_SAMPLES = 12;    // precisa se manter alto por ~0.8s pra não disparar por 1 solavanco

let buffer = [];
let sustainedHighCount = 0;
let state = 'idle';
let listening = false;
let handlers = { onStateChange: null, onAnomaly: null };
let _boundHandler = null;

function magnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function handleMotion(event) {
  // 'acceleration' já vem sem a gravidade, quando o dispositivo suporta.
  // Fallback pra accelerationIncludingGravity com filtro passa-alta simples.
  const a = event.acceleration && event.acceleration.x != null
    ? event.acceleration
    : event.accelerationIncludingGravity;

  if (!a || a.x == null) return;

  const mag = magnitude(a.x, a.y, a.z);
  buffer.push(mag);
  if (buffer.length > WINDOW_SIZE) buffer.shift();
  if (buffer.length < WINDOW_SIZE) return;

  const variability = stdDev(buffer);

  let newState = state;
  if (variability >= RUN_THRESHOLD) {
    sustainedHighCount++;
    if (sustainedHighCount >= SUSTAIN_SAMPLES) newState = 'alert';
  } else {
    sustainedHighCount = 0;
    newState = variability <= CALM_THRESHOLD ? 'calm' : 'idle';
  }

  if (newState !== state) {
    state = newState;
    handlers.onStateChange && handlers.onStateChange(state, variability);
    if (state === 'alert') {
      handlers.onAnomaly && handlers.onAnomaly(variability);
    }
  }
}

export const MotionGuard = {
  // iOS 13+ exige permissão explícita, pedida a partir de um toque do usuário
  // (não dá pra chamar isso sozinho ao carregar a página).
  async requestPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const result = await DeviceMotionEvent.requestPermission();
        return result === 'granted';
      } catch {
        return false;
      }
    }
    return true; // Android / navegadores que não exigem permissão explícita
  },

  isSupported() {
    return typeof DeviceMotionEvent !== 'undefined';
  },

  async start({ onAnomaly, onStateChange } = {}) {
    if (listening) return true;
    if (!this.isSupported()) return false;

    const granted = await this.requestPermission();
    if (!granted) return false;

    handlers.onAnomaly = onAnomaly || null;
    handlers.onStateChange = onStateChange || null;
    buffer = [];
    sustainedHighCount = 0;
    state = 'idle';

    _boundHandler = handleMotion;
    window.addEventListener('devicemotion', _boundHandler);
    listening = true;
    return true;
  },

  stop() {
    if (_boundHandler) window.removeEventListener('devicemotion', _boundHandler);
    listening = false;
    buffer = [];
    sustainedHighCount = 0;
    state = 'idle';
  },

  getState() {
    return state;
  },
};