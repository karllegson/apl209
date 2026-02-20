import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'

const MAX_BODY_BYTES = 2 * 1024 * 1024 // 2MB (allow optional pet photos in drafts)
const MAX_FORM_DATA_KEYS = 200 // cap form_data object key count

// GET — resume: list drafts by email or phone (typically one)
export async function GET(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`intake-drafts-get:${ip}`, { windowMs: 60 * 1000, max: 30 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Try again in a minute.' },
        { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {} }
      )
    }
  }
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.trim()?.slice(0, 100)
    const phone = searchParams.get('phone')?.trim()?.slice(0, 30)
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Provide email or phone to resume' },
        { status: 400 }
      )
    }
    const supabase = createAdminClient()
    let query = supabase
      .from('intake_drafts')
      .select('id, step, form_data, updated_at, created_at')
      .order('updated_at', { ascending: false })
    if (email) query = query.eq('owner_email', email)
    else query = query.eq('owner_phone', phone)
    const { data: rows, error } = await query
    if (error) {
      console.error('intake-drafts GET', error)
      return NextResponse.json({ error: 'Failed to load drafts' }, { status: 500 })
    }
    const drafts = (rows || []).map((row) => ({
      id: row.id,
      step: row.step,
      formData: row.form_data,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    }))
    return NextResponse.json({ drafts })
  } catch (err) {
    console.error('intake-drafts GET', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}

// POST — save draft (upsert by owner email or phone)
export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`intake-drafts-post:${ip}`, { windowMs: 60 * 60 * 1000, max: 60 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many draft saves. Try again later.' },
        { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {} }
      )
    }
    const cl = request.headers.get('content-length')
    if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }
  }
  try {
    const body = await request.json()
    const { step, formData } = body
    if (typeof step !== 'number' || step < 1 || step > 5) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }
    const email = formData.owner_email?.trim()
    const phone = formData.owner_phone?.trim()
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Enter your email and phone on step 1 so we can save your progress' },
        { status: 400 }
      )
    }
    if (!devMode) {
      if (body && typeof body === 'object' && JSON.stringify(body).length > MAX_BODY_BYTES) {
        return NextResponse.json({ error: 'Request too large' }, { status: 413 })
      }
      const keyCount = formData && typeof formData === 'object' ? Object.keys(formData).length : 0
      if (keyCount > MAX_FORM_DATA_KEYS) {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
      }
    }
    const supabase = createAdminClient()
    const row = {
      owner_email: (email || '').slice(0, 100),
      owner_phone: (phone || '').slice(0, 30),
      step,
      form_data: formData,
      updated_at: new Date().toISOString(),
    }
    let existing = null
    if (email) {
      const { data } = await supabase
        .from('intake_drafts')
        .select('id')
        .eq('owner_email', email)
        .maybeSingle()
      existing = data
    }
    if (!existing && phone) {
      const { data } = await supabase
        .from('intake_drafts')
        .select('id')
        .eq('owner_phone', phone)
        .maybeSingle()
      existing = data
    }
    if (existing) {
      const { error } = await supabase
        .from('intake_drafts')
        .update({ step: row.step, form_data: row.form_data, updated_at: row.updated_at })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('intake_drafts').insert({
        owner_email: row.owner_email,
        owner_phone: row.owner_phone,
        step: row.step,
        form_data: row.form_data,
      })
      if (error) throw error
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('intake-drafts POST', err)
    return NextResponse.json(
      { error: err.message || 'Failed to save draft' },
      { status: 500 }
    )
  }
}
