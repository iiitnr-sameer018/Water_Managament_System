-- Supabase SQL Schema for Water Management System
-- ENTERPRISE EDITION - Full Feature Set

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS file_versions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS staff_areas;
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Users Table
CREATE TABLE users (
    id text PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name text,
    role text NOT NULL CHECK (role IN ('user', 'staff', 'admin')),
    created_at timestamp with time zone DEFAULT now(),
    performance_score integer DEFAULT 100,
    is_active boolean DEFAULT true,
    phone text
);

-- Areas / Zones Table
CREATE TABLE areas (
    id text PRIMARY KEY,
    name text NOT NULL,
    zone_code text UNIQUE NOT NULL,
    city text NOT NULL DEFAULT 'Naya Raipur',
    pincode text,
    lat_center double precision,
    lon_center double precision,
    created_at timestamp with time zone DEFAULT now()
);

-- Staff-Area Mapping
CREATE TABLE staff_areas (
    id text PRIMARY KEY,
    staff_id text REFERENCES users(id) ON DELETE CASCADE,
    area_id text REFERENCES areas(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    assigned_at timestamp with time zone DEFAULT now(),
    UNIQUE(staff_id, area_id)
);

-- Complaints Table (Enhanced with SLA + Geo + Priority)
CREATE TABLE complaints (
    id text PRIMARY KEY,
    "userId" text REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL,
    description text NOT NULL,
    pincode text NOT NULL,
    location text NOT NULL,
    lat double precision,
    lon double precision,
    area_id text REFERENCES areas(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'Submitted',
    priority text NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    "imageUrl" text,
    "dateSubmitted" timestamp with time zone DEFAULT now(),
    "assignedStaffId" text REFERENCES users(id) ON DELETE SET NULL,
    "workNotes" text,
    eta text,
    rating integer,
    feedback text,
    "staffImageUrl" text,
    -- SLA Fields
    sla_deadline timestamp with time zone,
    escalation_level integer DEFAULT 0,
    escalated_at timestamp with time zone,
    resolved_at timestamp with time zone,
    -- Assignment metadata
    auto_assigned boolean DEFAULT false,
    assignment_reason text
);

-- Ratings Table
CREATE TABLE ratings (
    id text PRIMARY KEY,
    complaint_id text REFERENCES complaints(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text text,
    created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- AUDIT LOG TABLE
-- ==========================================
CREATE TABLE audit_logs (
    id text PRIMARY KEY,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    user_id text REFERENCES users(id) ON DELETE SET NULL,
    user_name text,
    user_role text,
    details jsonb DEFAULT '{}',
    old_values jsonb,
    new_values jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- NOTIFICATION TABLE
-- ==========================================
CREATE TABLE notifications (
    id text PRIMARY KEY,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    entity_type text,
    entity_id text,
    is_read boolean DEFAULT false,
    priority text DEFAULT 'NORMAL',
    created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- FILE VERSIONING TABLE
-- ==========================================
CREATE TABLE file_versions (
    id text PRIMARY KEY,
    complaint_id text REFERENCES complaints(id) ON DELETE CASCADE,
    file_url text NOT NULL,
    file_type text DEFAULT 'complaint_image',
    version_number integer NOT NULL DEFAULT 1,
    uploaded_by text REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at timestamp with time zone DEFAULT now(),
    is_current boolean DEFAULT true
);

-- ==========================================
-- ENABLE RLS
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- DROP EXISTING POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Allow public read access on users" ON users;
DROP POLICY IF EXISTS "Allow public insert on users" ON users;
DROP POLICY IF EXISTS "Allow public update on users" ON users;

DROP POLICY IF EXISTS "Allow public read access on complaints" ON complaints;
DROP POLICY IF EXISTS "Allow public insert on complaints" ON complaints;
DROP POLICY IF EXISTS "Allow public update on complaints" ON complaints;

DROP POLICY IF EXISTS "Allow public read access on ratings" ON ratings;
DROP POLICY IF EXISTS "Allow public insert on ratings" ON ratings;
DROP POLICY IF EXISTS "Allow public update on ratings" ON ratings;

DROP POLICY IF EXISTS "Allow public read access on areas" ON areas;
DROP POLICY IF EXISTS "Allow public insert on areas" ON areas;
DROP POLICY IF EXISTS "Allow public update on areas" ON areas;

DROP POLICY IF EXISTS "Allow public read access on staff_areas" ON staff_areas;
DROP POLICY IF EXISTS "Allow public insert on staff_areas" ON staff_areas;
DROP POLICY IF EXISTS "Allow public update on staff_areas" ON staff_areas;
DROP POLICY IF EXISTS "Allow public delete on staff_areas" ON staff_areas;

DROP POLICY IF EXISTS "Allow public read access on audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow public insert on audit_logs" ON audit_logs;

DROP POLICY IF EXISTS "Allow public read access on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public insert on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public update on notifications" ON notifications;

DROP POLICY IF EXISTS "Allow public read access on file_versions" ON file_versions;
DROP POLICY IF EXISTS "Allow public insert on file_versions" ON file_versions;

-- ==========================================
-- CREATE POLICIES (Public access for custom auth)
-- ==========================================
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on users" ON users FOR DELETE USING (true);

CREATE POLICY "Allow public read access on complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Allow public insert on complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on complaints" ON complaints FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on complaints" ON complaints FOR DELETE USING (true);

CREATE POLICY "Allow public read access on ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ratings" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ratings" ON ratings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ratings" ON ratings FOR DELETE USING (true);

CREATE POLICY "Allow public read access on areas" ON areas FOR SELECT USING (true);
CREATE POLICY "Allow public insert on areas" ON areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on areas" ON areas FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on staff_areas" ON staff_areas FOR SELECT USING (true);
CREATE POLICY "Allow public insert on staff_areas" ON staff_areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on staff_areas" ON staff_areas FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on staff_areas" ON staff_areas FOR DELETE USING (true);

CREATE POLICY "Allow public read access on audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert on notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on notifications" ON notifications FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on file_versions" ON file_versions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on file_versions" ON file_versions FOR INSERT WITH CHECK (true);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Areas / Zones
INSERT INTO areas (id, name, zone_code, city, pincode, lat_center, lon_center) VALUES
('area_1', 'Sector 24', 'NR-S24', 'Naya Raipur', '493661', 21.1610, 81.7870),
('area_2', 'Sector 27', 'NR-S27', 'Naya Raipur', '493661', 21.1540, 81.7950),
('area_3', 'Uperwara', 'NR-UPW', 'Naya Raipur', '493661', 21.1350, 81.7690),
('area_4', 'Rakhi', 'NR-RKH', 'Naya Raipur', '493661', 21.1480, 81.8020),
('area_5', 'Atal Nagar', 'NR-ATL', 'Naya Raipur', '493661', 21.1700, 81.7750);

-- Users
INSERT INTO users (id, email, name, role, created_at, performance_score) VALUES 
('1', 'citizen1@example.com', 'Ravi Kumar (Citizen)', 'user', now(), 100),
('2', 'citizen2@example.com', 'Alisha Sharma (Citizen)', 'user', now(), 100),
('101', 'staff1@example.com', 'Sameer S. (Maintenance)', 'staff', now(), 92),
('102', 'staff2@example.com', 'Vikas P. (Maintenance)', 'staff', now(), 85),
('103', 'staff3@example.com', 'Anish P. (Maintenance)', 'staff', now(), 78),
('999', 'admin@example.com', 'Super Admin', 'admin', now(), 100);

-- Staff-Area Mapping
INSERT INTO staff_areas (id, staff_id, area_id, is_primary) VALUES
('sa_1', '101', 'area_1', true),
('sa_2', '101', 'area_2', false),
('sa_3', '102', 'area_3', true),
('sa_4', '102', 'area_4', false),
('sa_5', '103', 'area_5', true),
('sa_6', '103', 'area_1', false);

-- Complaints (with SLA fields)
INSERT INTO complaints (id, "userId", type, description, pincode, location, lat, lon, area_id, status, priority, "imageUrl", "dateSubmitted", "assignedStaffId", sla_deadline) VALUES 
('739421', '1', 'leakage', 'Major pipe burst near the main road causing flooding.', '493661', 'Sector 24, Naya Raipur', 21.1610, 81.7870, 'area_1', 'In Progress', 'HIGH', '/img/leakage.jpg', now() - interval '1 day', '101', now() + interval '12 hours'),
('882190', '2', 'dirty_water', 'Muddy and yellow water coming from the kitchen taps for two days.', '493661', 'Sector 27, New Naya Raipur', 21.1540, 81.7950, 'area_2', 'Verified', 'NORMAL', '/img/dirty_water.jpg', now() - interval '12 hours', NULL, now() + interval '36 hours'),
('112233', '1', 'no_water', 'No water supply since yesterday evening in block B.', '493661', 'Uperwara, Naya Raipur', 21.1350, 81.7690, 'area_3', 'Completed', 'NORMAL', NULL, now() - interval '2 days', '102', now() - interval '1 day'),
('443322', '2', 'low_pressure', 'Very low water pressure in kitchen and bathroom taps.', '493661', 'Atal Nagar, Naya Raipur', 21.1700, 81.7750, 'area_5', 'Submitted', 'LOW', NULL, now() - interval '3 hours', NULL, now() + interval '45 hours'),
('556677', '1', 'leakage', 'Pipe leaking at junction near community park.', '493661', 'Rakhi, Naya Raipur', 21.1480, 81.8020, 'area_4', 'Submitted', 'NORMAL', NULL, now() - interval '6 hours', NULL, now() + interval '42 hours');

-- Ratings
INSERT INTO ratings (id, complaint_id, user_id, rating, feedback_text, created_at) VALUES 
('r_1', '112233', '1', 4, 'Resolved quickly, thanks but staff was a bit late.', now() - interval '1 day');

-- Initial Audit Logs
INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, user_name, user_role, details, created_at) VALUES
('al_1', 'COMPLAINT_CREATED', 'complaint', '739421', '1', 'Ravi Kumar', 'user', '{"type":"leakage","location":"Sector 24"}', now() - interval '1 day'),
('al_2', 'STAFF_ASSIGNED', 'complaint', '739421', '999', 'Super Admin', 'admin', '{"staffId":"101","staffName":"Sameer S."}', now() - interval '23 hours'),
('al_3', 'STATUS_CHANGED', 'complaint', '739421', '101', 'Sameer S.', 'staff', '{"from":"Submitted","to":"In Progress"}', now() - interval '22 hours'),
('al_4', 'COMPLAINT_CREATED', 'complaint', '882190', '2', 'Alisha Sharma', 'user', '{"type":"dirty_water","location":"Sector 27"}', now() - interval '12 hours'),
('al_5', 'COMPLAINT_RESOLVED', 'complaint', '112233', '102', 'Vikas P.', 'staff', '{"resolvedIn":"18 hours"}', now() - interval '1 day');

-- ==========================================
-- STORAGE SETUP (BUCKETS AND POLICIES)
-- ==========================================

-- Create the storage bucket if it doesn't exist (publicly accessible)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('complaints', 'complaints', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to prevent 'already exists' errors
DROP POLICY IF EXISTS "Allow public read access on complaints bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert on complaints bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update on complaints bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete on complaints bucket" ON storage.objects;

-- Allow public read access to images
CREATE POLICY "Allow public read access on complaints bucket" 
ON storage.objects FOR SELECT USING (bucket_id = 'complaints');

-- Allow public uploads (insert) to the complaints bucket
CREATE POLICY "Allow public insert on complaints bucket" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'complaints');

-- Allow public updates to their images (if needed)
CREATE POLICY "Allow public update on complaints bucket" 
ON storage.objects FOR UPDATE USING (bucket_id = 'complaints');

-- Allow public deletes of their images (if needed)
CREATE POLICY "Allow public delete on complaints bucket" 
ON storage.objects FOR DELETE USING (bucket_id = 'complaints');
