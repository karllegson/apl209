import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated } from '@/lib/auth/admin'

export const runtime = 'nodejs'

const STAFF_COOKIE = 'apl_staff_name'
const REQUIRED_STAFF = 'Karl Legson'
const DEFAULT_BUCKET = 'admin-uploads'

function getBucket() {
  return process.env.SUPABASE_UPLOADS_BUCKET || DEFAULT_BUCKET
}

function isKarlAdmin(request) {
  const adminAuth = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || isAdminAuthenticated(request)
  if (!adminAuth) return false
  const staffName = request.cookies.get(STAFF_COOKIE)?.value
  return staffName === REQUIRED_STAFF
}

function sanitizePath(p) {
  if (typeof p !== 'string') return ''
  const trimmed = p.trim().replace(/^\/+/, '')
  if (!trimmed) return ''
  if (trimmed.includes('..')) return null
  const segments = trimmed.split('/').filter(Boolean)
  if (segments.length === 0) return ''
  const segOk = /^[a-zA-Z0-9._-]+$/
  for (const seg of segments) {
    if (!segOk.test(seg)) return null
  }
  return segments.join('/')
}

export async function POST(request) {
  if (!isKarlAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const prefix = sanitizePath(body?.path || '')
  if (prefix === null) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }
  if (!prefix) {
    return NextResponse.json({ error: 'path is required (non-empty)' }, { status: 400 })
  }

  const admin = createAdminClient()
  const bucket = getBucket()

  // Create a placeholder object so the folder shows up in listings.
  const keepPath = `${prefix}/.keep`
  const blob = new Blob([''], { type: 'text/plain' })

  const { error } = await admin.storage.from(bucket).upload(keepPath, blob, {
    contentType: 'text/plain',
    upsert: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to create folder' }, { status: 500 })
  }

  return NextResponse.json({ success: true, path: prefix })
}

