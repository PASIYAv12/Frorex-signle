import { isAdmin } from './utils.js'
import { CONFIG } from './config.js'

const state = {
  enabled: true,
  symbols: new Set(CONFIG.SYMBOLS)
}

export function getState() {
  return {
    enabled: state.enabled,
    symbols: [...state.symbols]
  }
}

export function parseText(msg) {
  const t = msg?.message?.conversation ||
            msg?.message?.extendedTextMessage?.text ||
            ''
  return t.trim()
}

export async function handleCommand(sock, msg, sendToGroup, analyseFn) {
  const from = msg.key.participant || msg.key.remoteJid
  const chat = msg.key.remoteJid
  const text = parseText(msg)
  const lower = text.toLowerCase()

  // Admin only commands
  const admin = isAdmin(from, CONFIG.ADMINS)

  if (admin && lower === '!on') {
    state.enabled = true
    return sock.sendMessage(chat, { text: '✅ Bot turned ON' })
  }
  if (admin && lower === '!off') {
    state.enabled = false
    return sock.sendMessage(chat, { text: '🛑 Bot turned OFF' })
  }
  if (admin && lower.startsWith('!add ')) {
    const sym = text.split(' ')[1]?.toUpperCase()
    if (sym) {
      state.symbols.add(sym)
      return sock.sendMessage(chat, { text: `➕ Added ${sym}` })
    }
  }
  if (admin && lower.startsWith('!remove ')) {
    const sym = text.split(' ')[1]?.toUpperCase()
    if (sym && state.symbols.delete(sym)) {
      return sock.sendMessage(chat, { text: `➖ Removed ${sym}` })
    }
  }
  if (admin && (lower.startsWith('!buy ') || lower.startsWith('!sell '))) {
    // Manual signal: !buy XAUUSD 1925 SL 1915 TP 1935
    const parts = text.split(/\s+/)
    const side = parts[0].toUpperCase().replace('!','')
    const symbol = parts[1]?.toUpperCase()
    const entry = Number(parts[2])
    const slIdx = parts.findIndex(p => p.toUpperCase() === 'SL')
    const tpIdx = parts.findIndex(p => p.toUpperCase() === 'TP')
    const sl = slIdx > -1 ? Number(parts[slIdx+1]) : null
    const tp = tpIdx > -1 ? Number(parts[tpIdx+1]) : null

    if (!symbol || !entry || !sl || !tp) {
      return sock.sendMessage(chat, { text: 'Usage: !buy SYMBOL ENTRY SL SLPRICE TP TPPRICE' })
    }
    const msgTxt = `🔔 Manual ${side} – ${symbol}\nEntry: ${entry}\nSL: ${sl} | TP: ${tp}`
    await sendToGroup(msgTxt)
    return sock.sendMessage(chat, { text: '✅ Sent to group' })
  }

  if (lower === '!status') {
    const { enabled, symbols } = getState()
    return sock.sendMessage(chat, {
      text: `Bot: ${enabled ? 'ON ✅' : 'OFF 🛑'}\nSymbols: ${symbols.join(', ')}\nInterval: ${CONFIG.INTERVAL_MINUTES}m`
    })
  }

  if (lower === '!help') {
    return sock.sendMessage(chat, {
      text:
`Commands:
!status
!help
(Admin) !on | !off
(Admin) !add SYMBOL
(Admin) !remove SYMBOL
(Admin) !buy SYMBOL ENTRY SL SLPRICE TP TPPRICE
Example: !buy XAUUSD 1925 SL 1915 TP 1935`
    })
  }
}
