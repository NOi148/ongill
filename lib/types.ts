// Shared domain types for the 온길 (Ongil) application.
// Designed so additional health categories / dashboard features can be appended
// without breaking the auth or sync logic.

export interface BodyMetrics {
  age: string // "man age" (만 나이)
  gender: "male" | "female" | ""
  height: string // cm
  weight: string // kg
}

export interface ChronicHistory {
  hypertension: boolean
  diabetes: boolean // Type 2
  cancerSurvivor: boolean
  hiv: boolean
  kneeArthritis: "yes" | "no" | ""
  medications: string
}

export interface Mobility {
  aid: "none" | "cane" | "walker" | "wheelchair" | ""
  neuro: {
    stroke: boolean
    parkinsons: boolean
    ms: boolean // multiple sclerosis
    spinalInjury: boolean
  }
  fallHistory: "yes" | "no" | ""
  osteoporosis: "yes" | "no" | ""
}

export interface Cardiorespiratory {
  restingHeartRate: string
  dizzinessFrequency: "never" | "sometimes" | "often" | ""
  subjectiveHealth: "poor" | "fair" | "good" | ""
}

export interface Activity {
  dailySteps: string
  sedentaryHours: string
}

export interface LifeCycle {
  maternalStatus: "na" | "pregnant" | "postpartum" | ""
}

export interface Lifestyle {
  smoking: boolean
  drinking: boolean
}

// The full 7-category health survey payload.
export interface HealthSurvey {
  body: BodyMetrics
  chronic: ChronicHistory
  mobility: Mobility
  cardio: Cardiorespiratory
  activity: Activity
  lifeCycle: LifeCycle
  lifestyle: Lifestyle
}

// Stored record in the virtual cloud DB.
export interface UserRecord {
  userId: string
  passwordHash: string // SHA-256
  encryptedSurvey: string // AES encrypted HealthSurvey JSON
  createdAt: number
  emergencyContact?: string
}

// The decrypted session that the running app uses.
export interface Session {
  userId: string
  survey: HealthSurvey
  emergencyContact?: string
}

export type AppView = "login" | "signup"
export type TabKey = "home" | "map" | "hospital" | "myinfo"

export function emptySurvey(): HealthSurvey {
  return {
    body: { age: "", gender: "", height: "", weight: "" },
    chronic: {
      hypertension: false,
      diabetes: false,
      cancerSurvivor: false,
      hiv: false,
      kneeArthritis: "",
      medications: "",
    },
    mobility: {
      aid: "",
      neuro: { stroke: false, parkinsons: false, ms: false, spinalInjury: false },
      fallHistory: "",
      osteoporosis: "",
    },
    cardio: { restingHeartRate: "", dizzinessFrequency: "", subjectiveHealth: "" },
    activity: { dailySteps: "", sedentaryHours: "" },
    lifeCycle: { maternalStatus: "" },
    lifestyle: { smoking: false, drinking: false },
  }
}
