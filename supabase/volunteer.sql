-- ============================================================
-- Volunteer laundry schedule
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Volunteers (sign in with name + email or phone)
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  phone_normalized TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_email_unique
  ON volunteers (lower(email))
  WHERE email <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_phone_normalized_unique
  ON volunteers (phone_normalized)
  WHERE phone_normalized <> '';

CREATE INDEX IF NOT EXISTS idx_volunteers_created ON volunteers(created_at DESC);

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_volunteers_updated_at ON volunteers;
CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- One laundry volunteer per calendar day
CREATE TABLE IF NOT EXISTS volunteer_shifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL UNIQUE,
  arrival_time TIME NOT NULL,
  hours_worked NUMERIC(4, 1),
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE volunteer_shifts ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_volunteer ON volunteer_shifts(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_date ON volunteer_shifts(shift_date);

ALTER TABLE volunteer_shifts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_volunteer_shifts_updated_at ON volunteer_shifts;
CREATE TRIGGER update_volunteer_shifts_updated_at
  BEFORE UPDATE ON volunteer_shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Clinic closed dates (no volunteer needed)
CREATE TABLE IF NOT EXISTS volunteer_closures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  closed_date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_closures_date ON volunteer_closures(closed_date);

ALTER TABLE volunteer_closures ENABLE ROW LEVEL SECURITY;

-- Admin announcements shown on the volunteer calendar
CREATE TABLE IF NOT EXISTS volunteer_announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_announcements_created ON volunteer_announcements(created_at DESC);

ALTER TABLE volunteer_announcements ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_volunteer_announcements_updated_at ON volunteer_announcements;
CREATE TRIGGER update_volunteer_announcements_updated_at
  BEFORE UPDATE ON volunteer_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Public board (volunteers submit, admin approves)
CREATE TABLE IF NOT EXISTS volunteer_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_volunteer_posts_status ON volunteer_posts(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_posts_created ON volunteer_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_volunteer_posts_volunteer ON volunteer_posts(volunteer_id);

ALTER TABLE volunteer_posts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_volunteer_posts_updated_at ON volunteer_posts;
CREATE TRIGGER update_volunteer_posts_updated_at
  BEFORE UPDATE ON volunteer_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- TODO: Add a table for volunteer hours