"use client"

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns, AuditLog } from '@/app/(protected)/admin/logs/columns'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteBatchAuditLogs } from '@/app/(protected)/admin/logs/actions'
import { LogsToolbar } from '@/components/admin/audit/logs-toolbar'

import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AuditLogsClientProps {
  logs: AuditLog[]
}

export function AuditLogsClient({ logs }: AuditLogsClientProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedCount = Object.keys(rowSelection).length

  const handleBatchDelete = async () => {
    setIsDeleting(true)
    setShowDeleteDialog(false)
    
    // Get IDs from selection
    // rowSelection is { [index]: true }. Map to IDs.
    const selectedIndices = Object.keys(rowSelection).map(Number)
    const selectedIds = selectedIndices.map(index => logs[index]?.id).filter(Boolean)

    if (selectedIds.length === 0) {
        setIsDeleting(false)
        return
    }

    try {
      const result = await deleteBatchAuditLogs(selectedIds)
      if (result && result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${selectedIds.length} Einträge gelöscht`)
        setRowSelection({}) // Clear selection
      }
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <LogsToolbar>
         {selectedCount > 0 && (
           <Button 
             variant="destructive" 
             size="sm" 
             onClick={() => setShowDeleteDialog(true)}
             disabled={isDeleting}
             className="gap-2 animate-in fade-in slide-in-from-right-4"
           >
             {isDeleting ? <span className="animate-spin">⌛</span> : <Trash2 className="h-4 w-4" />}
             Löschen ({selectedCount})
           </Button>
         )}
      </LogsToolbar>

      <div className="border-t border-transparent"> 
         {/* 
            Note: LogsToolbar has a border-b. 
            The DataTable usually has a border wrapper. 
            If we want to avoid double borders, we might need a wrapper adjustment.
            But for now, sticking to standard. 
         */}
         <DataTable 
            columns={columns} 
            data={logs} 
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
         />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Auswahl löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie <strong>{selectedCount} Einträge</strong> wirklich löschen?
              <br/><br/>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete} className="bg-red-600 hover:bg-red-700">Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
