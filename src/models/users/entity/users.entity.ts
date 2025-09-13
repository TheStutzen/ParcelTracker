import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn()
  userId: number

  @Column({ nullable: false, unique: true })
  chatId: string

  @CreateDateColumn()
  dateCreate: Date
}
