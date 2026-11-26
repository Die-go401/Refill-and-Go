/* ==========================================================
   Refill & Go · main.js
   La estructura está en index.html y el diseño en style.css.
   Aquí solo hay datos, navegación y las funciones de los botones.

   La app guarda todo en el navegador (localStorage):
   cuentas, sesión, envases, historial y eco-puntos.
   Es una simulación: no hay servidor ni seguridad real.
   ========================================================== */

// ---------- Ajustes fáciles de cambiar ----------
const WELCOME_BONUS = 200;      // eco-puntos de regalo al crear una cuenta
const POINTS_PER_RETURN = 20;   // eco-puntos por cada devolución
const LOAN_DAYS = 7;            // días para devolver un envase
const KG_PER_CONTAINER = 0.15;  // kg de plástico evitado por envase reutilizado
const DAY = 24 * 60 * 60 * 1000;
const DB_KEY = "refillgo:db";
const IMG = "../assets/images/";
const PUBLIC_SCREENS = ["welcome", "login", "signup", "forgot-password", "new-password"];

// Imágenes: archivos dentro de assets/images/. Si un archivo no existe, se muestra la imagen por defecto.
const DEFAULT_CONTAINER_IMAGE = "a2a71.png";
const DEFAULT_REWARD_IMAGE = "93d67.png";

// ---------- Datos fijos ----------

// TIPOS DE ENVASE. Para agregar uno nuevo, copia una línea y cambia id, name e image.
// "image" es el nombre del archivo dentro de assets/images/.
// Por ahora todos usan la misma imagen (a2a71.png). Para darle una propia a un envase,
// sube el archivo a assets/images/ y cambia el nombre en su línea (ej. image: "bento.png").
const CONTAINER_TYPES = [
  { id: "bowl-750", name: "Bowl circular · 750 ml", image: "a2a71.png" },
  { id: "taper-1l", name: "Táper circular · 1 L", image: "a2a71.png" },
  { id: "vaso-400", name: "Vaso circular · 400 ml", image: "a2a71.png" },
  { id: "taper-rect-500", name: "Táper rectangular · 500 ml", image: "a2a71.png" },
  { id: "bowl-1200", name: "Bowl familiar · 1,2 L", image: "a2a71.png" },
  { id: "bowl-350", name: "Bowl pequeño · 350 ml", image: "a2a71.png" },
  { id: "taper-rect-1l", name: "Táper rectangular · 1 L", image: "a2a71.png" },
  { id: "bento-2c", name: "Bento · 2 compartimentos", image: "a2a71.png" },
  { id: "ensalada-900", name: "Táper para ensalada · 900 ml", image: "a2a71.png" },
  { id: "sopa-500", name: "Contenedor para sopa · 500 ml", image: "a2a71.png" },
  { id: "taza-350", name: "Taza de café con tapa · 350 ml", image: "a2a71.png" },
  { id: "vaso-termico-450", name: "Vaso térmico · 450 ml", image: "a2a71.png" },
  { id: "frasco-250", name: "Frasco de vidrio · 250 ml", image: "a2a71.png" },
  { id: "jarra-1l", name: "Jarra de vidrio · 1 L", image: "a2a71.png" },
];

// RECOMPENSAS. Para agregar una nueva, copia una línea y cambia los datos.
// "id" debe ser único. "image" es el nombre del archivo dentro de assets/images/
// (si el archivo no existe, se usa la imagen por defecto, así que puedes subirlas después).
// Se muestran ordenadas de menor a mayor costo, no importa en qué orden las escribas.
const rewardsCatalog = [
  { id: "galleta", image: "galleta.png", title: "Galleta artesanal", place: "Panadería Trigo", cost: 150 },
  { id: "te-frio", image: "te-frio.png", title: "Té frío", place: "Café Brote", cost: 180 },
  { id: "coffee", image: "93d67.png", title: "Café americano", place: "Café Brote", cost: 200 },
  { id: "croissant", image: "croissant.png", title: "Croissant de mantequilla", place: "Panadería Trigo", cost: 220 },
  { id: "capuchino", image: "capuchino.png", title: "Capuchino", place: "Café Brote", cost: 240 },
  { id: "jugo", image: "jugo.png", title: "Jugo natural", place: "Cocina Raíz", cost: 250 },
  { id: "dessert", image: "075c2.png", title: "Postre del día", place: "Cocina Raíz", cost: 300 },
  { id: "sandwich", image: "sandwich.png", title: "Sándwich vegetal", place: "Mercado Orgánico", cost: 350 },
  { id: "bag", image: "ce9ba.png", title: "Bolsa reutilizable", place: "Estación Circular", cost: 400 },
  { id: "botella", image: "botella.png", title: "Botella reutilizable", place: "Estación Kennedy", cost: 500 },
  { id: "almuerzo", image: "almuerzo.png", title: "Almuerzo del día", place: "Cocina Raíz", cost: 600 },
  { id: "menu", image: "menu.png", title: "Menú completo para dos", place: "Cocina Raíz", cost: 800 },
].sort((a, b) => a.cost - b.cost);

