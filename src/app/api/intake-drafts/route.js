import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET — resume: find draft by email or phone
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.trim()
    const phone = searchParams.get('phone')?.trim()
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Provide email or phone to resume' },
        { status: 400 }
      )
    }
    const supabase = createAdminClient()
    let query = supabase.from('intake_drafts').select('id, step, form_data')
    if (email) query = query.eq('owner_email', email)
    else query = query.eq('owner_phone', phone)
    const { data, error } = await query.maybeSingle()
    if (error) {
      console.error('intake-drafts GET', error)
      return NextResponse.json({ error: 'Failed to load draft' }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ draft: null }, { status: 200 })
    }
    return NextResponse.json({
      draft: {
        id: data.id,
        step: data.step,
        formData: data.form_data,
      },
    })
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
    const supabase = createAdminClient()
    const row = {
      owner_email: email || '',
      owner_phone: phone || '',
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
