import { mariadbDataSource } from '../../db'
import { Users } from './entity/users.entity'
import { IUser } from './interface'

export class UsersModel {
  private usersRepository = mariadbDataSource.getRepository(Users)

  async save(user: Partial<Users>) {
    return await this.usersRepository.save({ chatId: user.chatId })
  }

  async getByChatId(chatId: string): Promise<IUser> {
    return await this.usersRepository
      .createQueryBuilder('users')
      .where('users.chatId = :chatId', { chatId })
      .getOne()
  }

  async getByUserId(userId: number): Promise<IUser> {
    return await this.usersRepository
      .createQueryBuilder('users')
      .where('users.userId = :userId', { userId })
      .getOne()
  }

  async findAll(): Promise<IUser[]> {
    return await this.usersRepository.createQueryBuilder('users').getMany()
  }
}
