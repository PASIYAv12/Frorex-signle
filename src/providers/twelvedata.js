import axios from 'axios'
import { CONFIG } from '../config.js'

/**
 * Returns latest OHLC close array (numbers), most recent last.
 * TwelveData supports forex/crypto/stock. Free tier requires API key.
 */
export async function fetchCloses(symbol, limit = 200, interval = '15min') {
  const base = 'https://api.twelvedata.com/time_series'
  const params = new URLSearchParams({
    symbol,
    interval,
    outputsize: String(limit),
    apikey: CONFIG.KEYS.TWELVEDATA_API_KEY
  })
  const url = `${base}?${params.toString()}`
  const { data } = await axios.get(url, { timeout: 15000 })

  if (data?.status === 'error') {
    throw new Error(`TwelveData error: ${data?.message || 'unknown'}`)
  }
  const values = (data?.values || []).reverse() // oldest -> newest
  const closes = values.map(v => Number(v.close)).filter(n => Number.isFinite(n))
  return closes
}
