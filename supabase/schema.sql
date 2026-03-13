-- ============================================================
-- Supabase Schema — APL Spay & Neuter Intake Form
-- Run this in your Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- APPOINTMENTS (Intake Submissions) TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Customer status
  is_returning_customer BOOLEAN DEFAULT FALSE,

  -- Owner info
  owner_name TEXT DEFAULT '',
  owner_first_name TEXT DEFAULT '',
  owner_last_name TEXT DEFAULT '',
  owner_phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,

  -- Emergency contact
  emergency_contact_name TEXT DEFAULT '',
  emergency_contact_phone TEXT DEFAULT '',

  -- Contact preferences
  preferred_contact TEXT DEFAULT 'call'
    CHECK (preferred_contact IN ('call', 'text', 'email')),
  street_address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip_code TEXT DEFAULT '',
  how_heard TEXT DEFAULT '',
  requested_service TEXT DEFAULT '',

  -- Pet data (stored as JSONB array — one object per pet)
  -- Each pet: { pet_name, type, breed, color, age, weight, sex, pet_ownership,
  --   how_long_owned, testicles_descended, in_heat_or_pregnant, pregnant, last_heat_pregnancy_date, last_heat_date, pregnancy_date,
  --   currently_sick_injured, medical_conditions, medical_conditions_other,
  --   previous_surgeries, previous_surgeries_details,
  --   drug_vaccine_reactions, drug_vaccine_reactions_details,
  --   current_medications, current_medications_details,
  --   rabies_vaccinated, rabies_within_1_3_years, exposed_to_diseases,
  --   has_fleas_ticks, vet_behavior }
  num_pets INTEGER DEFAULT 1,
  pets JSONB NOT NULL DEFAULT '[]',

  -- Optional services
  wants_microchip BOOLEAN DEFAULT FALSE,
  wants_nail_trim BOOLEAN DEFAULT FALSE,
  wants_flea_treatment BOOLEAN DEFAULT FALSE,
  optional_vaccines JSONB DEFAULT '[]',
  optional_wellness_services JSONB DEFAULT '[]',

  -- Deposit (we only store last 4 digits of card; never store full number or CVV)
  deposit_acknowledged BOOLEAN DEFAULT FALSE,
  deposit_card_last4 TEXT DEFAULT '',
  deposit_card_expiry TEXT DEFAULT '',
  deposit_billing_zip TEXT DEFAULT '',

  -- Legal
  legal_acknowledged BOOLEAN DEFAULT FALSE,
  signature TEXT DEFAULT '',

  -- Owner note for vet (free text from pet info step)
  vet_note TEXT DEFAULT '',

  -- Admin management
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'attempted', 'cancelled', 'no-show', 'tnr')),
  admin_notes TEXT DEFAULT '',
  status_changed_by TEXT DEFAULT '',
  status_changed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts" ON appointments;
CREATE POLICY "Allow public inserts"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated reads" ON appointments;
CREATE POLICY "Allow authenticated reads"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated updates" ON appointments;
CREATE POLICY "Allow authenticated updates"
  ON appointments FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated deletes" ON appointments;
CREATE POLICY "Allow authenticated deletes"
  ON appointments FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_city ON appointments(city);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(owner_email);

-- ============================================================
-- INTAKE DRAFTS (Save & continue later)
-- form_data: full intake form (owner, pets, requested_service,
--   optional_vaccines, optional_wellness_services, legal_acknowledged, signature, etc.)
-- step: 1–6 (Preferences, Pet Info, Medical History, Vaccination, Review & Sign, Summary)
-- ============================================================
CREATE TABLE IF NOT EXISTS intake_drafts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  step INTEGER NOT NULL DEFAULT 1,
  form_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intake_drafts_email ON intake_drafts(owner_email);
CREATE INDEX IF NOT EXISTS idx_intake_drafts_phone ON intake_drafts(owner_phone);

ALTER TABLE intake_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert drafts" ON intake_drafts;
CREATE POLICY "Allow anon insert drafts"
  ON intake_drafts FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update drafts" ON intake_drafts;
CREATE POLICY "Allow anon update drafts"
  ON intake_drafts FOR UPDATE TO anon USING (true);
DROP POLICY IF EXISTS "Allow anon read drafts" ON intake_drafts;
CREATE POLICY "Allow anon read drafts"
  ON intake_drafts FOR SELECT TO anon USING (true);

DROP TRIGGER IF EXISTS update_intake_drafts_updated_at ON intake_drafts;
CREATE TRIGGER update_intake_drafts_updated_at
  BEFORE UPDATE ON intake_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGRATION: Add columns (run if appointments table already existed)
-- Run this block in Supabase SQL Editor if you get "column not found" errors.
-- Adds: full address, owner first/last name, requested_service,
--       optional_vaccines, optional_wellness_services.
-- ============================================================
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS street_address TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS owner_first_name TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS owner_last_name TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS requested_service TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS optional_vaccines JSONB DEFAULT '[]';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS optional_wellness_services JSONB DEFAULT '[]';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_acknowledged BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_card_last4 TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_card_expiry TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_billing_zip TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS vet_note TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status_changed_by TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;
-- To allow 'attempted' status on existing DBs: drop and re-add the status check:
-- ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
-- ALTER TABLE appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'confirmed', 'completed', 'attempted', 'cancelled', 'no-show'));
-- To allow 'tnr' status on existing DBs (run if you get invalid status error):
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'confirmed', 'completed', 'attempted', 'cancelled', 'no-show', 'tnr'));
-- If owner_name is NOT NULL, uncomment next line:
-- ALTER TABLE appointments ALTER COLUMN owner_name DROP NOT NULL;

