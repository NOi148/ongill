"use client"

import type { HealthSurvey } from "@/lib/types"
import { ChoiceCard, Field, SectionCard, TextInput } from "@/components/form-primitives"
import { Activity, HeartPulse, Baby, Cigarette, Accessibility, Stethoscope } from "lucide-react"

// Step 3 — the comprehensive 7-category health survey (categories 2-7;
// category 1 "Basic Biometrics" is collected in Step 2).
export function HealthSurveyStep({
  survey,
  setSurvey,
}: {
  survey: HealthSurvey
  setSurvey: (updater: (prev: HealthSurvey) => HealthSurvey) => void
}) {
  const { chronic, mobility, cardio, activity, lifeCycle, lifestyle } = survey

  return (
    <div className="flex flex-col gap-5">
      {/* 2. Chronic & Clinical History */}
      <SectionCard title="만성·임상 병력" icon={<Stethoscope size={22} />}>
        <Field label="진단받은 질환 (해당 사항 모두 선택)">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "hypertension", label: "고혈압" },
              { key: "diabetes", label: "제2형 당뇨" },
              { key: "cancerSurvivor", label: "암 (생존자)" },
              { key: "hiv", label: "HIV" },
            ].map((item) => (
              <ChoiceCard
                key={item.key}
                role="checkbox"
                ariaChecked={chronic[item.key as "hypertension"]}
                active={chronic[item.key as "hypertension"]}
                onClick={() =>
                  setSurvey((p) => ({
                    ...p,
                    chronic: { ...p.chronic, [item.key]: !p.chronic[item.key as "hypertension"] },
                  }))
                }
              >
                {item.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>

        <Field label="무릎 관절염 여부">
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: "yes", label: "있음" },
              { v: "no", label: "없음" },
            ].map((o) => (
              <ChoiceCard
                key={o.v}
                role="radio"
                ariaChecked={chronic.kneeArthritis === o.v}
                active={chronic.kneeArthritis === o.v}
                onClick={() => setSurvey((p) => ({ ...p, chronic: { ...p.chronic, kneeArthritis: o.v as "yes" } }))}
              >
                {o.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>

        <Field label="현재 복용 중인 약물">
          <TextInput
            placeholder="예: 혈압약, 당뇨약 (없으면 비워두세요)"
            value={chronic.medications}
            onChange={(e) => setSurvey((p) => ({ ...p, chronic: { ...p.chronic, medications: e.target.value } }))}
          />
        </Field>
      </SectionCard>

      {/* 3. Mobility & Physical Function */}
      <SectionCard title="이동 및 신체 기능" icon={<Accessibility size={22} />}>
        <Field label="보행 보조기구 사용">
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: "none", label: "사용 안 함" },
              { v: "cane", label: "지팡이" },
              { v: "walker", label: "보행기" },
              { v: "wheelchair", label: "휠체어" },
            ].map((o) => (
              <ChoiceCard
                key={o.v}
                role="radio"
                ariaChecked={mobility.aid === o.v}
                active={mobility.aid === o.v}
                onClick={() => setSurvey((p) => ({ ...p, mobility: { ...p.mobility, aid: o.v as "none" } }))}
              >
                {o.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>

        <Field label="신경학적 요인 (해당 사항 모두 선택)">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "stroke", label: "뇌졸중" },
              { key: "parkinsons", label: "파킨슨병" },
              { key: "ms", label: "다발성 경화증" },
              { key: "spinalInjury", label: "척수 손상" },
            ].map((item) => (
              <ChoiceCard
                key={item.key}
                role="checkbox"
                ariaChecked={mobility.neuro[item.key as "stroke"]}
                active={mobility.neuro[item.key as "stroke"]}
                onClick={() =>
                  setSurvey((p) => ({
                    ...p,
                    mobility: {
                      ...p.mobility,
                      neuro: { ...p.mobility.neuro, [item.key]: !p.mobility.neuro[item.key as "stroke"] },
                    },
                  }))
                }
              >
                {item.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>

        <Field label="낙상 위험 (과거 낙상 경험)">
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: "yes", label: "있음" },
              { v: "no", label: "없음" },
            ].map((o) => (
              <ChoiceCard
                key={o.v}
                role="radio"
                ariaChecked={mobility.fallHistory === o.v}
                active={mobility.fallHistory === o.v}
                onClick={() => setSurvey((p) => ({ ...p, mobility: { ...p.mobility, fallHistory: o.v as "yes" } }))}
              >
                {o.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>

        <Field label="골다공증 여부">
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: "yes", label: "있음" },
              { v: "no", label: "없음" },
            ].map((o) => (
              <ChoiceCard
                key={o.v}
                role="radio"
                ariaChecked={mobility.osteoporosis === o.v}
                active={mobility.osteoporosis === o.v}
                onClick={() => setSurvey((p) => ({ ...p, mobility: { ...p.mobility, osteoporosis: o.v as "yes" } }))}
              >
                {o.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>
      </SectionCard>

      {/* 4. Cardiorespiratory & Safety */}
      <SectionCard title="심폐 기능 및 안전" icon={<HeartPulse size={22} />}>
        <Field label="안정 시 심박수 (bpm)">
          <TextInput
            inputMode="numeric"
            placeholder="예: 72"
            value={cardio.restingHeartRate}
            onChange={(e) =>
              setSurvey((p) => ({ ...p, cardio: { ...p.cardio, restingHeartRate: e.target.value.replace(/\D/g, "") } }))
            }
          />
        </Field>

        <Field label="빈혈 / 어지러움 빈도">
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "never", label: "없음" },
              { v: "sometimes", label: "가끔" },
              { v: "often", label: "자주" },
            ].map((o) => (
              <ChoiceCard
                key={o.v}
                role="radio"
                ariaChecked={cardio.dizzinessFrequency === o.v}
                active={cardio.dizzinessFrequency === o.v}
                onClick={() => setSurvey((p) => ({ ...p, cardio: { ...p.cardio, dizzinessFrequency: o.v as "never" } }))}
              >
                {o.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>

        <Field label="주관적 건강 상태">
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "poor", label: "나쁨" },
              { v: "fair", label: "보통" },
              { v: "good", label: "좋음" },
            ].map((o) => (
              <ChoiceCard
                key={o.v}
                role="radio"
                ariaChecked={cardio.subjectiveHealth === o.v}
                active={cardio.subjectiveHealth === o.v}
                onClick={() => setSurvey((p) => ({ ...p, cardio: { ...p.cardio, subjectiveHealth: o.v as "poor" } }))}
              >
                {o.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>
      </SectionCard>

      {/* 5. Activity & Sedentary Behavior */}
      <SectionCard title="활동량 및 좌식 생활" icon={<Activity size={22} />}>
        <Field label="하루 평균 걸음 수">
          <TextInput
            inputMode="numeric"
            placeholder="예: 4000"
            value={activity.dailySteps}
            onChange={(e) =>
              setSurvey((p) => ({ ...p, activity: { ...p.activity, dailySteps: e.target.value.replace(/\D/g, "") } }))
            }
          />
        </Field>

        <Field label="하루 평균 앉아있는 시간 (시간)">
          <TextInput
            inputMode="numeric"
            placeholder="예: 8"
            value={activity.sedentaryHours}
            onChange={(e) =>
              setSurvey((p) => ({
                ...p,
                activity: { ...p.activity, sedentaryHours: e.target.value.replace(/\D/g, "") },
              }))
            }
          />
        </Field>
      </SectionCard>

      {/* 6. Special Life Cycle */}
      <SectionCard title="특수 생애 주기" icon={<Baby size={22} />}>
        <Field label="임신·산후 상태">
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "na", label: "해당 없음" },
              { v: "pregnant", label: "임신 중" },
              { v: "postpartum", label: "산후" },
            ].map((o) => (
              <ChoiceCard
                key={o.v}
                role="radio"
                ariaChecked={lifeCycle.maternalStatus === o.v}
                active={lifeCycle.maternalStatus === o.v}
                onClick={() => setSurvey((p) => ({ ...p, lifeCycle: { maternalStatus: o.v as "na" } }))}
              >
                {o.label}
              </ChoiceCard>
            ))}
          </div>
        </Field>
      </SectionCard>

      {/* 7. Lifestyle Habits */}
      <SectionCard title="생활 습관" icon={<Cigarette size={22} />}>
        <Field label="해당 사항 모두 선택">
          <div className="grid grid-cols-2 gap-3">
            <ChoiceCard
              role="checkbox"
              ariaChecked={lifestyle.smoking}
              active={lifestyle.smoking}
              onClick={() => setSurvey((p) => ({ ...p, lifestyle: { ...p.lifestyle, smoking: !p.lifestyle.smoking } }))}
            >
              흡연
            </ChoiceCard>
            <ChoiceCard
              role="checkbox"
              ariaChecked={lifestyle.drinking}
              active={lifestyle.drinking}
              onClick={() =>
                setSurvey((p) => ({ ...p, lifestyle: { ...p.lifestyle, drinking: !p.lifestyle.drinking } }))
              }
            >
              음주
            </ChoiceCard>
          </div>
        </Field>
      </SectionCard>
    </div>
  )
}
