"use client"

import type { Session } from "@/lib/types"
import { AlertTriangle, Brain, Footprints, HeartPulse, ShieldCheck, TriangleAlert } from "lucide-react"

// Home tab — personalized dashboard widgets driven by the registered survey.
export function HomeTab({ session }: { session: Session }) {
  const { userId, survey } = session
  const { mobility, chronic, cardio } = survey

  const usesAid = mobility.aid && mobility.aid !== "none"
  const hasFalls = mobility.fallHistory === "yes"
  const chronicCount =
    Number(chronic.hypertension) + Number(chronic.diabetes) + Number(chronic.cancerSurvivor) + Number(chronic.hiv)

  // Derive a simple safe-walking status from the profile.
  const riskFactors: string[] = []
  if (usesAid) riskFactors.push("보행 보조기구 사용")
  if (hasFalls) riskFactors.push("과거 낙상 경험")
  if (mobility.osteoporosis === "yes") riskFactors.push("골다공증")
  if (cardio.dizzinessFrequency === "often") riskFactors.push("잦은 어지러움")
  if (chronicCount > 0) riskFactors.push(`만성질환 ${chronicCount}개`)

  const level = riskFactors.length === 0 ? "안전" : riskFactors.length <= 2 ? "주의" : "특별 주의"
  const levelColor =
    level === "안전"
      ? "bg-primary text-primary-foreground"
      : level === "주의"
        ? "bg-amber-500 text-white"
        : "bg-destructive text-destructive-foreground"

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-lg text-muted-foreground">안녕하세요</p>
        <h2 className="text-3xl font-extrabold text-foreground text-balance">{userId}님, 오늘도 안전하게</h2>
      </div>

      {/* Personalized Safe Walking Status Card */}
      <section className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <Footprints size={24} />
            </span>
            <h3 className="text-xl font-bold text-foreground">안전 보행 상태</h3>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-base font-bold ${levelColor}`}>{level}</span>
        </div>

        {riskFactors.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {riskFactors.map((f) => (
              <li key={f} className="flex items-center gap-2 text-lg text-foreground">
                <TriangleAlert size={20} className="shrink-0 text-amber-600" />
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-lg leading-relaxed text-foreground">
            특별한 위험 요인이 없습니다. 규칙적인 걷기로 건강을 유지하세요.
          </p>
        )}
      </section>

      {/* Quick health widgets */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border-2 border-border bg-card p-5">
          <HeartPulse className="text-primary" size={28} />
          <p className="mt-3 text-base text-muted-foreground">안정 시 심박수</p>
          <p className="text-2xl font-extrabold text-foreground">
            {cardio.restingHeartRate || "-"}
            <span className="ml-1 text-base font-medium text-muted-foreground">bpm</span>
          </p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-5">
          <Footprints className="text-primary" size={28} />
          <p className="mt-3 text-base text-muted-foreground">하루 평균 걸음</p>
          <p className="text-2xl font-extrabold text-foreground">
            {survey.activity.dailySteps || "-"}
            <span className="ml-1 text-base font-medium text-muted-foreground">보</span>
          </p>
        </div>
      </div>

      {/* AI Safe Diagnostics Card — project manifesto */}
      <section className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary p-6 text-primary-foreground shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Brain size={24} />
          </span>
          <h3 className="text-xl font-bold">AI 안전 진단</h3>
        </div>
        <p className="mt-4 text-xl font-semibold leading-relaxed text-balance">
          내가 만들 AI는 <span className="underline decoration-primary-foreground/50 underline-offset-4">다양성과 공정성</span>을 기준으로
          판단하고, <span className="underline decoration-primary-foreground/50 underline-offset-4">데이터와 알고리즘의 편향</span>을 지속
          점검해야 된다.
        </p>
        <div className="mt-4 flex items-center gap-2 text-base text-primary-foreground/85">
          <ShieldCheck size={18} />
          공정하고 안전한 진단을 약속합니다
        </div>
      </section>

      {chronicCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={22} />
          <p className="text-base leading-relaxed text-amber-900">
            등록된 만성질환이 있어 무리한 운동은 피하고 충분한 휴식을 취하세요.
          </p>
        </div>
      )}
    </div>
  )
}
