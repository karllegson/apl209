import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

function getAdminClient() {
  try {
    return createAdminClient()
  } catch (err) {
    console.error('Supabase admin client error:', err.message)
    return null
  }
}

const DEFAULT_ITEMS = [
  { label: 'Excel Deposit Log', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Petty Cash Balance', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Covetrus', more_info: '', tool: 'covetrusTax', can_edit_more_info: false },
  { label: 'MWI', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Amazon Receipts', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Amazon Refunds (If we have any)', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'ROO', more_info: '', tool: '', can_edit_more_info: false },

  { label: 'F&M Bank Deposit Receipts', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Scanned Checks', more_info: '', tool: '', can_edit_more_info: false },

  // Bank statements
  { label: 'Bank Statement — F&M x3001', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Bank Statement — F&M x3002', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Bank Statement — Bank of Stockton x2223', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Bank Statement — Bank of Stockton x1718', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Bank Statement — BMO x8959 (Credit Card)', more_info: '', tool: '', can_edit_more_info: false },

  { label: 'Sales Tax Summary', more_info: '', tool: '', can_edit_more_info: false },

  { label: 'Credit Card Receipts', more_info: '', tool: '', can_edit_more_info: false },

  { label: 'Transamerica', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Workers Comp Payroll', more_info: '', tool: '', can_edit_more_info: false },

  { label: 'SFSPCA Vouchers', more_info: '', tool: '', can_edit_more_info: false },

  { label: 'Paypal', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Square', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Venmo', more_info: '', tool: '', can_edit_more_info: false },
  { label: 'Safeway', more_info: '', tool: '', can_edit_more_info: false },
]

export async function GET(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server configuration error. Check Supabase credentials.' },
      { status: 500 }
    )
  }

  const reseed = request.nextUrl?.searchParams?.get('reseed') === '1'

  let data
  let error

  if (reseed) {
    const del = await admin.from('sharefile_checklist_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (del.error && !del.error.message?.includes('does not exist')) {
      return NextResponse.json({ error: del.error.message }, { status: 500 })
    }
    const seedRows = DEFAULT_ITEMS.map((item, index) => ({
      label: item.label,
      more_info: item.more_info || '',
      tool: item.tool || '',
      can_edit_more_info: !!item.can_edit_more_info,
      sort_order: index,
    }))
    const seedResult = await admin.from('sharefile_checklist_items').insert(seedRows).select('*')
    if (seedResult.error) {
      return NextResponse.json(
        { error: seedResult.error.message, needsMigration: /does not exist|relation/i.test(seedResult.error.message) },
        { status: 500 }
      )
    }
    data = seedResult.data || []
  } else {
    const result = await admin
      .from('sharefile_checklist_items')
      .select('id, label, checked, more_info, tool, can_edit_more_info, sort_order, created_at, updated_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    data = result.data
    error = result.error
  }

  if (error) {
    const needsMigration = /does not exist|relation/i.test(error.message)
    if (needsMigration) {
      return NextResponse.json({ items: [], needsMigration: true, message: 'Run the sharefile_checklist_items migration in Supabase (see supabase/schema.sql).' })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    // Seed with defaults on first use
    const seedRows = DEFAULT_ITEMS.map((item, index) => ({
      label: item.label,
      more_info: item.more_info || '',
      tool: item.tool || '',
      can_edit_more_info: !!item.can_edit_more_info,
      sort_order: index,
    }))
    const seedResult = await admin.from('sharefile_checklist_items').insert(seedRows).select('*')
    if (seedResult.error) {
      const needsMigration = /does not exist|relation/i.test(seedResult.error.message)
      if (needsMigration) {
        return NextResponse.json({ items: [], needsMigration: true, message: 'Run the sharefile_checklist_items migration in Supabase (see supabase/schema.sql).' })
      }
      return NextResponse.json({ error: seedResult.error.message }, { status: 500 })
    }
    data = seedResult.data || []
  }

  const items = (data || []).map((row) => ({
    id: row.id,
    label: row.label || '',
    checked: !!row.checked,
    moreInfo: row.more_info || '',
    tool: row.tool || '',
    canEditMoreInfo: !!row.can_edit_more_info,
    sortOrder: row.sort_order ?? 0,
  }))

  return NextResponse.json({ items })
}

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server configuration error. Check Supabase credentials.' },
      { status: 500 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const label = typeof body.label === 'string' ? body.label.trim() : ''
  if (!label) {
    return NextResponse.json({ error: 'label is required' }, { status: 400 })
  }

  const { data: existing } = await admin
    .from('sharefile_checklist_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = existing != null && typeof existing.sort_order === 'number'
    ? existing.sort_order + 1
    : 0

  const row = {
    label,
    more_info: typeof body.moreInfo === 'string' ? body.moreInfo.trim() : '',
    tool: typeof body.tool === 'string' ? body.tool.trim() : '',
    can_edit_more_info: !!body.canEditMoreInfo,
    sort_order: sortOrder,
  }

  const { data, error } = await admin
    .from('sharefile_checklist_items')
    .insert(row)
    .select('id, label, checked, more_info, tool, can_edit_more_info, sort_order, created_at, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    item: {
      id: data.id,
      label: data.label || '',
      checked: !!data.checked,
      moreInfo: data.more_info || '',
      tool: data.tool || '',
      canEditMoreInfo: !!data.can_edit_more_info,
      sortOrder: data.sort_order ?? 0,
    },
  })
}

