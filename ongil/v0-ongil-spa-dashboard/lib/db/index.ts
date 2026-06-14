// Drizzle client over a shared pg Pool, connected to Neon Postgres.
// DATABASE_URL is auto-provisioned by the Neon integration.
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// The Neon integration exposes the connection string under several names.
// Accept any of them so the app works regardless of which one is present.
const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING

const globalForDb = globalThis as unknown as { __ONGIL_POOL__?: Pool }

function createPool() {
  if (!connectionString) {
    console.log("[v0] DATABASE_URL이 없습니다. Neon 연결 문자열 환경변수를 확인하세요.")
  }
  return new Pool({ connectionString })
}

export const pool = globalForDb.__ONGIL_POOL__ ?? createPool()

// Only cache the pool when we actually have a connection string, so a pool
// built from a missing URL is never reused after the env var becomes available.
if (process.env.NODE_ENV !== "production" && connectionString) {
  globalForDb.__ONGIL_POOL__ = pool
}

export const db = drizzle(pool, { schema })
