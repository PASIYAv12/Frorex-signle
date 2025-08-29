import { startWhatsApp } from './whatsapp.js'
import { handleCommand } from './commands.js'
import { startScheduler } from './scheduler.js'
import { analyseSymbol } from './signalEngine.js'
import { CONFIG } from './config.js'

async function main() {
  console.log('🚀 Starting WhatsApp Forex/Gold Signal Bot')
  console.log(`Group: ${CONFIG.GROUP_ID}`)
  console.log(`Admins: ${CONFIG.ADMINS.join(', ')}`)

  const { sendToGroup, sock } = await startWhatsApp((sock, msg) =>
    handleCommand(sock, msg, sendToGroup, analyseSymbol)
  )

  startScheduler(sendToGroup)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
