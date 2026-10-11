'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Mobile navigation
const menuToggle = $('#menuToggle');
const navLinks = $('#navLinks');
menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '×' : '☰';
});
$$('#navLinks a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (menuToggle) menuToggle.textContent = '☰';
}));

// Direction overview cards
const directionInfo = {
  N: { title: 'North · N', heading: 'A direction of opportunity', description: 'In many Vastu traditions, north is associated with prosperity and movement. Some interpretations suggest keeping this area orderly and well-lit.' },
  NE: { title: 'North-East · NE', heading: 'A space for clarity', description: 'In many Vastu traditions, the north-east is associated with prayer, reflection and keeping a space open or uncluttered.' },
  E: { title: 'East · E', heading: 'Light and new beginnings', description: 'East is traditionally connected with sunrise and renewal. Practical design can also consider daylight, glare control and thermal comfort.' },
  SE: { title: 'South-East · SE', heading: 'The traditional fire zone', description: 'Some Vastu traditions associate the south-east with Agni, the fire principle, and commonly discuss kitchen placement in this zone.' },
  S: { title: 'South · S', heading: 'Stability and structure', description: 'South is often discussed in relation to stability and protection in Vastu interpretations. Building design should always account for climate and site conditions.' },
  SW: { title: 'South-West · SW', heading: 'Grounded and settled', description: 'The south-west is traditionally associated with weight and stability. Some guidance recommends placing a main bedroom in this area.' },
  W: { title: 'West · W', heading: 'Reflection and completion', description: 'West is associated with the setting sun. Depending on local climate, west-facing openings may need careful shade and heat management.' },
  NW: { title: 'North-West · NW', heading: 'Movement and transition', description: 'North-west is sometimes associated with movement and change. Traditional recommendations often discuss guest rooms or flexible spaces here.' }
};
$$('.direction-cell[data-direction]').forEach(cell => cell.addEventListener('click', () => {
  $$('.direction-cell[data-direction]').forEach(item => item.classList.remove('active'));
  cell.classList.add('active');
  const data = directionInfo[cell.dataset.direction];
  if (!data) return;
  $('#directionTitle').textContent = data.title;
  $('#directionHeading').textContent = data.heading;
  $('#directionDescription').textContent = data.description;
}));

