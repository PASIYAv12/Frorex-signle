export const fmt = (n, dp = 5) => Number(n).toFixed(dp)

export const nowUTC = () => new Date().toISOString().replace('T',' ').replace('Z',' UTC')

export const isAdmin = (jid, admins) => admins.includes(jid)

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

export const buildSignalText = ({ side, symbol, price, sl, tp, tf, reasons }) => {
  const header = side === 'BUY' ? '🔥 BUY SIGNAL' : '🧊 SELL SIGNAL'
  const body = [
    `${header} – ${symbol}`,
    `Entry: ${fmt(price, 5)}`,
    `SL: ${fmt(sl, 5)} | TP: ${fmt(tp, 5)}`,
    `TF: ${tf}`,
    `Why: ${reasons.join(' • ')}`
  ].join('\n')
  return body
}
