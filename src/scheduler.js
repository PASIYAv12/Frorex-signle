import cron from 'node-cron'
import { CONFIG } from './config.js'
import { getState } from './commands.js'
import { analyseSymbol } from './signalEngine.js'
import { buildSignalText, nowUTC } from './utils.js'

export function startScheduler(sendToGroup) {
  const spec = `*/${CONFIG.INTERVAL_MINUTES} * * * *`
  console.log(`⏱️ Scheduler every ${CONFIG.INTERVAL_MINUTES}m: cron "${spec}"`)
  const task = cron.schedule(spec, async () => {
    const { enabled, symbols } = getState()
    if (!enabled) {
      console.log(`[${nowUTC()}] Skipping (bot OFF)`)
      return
    }
    console.log(`[${nowUTC()}] Running analysis for: ${symbols.join(', ')}`)
    for (const symbol of symbols) {
      try {
        const res = await analyseSymbol(symbol)
        if (res.decision === 'HOLD') {
          continue
        }
        const text = buildSignalText({
          side: res.decision,
          symbol,
          price: res.price,
          sl: res.sl,
          tp: res.tp,
          tf: CONFIG.TIMEFRAME,
          reasons: res.reasons
        })
        await sendToGroup(text)
      } catch (e) {
        console.error(`Analyse ${symbol} failed:`, e.message)
      }
    }
  }, { scheduled: true })
  return task
}
