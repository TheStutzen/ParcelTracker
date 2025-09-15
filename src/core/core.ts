import { myParcel } from '../libs/parcel'
import Models from '../models'
import { IParcel } from '../models/parcels/interface'
import { IUser } from '../models/users/interface'
import { ITrackParcel, IWhereParcel } from './interface'

export class Core {
  async createUser(chatId: string): Promise<IUser> {
    const hasUser = await Models.UsersModel.getByChatId(chatId)

    if (hasUser) {
      return hasUser
    } else {
      return await Models.UsersModel.save({ chatId: chatId })
    }
  }

  async whereParcel(barcode: string): Promise<IWhereParcel> {
    const carrier = await myParcel.getCarrierParcel(barcode)

    if (!carrier) {
      return {
        ok: false,
        message: 'Указан не верный трек номер, либо данных ещё нет'
      }
    }

    const status = await myParcel.getStatusParcel(carrier, barcode)

    if (!status || status.error) {
      return {
        ok: false,
        message: status.error
          ? `Нет данных, ошибка: ${status.error}`
          : 'Нет данных о статусе посылки'
      }
    }

    return { ok: true, status }
  }

  async trackParcel(chatId: string, barcode: string): Promise<ITrackParcel> {
    const user = await Models.UsersModel.getByChatId(chatId)

    const parcelInDb = await Models.ParcelsModel.getByBarcode(barcode)

    if (parcelInDb)
      return { ok: true, message: 'Отслеживание посылки уже было начато' }

    const hasParcel = await this.whereParcel(barcode)

    if (!hasParcel.ok) return hasParcel

    const parcel = await Models.ParcelsModel.save({
      userId: user.userId,
      barcode,
      updatedAt: hasParcel.status.updatedAt
    })

    if (!parcel) return { ok: false, message: 'Неудалось добавить посылку' }

    return { ok: true, message: 'Отслеживание посылки начато' }
  }

  async getUser(chatId: string): Promise<IUser> {
    return await Models.UsersModel.getByChatId(chatId)
  }

  async getParcelsByUserId(userId: number): Promise<IParcel[]> {
    return await Models.ParcelsModel.getByUserId(userId)
  }
}
