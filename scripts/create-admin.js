/**
 * Quick script to create an admin user in Supabase Auth
 * Run: node scripts/create-admin.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kuixjpvlyjiavnwcqxkz.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

async function createAdminUser() {
  const email = process.argv[2] || 'admin@apl209.org'
  const password = process.argv[3] || 'Admin123!@#'
  
  console.log(`Creating admin user: ${email}`)
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create user')
    }

    const user = await response.json()
    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n📝 Admin uses password-only auth. Visit http://localhost:3000/admin (password: apl)')
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  }
}

createAdminUser()
