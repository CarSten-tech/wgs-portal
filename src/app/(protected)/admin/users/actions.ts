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
  console.log('[createUser] Starting creation for:', data.email)
  const supabase = await createClient() // Regulaerer Client um Admin ID zu holen
  const supabaseAdmin = createAdminClient() // Admin Client fuer Auth Creation
  
  // 0. Get Acting Admin ID
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser) {
    return { error: 'Unauthorized: No active session' }
  }

  // 1. Auth-User erstellen
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password, 
    email_confirm: true,
    user_metadata: {
      force_password_change: true 
    }
  })

  if (authError) {
    console.error('[createUser] Auth Error:', authError)
    return { error: authError.message }
  }

  if (!authUser.user) {
    return { error: 'Failed to create user' }
  }

  // 2. Profil MANUELL erstellen
  console.log('[createUser] Creating Profile...')
  
  const payload = {
    id: authUser.user.id,
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    role: data.role,
    agency_id: data.agencyId || null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert(payload)

  if (profileError) {
    console.error('[createUser] Profile Error:', profileError)
    
    // Rollback Auth
    console.log('[createUser] Rolling back Auth User...')
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    
    return { error: `Fehler beim Profil-Erstellen: ${profileError.message}` }
  }

  // 3. Audit Log unterschreiben (Fix für "Unbekannt" bei Erstellung)
  if (adminUser) {
    console.log('[createUser] Patching Audit Log for Admin:', adminUser.id)
    await supabaseAdmin
      .from('audit_logs')
      .update({ changed_by: adminUser.id })
      .eq('record_id', authUser.user.id)
      .eq('table_name', 'profiles')
      .is('changed_by', null)
      
    // 4. Notification

    // 4. Notification
    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        title: 'Neuer Benutzer',
        message: `Benutzer ${data.firstName} ${data.lastName} wurde erstellt.`,
        type: 'info',
        user_id: adminUser.id,
        link: `/admin/logs?q=${data.email}`
      })
      
    if (notifError) console.error('[createUser] Notification Error:', notifError)
    else console.log('[createUser] Notification inserted for:', adminUser.id)
  }

  console.log('[createUser] Success')
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

  // Notification
  const { data: { user: adminUser } } = await supabaseAdmin.auth.getUser() // Service role might not give user? Wait.
  // We need the ACTUAL admin user from session to notify THEM.
  // resetUserPassword uses `createAdminClient`, doesn't check session explicitly in this func?
  // But this is a Server Action called by client.
  // Better: Get session from normal client.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
     await supabaseAdmin
      .from('notifications')
      .insert({
        title: 'Passwort zurückgesetzt',
        message: `Das Passwort für Benutzer-ID ${id} wurde geändert.`,
        type: 'warning',
        user_id: user.id
      })
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
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Parallel Execution of Critical Updates
  const [profileResult, authResult, userResult] = await Promise.all([
    // 1. Profile Update
    supabase
      .from('profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        agency_id: data.agencyId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id),
    
    // 2. Auth Metadata Update
    supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
      }
    }),

    // 3. Get Acting User (for notification)
    supabase.auth.getUser()
  ])

  // Check Profile Error
  if (profileResult.error) {
    console.error('[updateUser] Profile Error:', profileResult.error)
    return { error: profileResult.error.message }
  }

  // Check Auth Error
  if (authResult.error) {
     console.error('[updateUser] Auth Error:', authResult.error) // Non-critical but good to know
  }

  // 4. Notification (Fast Insert)
  const adminUser = userResult.data.user
  if (adminUser) {
    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        title: 'Benutzer aktualisiert',
        message: `Benutzer ${data.firstName} ${data.lastName} wurde erfolgreich bearbeitet.`,
        type: 'info',
        user_id: adminUser.id,
        link: `/admin/logs?q=${data.firstName}` 
      })

    if (notifError) console.error('[updateUser] Notification Error:', notifError)
    else console.log('[updateUser] Notification inserted for:', adminUser.id)
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  const supabase = await createClient() // Authentifizierter Client (Wichtig fuer Audit Log)
  const supabaseAdmin = createAdminClient() // Service Role (fuer Auth Ban)

  // 1. Profil Status Update via RLS
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    console.error('[toggleUserStatus] Profile Error:', error)
    return { error: error.message }
  }

  // 2. Auth Ban Status Update (Service Role notwendig)
  if (!isActive) {
    await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876000h' }) // 100 years
  } else {
    await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '0' })
  }

  // Notification
  // Fetch session again since we need actor ID
  const { data: { user: actor } } = await supabase.auth.getUser()
  if (actor) {
    await supabaseAdmin
        .from('notifications')
        .insert({
        title: isActive ? 'Benutzer aktiviert' : 'Benutzer deaktiviert',
        message: `Benutzer-ID ${id} wurde ${isActive ? 'freigeschaltet' : 'gesperrt'}.`,
        type: isActive ? 'info' : 'warning',
        user_id: actor.id
        })
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

  // Notification
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
      await supabaseAdmin
          .from('notifications')
          .insert({
            title: 'Benutzer gelöscht',
            message: `Benutzer-ID ${id} wurde entfernt.`,
            type: 'error',
            user_id: user.id
          })
  }

  revalidatePath('/admin/users')
  return { success: true }
}
