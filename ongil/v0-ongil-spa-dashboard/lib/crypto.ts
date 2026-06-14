// Server-only crypto helpers.
//
// - Passwords are hashed with scrypt + a per-user random salt (never stored in plaintext).
// - The health survey is encrypted at rest with AES-256-GCM using a server-side
//   key derived from ENCRYPTION_SECRET. The raw key never leaves the server, so
//   even someone with direct database access cannot read health data.
import "server-only"
import { randomBytes, scryptSync, timingSafeEqual, createCipheriv, createDecipheriv } from "crypto"
import type { HealthSurvey } from "@/lib/types"

function getEncryptionKey(): Buffer {
  // In production you MUST set ENCRYPTION_SECRET (see step-by-step guide).
  // When it is missing we fall back to a fixed dev key so the preview still
  // works, but data encrypted with the fallback is NOT secure — set the real
  // secret before going live.
  const secret = process.env.ENCRYPTION_SECRET ?? "ongil-dev-insecure-fallback-secret"
  if (!process.env.ENCRYPTION_SECRET) {
    console.log("[v0] ENCRYPTION_SECRET 미설정 - 개발용 임시 키를 사용 중입니다. 배포 전 반드시 설정하세요.")
  }
  // Derive a fixed 32-byte key from the secret (AES-256).
  return scryptSync(secret, "ongil-survey-salt-v1", 32)
}

// ── Password hashing (salted scrypt) ────────────────────────────────────────
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = scryptSync(password, salt, 64)
  const stored = Buffer.from(hash, "hex")
  if (candidate.length !== stored.length) return false
  return timingSafeEqual(candidate, stored)
}

// ── Survey encryption (AES-256-GCM) ─────────────────────────────────────────
export function encryptSurvey(survey: HealthSurvey): string {
  const key = getEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const plaintext = JSON.stringify(survey)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Store as iv:authTag:ciphertext (all hex).
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`
}

export function decryptSurvey(payload: string): HealthSurvey {
  const key = getEncryptionKey()
  const [ivHex, tagHex, dataHex] = payload.split(":")
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"))
  decipher.setAuthTag(Buffer.from(tagHex, "hex"))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()])
  return JSON.parse(decrypted.toString("utf8")) as HealthSurvey
}
