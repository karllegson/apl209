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
  // Still require the admin session cookie (same guard as other admin APIs)
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

  // Storage “folders” are path prefixes. Keep names safe.
  const segOk = /^[a-zA-Z0-9._-]+$/
  for (const seg of segments) {
    if (!segOk.test(seg)) return null
  }

  return segments.join('/')
}

function sanitizeFileName(name) {
  if (typeof name !== 'string') return ''
  const base = name.split('/').pop().split('\\').pop()
  const trimmed = base.trim()
  if (!trimmed) return ''
  if (trimmed.includes('..')) return ''
  // Keep it safe for object keys. Allow dot/underscore/dash/spaces.
  const safe = trimmed.replace(/[^a-zA-Z0-9._\- ]/g, '_').replace(/\s+/g, ' ').trim()
  return safe
}

export async function GET(request) {
  if (!isKarlAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const pathParam = url.searchParams.get('path') || ''
  const prefix = sanitizePath(pathParam)
  if (prefix === null) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const admin = createAdminClient()
  const bucket = getBucket()

  const { data, error } = await admin.storage.from(bucket).list(prefix || '', { limit: 500 })
  if (error) {
    const msg = error.message || 'Failed to list bucket contents'
    return NextResponse.json({ error: msg, needsBucket: /bucket|not found|does not exist/i.test(msg) }, { status: 500 })
  }

  const foldersSet = new Set()
  const files = []

  for (const obj of data || []) {
    const name = obj?.name
    if (!name) continue

    // Ignore placeholder “.keep” files (we use them to create folders).
    if (name === '.keep' || name.endsWith('/.keep')) continue

    // We treat the first path segment as a folder, if deeper than one segment.
    const parts = String(name).split('/')
    if (parts.length > 1) {
      const folderName = parts[0]
      if (!folderName || folderName === '.keep') continue
      const folderPath = prefix ? `${prefix}/${folderName}` : folderName
      foldersSet.add(folderPath)
      continue
    }

    const filePath = prefix ? `${prefix}/${name}` : name
    files.push({
      name: String(name),
      path: filePath,
      size: typeof obj.size === 'number' ? obj.size : null,
      updatedAt: obj.updated_at || obj.created_at || null,
    })
  }

  const folders = [...foldersSet]
    .map((full) => {
      const seg = full.split('/').pop() || full
      return { name: seg, path: full }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  files.sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({
    bucket,
    prefix,
    folders,
    files,
  })
}

export async function POST(request) {
  if (!isKarlAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData()
  const pathParam = form.get('path') || ''
  const prefix = sanitizePath(String(pathParam))
  if (prefix === null) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const file = form.get('file')
  if (!file || typeof file !== 'object' || typeof file.name !== 'string') {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const fileName = sanitizeFileName(file.name)
  if (!fileName) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
  }

  // Keep it reasonable for in-memory uploads.
  const maxBytes = 25 * 1024 * 1024 // 25MB
  if (typeof file.size === 'number' && file.size > maxBytes) {
    return NextResponse.json({ error: `File too large (max ${maxBytes / (1024 * 1024)}MB)` }, { status: 413 })
  }

  const admin = createAdminClient()
  const bucket = getBucket()

  const objectPath = prefix ? `${prefix}/${fileName}` : fileName

  const { error } = await admin.storage
    .from(bucket)
    .upload(objectPath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, path: objectPath })
}

