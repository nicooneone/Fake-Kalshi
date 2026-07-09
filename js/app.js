/* ============ Fake Kalshi — UI & routing ============ */

const app = document.getElementById("app");

/* ---------- tiny helpers ---------- */
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function toast(msg, kind = "success") {
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
function fmtVol(v) {
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return "$" + Math.round(v / 1e3) + "K";
  return "$" + v;
}
function fmtDate(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(t) {
  return new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function initials(name) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

/* ---------- charts (inline SVG) ---------- */
function sparklineSVG(history, w = 260, h = 36) {
  const pts = history.slice(-60);
  if (pts.length < 2) return "";
  const min = Math.min(...pts.map((p) => p.p)) - 2;
  const max = Math.max(...pts.map((p) => p.p)) + 2;
  const x = (i) => (i / (pts.length - 1)) * w;
  const y = (p) => h - ((p - min) / (max - min || 1)) * h;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.p).toFixed(1)}`).join(" ");
  const up = pts[pts.length - 1].p >= pts[0].p;
  const color = up ? "#00b672" : "#e5484d";
  return `<svg class="mc-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
  </svg>`;
}

function bigChartSVG(history, rangeMs, w = 800, h = 260) {
  const cutoff = rangeMs ? Date.now() - rangeMs : 0;
  let pts = history.filter((p) => p.t >= cutoff);
  if (pts.length < 2) pts = history.slice(-2);
  const min = Math.max(0, Math.min(...pts.map((p) => p.p)) - 4);
  const max = Math.min(100, Math.max(...pts.map((p) => p.p)) + 4);
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const x = (t) => ((t - t0) / (t1 - t0 || 1)) * w;
  const y = (p) => h - 20 - ((p - min) / (max - min || 1)) * (h - 40);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.p).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const up = last.p >= pts[0].p;
  const color = up ? "#00b672" : "#e5484d";
  const gridLines = [25, 50, 75].map((g) => {
    const gy = y(g);
    if (gy < 10 || gy > h - 10) return "";
    return `<line x1="0" y1="${gy}" x2="${w}" y2="${gy}" stroke="#e6e8ec" stroke-dasharray="4 5"/>
            <text x="${w - 4}" y="${gy - 5}" font-size="11" fill="#9aa1ad" text-anchor="end">${g}¢</text>`;
  }).join("");
  return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    ${gridLines}
    <path d="${d} L${x(last.t)},${h} L${x(pts[0].t)},${h} Z" fill="${color}" opacity="0.07"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="${x(last.t)}" cy="${y(last.p)}" r="4" fill="${color}"/>
  </svg>`;
}

/* ---------- shared chrome ---------- */
function navHTML(user, active) {
  const summary = portfolioSummary(user);
  return `
  <div class="demo-banner">🎓 <b>Practice mode</b> — every dollar on this site is fake. Trade freely, learn fast.</div>
  <nav class="topnav">
    <a class="logo" href="#/">
      <span class="logo-mark">FK</span> Kalshi <span class="fake-tag">Fake</span>
    </a>
    <div class="nav-links">
      <a href="#/" class="${active === "markets" ? "active" : ""}">Markets</a>
      <a href="#/portfolio" class="${active === "portfolio" ? "active" : ""}">Portfolio</a>
      <a href="#/activity" class="${active === "activity" ? "active" : ""}">Activity</a>
    </div>
    <div class="search-wrap">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input id="search-input" type="text" placeholder="Search markets" value="${esc(state.search)}" />
    </div>
    <div class="nav-right">
      <div class="balance-chip" id="deposit-btn" title="Add fake funds">
        <span class="bal-label">Cash</span>
        <span class="bal-amt mono">${fmtUSD(user.balance)}</span>
      </div>
      <div class="balance-chip" title="Cash + market value of positions">
        <span class="bal-label">Portfolio</span>
        <span class="bal-amt mono" style="color:var(--navy)">${fmtUSD(summary.total)}</span>
      </div>
      <div class="avatar-menu">
        <button class="avatar" id="avatar-btn">${esc(initials(user.name))}</button>
        <div class="avatar-dropdown" id="avatar-dd">
          <div class="dd-head">
            <div class="dd-name">${esc(user.name)}</div>
            <div class="dd-email">${esc(user.email)}</div>
          </div>
          <a href="#/portfolio">Portfolio</a>
          <a href="#/activity">Activity</a>
          <button id="dd-deposit">Add fake funds</button>
          <button id="dd-reset" class="danger">Reset my account</button>
          <button id="dd-logout" class="danger">Log out</button>
        </div>
      </div>
    </div>
  </nav>`;
}

function wireChrome(user) {
  const dd = document.getElementById("avatar-dd");
  document.getElementById("avatar-btn").onclick = (e) => { e.stopPropagation(); dd.classList.toggle("open"); };
  document.addEventListener("click", () => dd.classList.remove("open"), { once: true });

  document.getElementById("dd-logout").onclick = () => { logout(); location.hash = "#/login"; };
  document.getElementById("dd-reset").onclick = () => {
    if (!confirm("Reset your account to a fresh $10,000 and clear all positions and history?")) return;
    updateUser((u) => {
      u.balance = STARTING_BALANCE; u.deposited = STARTING_BALANCE;
      u.positions = []; u.activity = [];
    });
    toast("Account reset to $10,000");
    render();
  };
  const openDeposit = () => showDepositModal();
  document.getElementById("deposit-btn").onclick = openDeposit;
  document.getElementById("dd-deposit").onclick = openDeposit;

  const search = document.getElementById("search-input");
  if (search) {
    search.oninput = () => {
      state.search = search.value;
      if (location.hash !== "#/" && location.hash !== "") location.hash = "#/";
      else renderPreservingFocus();
    };
  }
}

function showDepositModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h2>Add fake funds 💸</h2>
      <p>Top up your practice balance. It's monopoly money — spend it on your convictions.</p>
      <div class="deposit-opts">
        ${[1000, 5000, 10000, 50000].map((d) => `<button class="deposit-opt" data-amt="${d * 100}">$${d.toLocaleString()}</button>`).join("")}
      </div>
      <a class="close-link">Cancel</a>
    </div>`;
  overlay.onclick = (e) => { if (e.target === overlay || e.target.classList.contains("close-link")) overlay.remove(); };
  overlay.querySelectorAll(".deposit-opt").forEach((b) => {
    b.onclick = () => {
      deposit(parseInt(b.dataset.amt, 10));
      overlay.remove();
      toast(`Deposited ${fmtUSD(parseInt(b.dataset.amt, 10))} in fake funds`);
      render();
    };
  });
  document.body.appendChild(overlay);
}

/* ---------- state & routing ---------- */
const state = {
  category: "Trending",
  search: "",
  ticket: { side: "yes", mode: "buy", qty: 10 }, // order ticket state on detail page
  chartRange: null, // ms window; null = all
};

function route() {
  const hash = location.hash || "#/";
  const user = currentUser();
  if (!user && hash !== "#/signup") return { page: "login" };
  if (!user) return { page: "signup" };
  if (hash === "#/login") return { page: "redirect-home" };
  if (hash === "#/signup") return { page: "redirect-home" };
  if (hash.startsWith("#/market/")) return { page: "market", id: hash.slice("#/market/".length) };
  if (hash === "#/portfolio") return { page: "portfolio" };
  if (hash === "#/activity") return { page: "activity" };
  return { page: "markets" };
}

/* ---------- auth pages ---------- */
function renderAuth(mode) {
  const isLogin = mode === "login";
  app.innerHTML = `
  <div class="auth-wrap">
    <div class="auth-card">
      <a class="logo" href="#/login"><span class="logo-mark">FK</span> Kalshi <span class="fake-tag">Fake</span></a>
      <div class="auth-tag">The practice prediction market. 100% fake money.</div>
      <h1>${isLogin ? "Welcome back" : "Create your account"}</h1>
      <form id="auth-form">
        ${isLogin ? "" : `<label>Name</label><input id="f-name" type="text" placeholder="Ada Lovelace" autocomplete="name" />`}
        <label>Email</label>
        <input id="f-email" type="email" placeholder="you@example.com" autocomplete="email" />
        <label>Password</label>
        <input id="f-pass" type="password" placeholder="${isLogin ? "Your password" : "At least 6 characters"}" autocomplete="${isLogin ? "current-password" : "new-password"}" />
        <div class="auth-error" id="auth-error"></div>
        <button class="submit-btn" type="submit">${isLogin ? "Log in" : "Sign up — get $10,000 fake"}</button>
      </form>
      <div class="auth-switch">
        ${isLogin
          ? `New here? <a id="switch-link">Sign up and get $10,000 in fake money</a>`
          : `Already have an account? <a id="switch-link">Log in</a>`}
      </div>
      <div class="auth-disclaimer">
        Educational simulator inspired by prediction markets like Kalshi. Not affiliated with Kalshi.
        No real money, no real trading. Accounts live only in this browser — don't reuse a real password.
      </div>
    </div>
  </div>`;

  document.getElementById("switch-link").onclick = () => renderAuth(isLogin ? "signup" : "login");
  document.getElementById("auth-form").onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("f-email").value;
    const pass = document.getElementById("f-pass").value;
    const res = isLogin
      ? login(email, pass)
      : signup(document.getElementById("f-name").value, email, pass);
    if (res.error) { document.getElementById("auth-error").textContent = res.error; return; }
    toast(isLogin ? "Logged in — good luck out there" : "Account created with $10,000 in fake money 🎉");
    location.hash = "#/";
    render();
  };
}

/* ---------- markets page ---------- */
function marketCardHTML(m) {
  const settled = m.settled;
  const pct = m.price;
  const trendUp = m.history.length > 8 && m.history[m.history.length - 1].p >= m.history[m.history.length - 8].p;
  return `
  <div class="market-card" data-goto="#/market/${m.id}">
    <div class="mc-top">
      <div class="mc-icon">${m.icon}</div>
      <div class="mc-title">${esc(m.title)}</div>
      <div class="mc-chance ${trendUp ? "up" : "down"}">
        <div class="pct mono">${pct}%</div>
        <div class="lbl">chance</div>
      </div>
    </div>
    ${sparklineSVG(m.history)}
    ${settled
      ? `<span class="settled-pill ${settled}">Settled ${settled}</span>`
      : `<div class="mc-buttons">
          <button class="btn-yes" data-quick="yes">Yes ${pct}¢</button>
          <button class="btn-no" data-quick="no">No ${100 - pct}¢</button>
        </div>`}
    <div class="mc-meta">
      <span>${fmtVol(m.volume)} vol</span>
      <span>Closes ${fmtDate(m.closes)}</span>
    </div>
  </div>`;
}

function renderMarkets(user) {
  const q = state.search.trim().toLowerCase();
  let list = allMarkets();
  if (q) {
    list = list.filter((m) => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
  } else if (state.category === "Trending") {
    list = list.filter((m) => m.trending || m.volume > 1500000);
  } else {
    list = list.filter((m) => m.category === state.category);
  }

  app.innerHTML = `
    ${navHTML(user, "markets")}
    <div class="cat-row">
      ${CATEGORIES.map((c) => `<button class="cat-chip ${!q && state.category === c ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
    </div>
    <div class="page">
      <div class="section-title">${q ? `Results for “${esc(state.search)}”` : esc(state.category)}</div>
      <div class="market-grid">
        ${list.map(marketCardHTML).join("") || `<div class="empty-note">No markets found.</div>`}
      </div>
    </div>`;

  wireChrome(user);
  app.querySelectorAll(".cat-chip").forEach((b) => {
    b.onclick = () => { state.category = b.dataset.cat; state.search = ""; render(); };
  });
  app.querySelectorAll(".market-card").forEach((card) => {
    card.onclick = (e) => {
      const quick = e.target.dataset && e.target.dataset.quick;
      if (quick) { state.ticket = { side: quick, mode: "buy", qty: 10 }; }
      location.hash = card.dataset.goto;
    };
  });
}

/* ---------- market detail ---------- */
const RANGES = [
  { label: "1H", ms: 3600e3 }, { label: "6H", ms: 6 * 3600e3 },
  { label: "1D", ms: 24 * 3600e3 }, { label: "1W", ms: 7 * 24 * 3600e3 },
  { label: "1M", ms: 30 * 24 * 3600e3 }, { label: "ALL", ms: null },
];

function renderMarket(user, id) {
  const m = getMarket(id);
  if (!m) { location.hash = "#/"; return; }
  const t = state.ticket;
  const price = t.side === "yes" ? m.price : 100 - m.price;
  const qty = Math.max(0, Math.floor(t.qty) || 0);
  const fee = qty ? tradeFee(qty, price) : 0;
  const cost = qty * price + fee;
  const proceeds = Math.max(0, qty * price - fee);
  const payout = qty * 100;
  const yesPos = user.positions.find((p) => p.marketId === id && p.side === "yes");
  const noPos = user.positions.find((p) => p.marketId === id && p.side === "no");
  const heldPos = t.side === "yes" ? yesPos : noPos;
  const canAfford = user.balance >= cost;
  const canSell = heldPos && heldPos.qty >= qty && qty > 0;

  const h = m.history;
  const dayAgo = Date.now() - 24 * 3600e3;
  const ref = h.find((p) => p.t >= dayAgo) || h[0];
  const delta = m.price - ref.p;

  app.innerHTML = `
    ${navHTML(user, "markets")}
    <div class="page">
      <div class="detail-layout">
        <div>
          <div class="detail-head">
            <div class="mc-icon">${m.icon}</div>
            <div>
              <div class="detail-title">${esc(m.title)}</div>
              <div class="detail-sub">
                <span>📁 ${esc(m.category)}</span>
                <span>📅 Closes ${fmtDate(m.closes)}</span>
                <span>💵 ${fmtVol(m.volume)} volume</span>
              </div>
            </div>
          </div>

          <div class="big-chance">
            <span class="pct mono">${m.price}%</span>
            <span class="lbl">chance</span>
            <span class="delta ${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}¢ today</span>
          </div>

          <div class="chart-box">
            ${bigChartSVG(h, state.chartRange)}
            <div class="tf-row">
              ${RANGES.map((r) => `<button class="tf-btn ${state.chartRange === r.ms ? "active" : ""}" data-ms="${r.ms ?? ""}">${r.label}</button>`).join("")}
            </div>
          </div>

          <div class="panel" style="margin-top:16px">
            <h3>Order book</h3>
            <table class="ob-table">
              <tr><th>Yes price</th><th>Contracts</th><th>No price</th><th>Contracts</th></tr>
              ${orderBook(m).map((r) => `
                <tr>
                  <td class="ob-yes mono">${r.yesPrice}¢</td><td class="mono">${r.yesQty.toLocaleString()}</td>
                  <td class="ob-no mono">${r.noPrice}¢</td><td class="mono">${r.noQty.toLocaleString()}</td>
                </tr>`).join("")}
            </table>
          </div>

          <div class="panel" style="margin-top:16px">
            <h3>Rules</h3>
            <div class="rules-text">${esc(m.rules)} Each contract pays <b>$1.00</b> if it settles in your favor and $0.00 otherwise.</div>
          </div>

          <div class="panel" style="margin-top:16px">
            <h3>Demo controls 🧪</h3>
            <div class="rules-text">Instantly resolve this market to test your prediction and trigger payouts for every position held.</div>
            ${m.settled
              ? `<div style="margin-top:10px"><span class="settled-pill ${m.settled}">Settled ${m.settled}</span></div>`
              : `<div class="settle-row">
                  <button class="settle-btn yes" id="settle-yes">Resolve YES</button>
                  <button class="settle-btn no" id="settle-no">Resolve NO</button>
                </div>`}
          </div>
        </div>

        <div>
          <div class="panel ticket">
            ${(yesPos || noPos) ? `
              <div class="pos-strip">
                <span>Your position</span>
                <span class="mono">
                  ${yesPos ? `<span class="side-pill yes">Yes</span> ${yesPos.qty} @ ${yesPos.avgCents}¢` : ""}
                  ${yesPos && noPos ? " · " : ""}
                  ${noPos ? `<span class="side-pill no">No</span> ${noPos.qty} @ ${noPos.avgCents}¢` : ""}
                </span>
              </div>` : ""}

            ${m.settled ? `
              <h3>Market settled</h3>
              <div class="rules-text">This market resolved <b style="text-transform:uppercase">${m.settled}</b>. Winning contracts paid $1.00 each.</div>
            ` : `
              <div class="buy-sell-row">
                <button class="bs-tab ${t.mode === "buy" ? "active" : ""}" data-mode="buy">Buy</button>
                <button class="bs-tab ${t.mode === "sell" ? "active" : ""}" data-mode="sell">Sell</button>
              </div>
              <div class="side-tabs">
                <button class="side-tab yes ${t.side === "yes" ? "active" : ""}" data-side="yes">Yes · ${m.price}¢</button>
                <button class="side-tab no ${t.side === "no" ? "active" : ""}" data-side="no">No · ${100 - m.price}¢</button>
              </div>
              <label>Contracts</label>
              <div class="qty-row">
                <button class="qty-step" id="qty-dec">−</button>
                <input id="qty-input" type="number" min="1" step="1" value="${qty || ""}" />
                <button class="qty-step" id="qty-inc">+</button>
              </div>
              <div class="ticket-math">
                <div class="row"><span>Price per contract</span><b class="mono">${price}¢</b></div>
                <div class="row"><span>Trading fee</span><b class="mono">${fmtUSD(fee)}</b></div>
                ${t.mode === "buy" ? `
                  <div class="row total"><span>Total cost</span><b class="mono">${fmtUSD(cost)}</b></div>
                  <div class="row payout"><span>Payout if you're right</span><b class="mono">${fmtUSD(payout)}</b></div>
                ` : `
                  <div class="row total"><span>You receive</span><b class="mono">${fmtUSD(proceeds)}</b></div>
                  <div class="row"><span>You hold</span><b class="mono">${heldPos ? heldPos.qty : 0} ${t.side.toUpperCase()}</b></div>
                `}
              </div>
              <button class="submit-btn ${t.side === "no" ? "no-side" : ""}" id="submit-order"
                ${qty < 1 || (t.mode === "buy" ? !canAfford : !canSell) ? "disabled" : ""}>
                ${t.mode === "buy"
                  ? (canAfford || qty < 1 ? `Buy ${qty || ""} ${t.side.toUpperCase()}` : "Insufficient funds")
                  : (canSell || qty < 1 ? `Sell ${qty || ""} ${t.side.toUpperCase()}` : "Not enough contracts")}
              </button>
              <div class="ticket-note">Fake money · fills instantly at market price</div>
            `}
          </div>
        </div>
      </div>
    </div>`;

  wireChrome(user);

  app.querySelectorAll(".tf-btn").forEach((b) => {
    b.onclick = () => { state.chartRange = b.dataset.ms === "" ? null : Number(b.dataset.ms); render(); };
  });

  if (!m.settled) {
    app.querySelectorAll(".bs-tab").forEach((b) => { b.onclick = () => { t.mode = b.dataset.mode; render(); }; });
    app.querySelectorAll(".side-tab").forEach((b) => { b.onclick = () => { t.side = b.dataset.side; render(); }; });
    const qtyInput = document.getElementById("qty-input");
    qtyInput.oninput = () => { t.qty = parseInt(qtyInput.value, 10) || 0; renderPreservingFocus(); };
    document.getElementById("qty-dec").onclick = () => { t.qty = Math.max(1, (t.qty || 1) - 1); render(); };
    document.getElementById("qty-inc").onclick = () => { t.qty = (t.qty || 0) + 1; render(); };
    document.getElementById("submit-order").onclick = () => {
      const res = t.mode === "buy" ? buy(id, t.side, t.qty) : sell(id, t.side, t.qty);
      if (res.error) { toast(res.error, "error"); return; }
      toast(t.mode === "buy"
        ? `Bought ${t.qty} ${t.side.toUpperCase()} @ ${res.price}¢ — ${fmtUSD(res.cost)}`
        : `Sold ${t.qty} ${t.side.toUpperCase()} @ ${res.price}¢ — +${fmtUSD(res.proceeds)}`);
      render();
    };
    const sy = document.getElementById("settle-yes");
    const sn = document.getElementById("settle-no");
    if (sy) sy.onclick = () => confirmSettle(id, "yes", m.title);
    if (sn) sn.onclick = () => confirmSettle(id, "no", m.title);
  }
}

function confirmSettle(id, outcome, title) {
  if (!confirm(`Resolve “${title}” to ${outcome.toUpperCase()}? All positions in this market will be paid out and it will close permanently.`)) return;
  const res = settleMarket(id, outcome);
  if (res.error) { toast(res.error, "error"); return; }
  toast(`Market settled ${outcome.toUpperCase()} — payouts delivered`);
  render();
}

/* ---------- portfolio ---------- */
function renderPortfolio(user) {
  const s = portfolioSummary(user);
  const rows = user.positions.map((pos) => {
    const m = getMarket(pos.marketId);
    const cur = pos.side === "yes" ? m.price : 100 - m.price;
    const pl = positionPL(pos);
    return `
      <tr class="clickable" data-goto="#/market/${m.id}">
        <td>${m.icon} ${esc(m.title)}</td>
        <td><span class="side-pill ${pos.side}">${pos.side}</span></td>
        <td class="mono">${pos.qty}</td>
        <td class="mono">${pos.avgCents}¢</td>
        <td class="mono">${cur}¢</td>
        <td class="mono">${fmtUSD(positionValue(pos))}</td>
        <td class="mono ${pl >= 0 ? "pl-up" : "pl-down"}">${fmtUSD(pl, { sign: true })}</td>
        <td><button class="mini-btn" data-sell="${m.id}|${pos.side}|${pos.qty}">Sell all</button></td>
      </tr>`;
  }).join("");

  app.innerHTML = `
    ${navHTML(user, "portfolio")}
    <div class="page">
      <div class="section-title">Portfolio</div>
      <div class="stat-cards">
        <div class="stat-card"><div class="sc-label">Total value</div><div class="sc-value mono">${fmtUSD(s.total)}</div></div>
        <div class="stat-card"><div class="sc-label">Cash</div><div class="sc-value mono">${fmtUSD(user.balance)}</div></div>
        <div class="stat-card"><div class="sc-label">In positions</div><div class="sc-value mono">${fmtUSD(s.posValue)}</div></div>
        <div class="stat-card"><div class="sc-label">Open P/L</div><div class="sc-value mono ${s.openPL >= 0 ? "up" : "down"}">${fmtUSD(s.openPL, { sign: true })}</div></div>
        <div class="stat-card"><div class="sc-label">All-time P/L</div><div class="sc-value mono ${s.allTimePL >= 0 ? "up" : "down"}">${fmtUSD(s.allTimePL, { sign: true })}</div></div>
      </div>
      ${user.positions.length ? `
        <div class="table-wrap">
          <table class="data-table">
            <tr><th>Market</th><th>Side</th><th>Qty</th><th>Avg</th><th>Now</th><th>Value</th><th>Open P/L</th><th></th></tr>
            ${rows}
          </table>
        </div>` : `<div class="empty-note">No open positions yet. <a href="#/" style="color:var(--green-dark);font-weight:700">Find a market →</a></div>`}
    </div>`;

  wireChrome(user);
  app.querySelectorAll("tr.clickable").forEach((r) => {
    r.onclick = (e) => { if (!e.target.dataset.sell) location.hash = r.dataset.goto; };
  });
  app.querySelectorAll("[data-sell]").forEach((b) => {
    b.onclick = () => {
      const [mid, side, q] = b.dataset.sell.split("|");
      const res = sell(mid, side, parseInt(q, 10));
      if (res.error) { toast(res.error, "error"); return; }
      toast(`Sold ${q} ${side.toUpperCase()} — +${fmtUSD(res.proceeds)}`);
      render();
    };
  });
}

/* ---------- activity ---------- */
function renderActivity(user) {
  const rows = user.activity.slice(0, 200).map((a) => {
    const m = a.marketId ? getMarket(a.marketId) : null;
    const label = {
      buy: "Buy", sell: "Sell", settle: "Settlement", deposit: "Deposit",
    }[a.type] || a.type;
    const detail = a.type === "deposit"
      ? "Added fake funds"
      : `${m ? m.icon + " " + esc(m.title) : ""}`;
    const qtyStr = a.qty ? `${a.qty} ${a.side ? a.side.toUpperCase() : ""} @ ${a.priceCents}¢` : "—";
    const amt = a.amountCents;
    return `
      <tr ${m ? `class="clickable" data-goto="#/market/${m.id}"` : ""}>
        <td>${fmtTime(a.t)}</td>
        <td><b>${label}</b>${a.type === "settle" ? ` <span class="side-pill ${a.outcome}">${a.outcome}</span>` : ""}</td>
        <td>${detail}</td>
        <td class="mono">${qtyStr}</td>
        <td class="mono ${amt >= 0 ? "pl-up" : "pl-down"}">${fmtUSD(amt, { sign: true })}</td>
      </tr>`;
  }).join("");

  app.innerHTML = `
    ${navHTML(user, "activity")}
    <div class="page">
      <div class="section-title">Activity</div>
      ${user.activity.length ? `
        <div class="table-wrap">
          <table class="data-table">
            <tr><th>Time</th><th>Type</th><th>Market</th><th>Details</th><th>Amount</th></tr>
            ${rows}
          </table>
        </div>` : `<div class="empty-note">No activity yet — your trades will show up here.</div>`}
    </div>`;

  wireChrome(user);
  app.querySelectorAll("tr.clickable").forEach((r) => { r.onclick = () => (location.hash = r.dataset.goto); });
}

/* ---------- render loop ---------- */
function render() {
  const r = route();
  const user = currentUser();
  switch (r.page) {
    case "login": return renderAuth("login");
    case "signup": return renderAuth("signup");
    case "redirect-home": location.hash = "#/"; return;
    case "market": return renderMarket(user, r.id);
    case "portfolio": return renderPortfolio(user);
    case "activity": return renderActivity(user);
    default: return renderMarkets(user);
  }
}

/* Re-render without stealing focus from an input the user is typing in. */
function renderPreservingFocus() {
  const active = document.activeElement;
  const activeId = active && active.id;
  const selStart = active && active.selectionStart;
  render();
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) {
      el.focus();
      try { if (selStart != null) el.setSelectionRange(selStart, selStart); } catch {}
    }
  }
}

window.addEventListener("hashchange", render);

/* Live price ticks — skip re-render while the user is typing in the ticket. */
setInterval(() => {
  if (!currentUser()) return;
  tickMarkets();
  const active = document.activeElement;
  const typing = active && (active.tagName === "INPUT");
  if (!typing) render();
}, TICK_MS);

render();
