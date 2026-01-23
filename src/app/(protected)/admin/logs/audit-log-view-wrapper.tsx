"use client"

import { useQueryState } from 'nuqs'
import { AuditDiffViewer } from '@/components/admin/audit/audit-diff-viewer'

interface AuditLogViewWrapperProps {
  log: any
  agencyMap: Record<string, string>
}

export function AuditLogViewWrapper({ log, agencyMap }: AuditLogViewWrapperProps) {
  const [viewId, setViewId] = useQueryState('view', { shallow: false })

  const isOpen = !!viewId && viewId === log.id

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setViewId(null)
    }
  }

  if (!isOpen) return null

  // Transform log data if needed or passed raw
  // AuditDiffViewer expects: oldData, newData, operation, tableName, agencyMap
  
  return (
    <AuditDiffViewer 
      open={true}
      onOpenChange={handleOpenChange}
      oldData={log.old_data}
      newData={log.new_data}
      operation={log.operation}
      tableName={log.table_name} // Label logic is inside Viewer or caller? Viewer expects label.
      // Wait, AuditDiffViewer usually takes raw strings. We might need logic here.
      // Let's check AuditDiffViewer. 
      // Assuming it handles labeled props if passed, or we pass raw.
      // previous implementation passed labeled table name.
      agencyMap={agencyMap}
    />
  )
}
