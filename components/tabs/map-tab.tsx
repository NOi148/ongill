"use client"

import type { Session } from "@/lib/types"
import { MapPin, Navigation, TrafficCone, TrendingUp } from "lucide-react"

// Map tab — placeholder for a senior-optimized safe navigation route.
export function MapTab({ session }: { session: Session }) {
  const { mobility } = session.survey
  const usesAid = mobility.aid && mobility.aid !== "none"

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-3xl font-extrabold text-foreground text-balance">안전 경로 안내</h2>
        <p className="mt-1 text-lg text-muted-foreground">신체 정보에 맞춘 안전한 길을 안내합니다</p>
      </div>

      {/* Map placeholder */}
      <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-secondary">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Navigation size={32} />
          </span>
          <p className="mt-3 text-lg font-semibold text-foreground">현재 위치 기반 경로 준비 중</p>
          <p className="text-base text-muted-foreground">가파른 경사와 위험 지역을 피한 경로</p>
        </div>
      </div>

      {/* Route safety features */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
            <TrendingUp size={24} />
          </span>
          <div>
            <p className="text-lg font-bold text-foreground">완만한 경사 우선</p>
            <p className="text-base text-muted-foreground">
              {usesAid ? "보조기구 사용에 맞춰 계단·급경사 제외" : "무릎 부담이 적은 평탄한 길 안내"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
            <TrafficCone size={24} />
          </span>
          <div>
            <p className="text-lg font-bold text-foreground">위험 교통 구간 회피</p>
            <p className="text-base text-muted-foreground">신호 없는 횡단보도·차량 혼잡 구간 우회</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
            <MapPin size={24} />
          </span>
          <div>
            <p className="text-lg font-bold text-foreground">중간 휴식 지점 표시</p>
            <p className="text-base text-muted-foreground">벤치·그늘·화장실 위치를 함께 안내</p>
          </div>
        </div>
      </div>
    </div>
  )
}
