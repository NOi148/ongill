// Drizzle schema for the 온길 (Ongil) app.
// A single table that stores each user's credentials and AES-encrypted health survey.
// The survey is encrypted at rest with a server-side key (ENCRYPTION_SECRET),
// so the raw health data is never readable directly from the database.
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  userIdLower: text("user_id_lower").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  encryptedSurvey: text("encrypted_survey").notNull(),
  emergencyContact: text("emergency_contact"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type AppUserRow = typeof appUsers.$inferSelect