// PUNTOS DEL MAPA (simulados). Los marcadores están en el HTML (data-point = id) y su posición
// en style.css (busca ".marker[data-point=...]").
// kind: "coffee" = cafetería, "return" = punto de devolución. En todos se puede devolver;
// los préstamos se hacen en las cafeterías.
const mapPoints = [
  { id: "brote", name: "Café Brote", kind: "coffee", area: "Miraflores", address: "Av. La Paz 640" },
  { id: "raiz", name: "Cocina Raíz", kind: "coffee", area: "Miraflores", address: "Av. José Larco 812" },
  { id: "circular", name: "Estación Circular", kind: "return", area: "Miraflores", address: "Calle Alcanfores 455" },
  { id: "trigo", name: "Panadería Trigo", kind: "coffee", area: "Miraflores", address: "Calle Schell 320" },
  { id: "kennedy", name: "Estación Kennedy", kind: "return", area: "Miraflores", address: "Av. Diagonal 275" },
  { id: "organico", name: "Mercado Orgánico", kind: "coffee", area: "Miraflores", address: "Av. Benavides 540" },
];

// ---------- Referencias al HTML ----------
const screens = document.querySelectorAll(".screen");
const toast = document.querySelector("#toast");
const byId = (id) => document.getElementById(id);
const setText = (id, text) => { byId(id).textContent = text; };
const field = (root, name) => root.querySelector(`[data-field="${name}"]`);
const setField = (root, name, text) => { field(root, name).textContent = text; };
const cloneTemplate = (id) => byId(id).content.firstElementChild.cloneNode(true);
const randomItem = (list) => list[Math.floor(Math.random() * list.length)];

// Pone una imagen; si el archivo no existe, usa la imagen por defecto
function setImage(image, file, fallback) {
  image.onerror = () => { image.onerror = null; image.src = IMG + fallback; };
  image.src = IMG + file;
}

// Tipo de envase de un envase guardado (también reconoce los guardados sin tipo)
function typeOf(container) {
  return CONTAINER_TYPES.find((type) => type.id === container.typeId)
    || CONTAINER_TYPES.find((type) => type.name === container.name)
    || CONTAINER_TYPES[0];
}

// ---------- Estado ----------
let db = loadDB();          // { users: { correo: cuenta }, session: correo | null }
let account = null;         // cuenta que inició sesión
let state = null;           // datos de esa cuenta (envases, puntos, historial...)
const historyStack = [];
let currentScreen = "welcome";
let toastTimer;
let selectedReturnId = null;
let lastReturn = null;
let lastReward = null;
let recoveryEmail = null;
let selectedMapPoint = null;
let returnPoint = null;
let mapFilter = "all";
let mapQuery = "";
let historyFilter = "all";
let faqExpanded = false;

// ---------- Guardado en el navegador ----------
function loadDB() {
  try {
    const saved = JSON.parse(localStorage.getItem(DB_KEY));
    if (saved && saved.users) return saved;
  } catch (error) { /* si falla, se empieza vacío */ }
  return { users: {}, session: null };
}

function saveDB() {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (error) { /* sin almacenamiento */ }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Hash sencillo para no guardar la contraseña tal cual (solo para la demo).
function hashPassword(text) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const input = `refillgo:${text}`;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

const normalizeEmail = (email) => String(email).trim().toLowerCase();

function blankData() {
  return { points: 0, avoided: 0, active: [], movements: [], redeemed: [], reminders: true, consent: true, messages: [] };
}

function newAccountData() {
  const data = blankData();
  data.points = WELCOME_BONUS;
  data.movements.push({ id: uid(), kind: "bonus", at: Date.now(), points: WELCOME_BONUS });
  return data;
}

// ---------- Fechas y estados ----------
function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    .format(new Date(timestamp)).replace(",", " ·");
}

function formatDay(timestamp) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(new Date(timestamp)).replace(/\./g, "");
}

function containerStatus(container) {
  const left = container.dueAt - Date.now();
  if (left < 0) return "Vencido";
  if (left <= DAY) return "Por vencer";
  return "Activo";
}

