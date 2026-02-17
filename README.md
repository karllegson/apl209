# Vet Clinic — Appointment Booking System

A modern appointment booking system for veterinary clinics, built with **Next.js**, **Supabase**, and **Tailwind CSS**. Deployable to **Vercel** and embeddable into a **WordPress** site via iframe.

---

## Features

### Public Booking Form (`/book`)
- Pet owner & pet information collection
- Service type selection (spay/neuter, TNR, wellness, vaccination)
- Multi-pet intake with health and vaccination details
- Optional vaccines and wellness add-ons
- Nonrefundable deposit (card details on Review & Sign)
- Mobile-responsive, modern UI
- Embeddable in WordPress via iframe

### Admin Dashboard (`/admin`)
- Password-protected login (default password: apl)
- Real-time statistics (total, pending, confirmed, today's, emergencies)
- Searchable & filterable appointment table
- Click-to-view appointment detail panel
- Update status (pending → confirmed → completed / cancelled / no-show)
- Delete appointments with confirmation
- CSV export
- Fully responsive

---

## Tech Stack

| Layer      | Tech                     |
|------------|--------------------------|
| Framework  | Next.js 15 (App Router)  |
| Database   | Supabase (PostgreSQL)    |
| Auth       | Cookie-based (admin only) |
| Styling    | Tailwind CSS v4          |
| Hosting    | Vercel                   |
| Icons      | Lucide React             |

---

## Setup Guide

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd apl209
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials and optional admin password:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
ADMIN_PASSWORD=apl
```

### 4. Run Locally

```bash
npm run dev
```

- **Booking form:** [http://localhost:3000/book](http://localhost:3000/book)
- **Admin:** [http://localhost:3000/admin](http://localhost:3000/admin) (password: apl)

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit: vet appointment booking system"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Add these **Environment Variables** in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy!

Your app will be live at `https://your-app.vercel.app`

---

## Embed in WordPress

### Option A: iframe (Recommended)

On your WordPress site, create a page at `/book` and add this HTML block:

```html
<iframe
  src="https://your-app.vercel.app/book"
  width="100%"
  height="900"
  style="border: none; max-width: 100%;"
  title="Book an Appointment"
></iframe>
```

**Tip:** Adjust the `height` value as needed, or use this responsive version:

```html
<div style="position: relative; width: 100%; padding-bottom: 120%; overflow: hidden;">
  <iframe
    src="https://your-app.vercel.app/book"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="Book an Appointment"
  ></iframe>
</div>
```

### Option B: Redirect

Create a WordPress page at `/book` and add a redirect to your Vercel URL using a plugin like **Redirection** or add this to your theme's `functions.php`:

```php
add_action('template_redirect', function() {
    if (is_page('book')) {
        wp_redirect('https://your-app.vercel.app/book');
        exit;
    }
});
```

---

## Project Structure

```
apl209/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── appointments/         # CRUD endpoints
│   │   │   │   ├── route.js          # GET all, POST new
│   │   │   │   └── [id]/route.js     # GET one, PATCH, DELETE
│   │   │   └── stats/route.js        # Dashboard stats
│   │   ├── book/
│   │   │   ├── page.jsx              # Public booking form
│   │   │   └── confirmation/page.jsx # Success page
│   │   ├── admin/
│   │   │   ├── login/page.jsx        # Admin login
│   │   │   ├── dashboard/page.jsx    # Main dashboard
│   │   │   └── appointments/page.jsx # Full appointments list
│   │   ├── layout.js
│   │   ├── globals.css
│   │   └── page.js                   # Redirects to /book
│   ├── components/
│   │   ├── BookingForm.jsx
│   │   ├── AppointmentTable.jsx
│   │   ├── AppointmentDetail.jsx
│   │   ├── StatsCards.jsx
│   │   ├── AdminSidebar.jsx
│   │   └── StatusBadge.jsx
│   ├── lib/supabase/
│   │   ├── client.js                 # Browser client
│   │   ├── server.js                 # Server client (cookies)
│   │   └── admin.js                  # Service role client
│   └── middleware.js                 # Auth protection
├── supabase/
│   └── schema.sql                    # Database schema
├── .env.local.example
├── next.config.mjs
└── package.json
```

---

## Admin Access

The admin dashboard is at `/admin`. Use password-only login (default: `apl`). Set `ADMIN_PASSWORD` in `.env.local` to change it.

---

## Reverting

If you need to revert to the previous state (before this system was built), the initial commit only contained a basic Express/SQLite boilerplate that was removed. This Next.js + Supabase setup is the full replacement.
