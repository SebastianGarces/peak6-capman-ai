import { db } from "./index";
import { curriculumLevels, skillObjectives, scenarios } from "./schema";
import { eq, like } from "drizzle-orm";

const CURRICULUM_LEVELS = [
  { levelNumber: 1, name: "Foundation", description: "Calls, puts, strike, expiration, premium, moneyness" },
  { levelNumber: 2, name: "Greeks Basics", description: "Delta, theta, vega intuition" },
  { levelNumber: 3, name: "Single-Leg Strategies", description: "Long/short calls/puts, covered call, cash-secured put" },
  { levelNumber: 4, name: "Vertical Spreads", description: "Bull/bear call/put spreads, max P/L, breakeven" },
  { levelNumber: 5, name: "Market Regime Analysis", description: "Trend ID, IV analysis, regime-strategy matching" },
  { levelNumber: 6, name: "Volatility Strategies", description: "Straddles, strangles, calendars" },
  { levelNumber: 7, name: "Complex Strategies", description: "Iron condors, butterflies, ratio spreads" },
  { levelNumber: 8, name: "Risk Management", description: "Position sizing, portfolio Greeks, rolling" },
  { levelNumber: 9, name: "Advanced Greeks", description: "Vanna, charm, volga" },
  { levelNumber: 10, name: "Professional Synthesis", description: "Multi-regime portfolios, full trade plans" },
];

