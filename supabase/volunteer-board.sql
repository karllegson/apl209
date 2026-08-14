-- ============================================================
-- Volunteer public board (run in Supabase SQL Editor)
-- Volunteers post → pending until admin approves.
-- Admin posts go live immediately.
-- ============================================================

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
