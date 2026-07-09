/* ============ Fake Kalshi — store: auth, markets, trading engine ============
 * Everything persists to localStorage. All money is FAKE and tracked in cents.
 */

const LS_USERS = "fk_users";
const LS_SESSION = "fk_session";
const LS_MARKETS = "fk_markets_v1";

const STARTING_BALANCE = 1000000; // $10,000.00 in cents
const HISTORY_POINTS = 240;       // points of seeded price history
const TICK_MS = 4000;             // live price tick interval

/* ---------- helpers ---------- */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function fmtUSD(cents, { sign = false } = {}) {
  const v = cents / 100;
  const s = Math.abs(v).toLocaleString("en-US", { style: "currency", currency: "USD" });
  if (sign) return (v >= 0 ? "+" : "-") + s;
  return (v < 0 ? "-" : "") + s;
}
function clampPrice(c) { return Math.min(99, Math.max(1, Math.round(c))); }

/* Kalshi-style trading fee: fees = ceil(0.07 × C × P × (1 − P)) in cents,
 * where C is contract count and P is price in dollars. */
function tradeFee(qty, priceCents) {
  const p = priceCents / 100;
  return Math.ceil(0.07 * qty * p * (1 - p) * 100);
}

/* ---------- market state ---------- */
/* Stored per market: { price: cents, history: [{t, p}], settled: null|"yes"|"no", volume } */
let marketState = loadJSON(LS_MARKETS, null);

function seedHistory(startProb, vol) {
  const now = Date.now();
  const stepMs = (1000 * 60 * 60 * 24 * 60) / HISTORY_POINTS; // ~60 days of history
  const pts = [];
  let p = startProb + (Math.random() - 0.5) * 0.25; // wander in from a different level
  p = Math.min(0.95, Math.max(0.05, p));
  for (let i = 0; i < HISTORY_POINTS; i++) {
    const t = now - (HISTORY_POINTS - i) * stepMs;
    // random walk with gentle pull toward the target starting probability
    p += (startProb - p) * 0.015 + (Math.random() - 0.5) * vol * 2.2;
    p = Math.min(0.97, Math.max(0.03, p));
    pts.push({ t, p: clampPrice(p * 100) });
  }
  pts[pts.length - 1].p = clampPrice(startProb * 100);
  return pts;
}

function initMarkets() {
  if (!marketState) marketState = {};
  let changed = false;
  for (const m of SEED_MARKETS) {
    if (!marketState[m.id]) {
      marketState[m.id] = {
        price: clampPrice(m.prob * 100),
        history: seedHistory(m.prob, m.vol),
        settled: null,
        volume: m.volume,
      };
      changed = true;
    }
  }
  if (changed) saveJSON(LS_MARKETS, marketState);
}

function getMarket(id) {
  const seed = SEED_MARKETS.find((m) => m.id === id);
  if (!seed) return null;
  return { ...seed, ...marketState[id] };
}
function allMarkets() { return SEED_MARKETS.map((m) => getMarket(m.id)); }

function tickMarkets() {
  const now = Date.now();
  let anyChange = false;
  for (const m of SEED_MARKETS) {
    const st = marketState[m.id];
    if (!st || st.settled) continue;
    const p = st.price / 100;
    let next = p + (Math.random() - 0.5) * m.vol * 1.6;
    // keep prices from pinning at the extremes
    next = Math.min(0.97, Math.max(0.03, next));
    st.price = clampPrice(next * 100);
    st.history.push({ t: now, p: st.price });
    if (st.history.length > 1200) st.history.splice(0, st.history.length - 1200);
    st.volume += Math.floor(Math.random() * 900);
    anyChange = true;
  }
  if (anyChange) saveJSON(LS_MARKETS, marketState);
  return anyChange;
}

/* Generate a plausible order book around the current price. */
function orderBook(m) {
  const rows = [];
  for (let i = 3; i >= 1; i--) {
    const yesPrice = clampPrice(m.price - i);
    rows.push({
      yesPrice,
      noPrice: 100 - yesPrice,
      yesQty: 200 + Math.floor(Math.abs(Math.sin(m.price * 13 + i * 7)) * 4800),
      noQty: 200 + Math.floor(Math.abs(Math.cos(m.price * 11 + i * 5)) * 4800),
    });
  }
  return rows;
}

/* ---------- auth ---------- */
/* Demo credential handling only: passwords are hashed with a simple digest
 * before storage. Fine for fake money; do NOT reuse real passwords here. */
function demoHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return "h" + h.toString(36) + str.length.toString(36);
}

function getUsers() { return loadJSON(LS_USERS, {}); }
function saveUsers(users) { saveJSON(LS_USERS, users); }

function currentUser() {
  const email = localStorage.getItem(LS_SESSION);
  if (!email) return null;
  return getUsers()[email] || null;
}

function signup(name, email, password) {
  email = email.trim().toLowerCase();
  if (!name.trim()) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  const users = getUsers();
  if (users[email]) return { error: "An account with that email already exists. Try logging in." };
  users[email] = {
    name: name.trim(),
    email,
    pass: demoHash(password),
    balance: STARTING_BALANCE,
    deposited: STARTING_BALANCE,
    positions: [],   // { marketId, side, qty, avgCents }
    activity: [],    // { t, type, marketId, side, qty, priceCents, amountCents, fee }
    createdAt: Date.now(),
  };
  saveUsers(users);
  localStorage.setItem(LS_SESSION, email);
  return { ok: true };
}