const SKILL_OBJECTIVES = [
  {
    code: "OBJ-001", name: "Identify option moneyness", description: "Identify option moneyness (ITM/ATM/OTM)", levelNumber: 1,
    studyGuide: `Option moneyness describes the relationship between an option's strike price and the current price of the underlying asset. There are three states:

In-The-Money (ITM): The option has intrinsic value. For calls, the stock price is above the strike (e.g., $185 stock, $170 strike call). For puts, the stock price is below the strike (e.g., $185 stock, $200 strike put). ITM options have deltas closer to 1.0 (calls) or -1.0 (puts).

At-The-Money (ATM): The strike price is approximately equal to the stock price. ATM options have deltas near 0.50 (calls) or -0.50 (puts). They have the highest time value and are the most sensitive to volatility changes.

Out-of-The-Money (OTM): The option has no intrinsic value. For calls, the stock is below the strike. For puts, the stock is above the strike. OTM options have deltas closer to 0 and are cheaper because they require a larger move to become profitable.

Quick tip: Delta is a fast proxy for moneyness. A call with 0.90 delta is deep ITM; one with 0.10 delta is far OTM.`,
  },
  {
    code: "OBJ-002", name: "Calculate intrinsic and extrinsic value", description: "Calculate option intrinsic and extrinsic value", levelNumber: 1,
    studyGuide: `Every option's price is composed of two parts: intrinsic value and extrinsic (time) value.

Intrinsic Value is the "real" value — what the option would be worth if exercised immediately.
- Call intrinsic = max(0, Stock Price - Strike Price)
- Put intrinsic = max(0, Strike Price - Stock Price)
- Intrinsic value can never be negative. An OTM option has zero intrinsic value.

Example: Stock at $420, $400 call priced at $28. Intrinsic = $420 - $400 = $20.

Extrinsic (Time) Value is the premium above intrinsic value. It represents the market's pricing of time remaining, volatility, and the probability of further favorable movement.
- Extrinsic = Option Price - Intrinsic Value
- Using the example above: $28 - $20 = $8 of time value.

Key behaviors:
- ATM options have the highest extrinsic value because uncertainty about finishing ITM or OTM is greatest.
- Extrinsic value decays over time (theta decay) and accelerates as expiration approaches.
- Higher implied volatility increases extrinsic value; lower IV decreases it.
- At expiration, extrinsic value is always zero — only intrinsic value remains.`,
  },
  {
    code: "OBJ-003", name: "Interpret delta for directional risk", description: "Interpret delta for directional risk", levelNumber: 2,
    studyGuide: `Delta measures how much an option's price changes for a $1 move in the underlying stock. It serves three purposes:

1. Rate of Change: A call with 0.60 delta gains approximately $0.60 when the stock rises $1, and loses $0.60 when it falls $1.

2. Directional Exposure (Equivalent Shares): Delta tells you the equivalent stock position. Owning 10 contracts (1,000 shares notional) of a 0.60 delta call gives you 600 equivalent shares of directional exposure. This is called "delta-equivalent shares."

3. Probability Proxy: Delta roughly approximates the probability the option finishes ITM at expiration. A 0.30 delta call has roughly a 30% chance of finishing ITM.

Delta ranges:
- Calls: 0 to +1.0 (deep OTM near 0, deep ITM near 1.0, ATM near 0.50)
- Puts: -1.0 to 0 (deep ITM near -1.0, deep OTM near 0, ATM near -0.50)

Net delta for a multi-leg position is the sum of all individual deltas (accounting for long/short and contract count). A position with net delta of +350 behaves like owning 350 shares of stock.

Delta is not constant — it changes as the stock moves (this rate of change is called gamma).`,
  },
  {
    code: "OBJ-004", name: "Interpret theta for time decay impact", description: "Interpret theta for time decay impact", levelNumber: 2,
    studyGuide: `Theta measures the daily time decay of an option's price — how much value the option loses each day, all else equal.

Key concepts:
- Theta is almost always negative for long option positions (you lose money each day).
- Theta is positive for short option positions (you earn money each day from decay).
- Expressed as dollars per day: a theta of -0.05 means the option loses $0.05 per day per share ($5 per contract).

Theta acceleration: Time decay is not linear — it accelerates as expiration approaches.
- At 60 DTE, an ATM option might lose $0.03/day.
- At 30 DTE, that increases to $0.05/day.
- At 7 DTE, it might be $0.12/day.
- A rough rule: options lose about 1/3 of their time value in the first half of their life and 2/3 in the second half.

ATM vs ITM/OTM: ATM options have the highest theta because they have the most extrinsic value to decay. Deep ITM options (mostly intrinsic value) and deep OTM options (little total value) have lower theta.

Practical implications:
- If you're long options, time works against you — consider how much theta you're paying daily.
- If you're short options, theta is your friend — the 30-45 DTE entry is popular because theta starts accelerating.
- Weekends count: theta accrues over weekends even though markets are closed.`,
  },
  {
    code: "OBJ-005", name: "Interpret vega for volatility sensitivity", description: "Interpret vega for volatility sensitivity", levelNumber: 2,
    studyGuide: `Vega measures how much an option's price changes for a 1 percentage point change in implied volatility (IV).

Key concepts:
- A vega of 0.15 means the option gains $0.15 per share ($15 per contract) if IV increases by 1%.
- Long options have positive vega — they benefit from rising IV.
- Short options have negative vega — they benefit from falling IV.

ATM options have the highest vega because they have the most extrinsic value, which is most sensitive to volatility changes. Deep ITM and deep OTM options have lower vega.

Longer-dated options have higher vega than shorter-dated ones — a 90 DTE ATM option is much more sensitive to IV changes than a 7 DTE ATM option.

IV Crush: After known events (earnings, FDA decisions), implied volatility often drops sharply as uncertainty resolves. This is called "vol crush." If you're long options through an event, even if the stock moves in your favor, the IV crush can cause your position to lose money.

Example: You buy a call at 45% IV for $5.00 with vega of 0.20. Earnings happen, IV drops to 25% (a 20-point drop). The vega impact alone is: 20 x $0.20 = $4.00 loss. The stock would need to move significantly in your favor to overcome this.

Practical tip: Compare a stock's IV to its IV Rank (where current IV sits relative to its historical range). High IV rank means options are expensive; low IV rank means they're cheap relative to history.`,
  },
  {
    code: "OBJ-006", name: "Identify correct strategy for market regime", description: "Identify correct strategy for market regime", levelNumber: 5,
    studyGuide: `Different market environments favor different options strategies. Identifying the current regime is the first step in strategy selection.

Bull Quiet (uptrend, VIX < 20): Steady upward movement with low volatility.
- Preferred: Bull call spreads, covered calls, cash-secured puts
- Rationale: Low premium makes selling less attractive; directional plays benefit from the trend

Bull Volatile (uptrend, VIX > 20, choppy): Rising but with large swings.
- Preferred: Ratio spreads, calendar spreads, protective puts on existing longs
- Rationale: Elevated premium makes selling attractive; need protection against sharp reversals

Bear Quiet (downtrend, VIX < 20): Steady decline without panic.
- Preferred: Bear put spreads, collars on longs, long puts
- Rationale: Relatively cheap protection; controlled downside plays

Bear Volatile (downtrend, VIX > 20, fast decline): Sharp selloff with fear.
- Preferred: Long puts, put spreads, straddles/strangles
- Rationale: High premium reflects real risk; protective strategies are critical

Sideways/Range-Bound (mean-reverting, defined range): Price oscillates in a range.
- Preferred: Iron condors, iron butterflies, short strangles, calendar spreads
- Rationale: Collect premium from time decay; profit from prices staying within a range

Regime identification tools: Look at price trend (moving averages), VIX level (above/below 20), IV rank for the specific stock, and recent price action (trending vs choppy vs rangebound).`,
  },
  {
    code: "OBJ-007", name: "Calculate max profit/loss for vertical spreads", description: "Calculate max profit/loss for vertical spreads", levelNumber: 4,
    studyGuide: `Vertical spreads involve buying and selling options at different strikes but the same expiration. There are four types:

Bull Call Spread (debit): Buy lower strike call, sell higher strike call.
- Max Profit = Width of strikes - Net debit paid
- Max Loss = Net debit paid
- Example: Buy $100 call for $5, sell $105 call for $2. Debit = $3. Max profit = $5 - $3 = $2. Max loss = $3.

Bear Put Spread (debit): Buy higher strike put, sell lower strike put.
- Max Profit = Width of strikes - Net debit paid
- Max Loss = Net debit paid
- Example: Buy $100 put for $4, sell $95 put for $1.50. Debit = $2.50. Max profit = $5 - $2.50 = $2.50. Max loss = $2.50.

Bull Put Spread (credit): Sell higher strike put, buy lower strike put.
- Max Profit = Net credit received
- Max Loss = Width of strikes - Net credit received
- Example: Sell $100 put for $4, buy $95 put for $1.50. Credit = $2.50. Max profit = $2.50. Max loss = $5 - $2.50 = $2.50.

Bear Call Spread (credit): Sell lower strike call, buy higher strike call.
- Max Profit = Net credit received
- Max Loss = Width of strikes - Net credit received

Key relationship: In any vertical spread, Max Profit + Max Loss = Width of Strikes. This is always true and serves as a quick check on your calculations.`,
  },
  {
    code: "OBJ-008", name: "Calculate breakeven for a given strategy", description: "Calculate breakeven for a given strategy", levelNumber: 4,
    studyGuide: `The breakeven point is the stock price at expiration where the position neither makes nor loses money (excluding commissions).

Single-Leg Strategies:
- Long Call: Breakeven = Strike + Premium paid
- Long Put: Breakeven = Strike - Premium paid
- Short Call: Breakeven = Strike + Premium received
- Short Put: Breakeven = Strike - Premium received

Vertical Spreads:
- Bull Call Spread: Breakeven = Lower strike + Net debit
- Bear Put Spread: Breakeven = Higher strike - Net debit
- Bull Put Spread: Breakeven = Higher strike - Net credit
- Bear Call Spread: Breakeven = Lower strike + Net credit

Straddles (long call + long put at same strike):
- Upper breakeven = Strike + Total premium paid
- Lower breakeven = Strike - Total premium paid

Strangles (long call + long put at different strikes):
- Upper breakeven = Call strike + Total premium paid
- Lower breakeven = Put strike - Total premium paid

Iron Condors (short strangle + long strangle protection):
- Upper breakeven = Short call strike + Net credit
- Lower breakeven = Short put strike - Net credit

Practical tip: Breakeven at expiration is different from breakeven during the trade. An option position can be profitable before expiration even if the stock hasn't reached the expiration breakeven, thanks to remaining time value.`,
  },
  {
    code: "OBJ-009", name: "Articulate risk management rationale", description: "Articulate risk management rationale", levelNumber: 8,
    studyGuide: `Risk management in options trading is about protecting capital while maintaining exposure to your thesis. It encompasses position sizing, exit rules, and portfolio-level controls.

Position Sizing:
- Risk a fixed percentage of portfolio per trade (commonly 1-3% of account value).
- For defined-risk trades (spreads), max loss IS your risk. Size so max loss = your risk budget.
- For undefined-risk trades (naked options), use a stop-loss level to define risk.

Stop-Loss Rules:
- Percentage of premium: Exit when you've lost 50-100% of premium paid (for long options) or 2x credit received (for short options).
- Technical stops: Exit if the underlying breaks a key support/resistance level that invalidates your thesis.
- Time stops: Close positions at a predetermined date if the thesis hasn't played out (e.g., close at 21 DTE regardless).

Rolling:
- Rolling is closing the current position and opening a new one, typically at a later expiration or different strike.
- Roll for credit when possible — this reduces your cost basis.
- Common rolls: roll short options out in time when tested, roll up/down to adjust strike.

Portfolio-Level Controls:
- Limit total portfolio delta exposure to avoid excessive directional risk.
- Monitor total portfolio theta — how much are you paying or collecting daily?
- Diversify across underlyings, expirations, and strategy types.
- Set a maximum portfolio-wide drawdown threshold (e.g., reduce position sizes after 10% drawdown).

The key principle: Define your risk before entering the trade, not after.`,
  },
  {
    code: "OBJ-010", name: "Construct multi-leg trade thesis", description: "Construct multi-leg trade thesis", levelNumber: 7,
    studyGuide: `A multi-leg trade thesis combines two or more options to express a nuanced market view. The thesis should articulate: what you expect to happen, why, and how the trade structure profits from that outcome.

Building a thesis framework:
1. Directional View: Where do you think the stock is going? (up, down, sideways, uncertain)
2. Magnitude: How far? (a little, a lot, within a range)
3. Timing: By when? (this week, in 30 days, over the next quarter)
4. Volatility View: Do you expect IV to rise, fall, or stay the same?

Matching structure to thesis:
- "Stock will rise moderately in 30 days, IV will stay flat" → Bull call spread
- "Stock will stay in a range, IV will decline after earnings" → Iron condor or short strangle
- "Stock will make a big move but I don't know direction" → Long straddle or strangle
- "Stock will rise but I want to reduce cost" → Call ratio spread or collar
- "Stock will decline sharply soon, IV is cheap" → Long puts or bear put spread

Trade plan components:
- Entry criteria: What triggers the trade? (technical level, event, IV rank threshold)
- Position sizing: How many contracts, what percentage of portfolio at risk?
- Profit target: At what gain do you take profits? (50% of max profit is a common target for credit spreads)
- Stop-loss: At what point do you exit for a loss?
- Adjustment plan: What do you do if the stock moves against you? (roll, add a leg, close half)
- Time-based exit: When do you close regardless of P/L? (e.g., 21 DTE for short premium)`,
  },
  {
    code: "OBJ-011", name: "Identify adjustment triggers", description: "Identify adjustment triggers (stop loss, roll conditions)", levelNumber: 8,
    studyGuide: `Adjustment triggers are predefined conditions that tell you when to modify, roll, or close a position. Setting these before entering a trade removes emotion from decision-making.

Price-Based Triggers:
- Short option tested: When the underlying moves through your short strike, consider rolling or closing. For a short put at $100, a trigger might be "if stock drops below $101, roll down and out."
- Breach of key support/resistance: If a technical level that formed your thesis breaks, the thesis may be invalidated.
- Percentage move: Exit or adjust if the stock moves more than X% against you.

Greeks-Based Triggers:
- Delta threshold: If your position delta exceeds a comfort level (e.g., a neutral trade reaches +/- 30 delta), rebalance.
- Gamma risk near expiration: High gamma near expiration means large, unpredictable P/L swings. Close or roll positions before the last week.

Time-Based Triggers:
- 21 DTE rule: Many traders close or roll short premium positions at 21 DTE to avoid the worst gamma risk zone while capturing most theta decay.
- 50% of max profit: Close credit spreads at 50% of max profit to lock in gains — the remaining 50% takes disproportionately longer to capture.

Loss-Based Triggers:
- 2x credit received: For credit spreads, close if losses reach 2x the credit received.
- Fixed dollar amount: Set a maximum dollar loss per position.

Rolling mechanics:
- Roll out (same strike, later expiration): Buys more time, usually for a credit.
- Roll out and away (different strike, later expiration): Adjusts the position while extending time.
- Roll up/down: Move strikes closer to the current stock price to collect more premium.
- Only roll if the original thesis is still intact — rolling a bad trade just delays the loss.`,
  },
  {
    code: "OBJ-012", name: "Evaluate portfolio-level Greek exposure", description: "Evaluate portfolio-level Greek exposure", levelNumber: 9,
    studyGuide: `Portfolio-level Greek analysis looks at the aggregate risk across all your positions, not just individual trades. This is how professional traders manage risk.

Portfolio Delta: Sum of all position deltas (adjusted for contract count and long/short).
- Measures overall directional exposure in equivalent shares.
- Example: Long 10 contracts of 0.50 delta calls (+500), short 5 contracts of -0.30 delta puts (+150). Net portfolio delta = +650 equivalent shares.
- A delta-neutral portfolio has net delta near zero — it doesn't benefit or suffer from small stock moves.

Portfolio Gamma: Sum of all position gammas.
- Measures how quickly your portfolio delta changes as the underlying moves.
- Long gamma (positive): Your delta moves in your favor as the stock moves (long options).
- Short gamma (negative): Your delta moves against you as the stock moves (short options). This is the most dangerous Greek exposure.

Portfolio Theta: Sum of all position thetas.
- Tells you how much your entire portfolio gains or loses per day from time decay.
- Positive theta = you earn from decay (net short premium). Negative theta = you pay for decay (net long premium).
- Most professional traders target a specific daily theta relative to portfolio size.

Portfolio Vega: Sum of all position vegas.
- Measures exposure to volatility changes across the portfolio.
- Positive vega = portfolio benefits from rising IV. Negative vega = benefits from falling IV.
- Diversifying expirations and underlyings helps manage aggregate vega exposure.

Hedging:
- Too much delta? Buy/sell shares or add opposing options to neutralize.
- Too much gamma risk? Reduce position sizes or add offsetting positions.
- Too much vega? Spread across expirations or add positions with opposing vega.

The goal is not to eliminate all Greeks but to keep each within a range that matches your risk tolerance and market outlook.`,
  },
];

