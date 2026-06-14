"use client"

import { useState } from "react"
import type { AppView, Session } from "@/lib/types"
import { LoginView } from "@/components/login-view"
import { SignupView } from "@/components/signup/signup-view"
import { AppShell } from "@/components/app-shell"

// Top-level SPA orchestrator. Keeps auth/session state cleanly separated from
// the individual views so future features can be appended without conflicts.
export default function Page() {
  const [session, setSession] = useState<Session | null>(null)
  const [view, setView] = useState<AppView>("login")
  // Carries a freshly-signed-up ID so the login screen can pre-fill / re-mount.
  const [prefillId, setPrefillId] = useState<string | null>(null)

  if (session) {
    return <AppShell session={session} onLogout={() => setSession(null)} />
  }

  if (view === "signup") {
    return (
      <SignupView
        onGoLogin={() => setView("login")}
        onComplete={(userId) => {
          setPrefillId(userId)
          setView("login")
        }}
      />
    )
  }

  return (
    <LoginView key={prefillId ?? "login"} onGoSignup={() => setView("signup")} onSuccess={(s) => setSession(s)} />
  )
}