function dueLabel(container) {
  const status = containerStatus(container);
  if (status === "Vencido") return `Venció el ${formatDay(container.dueAt)}.`;
  if (status === "Por vencer") {
    const today = new Date().toDateString() === new Date(container.dueAt).toDateString();
    return `Vence ${today ? "hoy" : "mañana"}, ${formatDay(container.dueAt)}.`;
  }
  return `Devuélvelo hasta el ${formatDay(container.dueAt)}.`;
}

const plasticKg = () => Number((state.avoided * KG_PER_CONTAINER).toFixed(2));
const userFirstName = () => account.name.trim().split(/\s+/)[0];
const userInitials = () => account.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "TN";

function memberSince() {
  const date = new Date(account.createdAt);
  const month = new Intl.DateTimeFormat("es-PE", { month: "short" }).format(date);
  return `${month} de ${date.getFullYear()}`;
}

// ---------- Mensajes ----------
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function showFormError(form, message) {
  const box = form.querySelector(".form-error");
  if (!box) { showToast(message); return; }
  box.textContent = message;
  box.hidden = false;
}

function clearFormErrors() {
  document.querySelectorAll(".form-error").forEach((box) => { box.hidden = true; });
}

// Rellena todos los <span data-bind="..."> del HTML con el valor actual.
function updateBindings() {
  const values = {};
  if (state && account) {
    Object.assign(values, {
      points: state.points,
      avoided: state.avoided,
      plastic: plasticKg().toLocaleString("es-PE"),
      "active-count": state.active.length,
      "user-name": account.name,
      "user-first": userFirstName(),
      "user-email": account.email,
      "user-initials": userInitials(),
      since: memberSince(),
    });
  }
  document.querySelectorAll("[data-bind]").forEach((element) => {
    const value = values[element.dataset.bind];
    if (value !== undefined) element.textContent = value;
  });
}

// ---------- Navegación entre pantallas ----------
function showScreen(name) {
  if (!byId(`screen-${name}`)) name = account ? "home" : "welcome";
  if (!account && !PUBLIC_SCREENS.includes(name)) name = "login";
  if (name === "return-confirm" && !findActive(selectedReturnId)) name = "return-select";
  currentScreen = name;
  screens.forEach((screen) => { screen.hidden = screen.id !== `screen-${name}`; });
  clearFormErrors();
  if (account) refreshers[name]?.();
  updateBindings();
  document.title = `Refill & Go · ${name}`;
}

function navigate(screen, remember = true) {
  if (remember && screen !== currentScreen) historyStack.push(currentScreen);
  showScreen(screen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  navigate(historyStack.pop() || (account ? "home" : "welcome"), false);
}

// ---------- Cuenta: iniciar y cerrar sesión ----------
function startSession(email, message) {
  account = db.users[email];
  state = { ...blankData(), ...account.data };
  account.data = state;
  db.session = email;
  saveDB();
  historyStack.length = 0;
  navigate("home", false);
  if (message) showToast(message);
}

function endSession(message) {
  account = null;
  state = null;
  db.session = null;
  saveDB();
  historyStack.length = 0;
  selectedReturnId = null;
  returnPoint = null;
  navigate("welcome", false);
  if (message) showToast(message);
}

// ---------- Mapa ----------
const pointById = (id) => mapPoints.find((point) => point.id === id);

// ----- Arrastrar el mapa (como Google Maps) -----
// .map-stage es más grande que el recuadro (.map-canvas). Aquí solo se mueve con transform.
const MAP_ZOOM = 1.8;                       // tamaño del mapa respecto al recuadro visible
const mapCanvas = document.querySelector(".map-canvas");
const mapStage = document.querySelector(".map-stage");
const mapPanel = byId("map-panel");
const mapPan = { x: 0, y: 0 };
let mapCenter = { fx: 0.5, fy: 0.5 };      // punto del mapa (en %) que está al centro
let mapDrag = null;
let ignoreMapClick = false;

function setMapPan(x, y, animate = false) {
  const cw = mapCanvas.clientWidth;
  const ch = mapCanvas.clientHeight;
  const sw = mapStage.offsetWidth;
  const sh = mapStage.offsetHeight;
  mapPan.x = Math.min(0, Math.max(cw - sw, x));  // nunca se ve fuera del mapa
  mapPan.y = Math.min(0, Math.max(ch - sh, y));
  mapStage.classList.toggle("easing", animate);
  mapStage.style.transform = `translate3d(${mapPan.x}px, ${mapPan.y}px, 0)`;
  mapCenter = { fx: (cw / 2 - mapPan.x) / sw, fy: (ch / 2 - mapPan.y) / sh };
}

// Ajusta el tamaño del mapa al recuadro (al entrar a la pantalla o cambiar el tamaño)
function layoutMap() {
  const cw = mapCanvas.clientWidth;
  const ch = mapCanvas.clientHeight;
  if (!cw || !ch) return;
  mapStage.style.width = `${cw * MAP_ZOOM}px`;
  mapStage.style.height = `${ch * MAP_ZOOM}px`;
  setMapPan(cw / 2 - mapCenter.fx * cw * MAP_ZOOM, ch / 2 - mapCenter.fy * ch * MAP_ZOOM);
}

// Mueve el mapa para que un elemento quede en (tx, ty) píxeles del recuadro
function centerMapOn(element, tx, ty) {
  setMapPan(tx - element.offsetLeft, ty - element.offsetTop, true);
}

// Zona visible entre el buscador y el cuadro del punto
function visibleMapBand() {
  const top = document.querySelector(".map-top").offsetHeight + 12;
  const bottom = mapCanvas.clientHeight - (mapPanel.hidden || window.innerWidth >= 760 ? 0 : mapPanel.offsetHeight);
  return (top + bottom) / 2;
}

function centerOnMe() {
  centerMapOn(document.querySelector(".you-are-here"), mapCanvas.clientWidth / 2, visibleMapBand());
}

mapStage.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  mapDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, px: mapPan.x, py: mapPan.y, active: false };
});

