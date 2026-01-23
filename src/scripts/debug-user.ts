'use server'
// Helper script to debug user creation failure in isolation

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=')
        if (key && values.length > 0) {
            process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '')
        }
    })
}

export async function main() {
  console.log('--- STARTING USER CREATION TEST ---')
  
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!sbUrl || !sbKey) {
      console.error('Missing Env Vars')
      process.exit(1)
  }

  const admin = createClient(sbUrl, sbKey, {
      auth: { autoRefreshToken: false, persistSession: false }
  })
  
  const testEmail = `test_${Date.now()}@example.com`
  console.log(`Attempting to create user: ${testEmail}`)

  const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: "TestPassword123!",
      email_confirm: true,
      user_metadata: {
          first_name: "Test",
          last_name: "Script",
          force_password_change: true
      }
  })

  if (error) {
      console.error('FAILED:', error)
      console.error('JSON:', JSON.stringify(error, null, 2))
  } else {
      console.log('SUCCESS:', data.user?.id)
      // Cleanup
      await admin.auth.admin.deleteUser(data.user!.id)
  }
}

main().catch(console.error)
