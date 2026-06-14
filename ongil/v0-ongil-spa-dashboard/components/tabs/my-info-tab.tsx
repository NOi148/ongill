"use client"

import { useState } from "react"
import type { Session } from "@/lib/types"
import { updateEmergencyContactAction } from "@/app/actions/auth"
import { Field, TextInput } from "@/components/form-primitives"
import { Button } from "@/components/ui/button"
import { Check, LogOut, Phone, ShieldCheck } from "lucide-react"

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <span className="text-base text-muted-foreground">{label}</span>
      <span className="text-right text-lg font-semibold text-foreground">{value || "-"}</span>
    </div>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <div>{children}</div>
    </section>
  )
}

const yn = (v: boolean) => (v ? "예" : "아니오")
const yesNo = (v: string) => (v === "yes" ? "있음" : v === "no" ? "없음" : "-")

const aidLabel: Record<string, string> = { none: "사용 안 함", cane: "지팡이", walker: "보행기", wheelchair: "휠체어" }
const dizLabel: Record<string, string> = { never: "없음", sometimes: "가끔", often: "자주" }
const healthLabel: Record<string, string> = { poor: "나쁨", fair: "보통", good: "좋음" }
const maternalLabel: Record<string, string> = { na: "해당 없음", pregnant: "임신 중", postpartum: "산후" }

export function MyInfoTab({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const { userId, survey } = session
  const { body, chronic, mobility, cardio, activity, lifeCycle, lifestyle } = survey

  const [contact, setContact] = useState(session.emergencyContact ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const bmi = (() => {
    const h = Number.parseFloat(body.height) / 100
    const w = Number.parseFloat(body.weight)
    if (!h || !w) return "-"
    return (w / (h * h)).toFixed(1)
  })()

  async function saveContact() {
    setSaving(true)
    setSaved(false)
    const res = await updateEmergencyContactAction(userId, contact)
    setSaving(false)
    if (res.ok) {
      session.emergencyContact = contact
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const neuro = [
    mobility.neuro.stroke && "뇌졸중",
    mobility.neuro.parkinsons && "파킨슨병",
    mobility.neuro.ms && "다발성 경화증",
    mobility.neuro.spinalInjury && "척수 손상",
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-3xl font-extrabold text-foreground text-balance">내 건강 정보</h2>
        <div className="mt-2 flex items-center gap-2 text-base text-primary">
          <ShieldCheck size={18} />
          암호화되어 안전하게 보관 중 ({userId})
        </div>
      </div>

      <InfoCard title="기본 신체 정보">
        <Row label="만 나이" value={body.age ? `${body.age}세` : "-"} />
        <Row label="성별" value={body.gender === "male" ? "남성" : body.gender === "female" ? "여성" : "-"} />
        <Row label="키" value={body.height ? `${body.height} cm` : "-"} />
        <Row label="몸무게" value={body.weight ? `${body.weight} kg` : "-"} />
        <Row label="BMI" value={bmi} />
      </InfoCard>

      <InfoCard title="만성·임상 병력">
        <Row label="고혈압" value={yn(chronic.hypertension)} />
        <Row label="제2형 당뇨" value={yn(chronic.diabetes)} />
        <Row label="암 생존자" value={yn(chronic.cancerSurvivor)} />
        <Row label="HIV" value={yn(chronic.hiv)} />
        <Row label="무릎 관절염" value={yesNo(chronic.kneeArthritis)} />
        <Row label="복용 약물" value={chronic.medications} />
      </InfoCard>

      <InfoCard title="이동 및 신체 기능">
        <Row label="보행 보조기구" value={aidLabel[mobility.aid] ?? "-"} />
        <Row label="신경학적 요인" value={neuro.length ? neuro.join(", ") : "없음"} />
        <Row label="과거 낙상 경험" value={yesNo(mobility.fallHistory)} />
        <Row label="골다공증" value={yesNo(mobility.osteoporosis)} />
      </InfoCard>

      <InfoCard title="심폐 기능 및 안전">
        <Row label="안정 시 심박수" value={cardio.restingHeartRate ? `${cardio.restingHeartRate} bpm` : "-"} />
        <Row label="어지러움 빈도" value={dizLabel[cardio.dizzinessFrequency] ?? "-"} />
        <Row label="주관적 건강 상태" value={healthLabel[cardio.subjectiveHealth] ?? "-"} />
      </InfoCard>

      <InfoCard title="활동량 및 생활 습관">
        <Row label="하루 평균 걸음" value={activity.dailySteps ? `${activity.dailySteps} 보` : "-"} />
        <Row label="앉아있는 시간" value={activity.sedentaryHours ? `${activity.sedentaryHours} 시간` : "-"} />
        <Row label="임신·산후 상태" value={maternalLabel[lifeCycle.maternalStatus] ?? "-"} />
        <Row label="흡연" value={yn(lifestyle.smoking)} />
        <Row label="음주" value={yn(lifestyle.drinking)} />
      </InfoCard>

      {/* Emergency contact setup */}
      <InfoCard title="비상 연락처">
        <Field label="긴급 시 연락할 번호">
          <div className="flex gap-2">
            <TextInput
              inputMode="tel"
              placeholder="예: 010-1234-5678"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <Button type="button" onClick={saveContact} disabled={saving} className="h-14 shrink-0 px-5 text-base font-bold">
              {saved ? <Check size={20} /> : saving ? "저장 중" : "저장"}
            </Button>
          </div>
        </Field>
        {contact && (
          <a
            href={`tel:${contact}`}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-lg font-bold text-primary"
          >
            <Phone size={20} /> 비상 전화 걸기
          </a>
        )}
      </InfoCard>

      <Button
        type="button"
        variant="outline"
        onClick={onLogout}
        className="h-14 w-full gap-2 text-lg font-bold text-destructive"
      >
        <LogOut size={20} /> 로그아웃
      </Button>
    </div>
  )
}
