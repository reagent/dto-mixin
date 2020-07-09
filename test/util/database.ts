import { Connection } from 'typeorm';

export async function truncateAll(connection: Connection): Promise<void> {
  for (const entity of connection.entityMetadatas) {
    const repository = connection.getRepository(entity.name);
    // SQLite uses `DELETE FROM` instead of `TRUNCATE ... CASCADE;`
    await repository.query(`DELETE FROM ${entity.tableName}`);
  }
}
