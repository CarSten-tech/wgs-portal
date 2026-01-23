'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Notification {
  id: string
  title: string
  message: string | null
  type: 'info' | 'warning' | 'error' | 'success'
  created_at: string
  user_id: string | null
  link: string | null
}

export async function getUnreadNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // improved query: fetch notifications targeted to user OR global (null)
  // AND where there is NO record in notification_reads for this user.
  // This is tricky with simple Supabase helpers.
  // Easiest is to use RPC or a raw query, or fetch meaningful set and filter.
  // Given potential volume, let's try a left join approach logic if possible, 
  // but Supabase JS client doesn't do "NOT EXISTS" easily without RPC.
  
  // Alternative: Fetch all recent notifications for user, and all read receipts for user.
  // Then filter in memory (assuming notification volume isn't massive per user window).
  // Let's optimize: Fetch IDs of read notifications first.
  
  const { data: reads } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', user.id)

  const readIds = new Set(reads?.map(r => r.notification_id) || [])

  // Fetch candidate notifications
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(50) // Reasonable limit for "unread" dropdown

  if (error) {
      console.error('Error fetching notifications:', error)
      return []
  }

  // Filter out read ones
  const unread = notifications.filter(n => !readIds.has(n.id))

  return unread as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  /* Mark single notification */
  const { error } = await supabase
    .from('notification_reads')
    .upsert({
      notification_id: notificationId,
      user_id: user.id
    }, { onConflict: 'notification_id, user_id', ignoreDuplicates: true })

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout') 
  return { success: true }
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const unreads = await getUnreadNotifications()
  if (unreads.length === 0) return { success: true }

  const records = unreads.map(n => ({
      notification_id: n.id,
      user_id: user.id
  }))

  const { error } = await supabase
    .from('notification_reads')
    .upsert(records, { onConflict: 'notification_id, user_id', ignoreDuplicates: true })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}
