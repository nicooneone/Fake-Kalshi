# Fake Kalshi 🎓

A **practice prediction market** — a paper-trading simulator inspired by Kalshi-style
event contracts. Every dollar is fake. Use it to sharpen your forecasting: put fake
money on your predictions, watch prices move, and see whether you were right.

> Educational project. Not affiliated with Kalshi. No real money, no real trading.

## Features

- **Accounts & login** — sign up with any email/password; every new account starts
  with **$10,000 in fake money**. Add more fake funds or reset your account any time.
- **24 practice markets** across Politics, Economics, Companies, Financials, Crypto,
  Sports, Climate, Tech & Science, and Culture.
- **Kalshi-style mechanics** — contracts priced 1–99¢ that pay **$1.00** if you're
  right, Yes/No sides, buy and sell, and a realistic trading fee
  (`0.07 × contracts × price × (1 − price)`).
- **Live prices** — market prices random-walk every few seconds, with 60 days of
  seeded price history, charts with timeframes, sparklines, and an order book.
- **Portfolio & P/L** — open positions with live profit/loss, cash vs. portfolio
  value, all-time P/L, and a full activity log of every trade.
- **Settlement** — resolve any market YES or NO from its Demo Controls panel to
  test a prediction and trigger $1.00-per-contract payouts instantly.

## Running it

No build step, no dependencies. Either open `index.html` directly, or serve the
folder (nicer, avoids any browser quirks):

```bash
# from the repo root — pick whichever you have:
python3 -m http.server 8000
# or
npx serve .
```

Then visit http://localhost:8000, sign up, and start trading.

## How your data is stored

Everything (accounts, balances, positions, market prices) lives in your browser's
`localStorage` — nothing leaves your machine. Because of that:

- Accounts only exist in the browser you created them in.
- **Don't reuse a real password** — this is a demo, not a secure auth system.
- Clearing site data resets everything.

## Project structure

```
index.html      — app shell
css/styles.css  — all styling
js/data.js      — seed market definitions (add your own markets here!)
js/store.js     — auth, balances, trading engine, price simulation, settlement
js/app.js       — UI rendering, routing, charts
```

### Adding your own markets

Append an object to `SEED_MARKETS` in `js/data.js`:

```js
{
  id: "my-market",
  icon: "🔮",
  category: "Tech & Science",
  title: "Will my prediction come true?",
  rules: "Resolves YES if ...",
  prob: 0.50,        // starting probability
  vol: 0.02,         // price jumpiness
  closes: "2026-12-31",
  volume: 100000,
}
```

Refresh the page and it appears with generated price history.
