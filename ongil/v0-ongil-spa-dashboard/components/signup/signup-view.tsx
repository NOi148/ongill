"use client"

import { useMemo, useState } from "react"
import { ChoiceCard, Field, Msg, TextInput } from "@/components/form-primitives"
import { HealthSurveyStep } from "./health-survey-step"
import { checkIdAction, signupAction } from "@/app/actions/auth"
import { emptySurvey, type HealthSurvey } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const ID_RE = /^[a-zA-Z][a-zA-Z0-9]*$/
const PW_RE = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#^*]).{8,}$/

type IdStatus = "idle" | "checking" | "available" | "taken" | "invalid"

export function SignupView({
  onComplete,
  onGoLogin,
}: {
  onComplete: (userId: string) => void
  onGoLogin: () => void
}) {
  const [step, setStep] = useState(1)

  // Step 1 state
  const [userId, setUserId] = useState("")
  const [idStatus, setIdStatus] = useState<IdStatus>("idle")
  const [idTouched, setIdTouched] = useState(false)
  const [password, setPassword] = useState("")
  const [pwFocused, setPwFocused] = useState(false)
  const [pwTouched, setPwTouched] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [consent, setConsent] = useState(false)

  // Step 3 survey (Step 2 metrics live inside the same survey.body)
  const [survey, setSurvey] = useState<HealthSurvey>(emptySurvey())

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // ── Validation ──────────────────────────────────────────────────────────
  const idValidFormat = ID_RE.test(userId)
  const pwValid = PW_RE.test(password)
  const confirmValid = confirm.length > 0 && confirm === password

  function handleIdChange(v: string) {
    setUserId(v)
    setIdStatus(v === "" ? "idle" : ID_RE.test(v) ? "idle" : "invalid")
  }

  async function checkDuplicate() {
    if (!idValidFormat) {
      setIdStatus("invalid")
      return
    }
    setIdStatus("checking")
    const res = await checkIdAction(userId)
    if (res.ok) {
      setIdStatus(res.data.available ? "available" : "taken")
    }
  }

  const step1Valid = idStatus === "available" && pwValid && confirmValid && consent

  // Step 2 (body metrics)
  const { age, gender, height, weight } = survey.body
  const bmi = useMemo(() => {
    const h = Number.parseFloat(height) / 100
    const w = Number.parseFloat(weight)
    if (!h || !w || h <= 0) return null
    return w / (h * h)
  }, [height, weight])

  const bmiCategory = useMemo(() => {
    if (bmi == null) return ""
    if (bmi < 18.5) return "저체중"
    if (bmi < 23) return "정상"
    if (bmi < 25) return "과체중"
    return "비만"
  }, [bmi])

  const step2Valid =
    age.trim() !== "" && gender !== "" && Number.parseFloat(height) > 0 && Number.parseFloat(weight) > 0

  function setBody<K extends keyof HealthSurvey["body"]>(key: K, value: HealthSurvey["body"][K]) {
    setSurvey((p) => ({ ...p, body: { ...p.body, [key]: value } }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError("")
    const res = await signupAction({ userId, password, survey })
    setSubmitting(false)
    if (res.ok) {
      onComplete(res.data.userId)
    } else {
      setSubmitError(res.error)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8">
      {/* Brand + progress */}
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">온길</h1>
        <p className="mt-1 text-lg text-muted-foreground">안전한 걸음을 위한 건강 등록</p>
        <div className="mt-5 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold",
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {step > s ? <Check size={18} /> : s}
              </div>
              {s < 3 && <div className={cn("h-1.5 flex-1 rounded-full", step > s ? "bg-primary" : "bg-muted")} />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-base font-semibold text-foreground">
          {step === 1 && "1단계 · 계정 설정 및 인증"}
          {step === 2 && "2단계 · 기본 신체 정보"}
          {step === 3 && "3단계 · 건강 설문 (7개 항목)"}
        </p>
      </header>

      <main className="flex-1">
        {/* ───────────── STEP 1 ───────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <Field
              label="아이디"
              required
              hint={
                idStatus === "invalid" ? (
                  <Msg kind="error">영문으로 시작하고 영문·숫자만 사용할 수 있습니다 (특수문자 불가).</Msg>
                ) : idStatus === "available" ? (
                  <Msg kind="success">사용 가능한 아이디입니다. ✔</Msg>
                ) : idStatus === "taken" ? (
                  <Msg kind="error">이미 사용 중인 아이디입니다.</Msg>
                ) : idStatus === "checking" ? (
                  <Msg kind="info">확인 중입니다...</Msg>
                ) : idTouched && userId !== "" ? (
                  <Msg kind="warning">[중복 확인] 버튼을 눌러 승인받아 주세요.</Msg>
                ) : null
              }
            >
              <div className="flex gap-2">
                <TextInput
                  value={userId}
                  placeholder="영문으로 시작 (예: hong123)"
                  autoCapitalize="none"
                  onChange={(e) => handleIdChange(e.target.value)}
                  onBlur={() => setIdTouched(true)}
                />
                <Button
                  type="button"
                  onClick={checkDuplicate}
                  disabled={!idValidFormat || idStatus === "checking"}
                  className="h-14 shrink-0 px-5 text-base font-bold"
                >
                  {idStatus === "checking" ? <Loader2 className="animate-spin" size={20} /> : "중복 확인"}
                </Button>
              </div>
            </Field>

            <Field
              label="비밀번호"
              required
              hint={
                pwFocused && !pwTouched ? (
                  <Msg kind="info">영문, 숫자, 특수문자(!@#^*)를 포함해 8자 이상 입력해 주세요.</Msg>
                ) : pwTouched && !pwValid ? (
                  <Msg kind="error">조건을 만족하지 않습니다. 영문·숫자·특수문자(!@#^*) 8자 이상.</Msg>
                ) : pwValid ? (
                  <Msg kind="success">안전한 비밀번호입니다. ✔</Msg>
                ) : null
              }
            >
              <div className="relative">
                <TextInput
                  type={showPw ? "text" : "password"}
                  value={password}
                  placeholder="비밀번호 입력"
                  className="pr-14"
                  onFocus={() => setPwFocused(true)}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => {
                    setPwTouched(true)
                    setPwFocused(false)
                  }}
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

            <Field
              label="비밀번호 확인"
              required
              hint={
                confirmTouched && !confirmValid ? (
                  <Msg kind="error">비밀번호가 일치하지 않습니다.</Msg>
                ) : confirmValid ? (
                  <Msg kind="success">비밀번호가 일치합니다. ✔</Msg>
                ) : null
              }
            >
              <div className="relative">
                <TextInput
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  placeholder="비밀번호 다시 입력"
                  className="pr-14"
                  onChange={(e) => setConfirm(e.target.value)}
                  onBlur={() => setConfirmTouched(true)}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "비밀번호 숨기기" : "비밀번호 표시"}
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirm ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </Field>

            <button
              type="button"
              onClick={() => setConsent((c) => !c)}
              role="checkbox"
              aria-checked={consent}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                consent ? "border-primary bg-secondary" : "border-input bg-card",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2",
                  consent ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {consent && <Check size={18} />}
              </span>
              <span className="text-base leading-relaxed text-foreground">
                <span className="font-bold">[필수]</span> 건강정보 암호화 저장 및 개인정보 처리에 동의합니다.
              </span>
            </button>

            <Button
              type="button"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className={cn("h-16 w-full text-xl font-bold", !step1Valid && "opacity-50")}
            >
              다음 단계
            </Button>
          </div>
        )}

        {/* ───────────── STEP 2 ───────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <Field label="만 나이" required>
              <TextInput
                inputMode="numeric"
                placeholder="예: 68"
                value={age}
                onChange={(e) => setBody("age", e.target.value.replace(/\D/g, ""))}
              />
            </Field>

            <Field label="성별" required>
              <div className="grid grid-cols-2 gap-3">
                <ChoiceCard
                  role="radio"
                  ariaChecked={gender === "male"}
                  active={gender === "male"}
                  onClick={() => setBody("gender", "male")}
                >
                  남성
                </ChoiceCard>
                <ChoiceCard
                  role="radio"
                  ariaChecked={gender === "female"}
                  active={gender === "female"}
                  onClick={() => setBody("gender", "female")}
                >
                  여성
                </ChoiceCard>
              </div>
            </Field>

            <Field label="키 (cm)" required>
              <TextInput
                inputMode="decimal"
                placeholder="예: 165"
                value={height}
                onChange={(e) => setBody("height", e.target.value.replace(/[^\d.]/g, ""))}
              />
            </Field>

            <Field label="몸무게 (kg)" required>
              <TextInput
                inputMode="decimal"
                placeholder="예: 62"
                value={weight}
                onChange={(e) => setBody("weight", e.target.value.replace(/[^\d.]/g, ""))}
              />
            </Field>

            <div className="flex items-center justify-between rounded-2xl border-2 border-border bg-card p-5">
              <span className="text-lg font-semibold text-foreground">체질량지수 (BMI)</span>
              <span
                className={cn(
                  "bmi-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-lg font-bold",
                  bmi == null ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground",
                )}
              >
                {bmi == null ? "입력 대기" : `${bmi.toFixed(1)} · ${bmiCategory}`}
              </span>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-16 flex-1 text-xl font-bold">
                이전
              </Button>
              <Button
                type="button"
                disabled={!step2Valid}
                onClick={() => setStep(3)}
                className={cn("h-16 flex-1 text-xl font-bold", !step2Valid && "opacity-50")}
              >
                다음 단계
              </Button>
            </div>
          </div>
        )}

        {/* ───────────── STEP 3 ───────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <HealthSurveyStep survey={survey} setSurvey={setSurvey} />

            {submitError && (
              <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4">
                <Msg kind="error">{submitError}</Msg>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-xl border-2 border-primary/30 bg-secondary p-4">
              <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={24} />
              <p className="text-base leading-relaxed text-foreground">
                제출 시 모든 건강 정보는 <span className="font-bold">AES 암호화</span> 후 안전한 클라우드에 저장되며, 어떤
                기기에서든 로그인하여 확인할 수 있습니다.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="h-16 flex-1 text-xl font-bold">
                이전
              </Button>
              <Button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="h-16 flex-1 text-xl font-bold"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={22} /> 저장 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={22} /> 완료
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-8 text-center">
        <button type="button" onClick={onGoLogin} className="text-lg font-semibold text-primary underline-offset-4 hover:underline">
          이미 계정이 있으신가요? 로그인
        </button>
      </footer>
    </div>
  )
}
