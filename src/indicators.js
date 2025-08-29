import { EMA, RSI, MACD } from 'technicalindicators'

export function computeIndicators(closes, cfg) {
  const emaFast = EMA.calculate({ period: cfg.EMA_FAST, values: closes })
  const emaSlow = EMA.calculate({ period: cfg.EMA_SLOW, values: closes })
  const rsi = RSI.calculate({ period: cfg.RSI_PERIOD, values: closes })
  const macd = MACD.calculate({
    fastPeriod: cfg.MACD_FAST,
    slowPeriod: cfg.MACD_SLOW,
    signalPeriod: cfg.MACD_SIGNAL,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
    values: closes
  })

  return { emaFast, emaSlow, rsi, macd }
}

export function generateDecision(closes, cfg) {
  if (closes.length < Math.max(cfg.EMA_SLOW, cfg.RSI_PERIOD, cfg.MACD_SLOW) + 5) {
    return { decision: 'HOLD', reasons: ['Not enough data'] }
  }

  const { emaFast, emaSlow, rsi, macd } = computeIndicators(closes, cfg)

  const lastClose = closes[closes.length - 1]
  const lastEmaFast = emaFast[emaFast.length - 1]
  const lastEmaSlow = emaSlow[emaSlow.length - 1]
  const lastRsi = rsi[rsi.length - 1]
  const lastMacd = macd[macd.length - 1] || {}

  const reasons = []

  // Signals
  const emaBull = lastEmaFast > lastEmaSlow
  const emaBear = lastEmaFast < lastEmaSlow
  const rsiOversold = lastRsi <= cfg.RSI_BUY
  const rsiOverbought = lastRsi >= cfg.RSI_SELL
  const macdBull = (lastMacd.MACD || 0) > (lastMacd.signal || 0)
  const macdBear = (lastMacd.MACD || 0) < (lastMacd.signal || 0)

  if (emaBull && rsiOversold && macdBull) {
    reasons.push('EMA9>EMA21', `RSI<=${cfg.RSI_BUY}`, 'MACD>Signal')
    return { decision: 'BUY', reasons, lastClose }
  }

  if (emaBear && rsiOverbought && macdBear) {
    reasons.push('EMA9<EMA21', `RSI>=${cfg.RSI_SELL}`, 'MACD<Signal')
    return { decision: 'SELL', reasons, lastClose }
  }

  reasons.push('No strong confluence')
  return { decision: 'HOLD', reasons, lastClose }
}
