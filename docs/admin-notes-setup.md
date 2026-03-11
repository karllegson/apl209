# Admin Notes — DB-Backed Setup

Reference for what was done so you can pick this up later or revert.

---

## What was done

Notes & reminders on the **Admin Tools** page are now stored in the database instead of localStorage.

1. **New table: `admin_notes`** (Supabase)
2. **API routes** under `/api/admin/notes` (admin-only)
3. **AdminNotes component** updated to use the API instead of localStorage

---

## 1. Database: `admin_notes` table

**File:** `supabase/schema.sql`

- **Table:** `admin_notes`
  - `id` — UUID, primary key
  - `text` — note content
  - `checked` — boolean (checklist style)
  - `sort_order` — integer for ordering
  - `created_at`, `updated_at` — timestamps
- **RLS:** Enabled, no policies (only server with service role can access).
- **Trigger:** `update_admin_notes_updated_at` keeps `updated_at` in sync.
- **Indexes:** `idx_admin_notes_created`, `idx_admin_notes_sort`.

To apply: run the “ADMIN NOTES” section of `supabase/schema.sql` in the Supabase SQL Editor (or run the full schema if you prefer).

---

## 2. API routes

- **`GET /api/admin/notes`** — List all notes. Returns `{ notes: [{ id, text, checked, createdAt }] }`. Requires admin cookie.
- **`POST /api/admin/notes`** — Create note. Body: `{ "text": "..." }`. Returns `{ note }`. Requires admin cookie.
- **`PATCH /api/admin/notes/[id]`** — Update note. Body: `{ "text": "..." }` and/or `{ "checked": true/false }`. If `text` is sent and empty, the note is deleted and response is `{ deleted: true }`. Requires admin cookie.
- **`DELETE /api/admin/notes/[id]`** — Delete note. Returns `{ ok: true }`. Requires admin cookie.

**Files:**
- `src/app/api/admin/notes/route.js` — GET, POST
- `src/app/api/admin/notes/[id]/route.js` — PATCH, DELETE

All routes use `isAdminAuthenticated(request)` and `createAdminClient()` (service role).

---

## 3. AdminNotes component

**File:** `src/components/admin/AdminNotes.jsx`

- Loads notes from `GET /api/admin/notes` on mount.
- Add note → `POST /api/admin/notes` with `{ text }`.
- Edit note → `PATCH /api/admin/notes/[id]` with `{ text }` (or delete if text is cleared).
- Toggle checkbox → `PATCH /api/admin/notes/[id]` with `{ checked }` (optimistic update).
- Delete → `DELETE /api/admin/notes/[id]`.
- Uses `credentials: 'include'` so the admin cookie is sent.
- Shows loading and error states.

---

## Reverting (back to localStorage)

1. **Schema:** Remove the `admin_notes` block from `supabase/schema.sql`. In Supabase SQL Editor, run: `DROP TABLE IF EXISTS admin_notes CASCADE;`
2. **API:** Delete `src/app/api/admin/notes/route.js` and `src/app/api/admin/notes/[id]/route.js`.
3. **Component:** Restore the previous `AdminNotes.jsx` that used `STORAGE_KEY = 'apl-admin-notes'`, `loadNotes()`, and `saveNotes()` (e.g. `git checkout HEAD -- src/components/admin/AdminNotes.jsx`).

---

## Migration from localStorage (optional)

Old notes in `apl-admin-notes` (localStorage) are **not** migrated automatically. To migrate:

- Add notes manually in the UI after the table exists, or
- Add a one-time script or admin page that reads localStorage and POSTs each note to `POST /api/admin/notes`.

---

*Last updated: March 2025*
