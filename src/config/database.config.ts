import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const envName = process.env.NODE_ENV || 'development';
const databaseName = `mixin-example_${envName}.sqlite3`;

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: `src/db/${databaseName}`,
  synchronize: false,
  migrationsRun: false,
  logging: envName !== 'test',
  entities: ['dist/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  migrations: ['dist/src/db/migrations/**/*.js'],
  cli: {
    migrationsDir: 'src/db/migrations',
  },
};
