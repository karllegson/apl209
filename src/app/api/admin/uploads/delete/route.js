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
  // Same constraint as list/upload. Filenames may have spaces in downloads,
  // but for safety on delete we keep this strict.
  const segOk = /^[a-zA-Z0-9._-]+(?: [a-zA-Z0-9._-]+)*$/
  for (const seg of segments) {
    if (!segOk.test(seg)) return null
  }
  return segments.join('/')
}

function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

export async function DELETE(request) {
  if (!isKarlAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const objectPath = sanitizePath(body?.path || '')
  if (!objectPath) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 })
  }

  const recursive = body?.recursive === true

  const admin = createAdminClient()
  const bucket = getBucket()

  if (!recursive) {
    const { error } = await admin.storage.from(bucket).remove([objectPath])
    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 })
    }
    return NextResponse.json({ success: true, deleted: 1 })
  }

  // Recursive folder deletion: delete all objects under `${objectPath}/`.
  const folderPrefix = `${objectPath}/`
  const toDelete = []
  const maxLoops = 20
  let offset = 0
  const limit = 200

  for (let i = 0; i < maxLoops; i++) {
    const { data, error } = await admin.storage.from(bucket).list(folderPrefix, { limit, offset })
    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to list for delete' }, { status: 500 })
    }

    if (!data || data.length === 0) break

    for (const obj of data) {
      const name = obj?.name
      if (!name) continue
      if (name === '.keep' || name.endsWith('/.keep')) {
        toDelete.push(`${folderPrefix}${name}`)
        continue
      }
      // obj.name is relative to the prefix we listed.
      toDelete.push(`${folderPrefix}${name}`)
    }

    if (data.length < limit) break
    offset += data.length
  }

  // Delete in batches.
  const batches = chunk(toDelete, 100)
  for (const b of batches) {
    const { error } = await admin.storage.from(bucket).remove(b)
    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to delete objects' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, deleted: toDelete.length })
}

