import { CONFIG } from './config.js'
import { generateDecision } from './indicators.js'
import { fetchCloses as fetchTD } from './providers/twelvedata.js'
import { fetchCloses as fetchDummy } from './providers/dummy.js'
import { clamp } from './utils.js'

function pickProvider() {
  switch (CONFIG.PROVIDER) {
    case 'twelvedata': return fetchTD
    case 'dummy': return fetchDummy
    default: return fetchTD
  }
}

export async function analyseSymbol(symbol) {
  const fetcher = pickProvider()
  const closes = await fetcher(symbol, CONFIG.CANDLES, CONFIG.TIMEFRAME)
  const { decision, reasons, lastClose } = generateDecision(closes, CONFIG.STRAT)
  if (decision === 'HOLD') return { decision, reasons, price: lastClose }

  // Basic SL/TP logic: SL 0.5% away, TP 1% away (adjust metals vs forex if needed)
  const price = lastClose
  const pctSL = 0.005
  const pctTP = 0.01
  const sl = decision === 'BUY' ? price * (1 - pctSL) : price * (1 + pctSL)
  const tp = decision === 'BUY' ? price * (1 + pctTP) : price * (1 - pctTP)

  return {
    decision,
    reasons,
    price,
    sl: clamp(sl, 0.00001, Number.MAX_SAFE_INTEGER),
    tp: clamp(tp, 0.00001, Number.MAX_SAFE_INTEGER)
  }
}
