import { TelegramBot } from './adapters/telegram'
import { Scheduler } from './core/scheduler'
import { mariadbDataSource } from './db'

async function startServer() {
  await mariadbDataSource
    .initialize()
    .then(() => console.info('Database connected'))
    .catch((err) => console.error(err))

  const telegram = new TelegramBot()

  new Scheduler(telegram)
}

startServer().catch((err) => {
  console.error(err)
})
