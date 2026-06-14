"use client"

import { useState } from "react"
import type { Session, TabKey } from "@/lib/types"
import { HomeTab } from "./tabs/home-tab"
import { MapTab } from "./tabs/map-tab"
import { HospitalTab } from "./tabs/hospital-tab"
import { MyInfoTab } from "./tabs/my-info-tab"
import { Footprints, Home, Hospital, MapPin, User } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "홈", icon: <Home size={26} /> },
  { key: "map", label: "지도", icon: <MapPin size={26} /> },
  { key: "hospital", label: "병원", icon: <Hospital size={26} /> },
  { key: "myinfo", label: "내정보", icon: <User size={26} /> },
]

// Scalable core application shell: fixed header, scrollable main, bottom nav.
// New tabs can be appended to TABS + the switch below without touching auth.
export function AppShell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [tab, setTab] = useState<TabKey>("home")

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col bg-background">
      {/* Fixed header */}
      <header className="app-header sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Footprints size={20} />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-primary">온길</span>
        </div>
        <span className="text-base font-semibold text-muted-foreground">{session.userId}님</span>
      </header>

      {/* Scrollable main content */}
      <main className="app-main flex-1 overflow-y-auto px-5 py-6 pb-28">
        {tab === "home" && <HomeTab session={session} />}
        {tab === "map" && <MapTab session={session} />}
        {tab === "hospital" && <HospitalTab />}
        {tab === "myinfo" && <MyInfoTab session={session} onLogout={onLogout} />}
      </main>

      {/* Bottom navigation */}
      <nav className="app-nav fixed bottom-0 left-1/2 z-20 w-full max-w-xl -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-4">
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <li key={t.key}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 py-3 text-base font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className={cn("flex h-8 items-center", active && "scale-110 transition-transform")}>
                    {t.icon}
                  </span>
                  {t.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
