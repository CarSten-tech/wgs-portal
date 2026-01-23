import { createClient } from '@/lib/supabase/server'
import { LogsToolbar } from '@/components/admin/audit/logs-toolbar'
import { searchParamsCache } from '@/app/(protected)/admin/logs/search-params' 
import { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'
import { AuditLogViewWrapper } from '@/app/(protected)/admin/logs/audit-log-view-wrapper'
import { AuditLogsClient } from '@/components/admin/audit/audit-logs-client'
import { PaginationControls } from '@/components/ui/pagination-controls'

export default async function AuditLogsPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await props.searchParams
  // Parse params cleanly
  const { q, operation, table, page, perPage } = searchParamsCache.parse(searchParams)

  const supabase = await createClient()

  // Pagination
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  // Start building query
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      actor:profiles (
        first_name,
        last_name,
        email
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  // 1. Filter by Action
  if (operation && operation !== 'ALL') {
    query = query.eq('operation', operation)
  }

  // 2. Filter by Table
  if (table && table !== 'ALL') {
    query = query.eq('table_name', table)
  }
  
  // 3. Search
  if (q) {
     const term = q
     // Search profiles for matching actors
     const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('id')
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)
     
     const actorIds = matchedProfiles?.map(p => p.id) || []
     
     const orConditions = []
     if (actorIds.length > 0) {
        const quotedIds = actorIds.map(id => `"${id}"`).join(',')
        orConditions.push(`changed_by.in.(${quotedIds})`)
     }
     orConditions.push(`table_name.ilike.%${term}%`)
     
     // Search in JSON data (name fields)
     orConditions.push(`new_data->>name.ilike.%${term}%`)
     orConditions.push(`old_data->>name.ilike.%${term}%`)
     orConditions.push(`new_data->>first_name.ilike.%${term}%`)
     orConditions.push(`old_data->>first_name.ilike.%${term}%`)
     orConditions.push(`new_data->>last_name.ilike.%${term}%`)
     orConditions.push(`old_data->>last_name.ilike.%${term}%`)

     // Also search email in JSON for users
     orConditions.push(`new_data->>email.ilike.%${term}%`)
     
     // Also search values if possible? For now adhere to prev logic.
     query = query.or(orConditions.join(','))
  }

  const { data: logs, error, count } = await query

  if (error) {
    console.error('Error fetching logs:', error)
    return <div className="p-8 text-red-500">Fehler beim Laden der Logs.</div>
  }

  // Fetch agencies for lookup
  const { data: agencies } = await supabase.from('agencies').select('id, name')
  const agencyMap = (agencies || []).reduce((acc: any, agency: any) => {
    acc[agency.id] = agency.name
    return acc
  }, {})

  // Transform logs
  const formattedLogs = logs.map((log: any) => ({
    ...log,
    actor_name: log.actor 
      ? `${log.actor.first_name || ''} ${log.actor.last_name || ''}`.trim() || log.actor.email 
      : 'Unbekannt'
  }))

  const viewId = searchParams.view as string | undefined
  let selectedLog = null
  if (viewId) {
     selectedLog = formattedLogs.find(l => l.id === viewId)
     if (!selectedLog) {
        const { data: singleLog } = await supabase
          .from('audit_logs')
          .select(`*, actor:profiles(*)`)
          .eq('id', viewId)
          .single()
        
        if (singleLog) {
            selectedLog = { 
                ...singleLog,
                actor_name: singleLog.actor 
                 ? `${singleLog.actor.first_name || ''} ${singleLog.actor.last_name || ''}`.trim() || singleLog.actor.email 
                 : 'Unbekannt'
            }
        }
     }
  }

  return (
    <div className="h-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Systemprotokolle
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
             Vollständiger Audit-Trail aller Änderungen.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm flex flex-col">
         <Suspense fallback={<div className="p-4">Lade Tabelle...</div>}>
           <AuditLogsClient logs={formattedLogs} />
         </Suspense>
         <PaginationControls total={count || 0} />
      </div>

       {selectedLog && (
          <Suspense fallback={null}>
             <AuditLogViewWrapper log={selectedLog} agencyMap={agencyMap} />
          </Suspense>
       )}

    </div>
  )
}
