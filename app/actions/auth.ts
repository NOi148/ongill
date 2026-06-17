"use server"

// Server actions for 온길 (Ongil) auth + health storage.
// These run on the server, talk to Supabase Postgres, and encrypt the
// health survey at rest. Because data lives in a central database, a user who
// signs up in one browser can log in from any other browser or device.
import { supabase } from "@/lib/supabase-server"
import { hashPassword, verifyPassword, encryptSurvey, decryptSurvey } from "@/lib/crypto"
import type { HealthSurvey, Session } from "@/lib/types"

export interface ApiOk<T> {
  ok: true
  data: T
}
export interface ApiErr {
  ok: false
  error: string
}
export type ApiResult<T> = ApiOk<T> | ApiErr

// Check whether an ID is still available (case-insensitive).
export async function checkIdAction(userId: string): Promise<ApiResult<{ available: boolean }>> {
  try {
    const key = userId.toLowerCase()
    const { data, error } = await supabase
      .from("app_users")
      .select("id")
      .eq("user_id_lower", key)
      .limit(1)

    if (error) {
      console.log("[v0] checkIdAction error:", error.message)
      return { ok: false, error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }
    }

    return { ok: true, data: { available: data.length === 0 } }
  } catch (e) {
    console.log("[v0] checkIdAction error:", (e as Error).message)
    return { ok: false, error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }
  }
}

// Register a new user with an encrypted survey.
export async function signupAction(params: {
  userId: string
  password: string
  survey: HealthSurvey
}): Promise<ApiResult<{ userId: string }>> {
  try {
    const key = params.userId.toLowerCase()

    // Check for existing user
    const { data: existing } = await supabase
      .from("app_users")
      .select("id")
      .eq("user_id_lower", key)
      .limit(1)

    if (existing && existing.length > 0) {
      return { ok: false, error: "이미 사용 중인 아이디입니다." }
    }

    const { hash, salt } = hashPassword(params.password)
    const encryptedSurvey = encryptSurvey(params.survey)

    const { error } = await supabase
      .from("app_users")
      .insert({
        user_id: params.userId,
        user_id_lower: key,
        password_hash: hash,
        password_salt: salt,
        encrypted_survey: encryptedSurvey,
      })

    if (error) {
      console.log("[v0] signupAction error:", error.message)
      return { ok: false, error: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." }
    }

    return { ok: true, data: { userId: params.userId } }
  } catch (e) {
    console.log("[v0] signupAction error:", (e as Error).message)
    return { ok: false, error: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." }
  }
}

// Authenticate and return the decrypted session.
export async function loginAction(params: {
  userId: string
  password: string
}): Promise<ApiResult<Session>> {
  try {
    const key = params.userId.toLowerCase()
    const { data: rows, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("user_id_lower", key)
      .limit(1)

    if (error) {
      console.log("[v0] loginAction error:", error.message)
      return { ok: false, error: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요." }
    }

    const record = rows?.[0]
    if (!record) {
      return { ok: false, error: "존재하지 않는 아이디입니다." }
    }

    if (!verifyPassword(params.password, record.password_hash, record.password_salt)) {
      return { ok: false, error: "비밀번호가 일치하지 않습니다." }
    }

    const survey = decryptSurvey(record.encrypted_survey)
    const session: Session = {
      userId: record.user_id,
      survey,
      emergencyContact: record.emergency_contact ?? undefined,
    }
    return { ok: true, data: session }
  } catch (e) {
    console.log("[v0] loginAction error:", (e as Error).message)
    return { ok: false, error: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요." }
  }
}

// Persist an emergency contact for an existing user.
export async function updateEmergencyContactAction(
  userId: string,
  contact: string,
): Promise<ApiResult<{ contact: string }>> {
  try {
    const key = userId.toLowerCase()
    const { data, error } = await supabase
      .from("app_users")
      .update({ emergency_contact: contact })
      .eq("user_id_lower", key)
      .select("id")

    if (error) {
      console.log("[v0] updateEmergencyContactAction error:", error.message)
      return { ok: false, error: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요." }
    }

    if (!data || data.length === 0) {
      return { ok: false, error: "사용자를 찾을 수 없습니다." }
    }

    return { ok: true, data: { contact } }
  } catch (e) {
    console.log("[v0] updateEmergencyContactAction error:", (e as Error).message)
    return { ok: false, error: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요." }
  }
}
