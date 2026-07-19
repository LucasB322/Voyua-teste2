const _history = [];
const _handlers = {};
const SCREENS_WITH_NAV = new Set(['home', 'explore', 'trips', 'feed', 'safety', 'profile', 'currency']);
const ROOT_SCREENS = new Set(['home', 'explore', 'trips', 'feed', 'safety', 'profile', 'currency']);

const $bottomNav = () => document.getElementById('bottom-nav');

export const Router = {
  register(screenId, { onShow } = {}) {
    _handlers[screenId] = { onShow };
  },

  go(screenId, { pushHistory = true, params = {} } = {}) {
    const target = document.querySelector(`[data-screen-id="${screenId}"]`);
    if (!target) return;
    const current = document.querySelector('.screen.is-active');
    if (current === target) return;

    const curr = _history[_history.length - 1];
    const isRootNav = ROOT_SCREENS.has(screenId) && ROOT_SCREENS.has(curr);
    if (pushHistory && curr && curr !== screenId) {
      if (!isRootNav) _history.push(curr);
      else _history.length = 0;
    }
    if (pushHistory) _history.push(screenId);

    current?.classList.remove('is-active');
    target.classList.add('is-active');

    const nav = $bottomNav();
    if (SCREENS_WITH_NAV.has(screenId)) {
      nav.classList.remove('is-hidden');
      document.querySelectorAll('.bottom-nav__item').forEach(btn =>
        btn.classList.toggle('is-active', btn.dataset.nav === screenId)
      );
    } else {
      nav.classList.add('is-hidden');
    }

    target.querySelectorAll('[data-scroll]').forEach(el => { el.scrollTop = 0; });
    target.scrollTop = 0;

    _handlers[screenId]?.onShow?.(params);
  },

  back() {
    _history.pop();
    const prev = _history[_history.length - 1];
    if (prev) this.go(prev, { pushHistory: false });
    else this.go('home', { pushHistory: false });
  },

  current() {
    return _history[_history.length - 1];
  },

  clearHistory() {
    _history.length = 0;
  },
};