// ─── Seed Scenarios (2 per level for levels 1-3) ────────
const SEED_SCENARIOS = [
  // ── Level 1: Foundation — OBJ-001 (Moneyness) ──
  {
    levelNumber: 1,
    scenarioText:
      "You are a junior options analyst reviewing the AAPL options chain after the stock closed at $185.50 following a mixed earnings report. The market is relatively calm with the VIX at 16.2. Your portfolio manager wants you to classify several options by moneyness to prepare a report for the morning meeting. The current option chain shows the following contracts expiring in 30 days: a $170 call trading at $16.80/$17.20 with 92 delta, a $185 call trading at $5.20/$5.60 with 52 delta, a $200 call trading at $1.10/$1.40 with 18 delta, a $170 put trading at $0.45/$0.70 with -8 delta, a $185 put trading at $4.80/$5.20 with -48 delta, and a $200 put trading at $15.50/$16.00 with -82 delta. Implied volatility across the chain is approximately 28%. The stock has been trading in a $175-$195 range for the past two months.",
    questionPrompt:
      "Classify each of the six options listed above as in-the-money (ITM), at-the-money (ATM), or out-of-the-money (OTM). Explain your reasoning for each classification and describe how moneyness relates to the delta values shown.",
    marketData: {
      underlying: "AAPL",
      currentPrice: 185.5,
      iv: 0.28,
      ivRank: 35,
      daysToExpiration: 30,
      optionChain: [
        { strike: 170, type: "call", bid: 16.8, ask: 17.2, delta: 0.92, theta: -0.03, vega: 0.08 },
        { strike: 185, type: "call", bid: 5.2, ask: 5.6, delta: 0.52, theta: -0.06, vega: 0.18 },
        { strike: 200, type: "call", bid: 1.1, ask: 1.4, delta: 0.18, theta: -0.04, vega: 0.12 },
        { strike: 170, type: "put", bid: 0.45, ask: 0.7, delta: -0.08, theta: -0.02, vega: 0.06 },
        { strike: 185, type: "put", bid: 4.8, ask: 5.2, delta: -0.48, theta: -0.06, vega: 0.18 },
        { strike: 200, type: "put", bid: 15.5, ask: 16.0, delta: -0.82, theta: -0.03, vega: 0.08 },
      ],
    },
    rubric: {
      criteria: [
        { criterion: "Correctly classifies all six options by moneyness", weight: 0.4, max_score: 40 },
        { criterion: "Explains the relationship between strike price and current price for each", weight: 0.3, max_score: 30 },
        { criterion: "Connects delta magnitude to moneyness status", weight: 0.3, max_score: 30 },
      ],
    },
    targetObjectives: ["OBJ-001"],
    difficulty: 2,
    marketRegime: "sideways",
    qualityScore: 0.92,
  },
  // ── Level 1: Foundation — OBJ-002 (Intrinsic/Extrinsic Value) ──
  {
    levelNumber: 1,
    scenarioText:
      "You are working at a retail brokerage help desk and a client calls asking about the value breakdown of their MSFT options position. MSFT is currently trading at $420.75. The client holds the following positions: a long $400 call expiring in 45 days currently priced at $28.50 (bid $28.20, ask $28.80), and a long $430 put expiring in 45 days currently priced at $17.30 (bid $17.00, ask $17.60). Implied volatility on MSFT is 24%, and the VIX is at 14.8. The stock recently rallied from $395 to $420 over two weeks on strong cloud revenue guidance. The client wants to understand how much of each option's price is 'real' value versus time value, and whether the time value component justifies holding through expiration or selling now.",
    questionPrompt:
      "Calculate the intrinsic value and extrinsic (time) value for both the $400 call and the $430 put. Explain what each component represents and advise the client on how time decay might affect these values as expiration approaches.",
    marketData: {
      underlying: "MSFT",
      currentPrice: 420.75,
      iv: 0.24,
      ivRank: 30,
      daysToExpiration: 45,
      optionChain: [
        { strike: 400, type: "call", bid: 28.2, ask: 28.8, delta: 0.78, theta: -0.08, vega: 0.22 },
        { strike: 430, type: "put", bid: 17.0, ask: 17.6, delta: -0.62, theta: -0.09, vega: 0.24 },
      ],
    },
    rubric: {
      criteria: [
        { criterion: "Correctly calculates intrinsic value for both options", weight: 0.35, max_score: 35 },
        { criterion: "Correctly calculates extrinsic value for both options", weight: 0.35, max_score: 35 },
        { criterion: "Explains time decay impact and provides sound advice", weight: 0.3, max_score: 30 },
      ],
    },
    targetObjectives: ["OBJ-002"],
    difficulty: 3,
    marketRegime: "bull_quiet",
    qualityScore: 0.9,
  },
  // ── Level 2: Greeks Basics — OBJ-003 (Delta) ──
  {
    levelNumber: 2,
    scenarioText:
      "You are a trainee on a derivatives desk and your mentor asks you to evaluate the directional exposure of a client's NVDA options position. NVDA is trading at $875.00 after a strong AI-related news cycle. The client owns 10 contracts of the $850 call (delta 0.68, theta -0.42, vega 0.95) and is short 5 contracts of the $900 call (delta 0.35, theta -0.38, vega 0.88). Both expire in 21 days. Implied volatility is 42% with an IV rank of 65, reflecting elevated but not extreme vol. The stock moved up $30 yesterday and the client wants to understand how their portfolio value changes with further moves in the underlying. Each contract represents 100 shares.",
    questionPrompt:
      "Calculate the net delta exposure of the client's combined position in terms of equivalent shares. Explain what this delta tells us about the position's directional bias, and describe how the position's delta would change if NVDA moved up another $20 versus down $20.",
    marketData: {
      underlying: "NVDA",
      currentPrice: 875.0,
      iv: 0.42,
      ivRank: 65,
      daysToExpiration: 21,
      optionChain: [
        { strike: 850, type: "call", bid: 52.3, ask: 53.1, delta: 0.68, theta: -0.42, vega: 0.95 },
        { strike: 900, type: "call", bid: 22.5, ask: 23.3, delta: 0.35, theta: -0.38, vega: 0.88 },
      ],
    },
    rubric: {
      criteria: [
        { criterion: "Correctly calculates net delta in equivalent shares", weight: 0.35, max_score: 35 },
        { criterion: "Explains directional bias and P&L sensitivity to underlying moves", weight: 0.35, max_score: 35 },
        { criterion: "Describes how delta changes (gamma effect) with price movement", weight: 0.3, max_score: 30 },
      ],
    },
    targetObjectives: ["OBJ-003"],
    difficulty: 4,
    marketRegime: "bull_volatile",
    qualityScore: 0.93,
  },
  // ── Level 2: Greeks Basics — OBJ-004/OBJ-005 (Theta & Vega) ──
  {
    levelNumber: 2,
    scenarioText:
      "You manage a small options portfolio and hold two positions in AMZN, currently trading at $185.20. Position A is a long $185 straddle (long the $185 call at $6.40 and long the $185 put at $6.10) expiring in 7 days. Position B is a long $185 straddle (long the $185 call at $10.80 and long the $185 put at $10.50) expiring in 45 days. AMZN has an earnings announcement in 5 days. Current IV is 38% (IV rank 72). The 7-day options have theta of -0.28 per contract and vega of 0.12, while the 45-day options have theta of -0.11 per contract and vega of 0.32. You are concerned about the interplay between time decay and potential volatility crush after earnings.",
    questionPrompt:
      "Compare the theta and vega exposures of Position A versus Position B. Explain which position is more vulnerable to time decay over the next week, which benefits more from a volatility spike before earnings, and what happens to each position if IV drops by 10 percentage points after the earnings announcement.",
    marketData: {
      underlying: "AMZN",
      currentPrice: 185.2,
      iv: 0.38,
      ivRank: 72,
      daysToExpiration: 7,
      optionChain: [
        { strike: 185, type: "call", bid: 6.2, ask: 6.6, delta: 0.52, theta: -0.28, vega: 0.12 },
        { strike: 185, type: "put", bid: 5.9, ask: 6.3, delta: -0.48, theta: -0.28, vega: 0.12 },
        { strike: 185, type: "call", bid: 10.6, ask: 11.0, delta: 0.54, theta: -0.11, vega: 0.32 },
        { strike: 185, type: "put", bid: 10.3, ask: 10.7, delta: -0.46, theta: -0.11, vega: 0.32 },
      ],
    },
    rubric: {
      criteria: [
        { criterion: "Correctly compares theta exposure and identifies near-term straddle as more vulnerable", weight: 0.3, max_score: 30 },
        { criterion: "Correctly compares vega exposure and identifies far-term straddle as more sensitive to IV changes", weight: 0.3, max_score: 30 },
        { criterion: "Accurately describes IV crush impact on both positions with approximate dollar amounts", weight: 0.4, max_score: 40 },
      ],
    },
    targetObjectives: ["OBJ-004", "OBJ-005"],
    difficulty: 5,
    marketRegime: "sideways",
    qualityScore: 0.91,
  },
  // ── Level 3: Single-Leg Strategies — Covered Call ──
  {
    levelNumber: 3,
    scenarioText:
      "You are advising a conservative investor who owns 500 shares of JNJ purchased at $155.00. JNJ currently trades at $162.30 in a low-volatility environment (IV 18%, IV rank 22, VIX 13.5). The stock has been range-bound between $155 and $168 for the past three months. The investor generates $3,200/year in dividends from the position and wants to enhance income without taking on significant additional risk. The next ex-dividend date is in 6 weeks. Available call options expiring in 45 days include: $165 call at $1.85/$2.15 (delta 0.35), $170 call at $0.65/$0.90 (delta 0.15), and $175 call at $0.20/$0.40 (delta 0.05). The investor is willing to sell the shares at $170 or above but would prefer to keep them for the dividend.",
    questionPrompt:
      "Recommend a covered call strategy for this investor. Specify which strike you would sell and how many contracts. Explain the trade-offs between income generation and upside cap, calculate the maximum profit and breakeven, and address the dividend risk consideration.",
    marketData: {
      underlying: "JNJ",
      currentPrice: 162.3,
      iv: 0.18,
      ivRank: 22,
      daysToExpiration: 45,
      optionChain: [
        { strike: 165, type: "call", bid: 1.85, ask: 2.15, delta: 0.35, theta: -0.03, vega: 0.08 },
        { strike: 170, type: "call", bid: 0.65, ask: 0.9, delta: 0.15, theta: -0.02, vega: 0.05 },
        { strike: 175, type: "call", bid: 0.2, ask: 0.4, delta: 0.05, theta: -0.01, vega: 0.02 },
      ],
    },
    rubric: {
      criteria: [
        { criterion: "Selects appropriate strike with clear reasoning for the choice", weight: 0.3, max_score: 30 },
        { criterion: "Correctly calculates max profit, premium income, and breakeven", weight: 0.3, max_score: 30 },
        { criterion: "Discusses assignment risk near ex-dividend date for ITM calls", weight: 0.2, max_score: 20 },
        { criterion: "Evaluates income enhancement vs upside cap trade-off", weight: 0.2, max_score: 20 },
      ],
    },
    targetObjectives: ["OBJ-001", "OBJ-002"],
    difficulty: 4,
    marketRegime: "sideways",
    qualityScore: 0.94,
  },
  // ── Level 3: Single-Leg Strategies — Cash-Secured Put ──
  {
    levelNumber: 3,
    scenarioText:
      "You are an options-savvy investor who has been watching META, currently trading at $505.80. The stock recently pulled back 8% from its all-time high of $550 after a broader tech selloff, but fundamentals remain strong with revenue growing 22% year-over-year. IV has spiked to 34% (IV rank 78) due to the selloff. You have $50,000 in cash and would be happy to own 100 shares of META at a lower price. Available put options expiring in 30 days include: $480 put at $5.20/$5.80 (delta -0.22), $490 put at $8.40/$9.00 (delta -0.30), and $500 put at $13.50/$14.20 (delta -0.40). You want to generate income if the stock stabilizes, or acquire shares at a discount if it continues falling.",
    questionPrompt:
      "Design a cash-secured put strategy for this situation. Select a strike price, justify your choice, calculate the effective purchase price if assigned, determine the annualized return if the put expires worthless, and explain how elevated implied volatility benefits this strategy.",
    marketData: {
      underlying: "META",
      currentPrice: 505.8,
      iv: 0.34,
      ivRank: 78,
      daysToExpiration: 30,
      optionChain: [
        { strike: 480, type: "put", bid: 5.2, ask: 5.8, delta: -0.22, theta: -0.12, vega: 0.35 },
        { strike: 490, type: "put", bid: 8.4, ask: 9.0, delta: -0.3, theta: -0.15, vega: 0.4 },
        { strike: 500, type: "put", bid: 13.5, ask: 14.2, delta: -0.4, theta: -0.18, vega: 0.45 },
      ],
    },
    rubric: {
      criteria: [
        { criterion: "Selects appropriate strike and calculates capital requirement", weight: 0.25, max_score: 25 },
        { criterion: "Calculates effective purchase price if assigned", weight: 0.25, max_score: 25 },
        { criterion: "Calculates annualized return if put expires worthless", weight: 0.25, max_score: 25 },
        { criterion: "Explains how elevated IV increases premium income for put sellers", weight: 0.25, max_score: 25 },
      ],
    },
    targetObjectives: ["OBJ-001", "OBJ-002"],
    difficulty: 5,
    marketRegime: "bear_volatile",
    qualityScore: 0.91,
  },
];

