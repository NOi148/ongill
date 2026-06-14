"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

// Senior-friendly large text field with label + message slot.
export function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string
  required?: boolean
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-lg font-semibold text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
      {hint}
    </div>
  )
}

type MsgKind = "info" | "warning" | "success" | "error"

export function Msg({ kind, children }: { kind: MsgKind; children: ReactNode }) {
  const styles: Record<MsgKind, string> = {
    info: "text-muted-foreground",
    warning: "text-amber-600",
    success: "text-primary",
    error: "text-destructive",
  }
  return <p className={cn("text-base font-medium leading-relaxed", styles[kind])}>{children}</p>
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg text-foreground",
        "placeholder:text-muted-foreground/70 outline-none transition-colors",
        "focus:border-primary focus:ring-4 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  )
}

// A large, accessible selectable card used for radio / checkbox groups.
export function ChoiceCard({
  active,
  onClick,
  children,
  type = "button",
  role,
  ariaChecked,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  type?: "button"
  role?: "radio" | "checkbox"
  ariaChecked?: boolean
}) {
  return (
    <button
      type={type}
      role={role}
      aria-checked={ariaChecked}
      onClick={onClick}
      className={cn(
        "flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-center text-base font-semibold transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-input bg-card text-foreground hover:border-primary/50",
      )}
    >
      {children}
    </button>
  )
}

export function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        {icon && <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">{icon}</span>}
        <h3 className="text-xl font-bold text-foreground text-balance">{title}</h3>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}
