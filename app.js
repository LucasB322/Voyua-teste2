/* ==========================================================================
   VOUYA — SAFE TRAVEL
   ========================================================================== */

(() => {
  'use strict';


  const STORAGE_KEY = 'vouya_state_v1';
  const Store = {
    _memoryFallback: null,
    _storageAvailable() {
      try {
        const testKey = '__vouya_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    },
    load() {
      if (this._storageAvailable()) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          console.warn('Vouya: failed to parse saved state, starting fresh.', e);
          return null;
        }
      }
      return this._memoryFallback;
    },
    save(data) {
      if (this._storageAvailable()) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return;
        } catch (e) {
          console.warn('Vouya: localStorage write failed, falling back to memory.', e);
        }
      }
      this._memoryFallback = data;
    },
    clear() {
      if (this._storageAvailable()) {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* no-op */ }
      }
      this._memoryFallback = null;
    },
  };

  /* ============================ SEED DATA ==================================== */
  // Fresh-install defaults. Used on first run and whenever the user resets
  // demo data from Profile > Reset demo data.
  function buildSeedData() {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const iso = (offsetDays) => new Date(now + offsetDays * DAY).toISOString().slice(0, 10);

    return {
      profile: {
        name: 'Amelia Cross',
        tier: 'Explorer',
        memberSince: 2022,
        rating: 4.9,
      },
      settings: {
        darkMode: false,
        locationSharing: true,
        pushNotifications: true,
      },
      favorites: ['swiss-alps', 'bali'],
      destinations: [
        {
          id: 'swiss-alps', name: 'Swiss Alps', country: 'Switzerland', price: 1120, rating: 4.9, reviewCount: 2341, tag: 'mountain',
          img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=900&auto=format&fit=crop',
          safetyScore: 92, safetyLabel: 'Low risk · stable region · good emergency coverage',
          desc: 'Snow-capped peaks, glacial lakes, and storybook villages. The Swiss Alps pair postcard scenery with some of the most reliable infrastructure in the world — well-marked trails, responsive mountain rescue, and excellent connectivity even at altitude.',
          thumbs: [
            'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1542224566954-d385d8a2c3b9?q=80&w=400&auto=format&fit=crop',
          ],
          reviews: [
            { name: 'Marco T.', avatar: 47, stars: 5, text: 'Felt completely at ease the whole trip — rescue posts everywhere and signal even on the trails.' },
            { name: 'Hana K.', avatar: 21, stars: 4, text: 'Stunning views. Bring proper boots — some trails are steeper than they look on the map.' },
          ],
          safetyPoints: [
            { level: 'green', text: 'Low crime rate, stable political climate' },
            { level: 'green', text: 'Mountain rescue average response: 14 min' },
            { level: 'amber', text: 'Cellular coverage drops above 2,800m' },
            { level: 'green', text: 'English widely spoken at medical facilities' },
          ],
        },
        {
          id: 'bali', name: 'Bali', country: 'Indonesia', price: 780, rating: 4.8, reviewCount: 5012, tag: 'beach',
          img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=900&auto=format&fit=crop',
          safetyScore: 78, safetyLabel: 'Moderate risk · watch road conditions',
          desc: 'Lush rice terraces, ocean temples, and a laid-back pace that makes it easy to stay a week longer than planned. Most safety concerns here center on traffic and water safety rather than crime.',
          thumbs: [
            'https://images.unsplash.com/photo-1518638150340-f706e86654de?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1604999333679-b86d54738315?q=80&w=400&auto=format&fit=crop',
          ],
          reviews: [
            { name: 'Priya S.', avatar: 32, stars: 5, text: 'Rented a scooter and regretted it within a day — traffic is genuinely chaotic. Everything else was wonderful.' },
            { name: 'Ben O.', avatar: 14, stars: 4, text: 'Stomach issues are common, stick to bottled water and you will mostly be fine.' },
          ],
          safetyPoints: [
            { level: 'amber', text: 'Scooter accidents are the leading cause of tourist injury' },
            { level: 'green', text: 'Low violent crime rate' },
            { level: 'amber', text: 'Tap water is not safe to drink' },
            { level: 'green', text: 'English widely spoken in tourist areas' },
          ],
        },
        {
          id: 'santorini', name: 'Santorini', country: 'Greece', price: 890, rating: 4.9, reviewCount: 3120, tag: 'beach',
          img: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=900&auto=format&fit=crop',
          safetyScore: 90, safetyLabel: 'Low risk · very tourist-friendly',
          desc: 'Whitewashed cliffside towns over a sapphire caldera. One of the most visited islands in the Aegean, with tourism infrastructure — clinics, transport, English signage — to match.',
          thumbs: [
            'https://images.unsplash.com/photo-1469796466635-455ede028aca?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=400&auto=format&fit=crop',
          ],
          reviews: [
            { name: 'Claire D.', avatar: 5, stars: 5, text: 'Felt safe walking back to our hotel late at night through Oia. Very calm island.' },
          ],
          safetyPoints: [
            { level: 'green', text: 'Very low crime rate' },
            { level: 'amber', text: 'Steep cliffside paths — watch footing at night' },
            { level: 'green', text: 'Excellent medical access for the size of the island' },
          ],
        },
        {
          id: 'reykjavik', name: 'Reykjavík', country: 'Iceland', price: 640, rating: 4.8, reviewCount: 1890, tag: 'city',
          img: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?q=80&w=900&auto=format&fit=crop',
          safetyScore: 97, safetyLabel: 'Very low risk · one of the world\u2019s safest countries',
          desc: 'A small, walkable capital that doubles as the gateway to glaciers, geysers, and the northern lights. Iceland regularly tops global peace indices.',
          thumbs: [
            'https://images.unsplash.com/photo-1504541989-eecca36ef8d3?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?q=80&w=400&auto=format&fit=crop',
          ],
          reviews: [
            { name: 'Tom R.', avatar: 60, stars: 5, text: 'Drove the ring road solo as a woman and never once felt unsafe. Just watch the weather.' },
          ],
          safetyPoints: [
            { level: 'green', text: 'Ranked #1 on the Global Peace Index most years' },
            { level: 'amber', text: 'Weather changes fast — check road conditions before driving' },
          ],
        },
        {
          id: 'lisbon', name: 'Lisbon', country: 'Portugal', price: 510, rating: 4.7, reviewCount: 2200, tag: 'city',
          img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop',
          safetyScore: 85, safetyLabel: 'Low risk · watch for pickpockets on trams',
          desc: 'Pastel facades, tiled stairways, and some of the best seafood in Europe at a fraction of Western European prices.',
          thumbs: ['https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=400&auto=format&fit=crop'],
          reviews: [{ name: 'Noah F.', avatar: 18, stars: 4, text: 'Tram 28 is a known pickpocket spot, keep bags zipped and to the front.' }],
          safetyPoints: [
            { level: 'amber', text: 'Pickpocketing reported on Tram 28 and in busy squares' },
            { level: 'green', text: 'Low violent crime' },
          ],
        },
        {
          id: 'kyoto', name: 'Kyoto', country: 'Japan', price: 610, rating: 4.9, reviewCount: 4410, tag: 'culture',
          img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=900&auto=format&fit=crop',
          safetyScore: 96, safetyLabel: 'Very low risk · excellent infrastructure',
          desc: 'Centuries-old temples and quiet bamboo groves a short walk from some of the most efficient transit on earth.',
          thumbs: [
            'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=400&auto=format&fit=crop',
          ],
          reviews: [{ name: 'Yuki M.', avatar: 11, stars: 5, text: 'Lost my wallet on a train platform and someone turned it in within the hour.' }],
          safetyPoints: [
            { level: 'green', text: 'Among the lowest crime rates of any major city' },
            { level: 'green', text: 'Trains run on time to the minute' },
          ],
        },
        {
          id: 'tulum', name: 'Tulum', country: 'Mexico', price: 350, rating: 4.4, reviewCount: 1675, tag: 'budget',
          img: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?q=80&w=900&auto=format&fit=crop',
          safetyScore: 64, safetyLabel: 'Exercise increased caution',
          desc: 'Jungle cenotes and beach clubs built into Mayan ruins. Tourist zones are well patrolled; exercise normal urban caution after dark.',
          thumbs: ['https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=400&auto=format&fit=crop'],
          reviews: [{ name: 'Greta L.', avatar: 8, stars: 4, text: 'Stick to the hotel zone at night and you will be fine. Daytime felt totally relaxed.' }],
          safetyPoints: [
            { level: 'amber', text: 'Avoid walking alone outside tourist areas after dark' },
            { level: 'green', text: 'Beach and hotel zones are well patrolled' },
          ],
        },
        {
          id: 'banff', name: 'Banff', country: 'Canada', price: 720, rating: 4.8, reviewCount: 980, tag: 'mountain',
          img: 'https://images.unsplash.com/photo-1561134643-668f9057cc2c?q=80&w=900&auto=format&fit=crop',
          safetyScore: 94, safetyLabel: 'Very low risk · main hazard is wildlife, not crime',
          desc: 'Turquoise glacial lakes ringed by the Canadian Rockies. The biggest safety consideration here is wildlife awareness, not crime.',
          thumbs: ['https://images.unsplash.com/photo-1561134643-668f9057cc2c?q=80&w=400&auto=format&fit=crop'],
          reviews: [{ name: 'Liam P.', avatar: 19, stars: 5, text: 'Saw a bear from a very safe distance thanks to clear trail signage and warnings.' }],
          safetyPoints: [
            { level: 'amber', text: 'Carry bear spray on backcountry trails' },
            { level: 'green', text: 'Extremely low crime rate' },
          ],
        },
        {
          id: 'marrakech', name: 'Marrakech', country: 'Morocco', price: 430, rating: 4.6, reviewCount: 1540, tag: 'culture',
          img: 'https://images.unsplash.com/photo-1597212720158-2e1ab78cf6fe?q=80&w=900&auto=format&fit=crop',
          safetyScore: 72, safetyLabel: 'Moderate risk · busy medina, watch belongings',
          desc: 'A maze of souks, riads, and spice markets in the shadow of the Atlas Mountains.',
          thumbs: ['https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=400&auto=format&fit=crop'],
          reviews: [{ name: 'Sara N.', avatar: 25, stars: 4, text: 'The medina is overwhelming at first but never felt unsafe, just busy. Negotiate prices up front.' }],
          safetyPoints: [
            { level: 'amber', text: 'Petty theft reported in crowded souks' },
            { level: 'green', text: 'Low rate of violent crime against tourists' },
          ],
        },
        {
          id: 'queenstown', name: 'Queenstown', country: 'New Zealand', price: 980, rating: 4.9, reviewCount: 1290, tag: 'mountain',
          img: 'https://images.unsplash.com/photo-1589871173675-81fa11e3d56c?q=80&w=900&auto=format&fit=crop',
          safetyScore: 95, safetyLabel: 'Very low risk · adventure-sport injury is the main concern',
          desc: 'The self-styled adventure capital of the world — bungee jumping, jet boating, and some of the most dramatic scenery in the South Pacific.',
          thumbs: ['https://images.unsplash.com/photo-1469521669194-babb45599def?q=80&w=400&auto=format&fit=crop'],
          reviews: [{ name: 'Owen K.', avatar: 41, stars: 5, text: 'Every adventure operator we used had clear, serious safety briefings.' }],
          safetyPoints: [
            { level: 'amber', text: 'Adventure sports carry inherent physical risk — choose licensed operators' },
            { level: 'green', text: 'Very low crime' },
          ],
        },
        {
          id: 'dolomites', name: 'Dolomites', country: 'Italy', price: 540, rating: 4.7, reviewCount: 860, tag: 'mountain',
          img: 'https://images.unsplash.com/photo-1551649001-7a2482d98d05?q=80&w=900&auto=format&fit=crop',
          safetyScore: 91, safetyLabel: 'Low risk · alpine hazards apply',
          desc: 'Jagged limestone peaks and rifugio hiking trails in northern Italy.',
          thumbs: ['https://images.unsplash.com/photo-1551649001-7a2482d98d05?q=80&w=400&auto=format&fit=crop'],
          reviews: [{ name: 'Elena V.', avatar: 3, stars: 5, text: 'Mountain huts (rifugi) were a great safety net — always someone nearby on the trail.' }],
          safetyPoints: [
            { level: 'amber', text: 'Weather can shift quickly at altitude' },
            { level: 'green', text: 'Well-maintained, well-marked trail network' },
          ],
        },
        {
          id: 'algarve', name: 'Algarve', country: 'Portugal', price: 390, rating: 4.5, reviewCount: 1120, tag: 'budget',
          img: 'https://images.unsplash.com/photo-1583087913376-78cdb7e76d44?q=80&w=900&auto=format&fit=crop',
          safetyScore: 88, safetyLabel: 'Low risk · strong rip currents on the Atlantic side',
          desc: 'Golden cliffs, sea caves, and a noticeably lower cost of living than the rest of Western Europe.',
          thumbs: ['https://images.unsplash.com/photo-1583087913376-78cdb7e76d44?q=80&w=400&auto=format&fit=crop'],
          reviews: [{ name: 'Dana W.', avatar: 17, stars: 4, text: 'Watch flag warnings on the beaches — some have strong currents even on calm-looking days.' }],
          safetyPoints: [
            { level: 'amber', text: 'Strong rip currents reported at several beaches — check flags' },
            { level: 'green', text: 'Very low crime' },
          ],
        },
      ],
      // Each trip references a destinationId and owns its own itinerary
      // (an object keyed by day number -> array of stops).
      trips: [
        {
          id: 'trip-kyoto-1',
          destinationId: 'kyoto',
          place: 'Kyoto, Japan',
          img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=900&auto=format&fit=crop',
          startDate: iso(12),
          endDate: iso(19),
          status: 'upcoming',
          steps: { flights: true, hotel: true, activities: false, packing: false },
          companionAvatars: [12, 33],
          companionsExtra: 2,
          days: {
            1: [
              { id: 't1', time: '08:30', icon: 'food', title: 'Breakfast at Café Bibliotic', note: 'Nakagyo Ward · 30 min walk from hotel' },
              { id: 't2', time: '10:00', icon: 'sight', title: 'Fushimi Inari Shrine', note: 'Allow 2.5 hrs · moderate hike' },
              { id: 't3', time: '14:00', icon: 'food', title: 'Lunch — Nishiki Market', note: 'Try the tako tamago' },
              { id: 't4', time: '19:00', icon: 'stay', title: 'Check in — Granbell Hotel', note: 'Confirmation #VY-8841' },
            ],
            2: [
              { id: 't5', time: '09:00', icon: 'sight', title: 'Arashiyama Bamboo Grove', note: 'Go early to beat crowds' },
              { id: 't6', time: '12:30', icon: 'food', title: 'Lunch near Tenryu-ji', note: '' },
            ],
            3: [], 4: [], 5: [],
          },
        },
        {
          id: 'trip-santorini-1',
          destinationId: 'santorini',
          place: 'Santorini, Greece',
          img: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=900&auto=format&fit=crop',
          startDate: iso(41),
          endDate: iso(47),
          status: 'upcoming',
          steps: { flights: true, hotel: false, activities: false, packing: false },
          companionAvatars: [],
          companionsExtra: 0,
          days: { 1: [{ id: 's1', time: '17:00', icon: 'sight', title: 'Sunset at Oia Castle', note: 'Arrive 45 min early for a spot' }], 2: [], 3: [], 4: [], 5: [], 6: [] },
        },
        {
          id: 'trip-bali-1',
          destinationId: 'bali',
          place: 'Ubud, Bali',
          img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=900&auto=format&fit=crop',
          startDate: iso(-110),
          endDate: iso(-102),
          status: 'past',
          steps: { flights: true, hotel: true, activities: true, packing: true },
          companionAvatars: [], companionsExtra: 0,
          days: { 1: [] },
          reviewed: false,
        },
        {
          id: 'trip-lisbon-1',
          destinationId: 'lisbon',
          place: 'Lisbon, Portugal',
          img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop',
          startDate: iso(-165),
          endDate: iso(-160),
          status: 'past',
          steps: { flights: true, hotel: true, activities: true, packing: true },
          companionAvatars: [], companionsExtra: 0,
          days: { 1: [] },
          reviewed: true,
        },
      ],
      activeTripId: 'trip-kyoto-1',
      emergencyContacts: [
        { id: 'c1', name: 'James Cross', relation: 'Brother · primary', phone: '+1 555 014 2231', avatar: 5 },
        { id: 'c2', name: 'Sofia Marin', relation: 'Best friend', phone: '+1 555 098 7711', avatar: 9 },
      ],
      notifications: [
        { id: 'n1', type: 'trip', title: 'Kyoto trip is in 12 days', body: 'Finish booking activities — you\u2019re 64% done planning.', time: now - 2 * 60 * 60 * 1000, read: false },
        { id: 'n2', type: 'safety', title: 'Safety check-in complete', body: 'Your location was shared successfully with James Cross.', time: now - 26 * 60 * 60 * 1000, read: false },
        { id: 'n3', type: 'system', title: 'Welcome to Vouya', body: 'Add an emergency contact to get the most out of Safety features.', time: now - 4 * 24 * 60 * 60 * 1000, read: true },
      ],
      safetyActivity: [
        { id: 'a1', icon: '📍', text: 'Location check-in', time: now - 2 * 60 * 1000 },
        { id: 'a2', icon: '🔋', text: 'Battery dropped below 85%', time: now - 40 * 60 * 1000 },
      ],
      paymentMethods: [{ id: 'pm1', brand: 'Visa', last4: '4242' }],
      
      posts: [
        {
          id: 'post-1', type: 'review', destinationId: 'kyoto', authorIsMe: false,
          authorName: 'Yuki M.', authorAvatar: 11, stars: 5,
          text: 'Lost my wallet on a train platform and someone turned it in within the hour. Felt safer here than at home.',
          img: null, time: now - 3 * 24 * 60 * 60 * 1000, likes: 24, likedByMe: false,
        },
        {
          id: 'post-2', type: 'moment', destinationId: 'santorini', authorIsMe: false,
          authorName: 'Claire D.', authorAvatar: 5, stars: null,
          text: 'Sunset in Oia hit different tonight. Walked back through town after dark and never once felt unsafe — well-lit streets the whole way.',
          img: 'https://images.unsplash.com/photo-1469796466635-455ede028aca?q=80&w=900&auto=format&fit=crop',
          time: now - 9 * 60 * 60 * 1000, likes: 41, likedByMe: true,
        },
        {
          id: 'post-3', type: 'review', destinationId: 'bali', authorIsMe: false,
          authorName: 'Priya S.', authorAvatar: 32, stars: 4,
          text: 'Rented a scooter and regretted it within a day — traffic is genuinely chaotic. Everything else was wonderful, just budget for a driver instead.',
          img: null, time: now - 30 * 60 * 60 * 1000, likes: 17, likedByMe: false,
        },
        {
          id: 'post-4', type: 'moment', destinationId: 'kyoto', authorIsMe: false,
          authorName: 'Marco T.', authorAvatar: 47, stars: null,
          text: 'Bamboo grove at sunrise, basically alone. Worth the early alarm.',
          img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=900&auto=format&fit=crop',
          time: now - 50 * 60 * 60 * 1000, likes: 63, likedByMe: false,
        },
      ],
    };
  }

  let data = Store.load() || buildSeedData();


  const ui = {
    currentScreen: 'splash',
    history: [],
    sosTimer: null,
    sosHoldStart: 0,
    activeDetailDestId: null,
    activeDetailTab: 'overview',
    activeTripsTab: 'upcoming',
    activeFeedFilter: 'all', // 'all' | 'mine'
    activeItineraryDay: 1,
    activeExploreFilter: 'all',
    reviewStars: 0,
    momentPhotoChoice: 'random',
    bookingDraft: null, // { destinationId, start, end, travelers, protection }
  };

  function persist() { Store.save(data); }

  const SCREENS_WITH_NAV = new Set(['home', 'explore', 'trips', 'feed', 'safety', 'profile']);
  const ROOT_SCREENS = new Set(['home', 'explore', 'trips', 'feed', 'safety', 'profile']);
  const AVATAR_URL = 'https://i.pravatar.cc/200?img=44';

  /* ============================ DOM REFS ===================================== */
  const $app = document.getElementById('app');
  const $bottomNav = document.getElementById('bottom-nav');
  const $toastStack = document.getElementById('toast-stack');
  const $loadingOverlay = document.getElementById('loading-overlay');

  /* ============================ UTILITIES ===================================== */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) { /* not all browsers support this */ }
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function uid(prefix = 'id') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function findDestination(id) { return data.destinations.find(d => d.id === id); }
  function findTrip(id) { return data.trips.find(t => t.id === id); }

  function daysUntil(dateStr) {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (24 * 60 * 60 * 1000));
  }

  function formatDateRange(startStr, endStr) {
    const opts = { month: 'short', day: 'numeric' };
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    const nights = Math.round((end - start) / (24 * 60 * 60 * 1000));
    return `${start.toLocaleDateString('en-US', opts)} — ${end.toLocaleDateString('en-US', opts)} · ${nights} night${nights === 1 ? '' : 's'}`;
  }

  function relativeTime(timestamp) {
    const diffMs = Date.now() - timestamp;
    const min = Math.round(diffMs / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.round(hr / 24);
    return `${day}d ago`;
  }

  function planningPercent(trip) {
    const vals = Object.values(trip.steps);
    const done = vals.filter(Boolean).length;
    return Math.round((done / vals.length) * 100);
  }

  function showToast(message, { type = 'success', duration = 2800, actionLabel = null, onAction = null } = {}) {
    const toast = document.createElement('div');
    toast.className = `toast${type === 'danger' ? ' toast--danger' : ''}`;
    toast.innerHTML = `<span class="toast__dot"></span><span>${escapeHtml(message)}</span>`;
    if (actionLabel) {
      const btn = document.createElement('button');
      btn.className = 'toast__action';
      btn.textContent = actionLabel;
      btn.addEventListener('click', () => {
        if (onAction) onAction();
        remove();
      });
      toast.appendChild(btn);
    }
    $toastStack.appendChild(toast);

    function remove() {
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 280);
    }
    const timer = setTimeout(remove, duration);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
  }

  function showLoading() { $loadingOverlay.classList.add('is-active'); }
  function hideLoading() { $loadingOverlay.classList.remove('is-active'); }
  function simulateAsync(callback, delay = 800) {
    showLoading();
    setTimeout(() => { hideLoading(); callback(); }, delay);
  }

  /* ============================ NAVIGATION ENGINE ============================= */
  function goToScreen(screenId, { pushHistory = true } = {}) {
    const target = qs(`[data-screen-id="${screenId}"]`);
    if (!target) return;
    const current = qs('.screen.is-active');
    if (current === target) return;

    if (pushHistory && ui.currentScreen && ui.currentScreen !== screenId) {
      ui.history.push(ui.currentScreen);
    }

    if (current) current.classList.remove('is-active');
    target.classList.add('is-active');
    ui.currentScreen = screenId;

    if (SCREENS_WITH_NAV.has(screenId)) {
      $bottomNav.classList.remove('is-hidden');
      qsa('.bottom-nav__item').forEach(btn => btn.classList.toggle('is-active', btn.dataset.nav === screenId));
    } else {
      $bottomNav.classList.add('is-hidden');
    }

    qsa('[data-scroll]', target).forEach(el => { el.scrollTop = 0; });
    target.scrollTop = 0;

    // Lazily render screens that depend on current data right as they're shown,
    // so e.g. navigating to Trips always reflects the latest state.
    onScreenShown(screenId);
  }

  function goBack() {
    const prev = ui.history.pop();
    if (prev) goToScreen(prev, { pushHistory: false });
    else goToScreen('home', { pushHistory: false });
  }

  function onScreenShown(screenId) {
    switch (screenId) {
      case 'home': renderHome(); break;
      case 'explore': renderExploreList(); renderTrendingRail(); break;
      case 'trips': renderTrips(); break;
      case 'feed': renderFeed(); break;
      case 'itinerary': renderItinerary(); break;
      case 'safety': renderSafety(); break;
      case 'profile': renderProfile(); break;
      case 'notifications': renderNotifications(); break;
      default: break;
    }
  }

  /* ============================ EVENT DELEGATION ============================== */
  // Single delegated click handler covers every [data-nav], [data-back],
  // [data-toast], and [data-fav] element anywhere in the document,
  // including ones rendered dynamically by the render*() functions below.
  document.addEventListener('click', (e) => {
    const favTarget = e.target.closest('[data-fav]');
    // Favorite buttons are often nested inside a card that itself has
    // data-nav (e.g. the heart icon on a destination card). Stop here so
    // saving a favorite never also triggers the card's navigation.
    if (favTarget) {
      e.stopPropagation();
      toggleFavorite(favTarget);
      return;
    }

    const detailTarget = e.target.closest('[data-open-detail]');
    if (detailTarget) {
      openDestinationDetail(detailTarget.dataset.openDetail);
      return;
    }

    const tripTarget = e.target.closest('[data-open-trip]');
    if (tripTarget) {
      data.activeTripId = tripTarget.dataset.openTrip;
      persist();
      goToScreen('itinerary');
      return;
    }

    const callTarget = e.target.closest('[data-call-contact]');
    if (callTarget) {
      e.stopPropagation();
      const contact = data.emergencyContacts.find(c => c.id === callTarget.dataset.callContact);
      if (contact) showToast(`Calling ${contact.name.split(' ')[0]}…`);
      return;
    }

    const deleteContactTarget = e.target.closest('[data-delete-contact]');
    if (deleteContactTarget) {
      e.stopPropagation();
      removeContact(deleteContactTarget.dataset.deleteContact);
      return;
    }

    const deleteStopTarget = e.target.closest('[data-delete-stop]');
    if (deleteStopTarget) {
      e.stopPropagation();
      removeStop(deleteStopTarget.dataset.deleteStop);
      return;
    }

    const reviewTarget = e.target.closest('[data-leave-review]');
    if (reviewTarget) {
      const trip = findTrip(reviewTarget.dataset.leaveReview);
      if (trip) openReviewComposer(trip.destinationId, trip.id);
      return;
    }

    const likeTarget = e.target.closest('[data-like-post]');
    if (likeTarget) {
      e.stopPropagation();
      toggleLikePost(likeTarget.dataset.likePost);
      return;
    }

    const backTarget = e.target.closest('[data-back]');
    if (backTarget) { goBack(); return; }

    const navTarget = e.target.closest('[data-nav]');
    const toastTarget = e.target.closest('[data-toast]');

    if (navTarget) {
      const screenId = navTarget.dataset.nav;
      const isRootNav = ROOT_SCREENS.has(screenId) && SCREENS_WITH_NAV.has(ui.currentScreen);
      goToScreen(screenId, { pushHistory: !isRootNav || !ROOT_SCREENS.has(ui.currentScreen) });
      if (toastTarget === navTarget && navTarget.dataset.toast) showToast(navTarget.dataset.toast);
      return;
    }

    if (toastTarget && toastTarget !== navTarget) {
      showToast(toastTarget.dataset.toast);
    }
  });

  function toggleFavorite(btn) {
    const destId = btn.dataset.fav;
    if (!destId) return; // defensive: every fav button is rendered with a destination id

    const idx = data.favorites.indexOf(destId);
    const isFav = idx < 0;
    if (isFav) data.favorites.push(destId);
    else data.favorites.splice(idx, 1);
    persist();

    // Re-render every visible favorite button for this destination so all
    // instances (rail card, list row, detail header) stay in sync, since
    // the same destination can appear in multiple places at once.
    qsa(`[data-fav="${destId}"]`).forEach(b => b.classList.toggle('is-fav', isFav));

    vibrate(12);
    showToast(isFav ? 'Saved to favorites' : 'Removed from favorites');
  }

  /* ============================ SPLASH SEQUENCE ================================ */
  function runSplashSequence() {
    const bar = document.getElementById('splash-progress');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => goToScreen('login', { pushHistory: false }), 280);
      }
      bar.style.width = `${progress}%`;
    }, 220);
  }

  /* ============================ FORM VALIDATION HELPERS ========================= */
  function setFieldError(inputId, message) {
    const field = document.getElementById(inputId)?.closest('.field');
    const errorEl = qs(`[data-error-for="${inputId}"]`);
    if (field) field.classList.add('has-error');
    if (errorEl) {
      if (message) errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }
  function clearFieldError(inputId) {
    const field = document.getElementById(inputId)?.closest('.field');
    const errorEl = qs(`[data-error-for="${inputId}"]`);
    if (field) field.classList.remove('has-error');
    if (errorEl) errorEl.hidden = true;
  }
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function initLogin() {
    const tabs = qsa('.login__tab');
    const form = qs('#login-form');
    const submitBtn = qs('#login-submit');
    const togglePass = qs('#toggle-pass');
    const passInput = qs('#login-pass');
    const emailInput = qs('#login-email');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        const isSignup = tab.dataset.loginTab === 'signup';
        submitBtn.querySelector('.btn__label').textContent = isSignup ? 'Create account' : 'Sign in';
      });
    });

    togglePass.addEventListener('click', () => {
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      togglePass.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });

    emailInput.addEventListener('input', () => clearFieldError('login-email'));
    passInput.addEventListener('input', () => clearFieldError('login-pass'));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitBtn.classList.contains('is-loading')) return;

      let valid = true;
      if (!isValidEmail(emailInput.value)) { setFieldError('login-email'); valid = false; } else clearFieldError('login-email');
      if (passInput.value.length < 6) { setFieldError('login-pass'); valid = false; } else clearFieldError('login-pass');
      if (!valid) { vibrate(20); return; }

      submitBtn.classList.add('is-loading');
      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        ui.history = [];
        goToScreen('home', { pushHistory: false });
        setTimeout(() => showToast(`Welcome back, ${data.profile.name.split(' ')[0]} 👋`), 350);
      }, 1100);
    });
  }

  /* ============================ DESTINATION CARD TEMPLATES ====================== */
  function destCardHtml(dest, { large = false } = {}) {
    const isFav = data.favorites.includes(dest.id);
    return `
      <div class="dest-card${large ? ' dest-card--lg' : ''}" data-open-detail="${dest.id}">
        <div class="dest-card__img" style="background-image:url('${dest.img}')">
          <span class="badge badge--light dest-card__price">$${dest.price}</span>
          <button class="dest-card__fav${isFav ? ' is-fav' : ''}" data-fav="${dest.id}" aria-label="Save to favorites">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.4 2.4 5 6 5c2 0 3.4 1 4 2.3C10.6 6 12 5 14 5c3.6 0 5.5 3.4 4 6.7C19.5 16.3 12 21 12 21z" stroke="currentColor" stroke-width="1.8"/></svg>
          </button>
        </div>
        <div class="dest-card__body">
          <h4>${escapeHtml(dest.name)}</h4>
          <p>${escapeHtml(dest.country)} · <span class="rating">★ ${dest.rating}</span></p>
        </div>
      </div>`;
  }

  function destRowHtml(dest) {
    return `
      <button class="dest-row" data-open-detail="${dest.id}">
        <div class="dest-row__img" style="background-image:url('${dest.img}')"></div>
        <div class="dest-row__body">
          <h4>${escapeHtml(dest.name)}</h4>
          <p>${escapeHtml(dest.country)} · <span class="rating">★ ${dest.rating}</span></p>
        </div>
        <div class="dest-row__price"><strong>$${dest.price}</strong><span>/ person</span></div>
      </button>`;
  }

  /* ============================ HOME SCREEN ===================================== */
  function renderHome() {
    // Greeting + name
    const hour = new Date().getHours();
    let greeting = 'Good evening,';
    if (hour < 12) greeting = 'Good morning,';
    else if (hour < 18) greeting = 'Good afternoon,';
    qs('#home-greeting').textContent = greeting;
    qs('#home-name').textContent = `${data.profile.name.split(' ')[0]} ✈️`;

    // Notification dot
    const unread = data.notifications.filter(n => !n.read).length;
    qs('#notif-dot').hidden = unread === 0;

    // Next trip
    const upcoming = data.trips
      .filter(t => t.status === 'upcoming')
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const slot = qs('#next-trip-slot');
    if (upcoming.length === 0) {
      slot.innerHTML = `
        <div class="empty-state" style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--r-lg); padding:32px 20px;">
          <div class="empty-state__icon">🧳</div>
          <p class="empty-state__title">No upcoming trips yet</p>
          <p class="empty-state__sub">Explore destinations and add one to your trips to see it here.</p>
          <button class="btn btn--primary" data-nav="explore">Explore destinations</button>
        </div>`;
    } else {
      const trip = upcoming[0];
      const days = daysUntil(trip.startDate);
      const dayLabel = days <= 0 ? 'Happening now' : days === 1 ? 'Tomorrow' : `In ${days} days`;
      const avatarsHtml = trip.companionAvatars.map(n => `<img class="avatar avatar--xs" src="https://i.pravatar.cc/64?img=${n}" alt="">`).join('');
      const extraHtml = trip.companionsExtra > 0 ? `<span class="avatar avatar--xs avatar--more">+${trip.companionsExtra}</span>` : '';
      slot.innerHTML = `
        <div class="trip-hero" data-open-trip="${trip.id}">
          <div class="trip-hero__img" style="background-image:url('${trip.img}')"></div>
          <div class="trip-hero__overlay"></div>
          <div class="trip-hero__body">
            <span class="badge badge--light">${dayLabel}</span>
            <h3 class="trip-hero__place">${escapeHtml(trip.place)}</h3>
            <p class="trip-hero__dates">${formatDateRange(trip.startDate, trip.endDate)}</p>
            <div class="trip-hero__avatars">${avatarsHtml}${extraHtml}</div>
          </div>
        </div>`;
    }

    // Weather (tied to the next trip's destination so it feels connected)
    const destForWeather = upcoming.length ? findDestination(upcoming[0].destinationId) : null;
    if (destForWeather) {
      qs('#weather-city').textContent = `${destForWeather.name} now`;
      // Deterministic pseudo-weather per destination so it doesn't jump
      // around on every render, but still varies between destinations.
      const seed = destForWeather.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const temp = 12 + (seed % 18);
      qs('#weather-temp').textContent = `${temp}°C`;
      qs('#weather-desc').textContent = temp > 22 ? 'Sunny · feels warm' : temp > 14 ? 'Clear · pleasant' : 'Cool · pack a layer';
    } else {
      qs('#weather-city').textContent = 'Weather';
      qs('#weather-temp').textContent = '—';
      qs('#weather-desc').textContent = 'Add a trip to see local weather';
    }

    // Reservations count (derived from steps marked done across upcoming trips)
    const resCount = upcoming.reduce((sum, t) => sum + Object.values(t.steps).filter(Boolean).length, 0);
    qs('#reservations-count').textContent = resCount;
    qs('#reservations-sub').textContent = resCount === 0 ? 'Nothing booked yet' : 'Across your upcoming trips';

    // Curated rail — show favorites first, then top-rated fillers
    const favDests = data.favorites.map(findDestination).filter(Boolean);
    const fillers = data.destinations.filter(d => !data.favorites.includes(d.id)).sort((a, b) => b.rating - a.rating);
    const curated = [...favDests, ...fillers].slice(0, 6);
    qs('#curated-rail').innerHTML = curated.map(d => destCardHtml(d)).join('');
  }

  /* ============================ EXPLORE SCREEN =================================== */
  function renderTrendingRail() {
    const trending = [...data.destinations].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
    qs('#trending-rail').innerHTML = trending.map(d => destCardHtml(d, { large: true })).join('');
  }

  function renderExploreList(filter = ui.activeExploreFilter, searchTerm = '') {
    ui.activeExploreFilter = filter;
    const list = qs('#explore-list');
    let results = filter === 'all' ? data.destinations : data.destinations.filter(d => d.tag === filter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(d => d.name.toLowerCase().includes(term) || d.country.toLowerCase().includes(term));
    }

    if (results.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🧭</div>
          <p class="empty-state__title">No destinations found</p>
          <p class="empty-state__sub">${searchTerm ? `No matches for "${escapeHtml(searchTerm)}".` : 'Try a different filter to keep exploring.'}</p>
        </div>`;
      return;
    }
    list.innerHTML = results.map(destRowHtml).join('');
  }

  function initExplore() {
    const chips = qsa('.chip-row .chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        renderExploreList(chip.dataset.filter, qs('#explore-search').value.trim());
      });
    });

    const searchInput = qs('#explore-search');
    searchInput.addEventListener('input', () => {
      renderExploreList(ui.activeExploreFilter, searchInput.value.trim());
    });
  }

  /* ============================ EXPLORE DETAIL SCREEN ============================= */
  function openDestinationDetail(destId) {
    const dest = findDestination(destId);
    if (!dest) return;
    ui.activeDetailDestId = destId;
    renderDestinationDetail(dest);
    goToScreen('explore-detail');
  }

  function renderDestinationDetail(dest) {
    qs('#detail-hero').style.backgroundImage = `url('${dest.img}')`;
    qs('#detail-name').textContent = dest.name;
    qs('#detail-country').textContent = dest.country;
    qs('#detail-rating').textContent = `★ ${dest.rating}`;
    qs('#detail-review-count').textContent = dest.reviewCount.toLocaleString();
    qs('#detail-price').textContent = `$${dest.price}`;
    qs('#detail-desc').textContent = dest.desc;

    const favBtn = qs('#detail-fav-btn');
    favBtn.dataset.fav = dest.id;
    favBtn.classList.toggle('is-fav', data.favorites.includes(dest.id));

    const ring = qs('#detail-safety-ring');
    ring.style.setProperty('--p', dest.safetyScore);
    qs('#detail-safety-score').textContent = dest.safetyScore;
    qs('#detail-safety-label').textContent = dest.safetyLabel;
    // Ring color reflects score band — green/amber/red, same vocabulary as
    // the rest of the app's safety indicators.
    ring.style.background = dest.safetyScore >= 80
      ? `conic-gradient(var(--color-secondary) calc(var(--p) * 1%), var(--color-gray-light) 0)`
      : dest.safetyScore >= 60
        ? `conic-gradient(var(--color-amber) calc(var(--p) * 1%), var(--color-gray-light) 0)`
        : `conic-gradient(var(--color-danger) calc(var(--p) * 1%), var(--color-gray-light) 0)`;

    qs('#detail-thumbs').innerHTML = dest.thumbs.map(src => `<div class="thumb" style="background-image:url('${src}')"></div>`).join('');

    qs('#detail-reviews').innerHTML = dest.reviews.map(r => `
      <div class="review">
        <img class="avatar avatar--sm" src="https://i.pravatar.cc/64?img=${r.avatar}" alt="">
        <div>
          <div class="review__row"><strong>${escapeHtml(r.name)}</strong><span class="rating">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span></div>
          <p>${escapeHtml(r.text)}</p>
        </div>
      </div>`).join('') || '<p style="color:var(--color-gray); font-size:13px;">No reviews yet for this destination.</p>';

    qs('#detail-safety-list').innerHTML = dest.safetyPoints.map(p => `
      <li><span class="dot dot--${p.level}"></span> ${escapeHtml(p.text)}</li>`).join('');

    // Reset to overview tab each time a new destination is opened
    qsa('[data-detail-tab]').forEach(t => t.classList.toggle('is-active', t.dataset.detailTab === 'overview'));
    qsa('[data-detail-panel]').forEach(p => p.classList.toggle('is-active', p.dataset.detailPanel === 'overview'));
  }

  function initExploreDetail() {
    qsa('[data-detail-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        qsa('[data-detail-tab]').forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        qsa('[data-detail-panel]').forEach(p => p.classList.remove('is-active'));
        qs(`[data-detail-panel="${tab.dataset.detailTab}"]`).classList.add('is-active');
      });
    });

    qs('#detail-book-btn').addEventListener('click', () => {
      if (!ui.activeDetailDestId) return;
      openBooking(ui.activeDetailDestId);
    });
  }

  function openBooking(destId) {
    const dest = findDestination(destId);
    if (!dest) return;
    const today = new Date();
    const start = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const end = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);

    ui.bookingDraft = {
      destinationId: destId,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      travelers: 1,
      protection: true,
    };
    renderBooking();
    goToScreen('booking');
  }

  function renderBooking() {
    const draft = ui.bookingDraft;
    if (!draft) return;
    const dest = findDestination(draft.destinationId);
    if (!dest) return;

    qs('#booking-summary').innerHTML = `
      <div class="booking-summary__img" style="background-image:url('${dest.img}')"></div>
      <div class="booking-summary__body">
        <h3>${escapeHtml(dest.name)}</h3>
        <p>${escapeHtml(dest.country)} · <span class="rating">★ ${dest.rating}</span></p>
        <p>$${dest.price} / person</p>
      </div>`;

    qs('#booking-start').value = draft.start;
    qs('#booking-end').value = draft.end;
    qs('#travelers-value').textContent = draft.travelers;
    qs('#travelers-minus').disabled = draft.travelers <= 1;
    qs('#travelers-plus').disabled = draft.travelers >= 8;

    const protectionCard = qs('.protection-card');
    const protectionInput = qs('#protection-toggle');
    protectionInput.checked = draft.protection;
    protectionCard.classList.toggle('is-off', !draft.protection);

    const subtotal = dest.price * draft.travelers;
    const protectionCost = draft.protection ? Math.round(subtotal * 0.08) : 0;
    const total = subtotal + protectionCost;
    qs('#booking-total').innerHTML = `
      <div class="booking-total__row"><span>${escapeHtml(dest.name)} × ${draft.travelers}</span><span>$${subtotal.toLocaleString()}</span></div>
      <div class="booking-total__row"><span>Vouya Shield protection</span><span>${draft.protection ? `$${protectionCost.toLocaleString()}` : 'Not included'}</span></div>
      <div class="booking-total__row is-total"><span>Total</span><span>$${total.toLocaleString()}</span></div>`;
  }

  function initBooking() {
    qs('#booking-start').addEventListener('change', (e) => {
      ui.bookingDraft.start = e.target.value;
      validateBookingDates();
      renderBooking();
    });
    qs('#booking-end').addEventListener('change', (e) => {
      ui.bookingDraft.end = e.target.value;
      validateBookingDates();
      renderBooking();
    });

    qs('#travelers-minus').addEventListener('click', () => {
      if (ui.bookingDraft.travelers > 1) { ui.bookingDraft.travelers--; renderBooking(); }
    });
    qs('#travelers-plus').addEventListener('click', () => {
      if (ui.bookingDraft.travelers < 8) { ui.bookingDraft.travelers++; renderBooking(); }
    });

    qs('#protection-toggle').addEventListener('change', (e) => {
      ui.bookingDraft.protection = e.target.checked;
      renderBooking();
    });

    qs('#confirm-booking-btn').addEventListener('click', () => {
      if (!validateBookingDates()) { vibrate(20); return; }
      confirmBooking();
    });
  }

  function validateBookingDates() {
    const errorEl = qs('#booking-date-error');
    const draft = ui.bookingDraft;
    const valid = new Date(draft.end) > new Date(draft.start);
    errorEl.hidden = valid;
    qs('#booking-start').closest('.field__control').style.borderColor = valid ? '' : 'var(--color-danger)';
    qs('#booking-end').closest('.field__control').style.borderColor = valid ? '' : 'var(--color-danger)';
    return valid;
  }

  function confirmBooking() {
    const draft = ui.bookingDraft;
    const dest = findDestination(draft.destinationId);
    const btn = qs('#confirm-booking-btn');
    btn.classList.add('is-loading');

    simulateAsync(() => {
      btn.classList.remove('is-loading');
      const newTrip = {
        id: uid('trip'),
        destinationId: dest.id,
        place: `${dest.name}, ${dest.country}`,
        img: dest.img,
        startDate: draft.start,
        endDate: draft.end,
        status: 'upcoming',
        steps: { flights: false, hotel: false, activities: false, packing: false },
        companionAvatars: [],
        companionsExtra: Math.max(0, draft.travelers - 1),
        days: { 1: [] },
      };
      data.trips.push(newTrip);
      data.activeTripId = newTrip.id;
      addNotification('trip', `${dest.name} trip confirmed`, `${draft.travelers} traveler${draft.travelers > 1 ? 's' : ''} · ${formatDateRange(draft.start, draft.end)}`);
      persist();

      ui.history = [];
      goToScreen('trips', { pushHistory: false });
      renderTrips();
      setTimeout(() => showToast(`Added ${dest.name} to your trips`, {
        actionLabel: 'View',
        onAction: () => { data.activeTripId = newTrip.id; goToScreen('itinerary'); },
      }), 350);
    }, 1100);
  }

  /* ============================ TRIPS SCREEN ===================================== */
  function tripCardHtml(trip) {
    const pct = planningPercent(trip);
    const days = daysUntil(trip.startDate);
    const dayLabel = days <= 0 ? 'Happening now' : days === 1 ? 'Tomorrow' : `In ${days} days`;
    const stepLabels = { flights: 'Flights', hotel: 'Hotel', activities: 'Activities', packing: 'Packing' };
    const stepsHtml = Object.entries(trip.steps).map(([key, done], i, arr) => {
      const firstUndone = arr.findIndex(([, d]) => !d) === i;
      const cls = done ? 'is-done' : (firstUndone ? 'is-active' : '');
      return `<span class="trip-card__step ${cls}">${stepLabels[key]}</span>`;
    }).join('');

    return `
      <article class="trip-card" data-open-trip="${trip.id}">
        <div class="trip-card__img" style="background-image:url('${trip.img}')"></div>
        <div class="trip-card__body">
          <div class="trip-card__top">
            <h3>${escapeHtml(trip.place)}</h3>
            <span class="badge badge--blue">${dayLabel}</span>
          </div>
          <p class="trip-card__dates">${formatDateRange(trip.startDate, trip.endDate)}</p>
          <div class="progress">
            <div class="progress__bar"><span style="width:${pct}%"></span></div>
            <span class="progress__label">Planning ${pct}% complete</span>
          </div>
          <div class="trip-card__timeline">${stepsHtml}</div>
        </div>
      </article>`;
  }

  function pastTripCardHtml(trip) {
    return `
      <article class="trip-card trip-card--past">
        <div class="trip-card__img" style="background-image:url('${trip.img}')"></div>
        <div class="trip-card__body">
          <div class="trip-card__top">
            <h3>${escapeHtml(trip.place)}</h3>
            <span class="badge badge--gray">Completed</span>
          </div>
          <p class="trip-card__dates">${formatDateRange(trip.startDate, trip.endDate)}</p>
          ${trip.reviewed
            ? `<span style="font-size:12px; color:var(--color-secondary); font-weight:600;">✓ Review submitted</span>`
            : `<button class="link-btn" data-leave-review="${trip.id}">Leave a review</button>`}
        </div>
      </article>`;
  }

  function renderTrips() {
    const upcoming = data.trips.filter(t => t.status === 'upcoming').sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const past = data.trips.filter(t => t.status === 'past').sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const upcomingEl = qs('#trips-upcoming');
    upcomingEl.innerHTML = upcoming.length
      ? upcoming.map(tripCardHtml).join('')
      : `<div class="empty-state"><div class="empty-state__icon">🧳</div><p class="empty-state__title">No upcoming trips</p><p class="empty-state__sub">Browse Explore and add a destination to start planning.</p><button class="btn btn--primary" data-nav="explore">Explore destinations</button></div>`;

    const pastEl = qs('#trips-past');
    pastEl.innerHTML = past.length
      ? past.map(pastTripCardHtml).join('')
      : `<div class="empty-state"><div class="empty-state__icon">📷</div><p class="empty-state__title">No past trips yet</p><p class="empty-state__sub">Completed trips will show up here.</p></div>`;
  }

  function initTrips() {
    const tabs = qsa('[data-trips-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        qsa('[data-trips-panel]').forEach(p => p.classList.remove('is-active'));
        qs(`[data-trips-panel="${tab.dataset.tripsTab}"]`).classList.add('is-active');
      });
    });

    qs('#add-trip-btn').addEventListener('click', () => {
      goToScreen('explore');
      showToast('Pick a destination to start a new trip');
    });
  }

  function initFeed() {
    qsa('[data-feed-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        qsa('[data-feed-filter]').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        ui.activeFeedFilter = chip.dataset.feedFilter;
        renderFeed();
      });
    });

    qs('#feed-compose-btn').addEventListener('click', openComposerChoice);
  }

  function postCardHtml(post) {
    const dest = findDestination(post.destinationId);
    const destLabel = dest ? `${dest.name}, ${dest.country}` : 'Somewhere wonderful';
    const starsHtml = post.type === 'review'
      ? `<div class="post-card__stars">${'★'.repeat(post.stars)}${'☆'.repeat(5 - post.stars)}</div>`
      : '';
    const imgHtml = post.img ? `<div class="post-card__img" style="background-image:url('${post.img}')"></div>` : '';
    const avatarSrc = post.authorIsMe ? AVATAR_URL : `https://i.pravatar.cc/64?img=${post.authorAvatar}`;

    return `
      <article class="post-card">
        <div class="post-card__head">
          <img class="avatar avatar--sm" src="${avatarSrc}" alt="">
          <div class="post-card__head-body">
            <strong>${escapeHtml(post.authorIsMe ? data.profile.name : post.authorName)}</strong>
            <span class="post-card__head-meta">📍 ${escapeHtml(destLabel)} · ${relativeTime(post.time)}</span>
          </div>
          <span class="post-card__type-badge post-card__type-badge--${post.type}">${post.type === 'review' ? 'Review' : 'Moment'}</span>
        </div>
        ${starsHtml}
        <p class="post-card__text">${escapeHtml(post.text)}</p>
        ${imgHtml}
        <div class="post-card__footer">
          <button class="post-card__action${post.likedByMe ? ' is-liked' : ''}" data-like-post="${post.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${post.likedByMe ? 'currentColor' : 'none'}"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.4 2.4 5 6 5c2 0 3.4 1 4 2.3C10.6 6 12 5 14 5c3.6 0 5.5 3.4 4 6.7C19.5 16.3 12 21 12 21z" stroke="currentColor" stroke-width="1.8"/></svg>
            <span>${post.likes}</span>
          </button>
          <button class="post-card__action" data-open-detail="${post.destinationId}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span>View destination</span>
          </button>
        </div>
      </article>`;
  }

  function renderFeed() {
    const list = qs('#feed-list');
    if (!list) return;
    let posts = data.posts.slice().sort((a, b) => b.time - a.time);
    if (ui.activeFeedFilter === 'mine') posts = posts.filter(p => p.authorIsMe);

    if (posts.length === 0) {
      list.innerHTML = ui.activeFeedFilter === 'mine'
        ? `<div class="empty-state"><div class="empty-state__icon">✍️</div><p class="empty-state__title">You haven't posted yet</p><p class="empty-state__sub">Tap the + button to write a review or share a moment.</p><button class="btn btn--primary" id="feed-empty-compose-btn">Create a post</button></div>`
        : `<div class="empty-state"><div class="empty-state__icon">🌍</div><p class="empty-state__title">No posts yet</p><p class="empty-state__sub">Be the first to share something.</p></div>`;
      qs('#feed-empty-compose-btn')?.addEventListener('click', openComposerChoice);
      return;
    }
    list.innerHTML = posts.map(postCardHtml).join('');
  }

  function toggleLikePost(postId) {
    const post = data.posts.find(p => p.id === postId);
    if (!post) return;
    post.likedByMe = !post.likedByMe;
    post.likes += post.likedByMe ? 1 : -1;
    persist();
    renderFeed();
  }

  const STOP_ICON_EMOJI = { food: '🍴', sight: '📍', stay: '🏨', transit: '🚆' };
  const STOP_ICON_CLASS = { food: 'food', sight: 'sight', stay: 'stay', transit: 'sight' };

  function activeTrip() { return findTrip(data.activeTripId) || data.trips[0]; }

  function renderItinerary() {
    const trip = activeTrip();
    if (!trip) return;
    const dest = findDestination(trip.destinationId);
    qs('#itinerary-title').textContent = `${dest ? dest.name : trip.place.split(',')[0]} Itinerary`;

    const dayKeys = Object.keys(trip.days).map(Number).sort((a, b) => a - b);
    if (!dayKeys.includes(ui.activeItineraryDay)) ui.activeItineraryDay = dayKeys[0] || 1;

    const start = new Date(trip.startDate + 'T00:00:00');
    qs('#day-row').innerHTML = dayKeys.map(dayNum => {
      const d = new Date(start);
      d.setDate(d.getDate() + (dayNum - 1));
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateNum = d.getDate();
      const active = dayNum === ui.activeItineraryDay ? ' is-active' : '';
      return `<button class="day-chip${active}" data-day="${dayNum}"><span>${weekday}</span><strong>${dateNum}</strong></button>`;
    }).join('');

    renderTimelineForDay(trip, ui.activeItineraryDay);
  }

  function renderTimelineForDay(trip, dayNum) {
  
    const stops = trip.days[dayNum] || [];
    const list = qs('#timeline-list');

    if (stops.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🗺️</div><p class="empty-state__title">Nothing planned yet</p><p class="empty-state__sub">Add your first stop for this day.</p></div>`;
      return;
    }

    list.innerHTML = stops.map((stop, i) => `
      <li class="timeline__item" draggable="true" data-id="${stop.id}">
        <div class="timeline__rail"><span class="timeline__time">${stop.time || '--:--'}</span><span class="timeline__line${i === stops.length - 1 ? ' timeline__line--end' : ''}"></span></div>
        <div class="timeline__card">
          <span class="timeline__drag" aria-hidden="true">⠿</span>
          <div class="timeline__icon timeline__icon--${STOP_ICON_CLASS[stop.icon] || 'sight'}">${STOP_ICON_EMOJI[stop.icon] || '📍'}</div>
          <div class="timeline__body">
            <h4>${escapeHtml(stop.title)}</h4>
            <p>${escapeHtml(stop.note || '')}</p>
          </div>
          <button class="contact-row__delete" data-delete-stop="${stop.id}" aria-label="Remove stop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </li>`).join('');
  }

  function removeStop(stopId) {
    const trip = activeTrip();
    if (!trip) return;
    const dayNum = ui.activeItineraryDay;
    const before = trip.days[dayNum].length;
    trip.days[dayNum] = trip.days[dayNum].filter(s => s.id !== stopId);
    if (trip.days[dayNum].length !== before) {
      persist();
      renderTimelineForDay(trip, dayNum);
      showToast('Stop removed', { type: 'danger' });
    }
  }

  function initItinerary() {
    qs('#day-row').addEventListener('click', (e) => {
      const chip = e.target.closest('.day-chip');
      if (!chip) return;
      ui.activeItineraryDay = Number(chip.dataset.day);
      qsa('.day-chip').forEach(c => c.classList.toggle('is-active', c === chip));
      renderTimelineForDay(activeTrip(), ui.activeItineraryDay);
    });

    qs('#itinerary-share-btn').addEventListener('click', () => showToast('Itinerary link copied to clipboard'));
    qs('#add-stop-btn').addEventListener('click', () => openSheet('stop'));

    initTimelineDragDrop();
  }

  function initTimelineDragDrop() {
    const list = qs('#timeline-list');
    let dragEl = null;

    list.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.timeline__item');
      if (!item) return;
      dragEl = item;
      item.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.dataset.id);
    });

    list.addEventListener('dragend', () => {
      if (dragEl) dragEl.classList.remove('is-dragging');
      qsa('.timeline__item', list).forEach(i => i.classList.remove('drag-over'));
      dragEl = null;
    });

    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const over = e.target.closest('.timeline__item');
      qsa('.timeline__item', list).forEach(i => i.classList.remove('drag-over'));
      if (!over || over === dragEl) return;
      over.classList.add('drag-over');
    });

    list.addEventListener('drop', (e) => {
      e.preventDefault();
      const over = e.target.closest('.timeline__item');
      if (!over || !dragEl || over === dragEl) return;
      reorderStopsFromDom(list);
      over.classList.remove('drag-over');
      showToast('Itinerary order updated');
      vibrate(10);
    });

    // Touch support: long-press a card to pick it up, drag with finger.
    let touchItem = null, touchStartY = 0, longPressTimer = null;

    list.addEventListener('touchstart', (e) => {
      const item = e.target.closest('.timeline__item');
      if (!item) return;
      touchStartY = e.touches[0].clientY;
      longPressTimer = setTimeout(() => { touchItem = item; item.classList.add('is-dragging'); vibrate(15); }, 350);
    }, { passive: true });

    list.addEventListener('touchmove', (e) => {
      if (!touchItem) {
        if (Math.abs(e.touches[0].clientY - touchStartY) > 10) clearTimeout(longPressTimer);
        return;
      }
      const touchY = e.touches[0].clientY;
      qsa('.timeline__item', list).forEach(i => i.classList.remove('drag-over'));
      for (const item of qsa('.timeline__item', list)) {
        if (item === touchItem) continue;
        const rect = item.getBoundingClientRect();
        if (touchY > rect.top && touchY < rect.bottom) { item.classList.add('drag-over'); break; }
      }
    }, { passive: true });

    list.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
      if (!touchItem) return;
      const target = qs('.timeline__item.drag-over', list);
      if (target) {
        const items = qsa('.timeline__item', list);
        const fromIdx = items.indexOf(touchItem);
        const toIdx = items.indexOf(target);
        if (fromIdx < toIdx) target.after(touchItem); else target.before(touchItem);
        reorderStopsFromDom(list);
        showToast('Itinerary order updated');
        vibrate(10);
      }
      touchItem.classList.remove('is-dragging');
      qsa('.timeline__item', list).forEach(i => i.classList.remove('drag-over'));
      touchItem = null;
    });

  
    function reorderStopsFromDom(listEl) {
      const trip = activeTrip();
      const dayNum = ui.activeItineraryDay;
      const orderedIds = qsa('.timeline__item', listEl).map(li => li.dataset.id);
      const stopsById = new Map(trip.days[dayNum].map(s => [s.id, s]));
      trip.days[dayNum] = orderedIds.map(id => stopsById.get(id)).filter(Boolean);
      persist();
    }
  }

  const SOS_HOLD_MS = 2000;
  const SOS_COUNTDOWN_S = 5;

  function renderSafety() {
    const list = qs('#contact-list');
    if (data.emergencyContacts.length === 0) {
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
      list.innerHTML = data.emergencyContacts.map(c => `
        <div class="contact-row">
          <img class="avatar avatar--sm" src="https://i.pravatar.cc/64?img=${c.avatar}" alt="">
          <div class="contact-row__body"><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.relation)}</span></div>
          <button class="icon-btn icon-btn--soft" data-call-contact="${c.id}" aria-label="Call">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" stroke="currentColor" stroke-width="1.6"/></svg>
          </button>
          <button class="contact-row__delete" data-delete-contact="${c.id}" aria-label="Remove contact">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>`).join('') + `
        <button class="contact-row contact-row--add" id="add-contact-row">
          <span class="contact-row__add-icon">+</span><span>Add emergency contact</span>
        </button>`;
    }
    qs('#add-contact-row')?.addEventListener('click', () => openSheet('contact'));

    const activityHtml = data.safetyActivity
      .slice()
      .sort((a, b) => b.time - a.time)
      .slice(0, 4)
      .map(a => `
        <div class="activity-row">
          <span class="activity-row__icon">${a.icon}</span>
          <div class="activity-row__body"><strong>${escapeHtml(a.text)}</strong><span>${relativeTime(a.time)}</span></div>
        </div>`).join('');
    qs('#safety-activity-list').innerHTML = activityHtml || `<p style="font-size:13px; color:var(--color-gray);">No recent activity.</p>`;
  }

  function addSafetyActivity(icon, text) {
    data.safetyActivity.unshift({ id: uid('act'), icon, text, time: Date.now() });
    data.safetyActivity = data.safetyActivity.slice(0, 20);
    persist();
  }

  function removeContact(contactId) {
    data.emergencyContacts = data.emergencyContacts.filter(c => c.id !== contactId);
    persist();
    renderSafety();
    showToast('Contact removed', { type: 'danger' });
  }

  function initSafety() {
    const sosBtn = qs('#sos-btn');
    const progressEl = qs('#sos-progress');
    const hintEl = qs('#sos-hint');
    let rafId = null;

    function startHold(e) {
      e.preventDefault();
      if (sosBtn.classList.contains('is-charging')) return;
      if (data.emergencyContacts.length === 0) {
        showToast('Add an emergency contact first', { type: 'danger', actionLabel: 'Add', onAction: () => openSheet('contact') });
        return;
      }
      sosBtn.classList.add('is-charging');
      ui.sosHoldStart = performance.now();
      hintEl.textContent = 'Keep holding…';
      vibrate(20);

      const tick = () => {
        const elapsed = performance.now() - ui.sosHoldStart;
        const pct = Math.min(100, (elapsed / SOS_HOLD_MS) * 100);
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

    sosBtn.addEventListener('pointerdown', startHold);
    sosBtn.addEventListener('pointerup', cancelHold);
    sosBtn.addEventListener('pointerleave', cancelHold);
    sosBtn.addEventListener('pointercancel', cancelHold);

    function triggerSosFlow() {
      cancelAnimationFrame(rafId);
      sosBtn.classList.remove('is-charging');
      progressEl.style.setProperty('--sos-p', '0%');
      hintEl.textContent = 'Press and hold for 2 seconds to alert your contacts';
      vibrate([30, 60, 30, 60, 30]);
      openSosSheet();
    }
  }

  function openSosSheet() {
    const backdrop = qs('#sos-backdrop');
    const sheet = qs('#sos-sheet');
    const icon = qs('#sos-sheet-icon');
    const title = qs('#sos-sheet-title');
    const sub = qs('#sos-sheet-sub');
    const countdownEl = qs('#sos-countdown');
    const cancelBtn = qs('#sos-cancel');

    const contactNames = data.emergencyContacts.map(c => c.name).join(' and ');

    icon.classList.remove('is-sent');
    icon.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="white" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="white" stroke-width="2"/></svg>`;
    title.textContent = 'Sending your alert…';
    sub.textContent = `Notifying ${contactNames} with your live location in`;
    cancelBtn.style.display = '';
    cancelBtn.textContent = 'Cancel alert';
    cancelBtn.classList.remove('btn--ghost');
    cancelBtn.classList.add('btn--outline-danger');

    let count = SOS_COUNTDOWN_S;
    countdownEl.textContent = count;
    countdownEl.style.display = '';

    backdrop.classList.add('is-active');
    sheet.classList.add('is-active');

    ui.sosTimer = setInterval(() => {
      count -= 1;
      if (count <= 0) { clearInterval(ui.sosTimer); sendSosAlert(); }
      else countdownEl.textContent = count;
    }, 1000);

    cancelBtn.onclick = () => {
      clearInterval(ui.sosTimer);
      closeSosSheet();
      showToast('Alert canceled');
    };
  }

  function sendSosAlert() {
    const icon = qs('#sos-sheet-icon');
    const title = qs('#sos-sheet-title');
    const sub = qs('#sos-sheet-sub');
    const countdownEl = qs('#sos-countdown');
    const cancelBtn = qs('#sos-cancel');
    const contactNames = data.emergencyContacts.map(c => c.name).join(' and ');

    icon.classList.add('is-sent');
    icon.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    title.textContent = 'Your contacts have been alerted';
    sub.textContent = `${contactNames} received your live location and a request to check in.`;
    countdownEl.style.display = 'none';
    cancelBtn.textContent = 'Done';
    cancelBtn.classList.remove('btn--outline-danger');
    cancelBtn.classList.add('btn--ghost');
    cancelBtn.onclick = () => closeSosSheet();
    vibrate([0, 80, 60, 80]);

    addSafetyActivity('🆘', `SOS alert sent to ${contactNames}`);
    addNotification('safety', 'SOS alert sent', `Your live location was shared with ${contactNames}.`);
    renderSafety();
  }

  function closeSosSheet() {
    qs('#sos-backdrop').classList.remove('is-active');
    qs('#sos-sheet').classList.remove('is-active');
  }

  /* ============================ PROFILE SCREEN ==================================== */
  function renderProfile() {
    qs('#profile-name').textContent = data.profile.name;
    qs('#profile-meta').textContent = `Member since ${data.profile.memberSince} · ${data.profile.tier} tier`;

    const countries = new Set(data.trips.map(t => findDestination(t.destinationId)?.country).filter(Boolean));
    qs('#stat-countries').textContent = countries.size;
    qs('#stat-trips').textContent = data.trips.length;
    qs('#stat-rating').textContent = data.profile.rating.toFixed(1);

    qs('#dark-mode-toggle').classList.toggle('is-on', data.settings.darkMode);
    qs('#dark-mode-toggle').setAttribute('aria-checked', String(data.settings.darkMode));
    qs('#location-toggle').classList.toggle('is-on', data.settings.locationSharing);
    qs('#location-toggle').setAttribute('aria-checked', String(data.settings.locationSharing));
    qs('#notif-toggle').classList.toggle('is-on', data.settings.pushNotifications);
    qs('#notif-toggle').setAttribute('aria-checked', String(data.settings.pushNotifications));

    const pm = data.paymentMethods[0];
    qs('#payment-summary').textContent = pm ? `${pm.brand} •••• ${pm.last4}` : 'No card on file';

    $app.setAttribute('data-theme', data.settings.darkMode ? 'dark' : 'light');
  }

  function initProfile() {
    const darkToggle = qs('#dark-mode-toggle');
    const locationToggle = qs('#location-toggle');
    const notifToggle = qs('#notif-toggle');

    darkToggle.addEventListener('click', () => {
      data.settings.darkMode = !data.settings.darkMode;
      persist();
      renderProfile();
      showToast(data.settings.darkMode ? 'Dark mode on' : 'Dark mode off');
    });

    locationToggle.addEventListener('click', () => {
      data.settings.locationSharing = !data.settings.locationSharing;
      persist();
      renderProfile();
      showToast(data.settings.locationSharing ? 'Location sharing enabled' : 'Location sharing disabled', { type: data.settings.locationSharing ? 'success' : 'danger' });
      if (!data.settings.locationSharing) {
        addSafetyActivity('📍', 'Location sharing turned off');
      }
    });

    notifToggle.addEventListener('click', () => {
      data.settings.pushNotifications = !data.settings.pushNotifications;
      persist();
      renderProfile();
      showToast(data.settings.pushNotifications ? 'Notifications enabled' : 'Notifications disabled');
    });

    qs('#payment-methods-btn').addEventListener('click', () => {
      const pm = data.paymentMethods[0];
      showToast(pm ? `${pm.brand} ending in ${pm.last4} is your default card` : 'No payment method on file yet');
    });

    qs('#edit-profile-btn').addEventListener('click', openProfileSheet);

    // Logout flow
    const logoutBtn = qs('#logout-btn');
    const logoutModal = qs('#logout-modal');
    const modalBackdrop = qs('#modal-backdrop');
    qs('#logout-cancel').addEventListener('click', () => closeModal(logoutModal));
    qs('#logout-confirm').addEventListener('click', () => {
      closeModal(logoutModal);
      simulateAsync(() => {
        ui.history = [];
        goToScreen('login', { pushHistory: false });
        qs('#login-pass').value = '';
        showToast('You have been logged out');
      }, 700);
    });
    logoutBtn.addEventListener('click', () => openModal(logoutModal));

    // Reset demo data flow
    const resetBtn = qs('#reset-data-btn');
    const resetModal = qs('#reset-modal');
    resetBtn.addEventListener('click', () => openModal(resetModal));
    qs('#reset-cancel').addEventListener('click', () => closeModal(resetModal));
    qs('#reset-confirm').addEventListener('click', () => {
      closeModal(resetModal);
      simulateAsync(() => {
        Store.clear();
        data = buildSeedData();
        persist();
        ui.activeDetailDestId = null;
        ui.activeItineraryDay = 1;
        ui.activeExploreFilter = 'all';
        renderHome(); renderProfile();
        $app.setAttribute('data-theme', 'light');
        showToast('Demo data has been reset');
      }, 900);
    });

    modalBackdrop.addEventListener('click', () => {
      closeModal(logoutModal);
      closeModal(resetModal);
    });
  }

  function openModal(modalEl) {
    modalEl.classList.add('is-active');
    qs('#modal-backdrop').classList.add('is-active');
  }
  function closeModal(modalEl) {
    modalEl.classList.remove('is-active');
    // Only hide the shared backdrop if no other modal is still open
    if (!qs('.modal.is-active')) qs('#modal-backdrop').classList.remove('is-active');
  }

  function openProfileSheet() {
    qs('#profile-name-input').value = data.profile.name;
    qs('#profile-tier-input').value = data.profile.tier;
    openSheet('profile');
  }

  const NOTIF_ICON = { trip: '🧳', safety: '🛟', system: '⚙️' };

  function renderNotifications() {
    const list = qs('#notifications-list');
    if (data.notifications.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🔔</div><p class="empty-state__title">You're all caught up</p><p class="empty-state__sub">New trip and safety updates will show up here.</p></div>`;
      return;
    }
    const sorted = data.notifications.slice().sort((a, b) => b.time - a.time);
    list.innerHTML = sorted.map(n => `
      <div class="notif-row${n.read ? '' : ' is-unread'}" data-mark-read="${n.id}">
        <div class="notif-row__icon notif-row__icon--${n.type}">${NOTIF_ICON[n.type] || '🔔'}</div>
        <div class="notif-row__body"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p></div>
        <span class="notif-row__time">${relativeTime(n.time)}</span>
      </div>`).join('');

    qsa('[data-mark-read]', list).forEach(row => {
      row.addEventListener('click', () => {
        const notif = data.notifications.find(n => n.id === row.dataset.markRead);
        if (notif && !notif.read) {
          notif.read = true;
          persist();
          row.classList.remove('is-unread');
        }
      });
    });
  }

  function addNotification(type, title, body) {
    data.notifications.unshift({ id: uid('notif'), type, title, body, time: Date.now(), read: false });
    data.notifications = data.notifications.slice(0, 30);
    persist();
  }

  function initNotifications() {
    qs('#clear-notifications-btn').addEventListener('click', () => {
      if (data.notifications.length === 0) return;
      data.notifications = [];
      persist();
      renderNotifications();
      showToast('Notifications cleared');
    });
  }

  function openSheet(name) {
    qs(`#${name}-backdrop`)?.classList.add('is-active');
    qs(`#${name}-sheet`)?.classList.add('is-active');
  }
  function closeSheet(name) {
    qs(`#${name}-backdrop`)?.classList.remove('is-active');
    qs(`#${name}-sheet`)?.classList.remove('is-active');
  }

  function initFormSheets() {
    qsa('[data-close-sheet]').forEach(btn => {
      btn.addEventListener('click', () => closeSheet(btn.dataset.closeSheet));
    });
    qs('#contact-backdrop').addEventListener('click', () => closeSheet('contact'));
    qs('#stop-backdrop').addEventListener('click', () => closeSheet('stop'));
    qs('#profile-backdrop').addEventListener('click', () => closeSheet('profile'));

    /* --- Add emergency contact --- */
    qs('#contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = qs('#contact-name');
      const relationInput = qs('#contact-relation');
      const phoneInput = qs('#contact-phone');

      let valid = true;
      if (!nameInput.value.trim()) { setFieldError('contact-name'); valid = false; } else clearFieldError('contact-name');
      if (!relationInput.value.trim()) { setFieldError('contact-relation'); valid = false; } else clearFieldError('contact-relation');
      const phoneDigits = phoneInput.value.replace(/[^\d]/g, '');
      if (phoneDigits.length < 7) { setFieldError('contact-phone'); valid = false; } else clearFieldError('contact-phone');
      if (!valid) { vibrate(20); return; }

      data.emergencyContacts.push({
        id: uid('contact'),
        name: nameInput.value.trim(),
        relation: relationInput.value.trim(),
        phone: phoneInput.value.trim(),
        avatar: Math.floor(Math.random() * 70) + 1,
      });
      persist();
      renderSafety();
      closeSheet('contact');
      e.target.reset();
      showToast(`${nameInput.value.trim()} added as an emergency contact`);
    });

    [['contact-name'], ['contact-relation'], ['contact-phone']].forEach(([id]) => {
      qs(`#${id}`).addEventListener('input', () => clearFieldError(id));
    });


    qs('#stop-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = qs('#stop-name');
      const timeInput = qs('#stop-time');
      const iconSelect = qs('#stop-icon');
      const noteInput = qs('#stop-note');

      let valid = true;
      if (!nameInput.value.trim()) { setFieldError('stop-name'); valid = false; } else clearFieldError('stop-name');
      if (!timeInput.value) { setFieldError('stop-time'); valid = false; } else clearFieldError('stop-time');
      if (!valid) { vibrate(20); return; }

      const trip = activeTrip();
      const dayNum = ui.activeItineraryDay;
      const newStop = {
        id: uid('stop'),
        time: timeInput.value,
        icon: iconSelect.value,
        title: nameInput.value.trim(),
        note: noteInput.value.trim(),
      };
  
      const stops = trip.days[dayNum] || (trip.days[dayNum] = []);
      const insertAt = stops.findIndex(s => s.time > newStop.time);
      if (insertAt === -1) stops.push(newStop); else stops.splice(insertAt, 0, newStop);

      persist();
      renderTimelineForDay(trip, dayNum);
      closeSheet('stop');
      e.target.reset();
      qs('#stop-icon').value = 'sight';
      showToast('Stop added to your day');
    });
    qs('#stop-name').addEventListener('input', () => clearFieldError('stop-name'));
    qs('#stop-time').addEventListener('input', () => clearFieldError('stop-time'));

    qs('#profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = qs('#profile-name-input');
      const tierSelect = qs('#profile-tier-input');

      if (!nameInput.value.trim()) { setFieldError('profile-name-input'); vibrate(20); return; }
      clearFieldError('profile-name-input');

      data.profile.name = nameInput.value.trim();
      data.profile.tier = tierSelect.value;
      persist();
      renderProfile();
      renderHome();
      closeSheet('profile');
      showToast('Profile updated');
    });
    qs('#profile-name-input').addEventListener('input', () => clearFieldError('profile-name-input'));
  }

  function populateDestinationSelect(selectEl) {
    selectEl.innerHTML = data.destinations
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(d => `<option value="${d.id}">${escapeHtml(d.name)}, ${escapeHtml(d.country)}</option>`)
      .join('');
  }

  function openComposerChoice() {
    openSheet('composer');
    qs('#composer-fab').classList.add('is-open');
  }

  function openReviewComposer(prefillDestId = null, prefillTripId = null) {
    const select = qs('#review-destination');
    populateDestinationSelect(select);
    if (prefillDestId) select.value = prefillDestId;
    ui.reviewStars = 0;
    ui.pendingReviewTripId = prefillTripId; // if set, marks that trip's "reviewed" flag on submit
    qsa('.star-picker__star').forEach(s => s.classList.remove('is-filled'));
    qs('#review-text').value = '';
    clearFieldError('review-destination');
    clearFieldError('review-text');
    qs('#review-star-error').hidden = true;
    openSheet('review');
  }

  function openMomentComposer(prefillDestId = null) {
    const select = qs('#moment-destination');
    populateDestinationSelect(select);
    if (prefillDestId) select.value = prefillDestId;
    qs('#moment-text').value = '';
    ui.momentPhotoChoice = 'random';
    qsa('.moment-photo-picker__option').forEach(b => b.classList.toggle('is-active', b.dataset.photo === 'random'));
    clearFieldError('moment-text');
    openSheet('moment');
  }

  function initComposer() {
    const fab = qs('#composer-fab');
    fab.addEventListener('click', openComposerChoice);

    function closeComposerChoice() {
      closeSheet('composer');
      fab.classList.remove('is-open');
    }

    qs('#composer-backdrop').addEventListener('click', closeComposerChoice);
    qsa('[data-close-sheet="composer"]').forEach(btn => btn.addEventListener('click', closeComposerChoice));

    qs('#choice-review').addEventListener('click', () => {
      closeComposerChoice();
      openReviewComposer();
    });
    qs('#choice-moment').addEventListener('click', () => {
      closeComposerChoice();
      openMomentComposer();
    });

    qs('#review-backdrop').addEventListener('click', () => closeSheet('review'));
    qs('#moment-backdrop').addEventListener('click', () => closeSheet('moment'));


    qsa('.star-picker__star').forEach(star => {
      star.addEventListener('click', () => {
        ui.reviewStars = Number(star.dataset.star);
        qsa('.star-picker__star').forEach(s => s.classList.toggle('is-filled', Number(s.dataset.star) <= ui.reviewStars));
        qs('#review-star-error').hidden = true;
      });
    });

    
    qsa('.moment-photo-picker__option').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.momentPhotoChoice = btn.dataset.photo;
        qsa('.moment-photo-picker__option').forEach(b => b.classList.toggle('is-active', b === btn));
      });
    });


    qs('#review-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const destSelect = qs('#review-destination');
      const textInput = qs('#review-text');

      let valid = true;
      if (!destSelect.value) { setFieldError('review-destination'); valid = false; } else clearFieldError('review-destination');
      if (ui.reviewStars < 1) { qs('#review-star-error').hidden = false; valid = false; } else qs('#review-star-error').hidden = true;
      if (!textInput.value.trim()) { setFieldError('review-text'); valid = false; } else clearFieldError('review-text');
      if (!valid) { vibrate(20); return; }

      data.posts.unshift({
        id: uid('post'), type: 'review', destinationId: destSelect.value, authorIsMe: true,
        authorName: data.profile.name, authorAvatar: null, stars: ui.reviewStars,
        text: textInput.value.trim(), img: null, time: Date.now(), likes: 0, likedByMe: false,
      });

  
      const dest = findDestination(destSelect.value);
      if (dest) {
        dest.reviews = dest.reviews || [];
        dest.reviews.unshift({ name: data.profile.name, avatar: 44, stars: ui.reviewStars, text: textInput.value.trim() });
        dest.reviewCount = (dest.reviewCount || 0) + 1;
      }

      if (ui.pendingReviewTripId) {
        const trip = findTrip(ui.pendingReviewTripId);
        if (trip) trip.reviewed = true;
        ui.pendingReviewTripId = null;
      }

      persist();
      closeSheet('review');
      renderFeed();
      renderTrips();
      showToast('Review posted — thanks for helping other travelers!', { duration: 3200 });
    });
    qs('#review-text').addEventListener('input', () => clearFieldError('review-text'));
    qs('#review-destination').addEventListener('change', () => clearFieldError('review-destination'));

    /* --- Submit: moment --- */
    qs('#moment-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const destSelect = qs('#moment-destination');
      const textInput = qs('#moment-text');

      if (!textInput.value.trim()) { setFieldError('moment-text'); vibrate(20); return; }
      clearFieldError('moment-text');

      const dest = findDestination(destSelect.value);
      const img = ui.momentPhotoChoice === 'random' && dest ? dest.img : null;

      data.posts.unshift({
        id: uid('post'), type: 'moment', destinationId: destSelect.value, authorIsMe: true,
        authorName: data.profile.name, authorAvatar: null, stars: null,
        text: textInput.value.trim(), img, time: Date.now(), likes: 0, likedByMe: false,
      });
      persist();
      closeSheet('moment');
      renderFeed();
      showToast('Moment shared to the community feed');
    });
    qs('#moment-text').addEventListener('input', () => clearFieldError('moment-text'));
  }

  function injectAvatars() {
    qsa('[data-avatar]').forEach(img => { img.src = AVATAR_URL; });
  }

  function init() {
    injectAvatars();
    initLogin();
    initExplore();
    initExploreDetail();
    initBooking();
    initTrips();
    initFeed();
    initItinerary();
    initSafety();
    initProfile();
    initNotifications();
    initFormSheets();
    initComposer();

    // Apply persisted theme immediately so there's no flash of light mode
    // before the user reaches Profile.
    $app.setAttribute('data-theme', data.settings.darkMode ? 'dark' : 'light');

    runSplashSequence();
  }

  document.addEventListener('DOMContentLoaded', init);
})();