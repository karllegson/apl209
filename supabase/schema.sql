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
  --   how_long_owned, testicles_descended, in_heat_or_pregnant, last_heat_pregnancy_date,
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

  -- Admin management
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
  admin_notes TEXT DEFAULT '',

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
-- If owner_name is NOT NULL, uncomment next line:
-- ALTER TABLE appointments ALTER COLUMN owner_name DROP NOT NULL;
