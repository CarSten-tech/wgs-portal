'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function createUser(data: {
  email: string
  password?: string
  firstName: string
  lastName: string
  role: string
  agencyId: string
}) {
  const supabaseAdmin = createAdminClient()
  
  // 1. Create Auth User
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password, // Optional: if undefined, Supabase might send invite if configured, but here we expect it for manual creation
    email_confirm: true,
    user_metadata: {
      first_name: data.firstName,
      last_name: data.lastName,
      force_password_change: true, // Force change on first login
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authUser.user) {
    return { error: 'Failed to create user' }
  }

  // 2. Create Profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: authUser.user.id,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
      agency_id: data.agencyId || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    })

  if (profileError) {
    // Optional: Delete auth user if profile creation fails
    // await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return { error: 'User created but profile setup failed: ' + profileError.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function resetUserPassword(id: string, password: string) {
  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    password: password,
    user_metadata: {
      force_password_change: true // Force change on next login
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUser(id: string, data: {
  firstName: string
  lastName: string
  role: string
  agencyId: string
}) {
  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
      agency_id: data.agencyId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }
  
  // Also update auth metadata for consistency
  await supabaseAdmin.auth.admin.updateUserById(id, {
    user_metadata: {
      first_name: data.firstName,
      last_name: data.lastName,
    }
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // If deactivating, maybe ban the user in Auth?
  if (!isActive) {
    await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876000h' }) // 100 years
  } else {
    await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '0' })
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const supabaseAdmin = createAdminClient()

  // Delete from Auth (Cascade usually handles profile, but good to be sure)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
