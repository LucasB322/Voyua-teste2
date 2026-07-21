import { Router } from '../router/router.js';
import { qs, qsa } from '../utils/dom.js';
import { showToast } from '../components/toast.js';

const SYSTEM_PROMPT = `You are Vouya's AI Travel Planner — a friendly, knowledgeable travel assistant built into the Vouya safe travel app. Your role is to help solo travelers (especially women) plan amazing, safe trips.

You help with:
- Destination suggestions based on budget, interests and travel style
- Best times to visit (considering crowds, weather, costs)
- Safety tips and advisories for each destination
- Accommodation recommendations for different budgets
- Must-see attractions and local experiences
- Packing tips
- Budget breakdowns

Always consider safety as a priority. When recommending destinations, mention safety ratings and any important advisories. Be warm, encouraging and practical. Keep responses concise but helpful — use emojis to make it friendly. Always ask follow-up questions to better personalize recommendations.`;

let _messages = [];
let _isLoading = false;

export function initAIPlanner() {
  Router.register('ai-planner', { onShow: () => {} });

  qs('#open-ai-planner')?.addEventListener('click', () => {
    Router.go('ai-planner');
  });

  qs('#ai-send-btn')?.addEventListener('click', sendMessage);

  qs('#ai-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  qsa('.ai-suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.suggestion;
      qs('#ai-input').value = text;
      sendMessage();
      qs('#ai-suggestions').style.display = 'none';
    });
  });
}

async function sendMessage() {
  if (_isLoading) return;
  const input = qs('#ai-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';

  appendMessage('user', text);
  _messages.push({ role: 'user', content: text });

  _isLoading = true;
  const loadingId = appendLoading();
  qs('#ai-send-btn').disabled = true;

  // Simula delay de IA
  await new Promise(r => setTimeout(r, 1200));

  const reply = generateReply(text);
  removeLoading(loadingId);
  appendMessage('bot', reply);
  _messages.push({ role: 'assistant', content: reply });
  showContextualSuggestions(reply);

  _isLoading = false;
  qs('#ai-send-btn').disabled = false;
  qs('#ai-input').focus();
}

function showContextualSuggestions(text) {
  const t = text.toLowerCase();
  const container = qs('#ai-suggestions');
  container.style.display = 'flex';

  let suggestions = [];

  if (t.includes('japan') || t.includes('tokyo') || t.includes('kyoto')) {
    suggestions = [
      { icon: '🗓️', label: 'Day-by-day itinerary', msg: 'Plan me a 7 day itinerary in Japan' },
      { icon: '💰', label: 'Budget breakdown', msg: 'Give me a detailed budget for Japan' },
      { icon: '🏨', label: 'Where to stay', msg: 'Best places to stay in Japan for solo travelers' },
      { icon: '🛡️', label: 'Safety tips', msg: 'Safety tips for solo travel in Japan' },
    ];
  } else if (t.includes('budget') || t.includes('$') || t.includes('cheap')) {
    suggestions = [
      { icon: '🗓️', label: 'Plan my trip', msg: 'Plan a full itinerary for my budget trip' },
      { icon: '🏨', label: 'Cheap accommodation', msg: 'Best budget accommodation options' },
      { icon: '🛡️', label: 'Is it safe?', msg: 'Is this destination safe for solo female travelers?' },
      { icon: '🧳', label: 'Packing tips', msg: 'What should I pack for a budget trip?' },
    ];
  } else if (t.includes('safe') || t.includes('solo') || t.includes('female')) {
    suggestions = [
      { icon: '🌍', label: 'Top safe destinations', msg: 'What are the top 5 safest destinations?' },
      { icon: '💰', label: 'Budget options', msg: 'Safe destinations under $1000' },
      { icon: '🧳', label: 'Safety packing', msg: 'What safety items should I pack?' },
      { icon: '📱', label: 'Vouya safety tips', msg: 'How can Vouya help keep me safe?' },
    ];
  } else if (t.includes('beach') || t.includes('sea') || t.includes('sun')) {
    suggestions = [
      { icon: '🇧🇷', label: 'Brazil beaches', msg: 'Tell me more about beaches in Brazil' },
      { icon: '🇹🇭', label: 'Thailand beaches', msg: 'Best beaches in Thailand for solo travelers' },
      { icon: '💰', label: 'Beach on a budget', msg: 'Best beach destinations under $800' },
      { icon: '🛡️', label: 'Beach safety', msg: 'Safety tips for beach destinations' },
    ];
  } else {
    suggestions = [
      { icon: '🗓️', label: 'Plan an itinerary', msg: 'Plan me a full trip itinerary' },
      { icon: '💰', label: 'Budget help', msg: 'Help me plan a trip with my budget' },
      { icon: '🛡️', label: 'Safe destinations', msg: 'What are the safest destinations for solo travel?' },
      { icon: '🏨', label: 'Accommodation tips', msg: 'Best accommodation for solo travelers' },
    ];
  }

  container.innerHTML = suggestions.map(s =>
    `<button class="ai-suggestion-chip" data-suggestion="${s.msg}">${s.icon} ${s.label}</button>`
  ).join('');

  container.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      qs('#ai-input').value = chip.dataset.suggestion;
      sendMessage();
      container.style.display = 'none';
    });
  });
}

