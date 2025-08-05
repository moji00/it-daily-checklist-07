-- Create default admin account in users table
INSERT INTO public.users (username, full_name, role, password_hash, is_active)
VALUES (
  'tmc.it',
  'TMC IT',
  'admin',
  -- Using SHA-256 hash of 'abcd_123'
  encode(sha256('abcd_123'::bytea), 'hex'),
  true
)
ON CONFLICT (username) DO NOTHING;