// Digital compass: device sensor when available, manual mode as a fallback.
const compassNeedle = $('#compassNeedle');
const compassDirection = $('#compassDirection');
const compassDegrees = $('#compassDegrees');
const compassStatus = $('#compassStatus');
const manualDirection = $('#manualDirection');
const enableCompass = $('#enableCompass');
const compassNames = [
  { name: 'North', short: 'N', degree: 0 }, { name: 'North-East', short: 'NE', degree: 45 },
  { name: 'East', short: 'E', degree: 90 }, { name: 'South-East', short: 'SE', degree: 135 },
  { name: 'South', short: 'S', degree: 180 }, { name: 'South-West', short: 'SW', degree: 225 },
  { name: 'West', short: 'W', degree: 270 }, { name: 'North-West', short: 'NW', degree: 315 }
];
function nearestDirection(degrees) {
  const normal = ((degrees % 360) + 360) % 360;
  return compassNames.reduce((best, item) => {
    const delta = Math.abs(((normal - item.degree + 540) % 360) - 180);
    return delta < best.delta ? { item, delta } : best;
  }, { item: compassNames[0], delta: Infinity }).item;
}
function renderCompass(degrees, sourceLabel = 'Manual direction') {
  const normal = ((Number(degrees) % 360) + 360) % 360;
  const nearest = nearestDirection(normal);
  if (compassNeedle) compassNeedle.style.transform = `rotate(${normal}deg)`;
  if (compassDirection) compassDirection.textContent = nearest.name;
  if (compassDegrees) compassDegrees.textContent = `${Math.round(normal)}° · ${sourceLabel}`;
}
manualDirection?.addEventListener('change', () => {
  renderCompass(Number(manualDirection.value), 'manual selection');
  if (compassStatus) compassStatus.textContent = 'Showing the direction selected manually. Device sensor readings are not active.';
});
let sensorActive = false;
function handleOrientation(event) {
  // webkitCompassHeading is a compass heading in degrees on some iOS browsers.
  let heading = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading : null;
  // alpha is relative orientation, not a calibrated compass on every device.
  if (heading === null && Number.isFinite(event.alpha)) heading = 360 - event.alpha;
  if (heading === null) {
    if (compassStatus) compassStatus.textContent = 'The browser sent an orientation event without a usable heading. Try manual direction.';
    return;
  }
  sensorActive = true;
  renderCompass(heading, 'device sensor · approximate');
  if (compassStatus) compassStatus.textContent = 'Device orientation received. Readings can be approximate and may require calibration.';
}
async function startCompass() {
  if (!('DeviceOrientationEvent' in window)) {
    if (compassStatus) compassStatus.textContent = 'This browser does not expose device orientation. Use the manual direction selector.';
    return;
  }
  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        if (compassStatus) compassStatus.textContent = 'Sensor permission was not granted. You can still use manual direction.';
        return;
      }
    }
    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    if (compassStatus) compassStatus.textContent = 'Waiting for sensor data… Move the device gently if needed.';
    window.setTimeout(() => {
      if (!sensorActive && compassStatus) compassStatus.textContent = 'No sensor heading received yet. Your browser or device may not support it; use manual direction.';
    }, 3500);
  } catch (error) {
    if (compassStatus) compassStatus.textContent = 'Could not access the compass sensor. Check browser permission or use manual direction.';
  }
}
enableCompass?.addEventListener('click', startCompass);
renderCompass(0, 'North reference');

// Simple interactive 3x3 room planner.
const roomSelect = $('#roomSelect');
const zoneSelect = $('#zoneSelect');
const plannerMessage = $('#plannerMessage');
const zoneLabels = { NW: 'NORTH-WEST', N: 'NORTH', NE: 'NORTH-EAST', W: 'WEST', C: 'CENTRE', E: 'EAST', SW: 'SOUTH-WEST', S: 'SOUTH', SE: 'SOUTH-EAST' };
const zoneRooms = new Map();
function renderPlanner() {
  $$('.house-cell[data-zone]').forEach(cell => {
    const zone = cell.dataset.zone;
    const room = zoneRooms.get(zone);
    cell.classList.toggle('has-room', Boolean(room));
    cell.replaceChildren();
    const label = document.createElement('span'); label.className = 'zone-name'; label.textContent = zoneLabels[zone]; cell.append(label);
    if (room) {
      const name = document.createElement('span'); name.className = 'placed-room'; name.textContent = room; cell.append(name);
      cell.title = `${room} in ${zoneLabels[zone]}. Click to remove.`;
      cell.setAttribute('aria-label', `${room} in ${zoneLabels[zone]}. Click to remove.`);
    } else {
      const symbol = document.createElement('span'); symbol.className = 'cell-symbol'; symbol.textContent = zone === 'C' ? '✥' : '＋'; cell.append(symbol);
      cell.title = `Empty ${zoneLabels[zone]} zone`;
      cell.setAttribute('aria-label', `Empty ${zoneLabels[zone]} zone`);
    }
  });
}
$('#placeRoomBtn')?.addEventListener('click', () => {
  const room = roomSelect.value;
  const zone = zoneSelect.value;
  if (zoneRooms.has(zone)) {
    plannerMessage.textContent = `${zoneLabels[zone]} already contains ${zoneRooms.get(zone)}. Remove it first or choose another zone.`;
    return;
  }
  zoneRooms.set(zone, room);
  renderPlanner();
  plannerMessage.textContent = `${room} placed in ${zoneLabels[zone]}. This is a sample layout, not a building recommendation.`;
});
$('#resetPlannerBtn')?.addEventListener('click', () => {
  zoneRooms.clear(); renderPlanner();
  if (plannerMessage) plannerMessage.textContent = 'Layout reset. Choose a room and zone to begin.';
});
$('#houseGrid')?.addEventListener('click', event => {
  const cell = event.target.closest('.house-cell[data-zone]');
  if (!cell) return;
  const zone = cell.dataset.zone;
  if (!zoneRooms.has(zone)) {
    zoneSelect.value = zone;
    if (plannerMessage) plannerMessage.textContent = `${zoneLabels[zone]} selected. Choose a room, then press “Place room +”.`;
    return;
  }
  const removed = zoneRooms.get(zone); zoneRooms.delete(zone); renderPlanner();
  if (plannerMessage) plannerMessage.textContent = `${removed} removed from ${zoneLabels[zone]}.`;
});
renderPlanner();

