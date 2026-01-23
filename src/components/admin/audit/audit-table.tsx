'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  Building2, 
  User, 
  Trash2,
  PenSquare,
  PlusCircle,
  Eye,
  ShieldAlert
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AuditDiffViewer } from './audit-diff-viewer'

interface AuditLog {
  id: string
  created_at: string
  table_name: string
  operation: string
  old_data: any
  new_data: any
  actor_name: string
}

interface AuditLogTableProps {
  logs: AuditLog[]
}

export function AuditTable({ logs }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const handleView = (log: AuditLog) => {
    setSelectedLog(log)
    setViewerOpen(true)
  }

  const getOperationBadge = (op: string) => {
    switch (op) {
      case 'INSERT':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 hover:bg-emerald-100">
            <PlusCircle className="h-3 w-3" /> Erstellt
          </Badge>
        )
      case 'UPDATE':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 hover:bg-blue-100">
            <PenSquare className="h-3 w-3" /> Bearbeitet
          </Badge>
        )
      case 'DELETE':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 hover:bg-red-100">
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

  return (
    <>
      <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="w-[180px]">Zeitpunkt</TableHead>
              <TableHead>Akteur</TableHead>
              <TableHead>Aktion</TableHead>
              <TableHead>Objekt</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
               <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Keine Logs vorhanden.
                  </TableCell>
                </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs text-slate-500">
                    {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </TableCell>
                  <TableCell>
                    {log.actor_name === 'System/Gelöscht' ? (
                       <div className="flex items-center gap-2 opacity-50">
                          <ShieldAlert className="h-4 w-4 text-slate-400" />
                          <span className="text-sm italic">System/Gelöscht</span>
                       </div>
                    ) : (
                        <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-slate-100">
                            {(log.actor_name?.[0] || '?')}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{log.actor_name}</span>
                        </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getOperationBadge(log.operation)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                       {getTableLabel(log.table_name)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleView(log)} className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedLog && (
        <AuditDiffViewer 
          open={viewerOpen} 
          onOpenChange={setViewerOpen}
          oldData={selectedLog.old_data}
          newData={selectedLog.new_data}
          operation={selectedLog.operation}
          tableName={getTableLabel(selectedLog.table_name)}
        />
      )}
    </>
  )
}