export async function seed() {
  console.log("Seeding curriculum levels...");

  // Upsert curriculum levels (idempotent)
  for (const level of CURRICULUM_LEVELS) {
    const existing = await db
      .select()
      .from(curriculumLevels)
      .where(eq(curriculumLevels.levelNumber, level.levelNumber))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(curriculumLevels).values({
        levelNumber: level.levelNumber,
        name: level.name,
        description: level.description,
        prerequisiteLevel: level.levelNumber > 1 ? level.levelNumber - 1 : null,
        masteryThreshold: 80,
        minAttemptsRequired: 1,
      });
    }
  }

  console.log("Seeding skill objectives...");

  // Get level IDs by number
  const levels = await db.select().from(curriculumLevels);
  const levelMap = new Map(levels.map((l) => [l.levelNumber, l.id]));

  for (const obj of SKILL_OBJECTIVES) {
    const existing = await db
      .select()
      .from(skillObjectives)
      .where(eq(skillObjectives.code, obj.code))
      .limit(1);

    const levelId = levelMap.get(obj.levelNumber);
    if (!levelId) throw new Error(`Level ${obj.levelNumber} not found for ${obj.code}`);

    if (existing.length === 0) {
      await db.insert(skillObjectives).values({
        code: obj.code,
        name: obj.name,
        description: obj.description,
        studyGuide: obj.studyGuide,
        curriculumLevelId: levelId,
      });
    } else if (obj.studyGuide && !existing[0].studyGuide) {
      await db
        .update(skillObjectives)
        .set({ studyGuide: obj.studyGuide, updatedAt: new Date() })
        .where(eq(skillObjectives.code, obj.code));
    }
  }

  console.log("Seeding scenarios...");

  for (const s of SEED_SCENARIOS) {
    // Check existence by matching a substring of scenarioText
    const snippet = s.scenarioText.slice(0, 80);
    const existing = await db
      .select({ id: scenarios.id })
      .from(scenarios)
      .where(like(scenarios.scenarioText, `${snippet}%`))
      .limit(1);

    if (existing.length === 0) {
      const levelId = levelMap.get(s.levelNumber);
      if (!levelId) throw new Error(`Level ${s.levelNumber} not found for scenario`);
      await db.insert(scenarios).values({
        curriculumLevelId: levelId,
        scenarioText: s.scenarioText,
        questionPrompt: s.questionPrompt,
        marketData: s.marketData,
        rubric: s.rubric,
        targetObjectives: s.targetObjectives,
        difficulty: s.difficulty,
        marketRegime: s.marketRegime,
        generatedBy: "seed",
        isActive: true,
        qualityScore: s.qualityScore,
      });
    }
  }

  console.log("Seed complete!");
}

// Run if executed directly
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
