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
  if (typeof p !== 'string') return null
  const trimmed = p.trim().replace(/^\/+/, '')
  if (!trimmed) return null
  if (trimmed.includes('..')) return null
  const segments = trimmed.split('/').filter(Boolean)
  if (segments.length === 0) return null
  const segOk = /^[a-zA-Z0-9._-]+(?: [a-zA-Z0-9._-]+)*$/ // allow spaces in filenames
  for (const seg of segments) {
    if (!segOk.test(seg)) return null
  }
  return segments.join('/')
}

export async function GET(request) {
  if (!isKarlAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const pathParam = url.searchParams.get('path')
  const objectPath = sanitizePath(pathParam || '')
  if (!objectPath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const admin = createAdminClient()
  const bucket = getBucket()

  const { data, error } = await admin.storage.from(bucket).createSignedUrl(objectPath, 60 * 10) // 10 min
  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to create signed URL' }, { status: 500 })
  }

  // Return as an attachment so browsers download instead of previewing in a tab.
  // We proxy the signed URL and add a Content-Disposition header.
  const fileName = objectPath.split('/').pop() || 'download'

  const upstream = await fetch(data.signedUrl)
  if (!upstream.ok) {
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
  const safeFileName = String(fileName).replace(/"/g, '')

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${safeFileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}

