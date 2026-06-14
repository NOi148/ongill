"use client"

import { Building2, Cross, Heart, MapPin, Phone, Pill } from "lucide-react"

interface Facility {
  name: string
  type: string
  distance: string
  phone: string
}

const FACILITIES: { category: string; icon: React.ReactNode; items: Facility[] }[] = [
  {
    category: "병원·의원",
    icon: <Cross size={22} />,
    items: [
      { name: "온길 가정의학과", type: "1차 진료", distance: "320m", phone: "02-123-4567" },
      { name: "행복 정형외과", type: "관절·재활", distance: "550m", phone: "02-234-5678" },
    ],
  },
  {
    category: "약국",
    icon: <Pill size={22} />,
    items: [
      { name: "건강 약국", type: "처방·상담", distance: "180m", phone: "02-345-6789" },
      { name: "365 열린약국", type: "야간 운영", distance: "640m", phone: "02-456-7890" },
    ],
  },
  {
    category: "노인복지센터",
    icon: <Heart size={22} />,
    items: [
      { name: "햇살 노인복지관", type: "건강·여가", distance: "800m", phone: "02-567-8901" },
      { name: "효사랑 경로당", type: "지역 모임", distance: "420m", phone: "02-678-9012" },
    ],
  },
]

// Hospital tab — localized directory of nearby medical & welfare facilities.
export function HospitalTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-3xl font-extrabold text-foreground text-balance">주변 의료·복지 시설</h2>
        <p className="mt-1 text-lg text-muted-foreground">가까운 순으로 안내합니다</p>
      </div>

      {FACILITIES.map((group) => (
        <section key={group.category} className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              {group.icon}
            </span>
            <h3 className="text-xl font-bold text-foreground">{group.category}</h3>
          </div>
          <ul className="flex flex-col gap-3">
            {group.items.map((f) => (
              <li key={f.name} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 p-4">
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-foreground">{f.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-base text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 size={16} /> {f.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={16} /> {f.distance}
                    </span>
                  </div>
                </div>
                <a
                  href={`tel:${f.phone}`}
                  aria-label={`${f.name} 전화 걸기`}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <Phone size={22} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
