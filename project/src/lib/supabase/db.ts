import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from '../../../migrations/schema';
import * as customSchema from './schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
    console.log('🔴 no database URL');
}

const globalForPostgres = globalThis as unknown as {
    postgresClient: ReturnType<typeof postgres> | undefined;
};

const client =
    globalForPostgres.postgresClient ??
    postgres(process.env.DATABASE_URL as string, { max: 1 });

if (process.env.NODE_ENV !== 'production') {
    globalForPostgres.postgresClient = client;
}

const db = drizzle(client, { schema: { ...schema, ...customSchema } });

const migrateDb = async () => {
    try {
        console.log('🟠 Migrating client');
        await migrate(db, { migrationsFolder: 'migrations' });
        console.log('🟢 Successfully Migrated');
    } catch (error) {
        console.log('🔴 Error Migrating client', error);
    }
};
migrateDb();

export default db;