mapStage.addEventListener("pointermove", (event) => {
  if (!mapDrag || event.pointerId !== mapDrag.id) return;
  const dx = event.clientX - mapDrag.x;
  const dy = event.clientY - mapDrag.y;
  if (!mapDrag.active) {
    if (Math.hypot(dx, dy) < 6) return;   // un toque corto sigue siendo un clic
    mapDrag.active = true;
    mapStage.setPointerCapture(event.pointerId);
    mapCanvas.classList.add("dragging");
  }
  setMapPan(mapDrag.px + dx, mapDrag.py + dy);
});

function endMapDrag(event) {
  if (!mapDrag || event.pointerId !== mapDrag.id) return;
  if (mapDrag.active) {
    ignoreMapClick = true;                // evita que soltar el mapa cierre o abra algo
    setTimeout(() => { ignoreMapClick = false; }, 0);
    mapCanvas.classList.remove("dragging");
  }
  mapDrag = null;
}
mapStage.addEventListener("pointerup", endMapDrag);
mapStage.addEventListener("pointercancel", endMapDrag);
mapCanvas.addEventListener("click", (event) => {
  if (ignoreMapClick) { event.stopPropagation(); event.preventDefault(); }
}, true);

window.addEventListener("resize", () => { if (currentScreen === "map") layoutMap(); });

// Muestra el cuadro con el nombre, la dirección y el botón "Cómo llegar"
function selectMapPoint(id) {
  const point = pointById(id);
  if (!point) return;
  selectedMapPoint = point.id;
  document.querySelectorAll(".marker").forEach((marker) => {
    marker.classList.toggle("selected", marker.dataset.point === point.id);
  });
  setText("map-name", point.name);
  setText("map-address", `${point.address} · ${point.area}`);
  byId("map-link").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${point.name}, ${point.address}, ${point.area}, Lima, Perú`)}`;
  mapPanel.hidden = false;
  mapCanvas.style.setProperty("--panel-h", `${mapPanel.offsetHeight}px`);
  // El punto queda visible arriba del cuadro
  centerMapOn(document.querySelector(`.marker[data-point="${point.id}"]`), mapCanvas.clientWidth / 2, visibleMapBand());
}

function closeMapPanel() {
  selectedMapPoint = null;
  document.querySelectorAll(".marker").forEach((marker) => marker.classList.remove("selected"));
  mapPanel.hidden = true;
  mapCanvas.style.setProperty("--panel-h", "0px");
}

const plain = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function applyMapFilters() {
  let visible = 0;
  document.querySelectorAll(".marker").forEach((marker) => {
    const matchesKind = mapFilter === "all" || marker.dataset.kind === mapFilter;
    const matchesName = !mapQuery || plain(marker.dataset.name).includes(plain(mapQuery));
    marker.hidden = !(matchesKind && matchesName);
    if (!marker.hidden) visible += 1;
  });
  byId("map-empty").hidden = visible > 0;
  const selected = document.querySelector(`.marker[data-point="${selectedMapPoint}"]`);
  if (selected?.hidden) closeMapPanel();
}

// ---------- Lógica de envases y puntos ----------
const findActive = (id) => state?.active.find((container) => container.id === id);

// Los préstamos se hacen en una cafetería
const loanPoint = () => randomItem(mapPoints.filter((point) => point.kind === "coffee"));

