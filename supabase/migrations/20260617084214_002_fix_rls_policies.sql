-- Drop existing policies
DROP POLICY IF EXISTS app_users_select ON app_users;
DROP POLICY IF EXISTS app_users_insert ON app_users;
DROP POLICY IF EXISTS app_users_update ON app_users;
DROP POLICY IF EXISTS app_users_delete ON app_users;

-- Create new policies that allow anonymous access (for server-side operations)
CREATE POLICY app_users_select ON app_users FOR SELECT USING (true);
CREATE POLICY app_users_insert ON app_users FOR INSERT WITH CHECK (true);
CREATE POLICY app_users_update ON app_users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY app_users_delete ON app_users FOR DELETE USING (true);