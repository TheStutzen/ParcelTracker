import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitDb1757785564086 implements MigrationInterface {
  name = 'InitDb1757785564086'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`userId\` int NOT NULL AUTO_INCREMENT, \`chatId\` varchar(255) NOT NULL, \`dateCreate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_096d474fe7c1af7be472676250\` (\`chatId\`), PRIMARY KEY (\`userId\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `CREATE TABLE \`parcels\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`barcode\` varchar(256) NOT NULL, \`arrived\` tinyint NOT NULL DEFAULT '0', \`delivered\` tinyint NOT NULL DEFAULT '0', \`updatedAt\` bigint NOT NULL, UNIQUE INDEX \`IDX_ed3a1711093934e4b9c559876b\` (\`barcode\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_ed3a1711093934e4b9c559876b\` ON \`parcels\``
    )
    await queryRunner.query(`DROP TABLE \`parcels\``)
    await queryRunner.query(
      `DROP INDEX \`IDX_096d474fe7c1af7be472676250\` ON \`users\``
    )
    await queryRunner.query(`DROP TABLE \`users\``)
  }
}