function registerLoan(code, type, point) {
  const normalized = code.toUpperCase();
  if (state.active.some((container) => container.code === normalized)) return false;
  const now = Date.now();
  const container = { id: uid(), code: normalized, typeId: type.id, name: type.name, place: point.name, loanedAt: now, dueAt: now + LOAN_DAYS * DAY };
  state.active.unshift(container);
  state.movements.unshift({ id: uid(), kind: "loan", at: now, containerId: container.id, code: container.code, name: type.name, place: point.name });
  saveDB();
  return container;
}

function completeReturn() {
  const point = returnPoint || randomItem(mapPoints);
  const index = state.active.findIndex((container) => container.id === selectedReturnId);
  if (index < 0) return false;
  const [container] = state.active.splice(index, 1);
  state.points += POINTS_PER_RETURN;
  state.avoided += 1;
  lastReturn = { id: uid(), kind: "return", at: Date.now(), containerId: container.id, code: container.code, name: container.name, place: point.name, points: POINTS_PER_RETURN };
  state.movements.unshift(lastReturn);
  selectedReturnId = null;
  returnPoint = null;
  saveDB();
  return true;
}

function redeemReward(reward) {
  state.points -= reward.cost;
  lastReward = { ...reward, claimCode: `RG-${1000 + state.redeemed.length + 5}`, at: Date.now() };
  state.redeemed.unshift(lastReward);
  state.movements.unshift({ id: uid(), kind: "redeem", at: lastReward.at, reward: reward.title, place: reward.place, points: reward.cost });
  saveDB();
}

function randomCode() {
  let code;
  do code = `RG-${Math.floor(1000 + Math.random() * 9000)}`;
  while (state.active.some((container) => container.code === code));
  return code;
}

// ---------- Rellenar las partes dinámicas de cada pantalla ----------
// Cada función solo pone datos dentro de elementos que ya existen en el HTML.

function containerCard(container, selectable) {
  const card = cloneTemplate("tpl-container-card");
  const status = containerStatus(container);
  setField(card, "name", container.name);
  setField(card, "meta", `${container.code} · Sin depósito`);
  const statusBox = field(card, "status");
  statusBox.textContent = status;
  statusBox.classList.toggle("warning", status !== "Activo");
  setField(card, "due", dueLabel(container));
  const select = field(card, "select");
  select.hidden = !selectable;
  select.dataset.id = container.id;
  return card;
}

function fillContainers(listId, emptyId, selectable) {
  byId(listId).replaceChildren(...state.active.map((c) => containerCard(c, selectable)));
  byId(emptyId).hidden = state.active.length > 0;
}

function showHome() {
  fillContainers("home-containers", "home-empty", false);
  const urgent = state.active.filter((container) => containerStatus(container) !== "Activo").length;
  byId("home-reminder").hidden = !(state.reminders && urgent > 0);
  if (urgent > 0) {
    setText("home-reminder-title", urgent === 1 ? "Tienes 1 envase por devolver pronto" : `Tienes ${urgent} envases por devolver pronto`);
  }
}

function showLoan() {
  const container = state.active[0];
  if (!container) return;
  setText("loan-name", container.name);
  setText("loan-code", container.code);
  setText("loan-place", container.place);
  setText("loan-due", dueLabel(container));
  const image = byId("loan-image");
  image.alt = container.name;
  setImage(image, typeOf(container).image, DEFAULT_CONTAINER_IMAGE);
}

function showReturnConfirm() {
  const container = findActive(selectedReturnId);
  if (!container) return;
  const status = containerStatus(container);
  setText("rc-name", container.name);
  setText("rc-meta", `${container.code} · Sin depósito`);
  setText("rc-status", status);
  byId("rc-status").classList.toggle("warning", status !== "Activo");
  setText("rc-due", dueLabel(container));
  if (!returnPoint) returnPoint = randomItem(mapPoints);
  const point = returnPoint;
  setText("rc-place-name", point.name);
  setText("rc-place-address", `${point.address} · ${point.area}`);
}

function showReturnSuccess() {
  setText("returned-title", `${lastReturn?.name || "Envase"} · ${lastReturn?.code || ""}`);
  setText("returned-date", formatDateTime(lastReturn?.at || Date.now()));
}

