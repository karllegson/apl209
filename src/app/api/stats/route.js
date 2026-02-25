import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

// GET — Dashboard statistics (admin only)
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
        error: 'Server configuration error. Please check Supabase credentials.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const [
    totalResult,
    pendingResult,
    confirmedResult,
    completedResult,
    cancelledResult,
    todayResult,
    standbyResult,
    recentResult,
  ] = await Promise.all([
    admin.from('appointments').select('*', { count: 'exact', head: true }),
    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed'),
    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed'),
    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled'),
    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`),
    // Attempted count must match attempted page: standby_appointments with status=attempted
    // that are NOT linked to an appointment already confirmed/cancelled/completed
    (async () => {
      const { data: standbyList } = await admin
        .from('standby_appointments')
        .select('id, source_appointment_id, merged_appointment_id')
        .eq('status', 'attempted')
      const linkedIds = [...new Set(
        (standbyList || []).flatMap((s) => [s.source_appointment_id, s.merged_appointment_id].filter(Boolean))
      )]
      if (linkedIds.length === 0) return { count: standbyList?.length ?? 0 }
      const { data: linkedAppointments } = await admin
        .from('appointments')
        .select('id, status')
        .in('id', linkedIds)
      const resolvedIds = new Set(
        (linkedAppointments || []).filter((a) => ['confirmed', 'cancelled', 'completed'].includes(a.status)).map((a) => a.id)
      )
      const count = (standbyList || []).filter((s) => {
        const srcId = s.source_appointment_id || s.merged_appointment_id
        return !srcId || !resolvedIds.has(srcId)
      }).length
      return { count }
    })(),
    admin
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  let linkClicks = {
    'pricing-request-appointment': 0,
    'pricing-back-to-home': 0,
    'google-business': 0,
  }
  try {
    const [linkReqApp, linkBackHome, linkGoogle] = await Promise.all([
      admin.from('link_clicks').select('*', { count: 'exact', head: true }).eq('link_id', 'pricing-request-appointment'),
      admin.from('link_clicks').select('*', { count: 'exact', head: true }).eq('link_id', 'pricing-back-to-home'),
      admin.from('link_clicks').select('*', { count: 'exact', head: true }).eq('link_id', 'google-business'),
    ])
    linkClicks = {
      'pricing-request-appointment': linkReqApp?.count ?? 0,
      'pricing-back-to-home': linkBackHome?.count ?? 0,
      'google-business': linkGoogle?.count ?? 0,
    }
  } catch (_) {
    // link_clicks table may not exist yet
  }

  return NextResponse.json({
    stats: {
      total: totalResult.count || 0,
      pending: pendingResult.count || 0,
      confirmed: confirmedResult.count || 0,
      completed: completedResult.count || 0,
      cancelled: cancelledResult.count || 0,
      today: todayResult.count || 0,
      standby: standbyResult?.count ?? 0,
      linkClicks,
    },
    recentAppointments: recentResult.data || [],
  })
}