// Demo contact form: validation is real, but no data is transmitted.
$('#contactForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#contactName').value.trim();
  if ($('#contactStatus')) $('#contactStatus').textContent = `Thank you${name ? `, ${name}` : ''}. This demo form is working locally; no message was sent to a server.`;
  event.currentTarget.reset();
});
$('#currentYear').textContent = String(new Date().getFullYear());

// VastuBot: load searchable answers from vastu-database.json.
const chatbotToggle = $('#chatbotToggle');
const chatbotPanel = $('#chatbotPanel');
const chatbotClose = $('#chatbotClose');
const chatForm = $('#chatForm');
const chatInput = $('#chatInput');
const chatMessages = $('#chatMessages');
let vastuDB = null;
let pendingOptions = null;
let lastTopic = null;

async function loadDatabase() {
  try {
    const response = await fetch('vastu-database.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    vastuDB = await response.json();
  } catch (error) {
    vastuDB = { topics: [], faqs: [], fallback: 'I could not load the knowledge database. Run this site with VS Code Live Server (not by opening index.html directly).' };
  }
}
function addChatMessage(text, type = 'bot') {
  const message = document.createElement('div');
  message.className = `chat-message ${type === 'user' ? 'user-message' : 'bot-message'}`;
  message.textContent = text;
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}
function addChoices(options, handler) {
  if (!options?.length) return;
  const wrap = document.createElement('div'); wrap.className = 'chatbot-choice-list';
  options.forEach(option => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'chatbot-choice'; button.textContent = option;
    button.addEventListener('click', () => { wrap.remove(); handler(option); });
    wrap.append(button);
  });
  chatMessages.append(wrap); chatMessages.scrollTop = chatMessages.scrollHeight;
}
function normalize(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}
const STOP_WORDS = new Set(['what','where','when','which','who','how','is','are','the','a','an','of','for','to','in','on','and','do','does','can','should','tell','me','about','please','explain','suggest','give','my','i','want','know','with','best','according','vastu']);
function meaningfulTokens(text) { return normalize(text).split(' ').filter(word => word.length > 2 && !STOP_WORDS.has(word)); }
function findFAQ(query) {
  if (!vastuDB?.faqs) return null;
  const q = normalize(query);
  let best = null; let bestScore = 0;
  for (const faq of vastuDB.faqs) {
    const terms = [faq.question, ...(faq.keywords || [])].map(normalize);
    let score = 0;
    for (const term of terms) {
      if (term && q === term) score = Math.max(score, 20 + term.length / 20);
      else if (term && q.includes(term)) score = Math.max(score, 12 + term.length / 20);
    }
    const tokens = new Set(meaningfulTokens(q));
    const faqTokens = new Set(meaningfulTokens(`${faq.question} ${(faq.keywords || []).join(' ')}`));
    let overlap = 0; tokens.forEach(token => { if (faqTokens.has(token)) overlap++; });
    score += overlap * 1.4;
    if (score > bestScore) { bestScore = score; best = faq; }
  }
  // Avoid replying with a barely-related FAQ based on one generic word.
  return bestScore >= 3.5 ? best : null;
}
function findTopic(query) {
  if (!vastuDB?.topics) return null;
  const q = normalize(query);
  let best = null; let bestScore = 0;
  for (const topic of vastuDB.topics) {
    const terms = [topic.label, ...(topic.keywords || [])].map(normalize).filter(Boolean);
    let score = 0;
    for (const term of terms) {
      if (q === term) score = Math.max(score, 15 + term.length / 10);
      else if (q.includes(term)) score = Math.max(score, 9 + term.length / 10);
    }
    const tokens = new Set(meaningfulTokens(q));
    for (const token of tokens) if (terms.some(term => term.split(' ').includes(token))) score += 1;
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  return bestScore >= 3 ? best : null;
}
function topicAnswer(topic, choice) {
  if (topic.concerns) {
    const concern = (topic.options || []).find(item => normalize(item) === normalize(choice)) || choice;
    const answer = topic.concerns[concern];
    return answer ? `${concern}: ${answer}` : null;
  }
  const answers = topic.answers || {};
  const matchedKey = Object.keys(answers).find(key => normalize(key) === normalize(choice))
    || Object.keys(answers).find(key => normalize(choice).includes(normalize(key)) || normalize(key).includes(normalize(choice)));
  return matchedKey ? `${matchedKey}: ${answers[matchedKey]}` : null;
}
function handleTopic(topic) {
  lastTopic = topic;
  pendingOptions = { topic };
  addChatMessage(topic.question || `What would you like to know about ${topic.label}?`);
  if (topic.options?.length) addChoices(topic.options, option => {
    addChatMessage(option, 'user');
    const answer = topicAnswer(topic, option);
    if (answer) addChatMessage(answer);
    else addChatMessage('I do not have a specific answer for that choice yet. Try asking another question or choosing another option.');
    addChatMessage('Would you like to explore another part of this topic?');
    addChoices(topic.options, nextOption => {
      addChatMessage(nextOption, 'user');
      const nextAnswer = topicAnswer(topic, nextOption);
      addChatMessage(nextAnswer || 'I could not find a specific answer for that option.');
    });
  });
}
function processChat(query) {
  const clean = query.trim();
  if (!clean) return;
  addChatMessage(clean, 'user');
  const faq = findFAQ(clean);
  if (faq) {
    pendingOptions = null;
    addChatMessage(faq.answer);
    const topic = findTopic(clean);
    if (topic?.options?.length) {
      addChatMessage(`Explore more about ${topic.label}:`);
      addChoices(topic.options, option => {
        addChatMessage(option, 'user');
        addChatMessage(topicAnswer(topic, option) || 'I do not have an answer for that option yet.');
      });
    }
    return;
  }
  const topic = findTopic(clean);
  if (topic) { handleTopic(topic); return; }
  // If the user enters a follow-up while a topic is active, search its answers first.
  if (lastTopic) {
    const answer = topicAnswer(lastTopic, clean);
    if (answer) { addChatMessage(answer); return; }
  }
  addChatMessage(vastuDB?.fallback || 'I could not find that in the VastuVerse database. Try a keyword such as bedroom, kitchen, entrance, direction, mirror, colours or water.');
  if (vastuDB?.topics?.length) {
    addChatMessage('Popular topics:');
    addChoices(vastuDB.topics.slice(0, 7).map(item => item.label), label => {
      addChatMessage(label, 'user');
      const selected = vastuDB.topics.find(item => item.label === label);
      if (selected) handleTopic(selected);
    });
  }
}
chatbotToggle?.addEventListener('click', () => {
  const open = chatbotPanel.classList.toggle('open');
  chatbotToggle.setAttribute('aria-expanded', String(open));
  if (open) chatInput?.focus();
});
chatbotClose?.addEventListener('click', () => {
  chatbotPanel.classList.remove('open'); chatbotToggle?.setAttribute('aria-expanded', 'false');
});
chatForm?.addEventListener('submit', event => {
  event.preventDefault(); const query = chatInput.value; chatInput.value = ''; processChat(query);
});
loadDatabase();
