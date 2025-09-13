import { mariadbDataSource } from '../../db'
import { Parcel } from './entity/parcel.entity'
import { IParcel, IParcelSave, IParcelUpdate } from './interface'

export class ParcelsModel {
  private parcelsRepository = mariadbDataSource.getRepository(Parcel)

  async save(parcel: IParcelSave): Promise<IParcel> {
    const hasParcel = await this.getByBarcode(parcel.barcode)

    if (hasParcel) return hasParcel

    return await this.parcelsRepository.save(parcel)
  }

  async getById(id: number): Promise<IParcel> {
    return await this.parcelsRepository
      .createQueryBuilder('parcel')
      .where('parcel.id = :id', { id })
      .getOne()
  }

  async getByBarcode(barcode: string): Promise<IParcel> {
    return await this.parcelsRepository
      .createQueryBuilder('parcel')
      .where('parcel.barcode = :barcode', { barcode })
      .getOne()
  }

  async getByUserId(userId: number): Promise<IParcel[]> {
    return await this.parcelsRepository
      .createQueryBuilder('parcel')
      .where('parcel.userId = :userId', { userId })
      .andWhere('parcel.delivered = :delivered', { delivered: false })
      .getMany()
  }

  async findAll(): Promise<IParcel[]> {
    return await this.parcelsRepository
      .createQueryBuilder('parcel')
      .where('parcel.delivered = :delivered', { delivered: false })
      .getMany()
  }

  async update(parcel: IParcelUpdate) {
    return await this.parcelsRepository.update(parcel.id, parcel)
  }
}
