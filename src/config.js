import 'dotenv/config'

export const CONFIG = {
  GROUP_ID: process.env.WHATSAPP_GROUP_ID?.trim(),
  ADMINS: (process.env.ADMINS || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)
    .map(n => `${n}@s.whatsapp.net`), // normalize JIDs
  INTERVAL_MINUTES: parseInt(process.env.INTERVAL_MINUTES || '15', 10),
  SYMBOLS: (process.env.SYMBOLS || 'XAUUSD').split(',').map(s => s.trim().toUpperCase()),
  STRAT: {
    EMA_FAST: parseInt(process.env.EMA_FAST || '9', 10),
    EMA_SLOW: parseInt(process.env.EMA_SLOW || '21', 10),
    RSI_PERIOD: parseInt(process.env.RSI_PERIOD || '14', 10),
    RSI_BUY: parseInt(process.env.RSI_BUY || '30', 10),
    RSI_SELL: parseInt(process.env.RSI_SELL || '70', 10),
    MACD_FAST: parseInt(process.env.MACD_FAST || '12', 10),
    MACD_SLOW: parseInt(process.env.MACD_SLOW || '26', 10),
    MACD_SIGNAL: parseInt(process.env.MACD_SIGNAL || '9', 10)
  },
  CANDLES: parseInt(process.env.CANDLES || '200', 10),
  PROVIDER: (process.env.PROVIDER || 'twelvedata').toLowerCase(),
  TIMEFRAME: process.env.TIMEFRAME || '15min',
  KEYS: {
    TWELVEDATA_API_KEY: process.env.TWELVEDATA_API_KEY || ''
  }
}
