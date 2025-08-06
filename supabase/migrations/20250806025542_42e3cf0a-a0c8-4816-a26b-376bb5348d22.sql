-- Fix the admin user password by updating it to the correct SHA-256 hash
-- SHA-256 hash of 'abcd_123' is: 6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090

UPDATE users 
SET password_hash = '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090',
    role = 'admin'
WHERE username = 'tmc.it';