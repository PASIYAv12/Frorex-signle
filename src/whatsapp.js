import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@adiwajshing/baileys'
import pino from 'pino'
import { CONFIG } from './config.js'

export async function startWhatsApp(onMessage) {
  const { state, saveCreds } = await useMultiFileAuthState('./data')
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update || {}
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        startWhatsApp(onMessage) // auto-reconnect
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp connected')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0]
    if (!m || m.key.fromMe) return
    await onMessage(sock, m)
  })

  // Helper: send text to group
  async function sendToGroup(text) {
    if (!CONFIG.GROUP_ID) throw new Error('GROUP_ID missing')
    await sock.sendMessage(CONFIG.GROUP_ID, { text })
  }

  return { sock, sendToGroup }
}