-- ============================================================
-- LINK CLICKS (track button/link clicks for stats)
-- link_id: e.g. 'pricing-request-appointment', 'pricing-back-to-home', 'google-business'
-- ============================================================
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  link_id TEXT NOT NULL,
  source TEXT DEFAULT '',
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at DESC);

ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert link_clicks" ON link_clicks;
CREATE POLICY "Allow anon insert link_clicks"
  ON link_clicks FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- FEATURE FLAGS / APP SETTINGS
-- Simple key → enabled boolean, for things like TNR waitlist toggle
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE
);

DROP POLICY IF EXISTS "Allow authenticated read link_clicks" ON link_clicks;
CREATE POLICY "Allow authenticated read link_clicks"
  ON link_clicks FOR SELECT TO authenticated USING (true);

-- ============================================================
-- STANDBY APPOINTMENTS (admin-managed list: first/last name, phone, dates, type)
-- merged_appointment_id: links to appointments when customer later does intake form
-- ============================================================
CREATE TABLE IF NOT EXISTS standby_appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  standby_date DATE,
  appointment_type TEXT DEFAULT '',
  scheduled_date DATE,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'attempted', 'cancelled', 'completed')),
  status_changed_by TEXT DEFAULT '',
  status_changed_at TIMESTAMPTZ,
  merged_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  source_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure column exists when table was created before this was added
ALTER TABLE standby_appointments ADD COLUMN IF NOT EXISTS source_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_standby_appointments_phone ON standby_appointments(phone);
CREATE INDEX IF NOT EXISTS idx_standby_appointments_source ON standby_appointments(source_appointment_id);
CREATE INDEX IF NOT EXISTS idx_standby_appointments_status ON standby_appointments(status);
CREATE INDEX IF NOT EXISTS idx_standby_appointments_standby_date ON standby_appointments(standby_date);
CREATE INDEX IF NOT EXISTS idx_standby_appointments_merged ON standby_appointments(merged_appointment_id);

ALTER TABLE standby_appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated standby" ON standby_appointments;
CREATE POLICY "Allow authenticated standby"
  ON standby_appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_standby_appointments_updated_at ON standby_appointments;
CREATE TRIGGER update_standby_appointments_updated_at
  BEFORE UPDATE ON standby_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TNR WAITLIST (Trap N Release — minimal form: first/last name, email, phone)
-- ============================================================
CREATE TABLE IF NOT EXISTS tnr_waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  animal_type TEXT DEFAULT '',
  photo_url TEXT,
  customer_notes TEXT,
  moved_to_tnr BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tnr_waitlist_email ON tnr_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_tnr_waitlist_phone ON tnr_waitlist(phone);
CREATE INDEX IF NOT EXISTS idx_tnr_waitlist_created ON tnr_waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tnr_waitlist_moved ON tnr_waitlist(moved_to_tnr);

ALTER TABLE tnr_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert tnr_waitlist" ON tnr_waitlist;
CREATE POLICY "Allow anon insert tnr_waitlist"
  ON tnr_waitlist FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated read tnr_waitlist" ON tnr_waitlist;
CREATE POLICY "Allow authenticated read tnr_waitlist"
  ON tnr_waitlist FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated update tnr_waitlist" ON tnr_waitlist;
CREATE POLICY "Allow authenticated update tnr_waitlist"
  ON tnr_waitlist FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- If tnr_waitlist already existed without moved_to_tnr, add it:
ALTER TABLE tnr_waitlist ADD COLUMN IF NOT EXISTS moved_to_tnr BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tnr_waitlist ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE tnr_waitlist ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE tnr_waitlist ADD COLUMN IF NOT EXISTS animal_type TEXT DEFAULT '';

-- ============================================================
-- ADMIN NOTES (Notes & reminders — Admin Tools, persisted in DB)
-- Used by AdminNotes component. API uses service role (bypasses RLS).
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL DEFAULT '',
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notes_created ON admin_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notes_sort ON admin_notes(sort_order);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- No policies: only server-side admin client (service role) can access.

DROP TRIGGER IF EXISTS update_admin_notes_updated_at ON admin_notes;
CREATE TRIGGER update_admin_notes_updated_at
  BEFORE UPDATE ON admin_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SHAREFILE CHECKLIST ITEMS (Admin Tools — Sharefile workflow)
-- Stored in DB so checklist is consistent across devices.
-- ============================================================
CREATE TABLE IF NOT EXISTS sharefile_checklist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT NOT NULL DEFAULT '',
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  more_info TEXT DEFAULT '',
  tool TEXT DEFAULT '',
  can_edit_more_info BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sharefile_items_sort ON sharefile_checklist_items(sort_order);

ALTER TABLE sharefile_checklist_items ENABLE ROW LEVEL SECURITY;

-- No policies: only server-side admin client (service role) can access.

DROP TRIGGER IF EXISTS update_sharefile_checklist_items_updated_at ON sharefile_checklist_items;
CREATE TRIGGER update_sharefile_checklist_items_updated_at
  BEFORE UPDATE ON sharefile_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