function showRewards() {
  byId("rewards-grid").replaceChildren(...rewardsCatalog.map((reward) => {
    const redeemed = state.redeemed.some((item) => item.title === reward.title);
    const available = state.points >= reward.cost;
    const card = cloneTemplate("tpl-reward-card");
    const image = field(card, "image");
    image.alt = reward.title;
    setImage(image, reward.image, DEFAULT_REWARD_IMAGE);
    setField(card, "title", reward.title);
    setField(card, "place", reward.place);
    setField(card, "cost", reward.cost);
    const button = field(card, "button");
    button.textContent = redeemed ? "Canjeado" : available ? "Canjear" : `${reward.cost - state.points} más`;
    button.classList.toggle("secondary", redeemed || !available);
    button.disabled = redeemed;
    button.dataset.reward = reward.title;
    return card;
  }));
}

function showRewardSuccess() {
  const reward = lastReward || state.redeemed[0] || rewardsCatalog[0];
  byId("rs-image").alt = reward.title;
  setImage(byId("rs-image"), reward.image, DEFAULT_REWARD_IMAGE);
  setText("rs-title", reward.title);
  setText("rs-place", reward.place);
  setText("rs-cost", reward.cost);
  setText("rs-spent", reward.cost);
  setText("rs-claim", reward.claimCode || "RG-1005");
  setText("rs-date", formatDateTime(reward.at || Date.now()));
}

// Cada movimiento se muestra distinto según su tipo
function historyItem(movement) {
  const item = cloneTemplate("tpl-history-item");
  const status = field(item, "status");
  const pointsKind = movement.kind === "redeem" || movement.kind === "bonus";
  field(item, "icon-container").hidden = pointsKind;
  field(item, "icon-points").hidden = !pointsKind;

  if (movement.kind === "loan") {
    const active = state.active.some((container) => container.id === movement.containerId);
    setField(item, "title", `${movement.name} · ${movement.code}`);
    setField(item, "detail", `Prestado en ${movement.place}`);
    setField(item, "meta", `${formatDateTime(movement.at)} · sin depósito`);
    status.textContent = active ? "Activo" : "Devuelto";
    status.classList.toggle("neutral", !active);
  } else if (movement.kind === "return") {
    setField(item, "title", `${movement.name} · ${movement.code}`);
    setField(item, "detail", `Devuelto en ${movement.place}`);
    setField(item, "meta", `${formatDateTime(movement.at)} · +${movement.points} eco-puntos`);
    status.textContent = "Devuelto";
    status.classList.add("neutral");
  } else if (movement.kind === "redeem") {
    setField(item, "title", movement.reward);
    setField(item, "detail", `Canjeado en ${movement.place}`);
    setField(item, "meta", `${formatDateTime(movement.at)} · -${movement.points} eco-puntos`);
    status.textContent = "Canjeado";
    status.classList.add("neutral");
  } else {
    setField(item, "title", "Bono de bienvenida");
    setField(item, "detail", "Eco-puntos de regalo por crear tu cuenta");
    setField(item, "meta", `${formatDateTime(movement.at)} · +${movement.points} eco-puntos`);
    status.textContent = "Bono";
    status.classList.add("neutral");
  }
  return item;
}

function showHistory() {
  const groups = { loan: ["loan"], return: ["return"], points: ["redeem", "bonus"] };
  const list = state.movements.filter((m) => historyFilter === "all" || groups[historyFilter].includes(m.kind));
  byId("history-list").replaceChildren(...list.map(historyItem));
  byId("history-empty").hidden = list.length > 0;
  document.querySelectorAll("[data-history-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.historyFilter === historyFilter);
  });
}

function updateReminders() {
  const toggle = byId("reminders-switch");
  toggle.classList.toggle("on", state.reminders);
  toggle.setAttribute("aria-checked", state.reminders);
}

function showProfileData() {
  const form = byId("profile-form");
  form.elements["name"].value = account.name;
  form.elements["email"].value = account.email;
  form.elements["phone"].value = account.phone || "";
}

function updateFaq() {
  byId("faq-list").hidden = !faqExpanded;
  byId("faq-button").textContent = `${faqExpanded ? "Ocultar" : "Ver"} preguntas frecuentes`;
}

function showSupport() {
  updateFaq();
  byId("sent-messages").hidden = state.messages.length === 0;
  byId("sent-list").replaceChildren(...state.messages.map((message) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    return paragraph;
  }));
}

// Qué se actualiza al entrar a cada pantalla
const refreshers = {
  home: showHome,
  "return-select": () => fillContainers("return-containers", "return-empty", true),
  map: () => { closeMapPanel(); layoutMap(); },
  "loan-confirmed": showLoan,
  "return-confirm": showReturnConfirm,
  "return-success": showReturnSuccess,
  rewards: showRewards,
  "reward-success": showRewardSuccess,
  profile: updateReminders,
  "profile-data": showProfileData,
  history: showHistory,
  support: showSupport,
  privacy: () => { byId("privacy-consent").checked = state.consent; },
};

