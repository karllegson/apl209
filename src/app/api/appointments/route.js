import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

// GET — List all intake submissions (admin only)
export async function GET(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json(
      {
        error:
          'Server configuration error. Please check Supabase credentials.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let query = admin.from('appointments').select('*', { count: 'exact' })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(
      `owner_name.ilike.%${search}%,owner_first_name.ilike.%${search}%,owner_last_name.ilike.%${search}%,owner_email.ilike.%${search}%,owner_phone.ilike.%${search}%,city.ilike.%${search}%,street_address.ilike.%${search}%,state.ilike.%${search}%,zip_code.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    appointments: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  })
}

// POST — Submit a new intake form (public — no auth required)
export async function POST(request) {
  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json(
      {
        error:
          'Server configuration error. Please check Supabase credentials in .env.local',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate required fields (skipped in dev mode)
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    if (!body.owner_first_name?.trim()) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }
    if (!body.owner_last_name?.trim()) {
      return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
    }
    if (!body.owner_phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }
    if (!body.owner_email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.owner_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!body.street_address?.trim()) {
      return NextResponse.json({ error: 'Street address is required' }, { status: 400 })
    }
    if (!body.city?.trim()) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }
    if (!body.state?.trim()) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 })
    }
    if (!body.zip_code?.trim()) {
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 })
    }
    if (!body.pets || !Array.isArray(body.pets) || body.pets.length === 0) {
      return NextResponse.json({ error: 'At least one pet is required' }, { status: 400 })
    }
    if (!body.legal_acknowledged) {
      return NextResponse.json({ error: 'Legal acknowledgement is required' }, { status: 400 })
    }
    if (!body.signature?.trim()) {
      return NextResponse.json({ error: 'Signature is required' }, { status: 400 })
    }
  }

  try {
    const { data, error } = await admin
      .from('appointments')
      .insert({
        is_returning_customer: body.is_returning_customer || false,
        owner_name: [body.owner_first_name, body.owner_last_name].map((s) => s?.trim()).filter(Boolean).join(' ') || body.owner_name?.trim() || '',
        owner_first_name: body.owner_first_name?.trim() || '',
        owner_last_name: body.owner_last_name?.trim() || '',
        owner_phone: body.owner_phone?.trim() || '',
        owner_email: body.owner_email?.trim().toLowerCase() || '',
        emergency_contact_name: body.emergency_contact_name?.trim() || '',
        emergency_contact_phone: body.emergency_contact_phone?.trim() || '',
        preferred_contact: body.preferred_contact || 'call',
        street_address: body.street_address?.trim() || '',
        city: body.city?.trim() || '',
        state: body.state?.trim() || '',
        zip_code: body.zip_code?.trim() || '',
        how_heard: body.how_heard?.trim() || '',
        requested_service: body.requested_service?.trim() || '',
        num_pets: body.num_pets || (body.pets?.length || 0),
        pets: body.pets || [],
        wants_microchip: (Array.isArray(body.optional_wellness_services) && body.optional_wellness_services.includes('microchip')) || body.wants_microchip || false,
        wants_nail_trim: (Array.isArray(body.optional_wellness_services) && body.optional_wellness_services.includes('nail_trim')) || body.wants_nail_trim || false,
        wants_flea_treatment: (Array.isArray(body.optional_wellness_services) && (body.optional_wellness_services.includes('flea_selarid_feline') || body.optional_wellness_services.includes('flea_para_defense_k9'))) || body.wants_flea_treatment || false,
        optional_vaccines: Array.isArray(body.optional_vaccines) ? body.optional_vaccines : [],
        optional_wellness_services: Array.isArray(body.optional_wellness_services) ? body.optional_wellness_services : [],
        deposit_acknowledged: body.deposit_acknowledged || false,
        deposit_card_last4: (body.deposit_card_last4 || '').toString().replace(/\D/g, '').slice(0, 4) || '',
        deposit_card_expiry: (body.deposit_card_expiry || '').toString().trim().slice(0, 10) || '',
        deposit_billing_zip: (body.deposit_billing_zip || '').toString().trim().slice(0, 10) || '',
        legal_acknowledged: body.legal_acknowledged || false,
        signature: body.signature?.trim() || '',
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        {
          error: error.message || 'Failed to save submission',
          details:
            process.env.NODE_ENV === 'development'
              ? JSON.stringify(error)
              : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ appointment: data }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }
}
