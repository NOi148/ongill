CREATE TABLE app_users (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  user_id_lower TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  encrypted_survey TEXT NOT NULL,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_users_select" ON app_users FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "app_users_insert" ON app_users FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "app_users_update" ON app_users FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "app_users_delete" ON app_users FOR DELETE
  TO authenticated USING (true);