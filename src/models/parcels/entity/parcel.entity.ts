import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'parcels' })
export class Parcel {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column({ type: 'varchar', length: 256, nullable: false, unique: true })
  barcode: string

  @Column({ type: 'tinyint', default: 0 })
  arrived: boolean

  @Column({ type: 'tinyint', default: 0 })
  delivered: boolean

  @Column({ type: 'bigint', nullable: false })
  updatedAt: number
}
