import { Telegraf, Markup } from 'telegraf'
import { core } from '../../core'

export class TelegramBot {
  private bot: Telegraf
  private userStates: Record<
    number,
    {
      step?: string
      origin?: string
      barcode?: string
    }
  > = {}

  constructor() {
    const token = process.env.TG_TOKEN
    if (!token) {
      throw new Error('Missing required environment variable: TG_TOKEN')
    }

    this.bot = new Telegraf(token)
    this.init()

    this.bot.catch((err) => {
      console.error('Oooops', err)
    })
  }

  async init() {
    this.bot.launch()
    console.log('🚀 Telegram bot started')

    this.bot.telegram.setMyCommands([
      {
        command: 'start',
        description: 'Начать пользоваться ботом для отслеживания посылок'
      },
      { command: 'me', description: 'Показать информацию о вас' }
    ])

    this.bot.command('start', async (ctx: any) => {
      await core.createUser(String(ctx.from.id))

      await ctx.reply(
        `Привет, ${ctx.from.first_name}! Рады тебя видеть!\nЭтот бот позволяет проверить где твоя посылка, а так же запустить её отслеживание.`
      )

      return await this.showMainMenu(ctx)
    })

    this.bot.command('me', (ctx: any) => {
      const { id, username, first_name, last_name } = ctx.from
      return ctx.reply(`Ваши данные:
      ID: ${id || '-'}
      UserName: ${username || '-'}
      FirstName: ${first_name || '-'}
      LastName: ${last_name || '-'}
      `)
    })

    this.bot.on('text', async (ctx: any) => {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('В главное меню', 'showMainMenu')]
      ])