function generateReply(text) {
  const t = text.toLowerCase();

  if (t.includes('budget') || t.includes('$') || t.includes('money') || t.includes('cheap') || t.includes('afford')) {
    const budget = text.match(/\$?(\d+)/)?.[1];
    if (budget && Number(budget) < 500) {
      return `With **$${budget}**, here are some great budget-friendly options: 🌟\n\n**🇧🇷 Brazil (Northeast)** — Fortaleza or Natal offer stunning beaches for under $400. Hostels from $15/night.\n\n**🇲🇽 Mexico** — Oaxaca is incredible for culture lovers. Street food, markets and colonial charm on a tight budget.\n\n**🇵🇹 Portugal** — Porto is one of Europe's most affordable cities. Wine, food and history for less than you'd think!\n\n🛡️ **Safety tip:** All three are popular with solo travelers. Stick to tourist areas and use Vouya's safety circle feature.\n\nWhich vibe appeals to you most — beach, culture or city?`;
    }
    if (budget && Number(budget) >= 500 && Number(budget) < 1500) {
      return `**$${budget}** opens up some wonderful options! Here's what I'd recommend: ✈️\n\n**🇯🇵 Japan** — Tokyo + Kyoto in 7 days. Budget $80-100/day covering transport, food and mid-range hotels.\n\n**🇬🇷 Greece** — Athens and Santorini. Ferry hopping between islands is magical and surprisingly affordable.\n\n**🇹🇭 Thailand** — Bangkok, Chiang Mai and beaches. $50-70/day covers everything comfortably.\n\n**🇨🇷 Costa Rica** — Perfect for nature lovers. Rainforests, volcanoes and incredible wildlife.\n\n🛡️ **Safety:** Japan and Greece rank among the world's safest for solo female travelers.\n\nWant a detailed day-by-day budget breakdown for any of these?`;
    }
    return `With a generous budget, you have the world at your feet! 🌍\n\n**🇮🇸 Iceland** — Northern lights, hot springs and dramatic landscapes. Best Sept-March for aurora.\n\n**🇳🇿 New Zealand** — Lord of the Rings landscapes, adventure sports and friendly locals.\n\n**🇯🇵 Japan** — Go beyond Tokyo: Kyoto, Osaka, Hiroshima and a ryokan stay.\n\n**🇮🇹 Italy** — Amalfi Coast, Tuscany and Rome. Stay in boutique hotels for the full experience.\n\n🛡️ All of these are excellent for solo travelers with strong safety records.\n\nWould you like me to plan a full itinerary for any destination?`;
  }

  if (t.includes('safe') || t.includes('solo') || t.includes('woman') || t.includes('female') || t.includes('security')) {
    return `Great question — safety is our top priority at Vouya! 🛡️\n\n**Top 5 safest destinations for solo female travelers:**\n\n**🇮🇸 Iceland** — Consistently ranked #1. Extremely low crime, helpful locals.\n\n**🇯🇵 Japan** — Safe public transport, respectful culture, easy to navigate alone.\n\n**🇳🇿 New Zealand** — Friendly, English-speaking and very safe outdoors.\n\n**🇵🇹 Portugal** — Europe's most welcoming country for solo travelers.\n\n**🇸🇬 Singapore** — Ultra-safe city-state, excellent public transport.\n\n💡 **Vouya safety tips:**\n- Always activate your **Safety Circle** before arrival\n- Set **check-in reminders** at each new location\n- Share your **live location link** with family\n- Use the **SOS button** if you ever feel unsafe\n\nWhich region interests you most?`;
  }

  if (t.includes('japan') || t.includes('tokyo') || t.includes('kyoto')) {
    return `**Japan** is one of the best destinations for solo travelers! 🇯🇵\n\n**Best time to visit:**\n- 🌸 **March-April** — Cherry blossoms (very crowded, book early)\n- 🍁 **Oct-Nov** — Autumn leaves, perfect weather, fewer tourists\n- ❄️ **Dec-Feb** — Snow festivals in Hokkaido, cheaper prices\n- ☀️ **May-June** — Before rainy season, comfortable temperatures\n\n**Budget breakdown (7 days):**\n- Flights: $600-900\n- Accommodation: $40-80/night\n- Food: $20-40/day\n- Transport (JR Pass): $200\n- Activities: $100-200\n- **Total: ~$1,200-1,800**\n\n**Must-visit:**\nTokyo → Kyoto → Osaka → Hiroshima\n\n🛡️ **Safety:** Japan is extremely safe. Solo female travelers consistently rate it as one of the best destinations worldwide.\n\nWould you like a day-by-day itinerary?`;
  }

  if (t.includes('beach') || t.includes('sea') || t.includes('ocean') || t.includes('sun')) {
    return `Beach destinations coming right up! 🏖️\n\n**Best beaches for solo travelers:**\n\n**🇧🇷 Jericoacoara, Brazil** — Stunning dunes, lagoons and a relaxed vibe. Great for meeting other travelers.\n\n**🇹🇭 Koh Lanta, Thailand** — Quieter than Phuket, beautiful sunsets, budget-friendly.\n\n**🇵🇹 Algarve, Portugal** — Dramatic cliffs, crystal water and very safe.\n\n**🇬🇷 Crete, Greece** — History + beaches. Excellent infrastructure for solo travel.\n\n**🇲🇻 Maldives** — Splurge-worthy for a special trip. Overwater bungalows from $200/night.\n\n**Best seasons:**\n- Brazil: June-September (dry season)\n- Thailand: November-March (cool & dry)\n- Portugal: May-September\n- Greece: May-October\n\n🛡️ Always research local beach safety and avoid isolated beaches alone at night.\n\nWhich budget range are you working with?`;
  }

  if (t.includes('pack') || t.includes('bring') || t.includes('luggage') || t.includes('bag')) {
    return `Smart packing for solo travel! 🧳\n\n**Essentials:**\n- 📄 Copies of passport/documents (digital + physical)\n- 💊 Basic first aid kit and personal medications\n- 🔌 Universal adapter\n- 🔒 Padlock for hostel lockers\n- 💳 Two payment cards (different banks)\n\n**Clothing (1-week rule):**\n- 5 tops, 2 bottoms, 1 dress/smart outfit\n- Comfortable walking shoes + sandals\n- Light jacket or layer\n- Quick-dry fabrics only\n\n**Tech & safety:**\n- Portable charger (essential!)\n- Offline maps downloaded\n- Emergency contact card in wallet\n- Vouya app set up with safety circle ✅\n\n**Pro tips:**\n- Roll clothes instead of folding\n- Leave 30% of bag space for souvenirs\n- Wear heaviest items on travel days\n\nWhat's your destination? I can give more specific packing tips!`;
  }

  if (t.includes('when') || t.includes('best time') || t.includes('season') || t.includes('weather')) {
    return `Great question about timing! 📅 Here's a quick seasonal guide:\n\n**Europe:** May-June & September (avoid peak July-August crowds)\n\n**Southeast Asia:** November-March (dry season, cooler temps)\n\n**South America:** June-September (Brazil's winter = dry & perfect)\n\n**Japan:** March-April (cherry blossoms) or October-November (autumn)\n\n**Caribbean:** December-April (dry season, hurricane-free)\n\n**General rules:**\n- 🏷️ **Cheapest:** Shoulder season (1-2 months before/after peak)\n- 👥 **Least crowded:** Off-season (research weather first)\n- 🌤️ **Best weather:** Varies hugely by destination\n\nWhich destination are you considering? I can give you month-by-month details!`;
  }

  if (t.includes('itinerary') || t.includes('plan') || t.includes('days') || t.includes('week')) {
    return `I'd love to plan your itinerary! 🗓️ To create the perfect trip, tell me:\n\n1. **Where** do you want to go?\n2. **How many days** do you have?\n3. **What's your budget** (approximate)?\n4. **What do you enjoy** — culture, nature, food, adventure, relaxation?\n5. **Any concerns** — mobility, dietary needs, safety priorities?\n\nWith these details I can build you a day-by-day plan with accommodation suggestions, must-see spots and safety tips for each location! 🌍`;
  }

  if (t.includes('hotel') || t.includes('hostel') || t.includes('stay') || t.includes('accommodation') || t.includes('sleep')) {
    return `Accommodation options for solo travelers: 🏨\n\n**Hostels ($15-40/night)**\nPerfect for meeting people. Look for female-only dorms for extra safety. Top picks: Generator, Selina, Meininger.\n\n**Budget hotels ($40-80/night)**\nMore privacy, good for introverts. Booking.com and Expedia often have great deals.\n\n**Mid-range ($80-150/night)**\nBoutique hotels often have the best locations and personal service.\n\n**Airbnb**\nGreat for longer stays. Read reviews carefully and choose verified hosts.\n\n**Safety tips for accommodation:**\n- Always check reviews from solo female travelers\n- Confirm 24h reception\n- Check door/window locks before unpacking\n- Share your exact address with your Vouya safety circle\n- Download the hotel's address in local language\n\nWhat's your destination and budget? I can suggest specific places!`;
  }

  // Resposta genérica
  return `That's a great question! 🌍 I'm here to help you plan the perfect safe trip.\n\nI can help you with:\n- 💰 **Budget planning** — "I have $800, where should I go?"\n- 🛡️ **Safety tips** — "What are the safest destinations for solo travel?"\n- 📅 **Best time to visit** — "When should I visit Thailand?"\n- 🗺️ **Itinerary planning** — "Plan me 7 days in Japan"\n- 🏨 **Accommodation** — "Best places to stay in Lisbon"\n- 🧳 **Packing tips** — "What should I pack for a beach trip?"\n\nWhat would you like to know more about?`;
}

function appendMessage(role, text) {
  const container = qs('#ai-chat-messages');
  const isBot = role === 'bot';

  const div = document.createElement('div');
  div.className = `ai-message ai-message--${isBot ? 'bot' : 'user'}`;
  div.innerHTML = isBot
    ? `<div class="ai-message__avatar">✨</div>
       <div class="ai-message__bubble">${formatText(text)}</div>`
    : `<div class="ai-message__bubble ai-message__bubble--user">${escapeHtml(text)}</div>`;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function appendLoading() {
  const container = qs('#ai-chat-messages');
  const id = 'loading-' + Date.now();
  const div = document.createElement('div');
  div.className = 'ai-message ai-message--bot';
  div.id = id;
  div.innerHTML = `
    <div class="ai-message__avatar">✨</div>
    <div class="ai-message__bubble ai-message__loading">
      <span></span><span></span><span></span>
    </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeLoading(id) {
  qs(`#${id}`)?.remove();
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}