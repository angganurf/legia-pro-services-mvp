import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as marketplaceSchema from './schema/marketplace';

export const db = drizzle(process.env.DATABASE_URL!);

export const schema = { ...authSchema, ...marketplaceSchema };

export type DatabaseType = typeof schema;