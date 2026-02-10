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
    weekResult,
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
    // Submitted today
    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`),
    // Submitted this week
    admin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${weekAgo}T00:00:00`),
    // Recent 5
    admin
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return NextResponse.json({
    stats: {
      total: totalResult.count || 0,
      pending: pendingResult.count || 0,
      confirmed: confirmedResult.count || 0,
      completed: completedResult.count || 0,
      cancelled: cancelledResult.count || 0,
      today: todayResult.count || 0,
      thisWeek: weekResult.count || 0,
    },
    recentAppointments: recentResult.data || [],
  })
}
