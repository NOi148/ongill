"use client"

import { useState } from "react"
import { Field, Msg, TextInput } from "@/components/form-primitives"
import { Button } from "@/components/ui/button"
import { loginAction } from "@/app/actions/auth"
import type { Session } from "@/lib/types"
import { CheckCircle2, Eye, EyeOff, Footprints, Loader2 } from "lucide-react"

export function LoginView({
  onSuccess,
  onGoSignup,
}: {
  onSuccess: (session: Session) => void
  onGoSignup: () => void
}) {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<string | null>(null)

  async function handleLogin() {
    if (!userId || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.")
      return
    }
    setLoading(true)
    setError("")
    // Password is verified server-side (salted scrypt) before the encrypted survey is decrypted.
    const res = await loginAction({ userId, password })
    if (res.ok) {
      setSuccess(res.data.userId)
      // Show the senior-friendly success alert briefly, then enter the app.
      setTimeout(() => onSuccess(res.data), 1400)
    } else {
      setLoading(false)
      setError(res.error)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg">
          <Footprints size={40} />
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-primary">온길</h1>
        <p className="mt-2 text-lg text-muted-foreground text-balance">안전한 걸음, 건강한 일상을 함께합니다</p>
      </div>

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}
      >
        <Field label="아이디">
          <TextInput
            value={userId}
            autoCapitalize="none"
            placeholder="아이디 입력"
            onChange={(e) => setUserId(e.target.value)}
          />
        </Field>

        <Field label="비밀번호">
          <div className="relative">
            <TextInput
              type={showPw ? "text" : "password"}
              value={password}
              placeholder="비밀번호 입력"
              className="pr-14"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>
        </Field>

        {error && <Msg kind="error">{error}</Msg>}

        <Button type="submit" disabled={loading} className="h-16 w-full text-xl font-bold">
          {loading ? <Loader2 className="animate-spin" size={24} /> : "로그인"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onGoSignup}
          className="text-lg font-semibold text-primary underline-offset-4 hover:underline"
        >
          처음 오셨나요? 회원가입
        </button>
      </div>

      {/* Senior-friendly success alert overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-2xl">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-primary">
              <CheckCircle2 size={48} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-foreground text-balance">환영합니다, {success}님!</h2>
            <p className="mt-2 text-lg leading-relaxed text-muted-foreground">
              건강 정보를 안전하게 불러왔습니다.
              <br />
              잠시만 기다려 주세요...
            </p>
            <Loader2 className="mx-auto mt-5 animate-spin text-primary" size={28} />
          </div>
        </div>
      )}
    </div>
  )
}
