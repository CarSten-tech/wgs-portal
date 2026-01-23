'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function deleteAuditLog(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/logs')
  return { success: true }
}

export async function deleteBatchAuditLogs(ids: string[]) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .in('id', ids)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/logs')
  return { success: true }
}

export async function clearAuditLogs() {
  const supabase = createAdminClient()

  // Optional: Add logic to only clear old logs, or all
  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/logs')
  return { success: true }
}