function login(email, password) {
  email = email.trim().toLowerCase();
  const users = getUsers();
  const u = users[email];
  if (!u || u.pass !== demoHash(password)) return { error: "Incorrect email or password." };
  localStorage.setItem(LS_SESSION, email);
  return { ok: true };
}

function logout() { localStorage.removeItem(LS_SESSION); }

function updateUser(mutator) {
  const email = localStorage.getItem(LS_SESSION);
  if (!email) return null;
  const users = getUsers();
  const u = users[email];
  if (!u) return null;
  mutator(u);
  saveUsers(users);
  return u;
}

function deposit(cents) {
  return updateUser((u) => {
    u.balance += cents;
    u.deposited += cents;
    u.activity.unshift({ t: Date.now(), type: "deposit", amountCents: cents });
  });
}

/* ---------- trading ---------- */
function findPosition(u, marketId, side) {
  return u.positions.find((p) => p.marketId === marketId && p.side === side);
}

function buy(marketId, side, qty) {
  const m = getMarket(marketId);
  if (!m || m.settled) return { error: "This market is closed." };
  qty = Math.floor(qty);
  if (!qty || qty < 1) return { error: "Enter at least 1 contract." };
  const price = side === "yes" ? m.price : 100 - m.price;
  const fee = tradeFee(qty, price);
  const cost = qty * price + fee;
  let result = null;
  updateUser((u) => {
    if (u.balance < cost) { result = { error: "Not enough balance for this order." }; return; }
    u.balance -= cost;
    let pos = findPosition(u, marketId, side);
    if (pos) {
      pos.avgCents = Math.round((pos.avgCents * pos.qty + price * qty) / (pos.qty + qty));
      pos.qty += qty;
    } else {
      u.positions.push({ marketId, side, qty, avgCents: price });
    }
    u.activity.unshift({ t: Date.now(), type: "buy", marketId, side, qty, priceCents: price, amountCents: -cost, fee });
    result = { ok: true, cost, fee, price };
  });
  if (result && result.ok) {
    marketState[marketId].volume += qty;
    saveJSON(LS_MARKETS, marketState);
  }
  return result || { error: "You need to log in first." };
}

function sell(marketId, side, qty) {
  const m = getMarket(marketId);
  if (!m || m.settled) return { error: "This market is closed." };
  qty = Math.floor(qty);
  if (!qty || qty < 1) return { error: "Enter at least 1 contract." };
  const price = side === "yes" ? m.price : 100 - m.price;
  const fee = tradeFee(qty, price);
  let result = null;
  updateUser((u) => {
    const pos = findPosition(u, marketId, side);
    if (!pos || pos.qty < qty) { result = { error: "You don't hold that many contracts." }; return; }
    const proceeds = qty * price - fee;
    u.balance += proceeds;
    pos.qty -= qty;
    if (pos.qty === 0) u.positions = u.positions.filter((p) => p !== pos);
    u.activity.unshift({ t: Date.now(), type: "sell", marketId, side, qty, priceCents: price, amountCents: proceeds, fee });
    result = { ok: true, proceeds, fee, price };
  });
  if (result && result.ok) {
    marketState[marketId].volume += qty;
    saveJSON(LS_MARKETS, marketState);
  }
  return result || { error: "You need to log in first." };
}

/* Settle a market to YES or NO (demo control) and pay out ALL users' positions. */
function settleMarket(marketId, outcome) {
  const st = marketState[marketId];
  if (!st || st.settled) return { error: "Already settled." };
  st.settled = outcome;
  st.price = outcome === "yes" ? 100 : 0;
  st.history.push({ t: Date.now(), p: st.price });
  saveJSON(LS_MARKETS, marketState);

  const users = getUsers();
  for (const email of Object.keys(users)) {
    const u = users[email];
    const held = u.positions.filter((p) => p.marketId === marketId);
    if (!held.length) continue;
    for (const pos of held) {
      const won = pos.side === outcome;
      const payout = won ? pos.qty * 100 : 0;
      u.balance += payout;
      u.activity.unshift({
        t: Date.now(), type: "settle", marketId, side: pos.side, qty: pos.qty,
        priceCents: won ? 100 : 0, amountCents: payout, outcome,
      });
    }
    u.positions = u.positions.filter((p) => p.marketId !== marketId);
  }
  saveUsers(users);
  return { ok: true };
}

/* ---------- portfolio math ---------- */
function positionValue(pos) {
  const m = getMarket(pos.marketId);
  if (!m) return 0;
  const cur = pos.side === "yes" ? m.price : 100 - m.price;
  return pos.qty * cur;
}
function positionPL(pos) {
  const m = getMarket(pos.marketId);
  if (!m) return 0;
  const cur = pos.side === "yes" ? m.price : 100 - m.price;
  return pos.qty * (cur - pos.avgCents);
}
function portfolioSummary(u) {
  const posValue = u.positions.reduce((s, p) => s + positionValue(p), 0);
  const openPL = u.positions.reduce((s, p) => s + positionPL(p), 0);
  const total = u.balance + posValue;
  return { posValue, openPL, total, allTimePL: total - u.deposited };
}

initMarkets();
