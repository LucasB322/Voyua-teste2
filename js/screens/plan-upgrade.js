import { Store } from '../store/store.js';
import { Router } from '../router/router.js';
import { setPlan } from '../store/actions.js';
import { showToast } from '../components/toast.js';
import { qs, qsa, vibrate } from '../utils/dom.js';
import { formatPrice } from '../utils/format.js';

const PRICING = {
  monthly: { amount: 6.99, period: '/ month' },
  annual: { amount: 59.99, period: '/ year' },
};

let _cycle = 'monthly';
let _selected = 'free';

export function initPlanUpgrade() {
  Router.register('plan-upgrade', {
    onShow: () => {
      _selected = Store.getState().profile.plan || 'free';
      render(Store.getState());
    },
  });

  qsa('#billing-toggle .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      _cycle = chip.dataset.cycle;
      qsa('#billing-toggle .chip').forEach(c => c.classList.toggle('is-active', c === chip));
      vibrate(10);
      render(Store.getState());
    });
  });

  qs('#plan-card-free').addEventListener('click', () => {
    _selected = 'free';
    vibrate(10);
    render(Store.getState());
  });

  qs('#plan-card-premium').addEventListener('click', () => {
    _selected = 'premium';
    vibrate(10);
    render(Store.getState());
  });

  qs('#plan-upgrade-cta').addEventListener('click', () => {
    const current = Store.getState().profile.plan || 'free';
    if (_selected === current) return;

    setPlan(_selected);
    vibrate(_selected === 'premium' ? 20 : 12);
    showToast(_selected === 'premium' ? 'Welcome to Vouya Premium 🎉' : "You're back on the Free plan");
    render(Store.getState());
  });
}

function render(state) {
  const current = state.profile.plan || 'free';
  const pricing = PRICING[_cycle];

  qs('#premium-price').textContent = formatPrice(pricing.amount);
  qs('#premium-period').textContent = pricing.period;

  const freeCard = qs('#plan-card-free');
  const premiumCard = qs('#plan-card-premium');

  freeCard.classList.toggle('is-current', current === 'free');
  freeCard.classList.toggle('is-selected', _selected === 'free');
  premiumCard.classList.toggle('is-current', current === 'premium');
  premiumCard.classList.toggle('is-selected', _selected === 'premium');

  qs('#free-current-badge').hidden = current !== 'free';
  qs('#premium-current-badge').hidden = current !== 'premium';

  const summary = qs('#plan-summary');
  if (summary) summary.textContent = current === 'premium' ? 'Premium plan' : 'Free plan';

  const cta = qs('#plan-upgrade-cta');
  cta.classList.remove('btn--primary', 'btn--ghost', 'btn--outline-danger');
  if (_selected === current) {
    cta.textContent = 'Current plan';
    cta.disabled = true;
    cta.classList.add('btn--ghost');
  } else if (_selected === 'premium') {
    cta.textContent = 'Upgrade to Premium';
    cta.disabled = false;
    cta.classList.add('btn--primary');
  } else {
    cta.textContent = 'Downgrade to Free';
    cta.disabled = false;
    cta.classList.add('btn--outline-danger');
  }
}