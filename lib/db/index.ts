import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

export function hasDatabase() {
  return Boolean(connectionString)
}

export function getDb() {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool =
    globalForDb.pool ??
    new Pool({
      connectionString,
      ssl:
        connectionString.includes('localhost') ||
        connectionString.includes('127.0.0.1')
          ? undefined
          : { rejectUnauthorized: false },
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.pool = pool
  }

  return drizzle(pool, { schema })
}