// ---------- Botones ----------
document.addEventListener("click", (event) => {
  // Tocar el fondo del mapa cierra el cuadro del punto
  if (event.target.closest(".map-canvas") && !event.target.closest(".marker, .map-panel, .search-box, .filters, .map-locate")) {
    closeMapPanel();
  }

  const screenTarget = event.target.closest("[data-screen]");
  if (screenTarget) {
    const screen = screenTarget.dataset.screen;
    if (screenTarget.classList.contains("nav-item")) {
      // La barra inferior reinicia el historial de "volver"
      historyStack.length = 0;
      navigate(screen, false);
    } else {
      navigate(screen);
    }
    return;
  }

  const filterTarget = event.target.closest("[data-filter]");
  if (filterTarget) {
    document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("active", button === filterTarget));
    mapFilter = filterTarget.dataset.filter;
    applyMapFilters();
    showToast(mapFilter === "all" ? "Mostrando todos los puntos." : `Filtro ${filterTarget.textContent.trim()} aplicado.`);
    return;
  }

  const historyFilterTarget = event.target.closest("[data-history-filter]");
  if (historyFilterTarget) {
    historyFilter = historyFilterTarget.dataset.historyFilter;
    showHistory();
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;

  if (action === "back") goBack();

  if (action === "toggle-password") {
    const password = actionTarget.closest(".input-wrap").querySelector("input");
    password.type = password.type === "password" ? "text" : "password";
  }

  // Mapa
  if (action === "filters") {
    byId("map-search").focus();
    showToast("Busca un punto o elige un filtro.");
  }
  if (action === "locate") centerOnMe();
  if (action === "point") {
    // Tocar otra vez el mismo punto cierra el cuadro
    if (selectedMapPoint === actionTarget.dataset.point && !byId("map-panel").hidden) closeMapPanel();
    else selectMapPoint(actionTarget.dataset.point);
  }

  // Escaneo
  if (action === "manual") navigate(currentScreen === "scan-return" ? "manual-return" : "manual-loan");
  if (action === "scan-code") {
    if (actionTarget.dataset.mode === "return") {
      returnPoint = randomItem(mapPoints); // el QR identifica en qué punto devuelves
      if (state.active.length === 1) {
        selectedReturnId = state.active[0].id;
        navigate("return-confirm");
      } else {
        if (!state.active.length) showToast("No tienes envases activos para devolver.");
        navigate("return-select");
      }
    } else {
      registerLoan(randomCode(), randomItem(CONTAINER_TYPES), loanPoint());
      navigate("loan-confirmed");
    }
  }

  // Devolución
  if (action === "select-return") {
    selectedReturnId = actionTarget.dataset.id;
    navigate("return-confirm");
  }
  if (action === "change-container") navigate("return-select");
  if (action === "confirm-return") {
    if (completeReturn()) navigate("return-success");
    else showToast("Ese envase ya no está activo.");
  }

  // Recompensas
  if (action === "redeem") {
    const reward = rewardsCatalog.find((item) => item.title === actionTarget.dataset.reward);
    if (!reward) return;
    if (state.redeemed.some((item) => item.title === reward.title)) {
      showToast("Esta recompensa ya fue canjeada.");
    } else if (state.points >= reward.cost) {
      redeemReward(reward);
      navigate("reward-success");
    } else {
      showToast(`Te faltan ${reward.cost - state.points} eco-puntos para ${reward.title}.`);
    }
  }

  // Perfil
  if (action === "toggle-reminders") {
    state.reminders = !state.reminders;
    saveDB();
    updateReminders();
    showToast(state.reminders ? "Recordatorios activados." : "Recordatorios desactivados.");
  }
  if (action === "logout") endSession("Sesión cerrada correctamente.");
  if (action === "faq") {
    faqExpanded = !faqExpanded;
    updateFaq();
  }
  if (action === "privacy-consent") state.consent = actionTarget.checked;
  if (action === "save-privacy") {
    saveDB();
    showToast("Preferencias de privacidad guardadas.");
  }
  if (action === "delete-account") {
    if (window.confirm("¿Seguro que quieres eliminar tu cuenta y todos tus datos de esta demo?")) {
      delete db.users[account.email];
      endSession("Tu cuenta fue eliminada.");
    }
  }
});

// Buscador del mapa
document.addEventListener("input", (event) => {
  if (event.target.id === "map-search") {
    mapQuery = event.target.value.trim();
    applyMapFilters();
  }
  // Al escribir de nuevo se quita el mensaje de error del formulario
  event.target.closest("form")?.querySelector(".form-error")?.setAttribute("hidden", "");
});

