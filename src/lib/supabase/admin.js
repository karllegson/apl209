import { createClient } from '@supabase/supabase-js'

// Admin client uses the service role key — bypasses RLS
// Only use server-side (API routes, server actions)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || url.includes('your-project-id')) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL. Please set it in .env.local'
    )
  }

  if (!key || key.includes('your-service-role-key')) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. Please set it in .env.local'
    )
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
