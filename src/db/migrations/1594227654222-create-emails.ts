import { MigrationInterface, QueryRunner } from 'typeorm';

export class createEmails1594227654222 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.query(`
      CREATE TABLE emails (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    queryRunner.query(`DROP TABLE emails`);
  }
}
