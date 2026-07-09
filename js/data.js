/* ============ Fake Kalshi — seed market data ============
 * All markets are fictional practice markets. Prices are in cents (1–99).
 * Each contract pays $1.00 (100¢) if it settles in your favor, $0 otherwise.
 */

const CATEGORIES = [
  "Trending", "Politics", "Economics", "Companies", "Financials",
  "Crypto", "Sports", "Climate", "Tech & Science", "Culture",
];

/* Accounts pre-created the first time the app loads (demo seed data).
 * Balances/activity are in cents; activity arrays are newest-first.
 * Bump SEED_VERSION to re-apply seed accounts in browsers that already
 * created them (resets those accounts to this seed state). */
const SEED_VERSION = 2;

const WC_COMBO = {
  title: "6 markets combo — FIFA World Cup",
  costCents: 99965,
  payoutCents: 389105,
  legs: [
    {
      game: "Argentina vs Egypt", when: "Jul 7 @ 12:00pm EDT",
      picks: ["Argentina advances", "Lionel Messi: 1+ goals", "Reg Time: Over 1.5 goals scored"],
    },
    {
      game: "France vs Morocco", when: "Jul 7 @ 4:00pm EDT",
      picks: ["France advances", "Kylian Mbappe: 1+ goals", "Reg Time: Over 1.5 goals scored"],
    },
  ],
};

const NBA_COMBO = {
  title: "4 markets combo — NBA Finals",
  costCents: 218500,
  payoutCents: 786000,
  legs: [
    {
      game: "Thunder vs Pacers · Game 6", when: "Jun 19 @ 8:30pm EDT",
      picks: ["Thunder win", "Shai Gilgeous-Alexander: 30+ points"],
    },
    {
      game: "Thunder vs Pacers · Game 7", when: "Jun 22 @ 8:00pm EDT",
      picks: ["Series goes to Game 7", "Over 205.5 total points"],
    },
  ],
};

const MLB_COMBO = {
  title: "4 markets combo — MLB",
  costCents: 172109,
  payoutCents: 615000,
  legs: [
    {
      game: "Yankees vs Red Sox", when: "Jun 27 @ 7:05pm EDT",
      picks: ["Yankees win", "Aaron Judge: 1+ home runs"],
    },
    {
      game: "Dodgers vs Giants", when: "Jun 27 @ 9:45pm EDT",
      picks: ["Dodgers win", "Over 8.5 total runs"],
    },
  ],
};

const SEED_ACCOUNTS = [
  {
    name: "Nicholas de Hombre",
    email: "nicholas@fakekalshi.demo",
    password: "messi2026",
    balance: 724934,   // $10,000 start + all activity below = $7,249.34
    deposited: 1000000,
    activity: [
      { t: Date.parse("2026-07-07T18:10:00-04:00"), type: "combo_settle", outcome: "won", amountCents: 389105, combo: WC_COMBO },
      { t: Date.parse("2026-07-07T11:24:00-04:00"), type: "combo_buy", amountCents: -99965, combo: WC_COMBO },
      { t: Date.parse("2026-07-06T17:25:00-04:00"), type: "sell", marketId: "eth-8k", side: "yes", qty: 1500, priceCents: 17, amountCents: 24018, fee: 1482 },
      { t: Date.parse("2026-07-03T09:55:00-04:00"), type: "sell", marketId: "btc-150k", side: "yes", qty: 2000, priceCents: 29, amountCents: 55117, fee: 2883 },
      { t: Date.parse("2026-07-02T13:10:00-04:00"), type: "sell", marketId: "fed-cut-sep", side: "yes", qty: 400, priceCents: 66, amountCents: 25771, fee: 629 },
      { t: Date.parse("2026-07-01T15:30:00-04:00"), type: "sell", marketId: "sp500-7000", side: "yes", qty: 3000, priceCents: 36, amountCents: 103161, fee: 4839 },
      { t: Date.parse("2026-07-01T10:45:00-04:00"), type: "buy", marketId: "eth-8k", side: "yes", qty: 1500, priceCents: 30, amountCents: -47205, fee: 2205 },
      { t: Date.parse("2026-06-30T11:00:00-04:00"), type: "buy", marketId: "fed-cut-sep", side: "yes", qty: 400, priceCents: 58, amountCents: -23883, fee: 683 },
      { t: Date.parse("2026-06-29T16:20:00-04:00"), type: "sell", marketId: "world-cup-host-win", side: "no", qty: 1200, priceCents: 84, amountCents: 99671, fee: 1129 },
      { t: Date.parse("2026-06-28T20:45:00-04:00"), type: "combo_settle", outcome: "lost", amountCents: 0, combo: MLB_COMBO },
      { t: Date.parse("2026-06-27T09:30:00-04:00"), type: "buy", marketId: "btc-150k", side: "yes", qty: 2000, priceCents: 41, amountCents: -85387, fee: 3387 },
      { t: Date.parse("2026-06-26T19:15:00-04:00"), type: "combo_buy", amountCents: -172109, combo: MLB_COMBO },
      { t: Date.parse("2026-06-25T14:12:00-04:00"), type: "buy", marketId: "sp500-7000", side: "yes", qty: 3000, priceCents: 48, amountCents: -149242, fee: 5242 },
      { t: Date.parse("2026-06-24T12:40:00-04:00"), type: "sell", marketId: "house-flip", side: "no", qty: 4000, priceCents: 28, amountCents: 106355, fee: 5645 },
      { t: Date.parse("2026-06-23T23:05:00-04:00"), type: "combo_settle", outcome: "lost", amountCents: 0, combo: NBA_COMBO },
      { t: Date.parse("2026-06-20T12:30:00-04:00"), type: "buy", marketId: "house-flip", side: "no", qty: 4000, priceCents: 45, amountCents: -186931, fee: 6931 },
      { t: Date.parse("2026-06-19T18:00:00-04:00"), type: "combo_buy", amountCents: -218500, combo: NBA_COMBO },
      { t: Date.parse("2026-06-18T10:05:00-04:00"), type: "buy", marketId: "world-cup-host-win", side: "no", qty: 1200, priceCents: 78, amountCents: -95042, fee: 1442 },
    ],
  },
];

