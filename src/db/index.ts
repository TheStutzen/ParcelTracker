import { DataSource } from 'typeorm'

export const mariadbDataSource = new DataSource({
  type: (process.env.TYPE as any) ?? 'mariadb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) ?? 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  logging: process.env.DEBUG === 'true',
  synchronize: false,
  migrationsRun: true,
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/../db/migrations/*{.ts,.js}'],
  extra: {
    charset: 'utf8mb4_unicode_ci'
  }
})
