// mockBackendAPI — a simulated asynchronous backend service.
//
// Goal: emulate a *global* cloud database so that a user who signs up in one
// browser can log in from any other browser/device. Because v0 previews run in
// an isolated sandbox without a real server, we persist the virtual DB to a
// module-level singleton and mirror it into a globally shared store. In a real
// deployment this module would be swapped for actual fetch() calls — the public
// API surface (signup / checkId / login / updateEmergencyContact) stays identical.

import CryptoJS from "crypto-js"
import type { HealthSurvey, Session, UserRecord } from "./types"

// A fixed app-level secret used for the AES "encryption simulation".
const AES_SECRET = "ongil-secure-health-vault-2026"

// ── Simulated cloud database ────────────────────────────────────────────────
// We attach to globalThis so hot-reloads / multiple module instances share it,
// emulating a single remote source of truth.
interface CloudState {
  users: Record<string, UserRecord>
}

const STORE_KEY = "__ONGIL_MOCK_GLOBAL_DB__"

function getCloud(): CloudState {
  const g = globalThis as unknown as Record<string, CloudState | undefined>
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { users: {} }
  }
  return g[STORE_KEY] as CloudState
}

// MOCK_GLOBAL_DB — exposed reference to the centralized virtual database.
export const MOCK_GLOBAL_DB = getCloud()

// Simulate remote network latency.
function latency<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ── Crypto helpers ──────────────────────────────────────────────────────────
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex)
}

function encryptSurvey(survey: HealthSurvey): string {
  return CryptoJS.AES.encrypt(JSON.stringify(survey), AES_SECRET).toString()
}

function decryptSurvey(cipher: string): HealthSurvey {
  const bytes = CryptoJS.AES.decrypt(cipher, AES_SECRET)
  const json = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(json) as HealthSurvey
}

// ── API result types ─────────────────────────────────────────────────────────
export interface ApiOk<T> {
  ok: true
  data: T
}
export interface ApiErr {
  ok: false
  error: string
}
export type ApiResult<T> = ApiOk<T> | ApiErr

// ── Public API ────────────────────────────────────────────────────────────────
export const mockBackendAPI = {
  // Verify ID uniqueness against the global DB.
  async checkId(userId: string): Promise<ApiResult<{ available: boolean }>> {
    const cloud = getCloud()
    const exists = Boolean(cloud.users[userId.toLowerCase()])
    return latency({ ok: true, data: { available: !exists } }, 600)
  },

  // Commit a new user + encrypted survey to the global DB.
  async signup(params: {
    userId: string
    password: string
    survey: HealthSurvey
  }): Promise<ApiResult<{ userId: string }>> {
    const cloud = getCloud()
    const key = params.userId.toLowerCase()
    if (cloud.users[key]) {
      return latency({ ok: false, error: "이미 사용 중인 아이디입니다." })
    }
    const record: UserRecord = {
      userId: params.userId,
      passwordHash: hashPassword(params.password),
      encryptedSurvey: encryptSurvey(params.survey),
      createdAt: Date.now(),
    }
    cloud.users[key] = record
    return latency({ ok: true, data: { userId: params.userId } }, 900)
  },

  // Authenticate and return a decrypted session.
  async login(params: { userId: string; password: string }): Promise<ApiResult<Session>> {
    const cloud = getCloud()
    const key = params.userId.toLowerCase()
    const record = cloud.users[key]
    if (!record) {
      return latency({ ok: false, error: "존재하지 않는 아이디입니다." })
    }
    if (record.passwordHash !== hashPassword(params.password)) {
      return latency({ ok: false, error: "비밀번호가 일치하지 않습니다." })
    }
    const survey = decryptSurvey(record.encryptedSurvey)
    const session: Session = {
      userId: record.userId,
      survey,
      emergencyContact: record.emergencyContact,
    }
    return latency({ ok: true, data: session }, 900)
  },

  // Persist an emergency contact for an existing user.
  async updateEmergencyContact(userId: string, contact: string): Promise<ApiResult<{ contact: string }>> {
    const cloud = getCloud()
    const key = userId.toLowerCase()
    const record = cloud.users[key]
    if (!record) return latency({ ok: false, error: "사용자를 찾을 수 없습니다." })
    record.emergencyContact = contact
    return latency({ ok: true, data: { contact } }, 500)
  },
}