// ---------- Formularios ----------
document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);

  // --- Entrar y crear cuenta ---
  if (form.id === "login-form") {
    const email = normalizeEmail(data.get("email"));
    const user = db.users[email];
    if (!user || user.passHash !== hashPassword(data.get("password"))) {
      showFormError(form, "Correo o contraseña incorrectos.");
      return;
    }
    form.reset();
    startSession(email, `¡Hola de nuevo, ${user.name.trim().split(/\s+/)[0]}!`);
  }

  if (form.id === "signup-form") {
    const name = data.get("name").trim();
    const email = normalizeEmail(data.get("email"));
    const password = data.get("password");
    if (name.length < 2) { showFormError(form, "Escribe un nombre de usuario de al menos 2 letras."); return; }
    if (password.length < 6) { showFormError(form, "La contraseña debe tener al menos 6 caracteres."); return; }
    if (db.users[email]) { showFormError(form, "Ya existe una cuenta con ese correo. Inicia sesión."); return; }
    db.users[email] = { name, email, phone: "", passHash: hashPassword(password), createdAt: Date.now(), data: newAccountData() };
    form.reset();
    startSession(email, `Cuenta de ${name} creada. ¡Te regalamos ${WELCOME_BONUS} eco-puntos!`);
  }

  // --- Recuperar contraseña ---
  if (form.id === "recovery-form") {
    const email = normalizeEmail(data.get("email"));
    const user = db.users[email];
    if (!user || user.name.trim().toLowerCase() !== data.get("name").trim().toLowerCase()) {
      showFormError(form, "No encontramos una cuenta con esos datos.");
      return;
    }
    recoveryEmail = email;
    form.reset();
    navigate("new-password");
    showToast("Identidad verificada. Elige tu nueva contraseña.");
  }

  if (form.id === "new-password-form") {
    const password = data.get("password");
    if (!recoveryEmail || !db.users[recoveryEmail]) { navigate("forgot-password"); return; }
    if (password !== data.get("confirmation")) { showFormError(form, "Las contraseñas no coinciden."); return; }
    db.users[recoveryEmail].passHash = hashPassword(password);
    saveDB();
    byId("login-form").elements["email"].value = recoveryEmail;
    recoveryEmail = null;
    form.reset();
    historyStack.length = 0;
    historyStack.push("welcome");
    navigate("login", false);
    showToast("Contraseña actualizada. Ya puedes ingresar.");
  }

  // --- Códigos manuales ---
  if (form.id === "manual-code-form") {
    const code = data.get("code").trim().toUpperCase();
    if (form.dataset.mode === "loan") {
      const type = CONTAINER_TYPES.find((item) => item.id === data.get("container")) || CONTAINER_TYPES[0];
      if (!registerLoan(code, type, loanPoint())) {
        showToast("Ese envase ya está activo en tu cuenta.");
        return;
      }
      form.reset();
      navigate("loan-confirmed");
    } else {
      const container = state.active.find((item) => item.code === code);
      if (!container) {
        showToast("Ese código no corresponde a uno de tus envases activos.");
        return;
      }
      selectedReturnId = container.id;
      returnPoint = randomItem(mapPoints);
      form.reset();
      navigate("return-confirm");
    }
  }

  // --- Soporte y perfil ---
  if (form.id === "support-form") {
    state.messages.unshift(data.get("message").trim());
    saveDB();
    form.reset();
    showSupport();
    showToast("Mensaje enviado. Te responderemos pronto.");
  }

  if (form.id === "profile-form") {
    const name = data.get("name").trim();
    const email = normalizeEmail(data.get("email"));
    if (email !== account.email && db.users[email]) {
      showFormError(form, "Ese correo ya está en uso por otra cuenta.");
      return;
    }
    if (email !== account.email) {
      delete db.users[account.email];
      account.email = email;
      db.users[email] = account;
      db.session = email;
    }
    account.name = name;
    account.phone = data.get("phone").trim();
    saveDB();
    navigate("profile");
    showToast("Tus datos se guardaron correctamente.");
  }
});

// ---------- Inicio ----------
// Llena la lista de tipos de envase del formulario de código manual
document.querySelectorAll('select[name="container"]').forEach((select) => {
  CONTAINER_TYPES.forEach((type) => select.append(new Option(type.name, type.id)));
});

if (db.session && db.users[db.session]) {
  account = db.users[db.session];
  state = { ...blankData(), ...account.data };
  account.data = state;
  showScreen("home");
} else {
  db.session = null;
  showScreen("welcome");
}