/* prob: starting probability (0–1) · vol: how jumpy the price is ·
 * closes: ISO date the market closes · volume: fake total contracts traded */
const SEED_MARKETS = [
  {
    id: "fed-cut-sep",
    icon: "🏛️",
    category: "Economics",
    title: "Will the Fed cut rates at the September meeting?",
    rules: "Resolves YES if the FOMC lowers the target federal funds rate at its September meeting. Resolves NO if the rate is held or raised.",
    prob: 0.62, vol: 0.020, closes: "2026-09-17", volume: 1834200, trending: true,
  },
  {
    id: "cpi-under-3",
    icon: "🛒",
    category: "Economics",
    title: "Will year-over-year inflation (CPI) be below 3.0% this month?",
    rules: "Resolves YES if the next monthly CPI release shows year-over-year headline inflation below 3.0%.",
    prob: 0.44, vol: 0.018, closes: "2026-08-12", volume: 921500, trending: true,
  },
  {
    id: "recession-2026",
    icon: "📉",
    category: "Economics",
    title: "Will the US enter a recession in 2026?",
    rules: "Resolves YES if NBER declares a US recession beginning in calendar year 2026.",
    prob: 0.21, vol: 0.012, closes: "2026-12-31", volume: 2455100,
  },
  {
    id: "unemployment-45",
    icon: "💼",
    category: "Economics",
    title: "Will the unemployment rate hit 4.5% or higher this year?",
    rules: "Resolves YES if any monthly BLS jobs report in 2026 shows a headline unemployment rate of 4.5% or higher.",
    prob: 0.33, vol: 0.015, closes: "2026-12-31", volume: 604300,
  },
  {
    id: "senate-bill-pass",
    icon: "🏛️",
    category: "Politics",
    title: "Will the budget bill pass the Senate before October?",
    rules: "Resolves YES if the pending budget reconciliation bill passes a full Senate vote before October 1, 2026.",
    prob: 0.55, vol: 0.025, closes: "2026-09-30", volume: 1210800, trending: true,
  },
  {
    id: "house-flip",
    icon: "🗳️",
    category: "Politics",
    title: "Will control of the House flip in the midterms?",
    rules: "Resolves YES if the party currently holding the House majority loses it in the 2026 midterm elections.",
    prob: 0.58, vol: 0.014, closes: "2026-11-03", volume: 3892400, trending: true,
  },
  {
    id: "cabinet-change",
    icon: "🏢",
    category: "Politics",
    title: "Will there be a Cabinet-level departure before year end?",
    rules: "Resolves YES if any sitting Cabinet secretary resigns, is dismissed, or otherwise leaves office before December 31, 2026.",
    prob: 0.47, vol: 0.022, closes: "2026-12-31", volume: 512700,
  },
  {
    id: "btc-150k",
    icon: "₿",
    category: "Crypto",
    title: "Will Bitcoin hit $150,000 this year?",
    rules: "Resolves YES if the BTC/USD price on major exchanges trades at or above $150,000 at any point in 2026.",
    prob: 0.38, vol: 0.030, closes: "2026-12-31", volume: 4120900, trending: true,
  },
  {
    id: "eth-8k",
    icon: "💎",
    category: "Crypto",
    title: "Will Ethereum close above $8,000 by end of Q3?",
    rules: "Resolves YES if ETH/USD closes above $8,000 on September 30, 2026 (UTC).",
    prob: 0.26, vol: 0.032, closes: "2026-09-30", volume: 1077600,
  },
  {
    id: "sp500-7000",
    icon: "📈",
    category: "Financials",
    title: "Will the S&P 500 close above 7,000 this year?",
    rules: "Resolves YES if the S&P 500 index has a daily close above 7,000 at any point in 2026.",
    prob: 0.51, vol: 0.020, closes: "2026-12-31", volume: 2688000, trending: true,
  },
  {
    id: "nvda-6t",
    icon: "🖥️",
    category: "Companies",
    title: "Will Nvidia's market cap top $6 trillion this year?",
    rules: "Resolves YES if Nvidia's market capitalization closes above $6 trillion on any trading day in 2026.",
    prob: 0.42, vol: 0.026, closes: "2026-12-31", volume: 1550300,
  },
  {
    id: "apple-foldable",
    icon: "📱",
    category: "Companies",
    title: "Will Apple announce a foldable device this year?",
    rules: "Resolves YES if Apple officially announces a foldable iPhone, iPad, or Mac at any event or press release in 2026.",
    prob: 0.29, vol: 0.020, closes: "2026-12-31", volume: 733100,
  },
  {
    id: "gpt6-release",
    icon: "🤖",
    category: "Tech & Science",
    title: "Will a major AI lab release a next-gen frontier model by December?",
    rules: "Resolves YES if OpenAI, Anthropic, or Google DeepMind publicly releases a new flagship frontier model before December 31, 2026.",
    prob: 0.71, vol: 0.018, closes: "2026-12-31", volume: 1902200, trending: true,
  },
  {
    id: "starship-orbit",
    icon: "🚀",
    category: "Tech & Science",
    title: "Will Starship complete a fully successful orbital mission this quarter?",
    rules: "Resolves YES if SpaceX's Starship completes an orbital flight with successful booster and ship recovery this quarter.",
    prob: 0.64, vol: 0.024, closes: "2026-09-30", volume: 845900,
  },
  {
    id: "world-cup-host-win",
    icon: "⚽",
    category: "Sports",
    title: "Will a host nation team reach the World Cup semifinals?",
    rules: "Resolves YES if the USA, Mexico, or Canada men's national team reaches the semifinal round of the 2026 FIFA World Cup.",
    prob: 0.18, vol: 0.020, closes: "2026-07-14", volume: 2214700, trending: true,
  },
  {
    id: "yankees-ws",
    icon: "⚾",
    category: "Sports",
    title: "Will the Yankees win the World Series?",
    rules: "Resolves YES if the New York Yankees win the 2026 MLB World Series.",
    prob: 0.12, vol: 0.015, closes: "2026-11-01", volume: 1688400,
  },
  {
    id: "chiefs-superbowl",
    icon: "🏈",
    category: "Sports",
    title: "Will the Chiefs reach the Super Bowl?",
    rules: "Resolves YES if the Kansas City Chiefs play in Super Bowl LXI.",
    prob: 0.24, vol: 0.016, closes: "2027-01-25", volume: 3011000,
  },
  {
    id: "hottest-year",
    icon: "🌡️",
    category: "Climate",
    title: "Will 2026 be the hottest year on record?",
    rules: "Resolves YES if NASA GISS or NOAA declares 2026 the warmest calendar year in the instrumental record.",
    prob: 0.56, vol: 0.010, closes: "2027-01-15", volume: 458200,
  },
  {
    id: "atlantic-hurricanes",
    icon: "🌀",
    category: "Climate",
    title: "Will there be 18+ named Atlantic storms this season?",
    rules: "Resolves YES if the 2026 Atlantic hurricane season produces 18 or more named storms per the National Hurricane Center.",
    prob: 0.49, vol: 0.014, closes: "2026-11-30", volume: 297800,
  },
  {
    id: "nyc-snow-dec",
    icon: "❄️",
    category: "Climate",
    title: "Will it snow in Central Park on Christmas Day?",
    rules: "Resolves YES if measurable snowfall (≥0.1 in) is recorded at the Central Park station on December 25, 2026.",
    prob: 0.15, vol: 0.008, closes: "2026-12-25", volume: 186500,
  },
  {
    id: "box-office-2b",
    icon: "🎬",
    category: "Culture",
    title: "Will any 2026 film gross $2 billion worldwide?",
    rules: "Resolves YES if any film released in 2026 surpasses $2 billion in worldwide box office gross during 2026.",
    prob: 0.34, vol: 0.016, closes: "2026-12-31", volume: 522900,
  },
  {
    id: "album-record",
    icon: "🎵",
    category: "Culture",
    title: "Will a new album break the single-week streaming record this year?",
    rules: "Resolves YES if any album released in 2026 sets a new single-week global streaming record on Spotify.",
    prob: 0.41, vol: 0.020, closes: "2026-12-31", volume: 388100,
  },
  {
    id: "oscars-viewers",
    icon: "🏆",
    category: "Culture",
    title: "Will next year's Oscars draw over 20M viewers?",
    rules: "Resolves YES if official Nielsen ratings for the 2027 Academy Awards broadcast exceed 20 million total viewers.",
    prob: 0.37, vol: 0.012, closes: "2027-03-15", volume: 143700,
  },
  {
    id: "tiktok-ban",
    icon: "📵",
    category: "Tech & Science",
    title: "Will TikTok be unavailable in US app stores at year end?",
    rules: "Resolves YES if TikTok is not available for download in the US Apple App Store or Google Play Store on December 31, 2026.",
    prob: 0.19, vol: 0.022, closes: "2026-12-31", volume: 977300,
  },
];
