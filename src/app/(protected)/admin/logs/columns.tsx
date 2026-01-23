"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, PlusCircle, PenSquare } from "lucide-react"
import { deleteAuditLog } from "@/app/(protected)/admin/logs/actions"
import { toast } from "sonner"
import { ViewActions } from './view-actions'
import { getChangedKeys, formatKey } from '@/lib/audit-utils'
import { Checkbox } from "@/components/ui/checkbox"
// import { AuditDiffViewer } from "@/components/admin/audit/audit-diff-viewer" // We handle view in Page via wrapper or cell?
// Actually simpler to keep View Logic in the Page or a Cell Component.
// Let's make a Cell Actions component.

export type AuditLog = {
  id: string
  created_at: string
  table_name: string
  operation: string
  old_data: any
  new_data: any
  actor_name: string
}

// Helpers
const getOperationBadge = (op: string) => {
  switch (op) {
    case 'INSERT':
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
          <PlusCircle className="h-3 w-3" /> Erstellt
        </Badge>
      )
    case 'UPDATE':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
          <PenSquare className="h-3 w-3" /> Bearbeitet
        </Badge>
      )
    case 'DELETE':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <Trash2 className="h-3 w-3" /> Gelöscht
        </Badge>
      )
    default:
      return <Badge variant="outline">{op}</Badge>
  }
}

const getTableLabel = (table: string) => {
  switch (table) {
    case 'profiles': return 'Benutzer'
    case 'providers': return 'Träger'
    case 'facilities': return 'Einrichtung'
    default: return table
  }
}

const getObjectLabel = (log: AuditLog) => {
  const data = log.new_data || log.old_data
  if (!data) return 'Unbekannt'

  if (log.table_name === 'profiles') {
      const nameParts = [data.first_name, data.last_name].filter(Boolean)
      if (nameParts.length > 0) return nameParts.join(' ')
      if (data.email) return data.email
      return 'Benutzer'
  }
  
  if (data.name) return data.name
  
  return (data.id || '').slice(0, 8) + '...'
}

export const columns: ColumnDef<AuditLog>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "created_at",
    header: "Zeitpunkt",
    cell: ({ row }) => 
      <span className="font-mono text-xs text-slate-500">
        {format(new Date(row.getValue("created_at")), "dd.MM.yyyy HH:mm:ss", { locale: de })}
      </span>
  },
  {
    accessorKey: "actor_name",
    header: "Akteur",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
         <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
           {row.original.actor_name}
         </span>
      </div>
    )
  },
  {
    accessorKey: "operation",
    header: "Aktion",
    cell: ({ row }) => getOperationBadge(row.getValue("operation")),
  },
  {
    id: "object",
    header: "Objekt",
    cell: ({ row }) => {
      const log = row.original
      return (
          <div className="text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
               {getTableLabel(log.table_name)}
            </span>
            <span className="text-slate-400 mx-2">:</span>
            <span className="font-medium text-slate-500">
              {getObjectLabel(log)}
            </span>
          </div>
      )
    }
  },

  {
    accessorKey: "changes",
    header: "Änderungen",
    cell: ({ row }) => {
      const keys = getChangedKeys(row.original.old_data, row.original.new_data, row.original.operation)
      
      if (keys.length === 0) return <span className="text-slate-400 italic text-xs">-</span>
      
      const displayKeys = keys.slice(0, 2)
      const remaining = keys.length - 2
      
      return (
        <div className="flex flex-wrap gap-1">
          {displayKeys.map(k => (
             <Badge key={k} variant="secondary" className="text-[10px] px-1 py-0 h-5 font-normal text-slate-600 bg-slate-100 border-slate-200">
               {formatKey(k)}
             </Badge>
          ))}
          {remaining > 0 && (
             <span className="text-xs text-slate-400 self-center">+{remaining}</span>
          )}
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ViewActions logId={row.original.id} />,
  },
]