      try {
        return await this.handleText(ctx)
      } catch (error) {
        console.error('Error handling message:', error)
        return await ctx.reply(
          'Произошла ошибка. Попробуйте еще раз позже.',
          keyboard
        )
      }
    })

    this.bot.action('showMainMenu', async (ctx: any) => {
      await ctx.answerCbQuery()
      try {
        await ctx.deleteMessage()
      } catch {}

      return await this.showMainMenu(ctx)
    })

    this.bot.action('showParcels', async (ctx: any) => {
      await ctx.answerCbQuery()
      try {
        await ctx.deleteMessage()
      } catch {}

      return await this.showParcels(ctx)
    })

    this.bot.action('whereParcel', async (ctx: any) => {
      await ctx.answerCbQuery()
      try {
        await ctx.deleteMessage()
      } catch {}

      await this.updateUserState(ctx.from.id, {
        step: 'awaitBarcode',
        origin: 'whereParcel'
      })

      return await ctx.reply(
        'Пожалуйста, введите трек номер посылки:',
        Markup.inlineKeyboard([
          [Markup.button.callback('🔙 Назад', 'showMainMenu')]
        ])
      )
    })

    this.bot.action('trackParcel', async (ctx: any) => {
      await ctx.answerCbQuery()
      try {
        await ctx.deleteMessage()
      } catch {}

      await this.updateUserState(ctx.from.id, {
        step: 'awaitBarcode',
        origin: 'trackParcel'
      })

      return await ctx.reply(
        'Пожалуйста, введите трек номер посылки:',
        Markup.inlineKeyboard([
          [Markup.button.callback('🔙 Назад', 'showMainMenu')]
        ])
      )
    })

    this.bot.action(/whereParcel_(.+)/, async (ctx: any) => {
      await ctx.answerCbQuery()
      try {
        await ctx.deleteMessage()
      } catch {}

      return await this.whereParcel(ctx, ctx.match[1])
    })

    this.bot.action(/beginTrackParcel_(.+)/, async (ctx: any) => {
      await ctx.answerCbQuery()
      try {
        await ctx.deleteMessage()
      } catch {}

      return await this.trackParcel(ctx, ctx.match[1])
    })

    this.bot.action(/confirnInput_(.+)/, async (ctx: any) => {
      await ctx.answerCbQuery()
      try {
        await ctx.deleteMessage()
      } catch {}

      switch (ctx.match[1]) {
        case 'barcode': {
          const userState = this.userStates[ctx.from.id]

          switch (userState.origin) {
            case 'whereParcel': {
              delete this.userStates[ctx.from.id]

              return await this.whereParcel(ctx, userState.barcode)
            }

            case 'trackParcel': {
              delete this.userStates[ctx.from.id]

              return await this.trackParcel(ctx, userState.barcode)
            }
          }
        }
      }
    })

    this.bot.action(/declineInput_(.+)/, async (ctx: any) => {
      await ctx.answerCbQuery()
      try {
        await ctx.deleteMessage()
      } catch {}

      switch (ctx.match[1]) {
        case 'barcode': {
          await this.updateUserState(ctx.from.id, { step: 'awaitBarcode' })

          return await ctx.reply('Пожалуйста, введите трек номер посылки:')
        }
      }
    })
  }

  private async showMainMenu(ctx: any) {
    const user = await core.getUser(ctx.from.id)
    const parcels = await core.getParcelsByUserId(user.userId)

    const keyboard: any[] = [
      [Markup.button.callback('Узнать где посылка', 'whereParcel')],
      [Markup.button.callback('Начать отслеживать посылку', 'trackParcel')]
    ]

    if (parcels.length) {
      keyboard.push([
        Markup.button.callback('📦 Показать мои посылки', 'showParcels')
      ])
    }

    return await ctx.reply('Главное меню:', Markup.inlineKeyboard(keyboard))
  }

  private async handleText(ctx: any) {
    const userId = ctx.from.id
    const userState = this.userStates[userId]

    if (!userState) return

    switch (userState.step) {
      case 'awaitBarcode': {
        if (ctx.message.text.length < 7) {
          await this.updateUserState(userId, { step: 'awaitBarcode' })

          return await ctx.reply(
            'Трек номер посылки не может быть меньше 7 символов, пожалуйста, повторите попытку ввода:'
          )
        }

        await this.updateUserState(userId, { barcode: ctx.message.text })

        return await ctx.reply(
          `Указанный трек номер: ${ctx.message.text}, верный?`,
          Markup.inlineKeyboard([
            [Markup.button.callback('Да', 'confirnInput_barcode')],
            [Markup.button.callback('Нет', 'declineInput_barcode')],
            [Markup.button.callback('В главное меню', 'showMainMenu')]
          ])
        )
      }
    }
  }

  private async updateUserState(
    chatId: number,
    newState: Partial<(typeof this.userStates)[number]>
  ) {
    const currentState = this.userStates[chatId]

    this.userStates[chatId] = { ...currentState, ...newState }
  }

  private async whereParcel(ctx: any, barcode: string) {
    const data = await core.whereParcel(barcode)

    if (!data.ok) {
      return await ctx.reply(data.message)
    }

    const statusIcons: Record<string, string> = {
      accepted: '📦',
      arrived: '📍',
      delivered: '✅',
      default: '🛫'
    }

    const maxLength = 4000
    const messages: string[] = []

    let currentText =
      `📦 Данные о посылке:\n\n` +
      `#️⃣ Трек номер: ${data.status.barcode}\n` +
      `🚚 Перевозчик: ${data.status.carrier.name}\n` +
      `🕒 В пути: ${data.status.deliveringTime} дней\n` +
      `⚖️ Вес: ${data.status.weight} кг.\n` +
      `📤 Отправитель: ${data.status.attributes.sender}\n` +
      `📥 Получатель: ${data.status.attributes.recipient}\n` +
      `📌 Тип: ${data.status.attributes.type}\n` +
      `💰 Объявленная ценность: ${data.status.attributes.insurance} руб.\n\n` +
      `📝 История:\n\n`

    for (const ev of data.status.events.sort(
      (a, b) => b.eventDate - a.eventDate
    )) {
      let icon = statusIcons.default
      if (ev.accepted) icon = statusIcons.accepted
      if (ev.arrived) icon = statusIcons.arrived
      if (ev.delivered) icon = statusIcons.delivered

      const date = new Date(ev.eventDate).toLocaleString('ru-RU')
      const line = `${icon} ${date} — ${ev.operation} (${ev.location}, ${ev.zipCode})\n`

      if (currentText.length + line.length > maxLength) {
        messages.push(currentText)
        currentText = line
      } else {
        currentText += line
      }
    }

    if (currentText.trim().length > 0) {
      messages.push(currentText)
    }

    for (const msg of messages) {
      await ctx.reply(msg)
    }

    return await ctx.reply(
      'Выбери действие:',
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            'Начать отслеживание посылки',
            `beginTrackParcel_${data.status.barcode}`
          )
        ],
        [Markup.button.callback('🔙 Назад', 'showParcels')],
        [Markup.button.callback('🏠 В главное меню', 'showMainMenu')]
      ])
    )
  }

  private async trackParcel(ctx: any, barcode: string) {
    const data = await core.trackParcel(ctx.from.id, barcode)

    return await ctx.reply(
      data.message,
      Markup.inlineKeyboard([
        [Markup.button.callback('🏠 В главное меню', 'showMainMenu')]
      ])
    )
  }

  private async showParcels(ctx: any) {
    const user = await core.getUser(ctx.from.id)
    const parcels = await core.getParcelsByUserId(user.userId)

    const keyboard = Markup.inlineKeyboard([
      ...parcels.map((parcel: any) => [
        Markup.button.callback(
          `${parcel.barcode}`,
          `whereParcel_${parcel.barcode}`
        )
      ]),
      [Markup.button.callback('🏠 В главное меню', 'showMainMenu')]
    ])

    return await ctx.reply(
      'Выберите нужную посылку, чтобы узнать подробнее информацию о ней:',
      keyboard
    )
  }

  async sendMessage(chatId: string, message: any) {
    return await this.bot.telegram.sendMessage(chatId, message)
  }
}
