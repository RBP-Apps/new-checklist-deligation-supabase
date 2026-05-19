<USER_REQUEST>
now our schema is 

-- =========================================================
-- SAFE NEW SCHEMA SETUP
-- THIS WILL NOT TOUCH OLD TABLES / OLD APP
-- EVERYTHING CREATED WITH "new_" PREFIX
-- =========================================================

-- =========================================================
-- EXTENSIONS
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- ENUM TYPES
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'new_enable_reminder') THEN
        CREATE TYPE public.new_enable_reminder AS ENUM ('yes', 'no');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'new_user_status') THEN
        CREATE TYPE public.new_user_status AS ENUM (
            'active',
            'inactive',
            'on_leave',
            'terminated'
        );
<truncated 12758 bytes>