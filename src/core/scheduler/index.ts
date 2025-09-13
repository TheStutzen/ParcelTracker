import cron from 'node-cron'
import { TelegramBot } from '../../adapters/telegram'
import Models from '../../models'
import { core } from '..'

export class Scheduler {
  telegram: TelegramBot

  constructor(telegram: TelegramBot) {
    this.telegram = telegram

    cron.schedule('0 * * * *', async () => {
      await this.checkParcel()
    })
  }

  private async checkParcel() {
    const parcels = await Models.ParcelsModel.findAll()

    for (const parcel of parcels) {
      const response = await core.whereParcel(parcel.barcode)

      if (response.ok && response?.status?.updatedAt > parcel.updatedAt) {
        await Models.ParcelsModel.update({
          id: parcel.id,
          arrived: response.status.arrived,
          delivered: response.status.delivered,
          updatedAt: response.status.updatedAt
        })

        const user = await Models.UsersModel.getByUserId(parcel.userId)

        const statusIcons: Record<string, string> = {
          accepted: '📦',
          arrived: '📍',
          delivered: '✅',
          default: '🛫'
        }

        const date = new Date(
          response.status.events[0].eventDate
        ).toLocaleString('ru-RU')

        let icon = statusIcons.default
        if (response.status.events[0].accepted) icon = statusIcons.accepted
        if (response.status.events[0].arrived) icon = statusIcons.arrived
        if (response.status.events[0].delivered) icon = statusIcons.delivered

        const line = `${icon} ${date} — ${response.status.events[0].operation} (${response.status.events[0].location}, ${response.status.events[0].zipCode})\n`

        return await this.telegram.sendMessage(
          user.chatId,
          `Новый статус у посылки: ${line}`
        )
      }
    }
  }
}
