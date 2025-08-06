-- Add admin-specific columns to users table
ALTER TABLE users 
ADD COLUMN access_level text DEFAULT 'limited',
ADD COLUMN permissions text[] DEFAULT '{}',
ADD COLUMN department text;

-- Update access level for admin users
UPDATE users 
SET access_level = 'full',
    permissions = ARRAY['manage_users', 'manage_templates', 'view_all_checklists']
WHERE role = 'admin';

-- Update access level for regular users
UPDATE users 
SET permissions = ARRAY['manage_own_checklists', 'view_templates']
WHERE role = 'user';

-- Migrate any existing data from admin_data to users table
UPDATE users 
SET access_level = ad.access_level,
    permissions = ad.permissions,
    department = ad.department
FROM admin_data ad 
WHERE users.id = ad.user_id;

-- Drop the admin_data table as it's no longer needed
DROP TABLE IF EXISTS admin_data;