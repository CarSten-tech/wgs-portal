'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  PenSquare,
  PlusCircle,
  Eye,
  Search,
  ArrowUpDown,
  Filter,
  X
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { AuditDiffViewer } from './audit-diff-viewer'
import { deleteAuditLog } from '@/app/(protected)/admin/logs/actions'

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
  agencyMap: Record<string, string>
}

export function AuditLogTable({ logs, agencyMap }: AuditLogTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState('')
  const [operationFilter, setOperationFilter] = useState('ALL')
  const [tableFilter, setTableFilter] = useState('ALL')
  /* Sort only by created_at by default */
  const [sortConfig, setSortConfig] = useState<{ key: keyof AuditLog; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' })

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }
  
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleView = (log: AuditLog) => {
    setSelectedLog(log)
    setViewerOpen(true)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Sind Sie sicher? Dieser Log-Eintrag wird unwiderruflich gelöscht.')) return

    setDeletingId(id)
    try {
      const result = await deleteAuditLog(id)
      if (result.error) {
        toast.error('Fehler beim Löschen')
      } else {
        toast.success('Eintrag gelöscht')
      }
    } catch {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setDeletingId(null)
    }
  }

  // --- Filtering & Sorting Logic ---
  
  const filteredLogs = logs.filter(log => {
      const matchesSearch = 
        log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.new_data?.id && log.new_data.id.includes(searchTerm)) ||
        (log.old_data?.id && log.old_data.id.includes(searchTerm));

      const matchesOp = operationFilter === 'ALL' || log.operation === operationFilter
      const matchesTable = tableFilter === 'ALL' || log.table_name === tableFilter

      return matchesSearch && matchesOp && matchesTable
  })

  // Sorting
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (!sortConfig) return 0
    
    let aVal = a[sortConfig.key]
    let bVal = b[sortConfig.key]

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const requestSort = (key: keyof AuditLog) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // --- Helpers ---

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

    // Profile Strategy
    if (log.table_name === 'profiles') {
        const nameParts = [data.first_name, data.last_name].filter(Boolean)
        if (nameParts.length > 0) return nameParts.join(' ')
        if (data.email) return data.email
        return 'Benutzer'
    }
    
    // Generic Name Strategy (Facilities, Agencies)
    if (data.name) return data.name
    
    // Fallback: ID
    return (data.id || '').slice(0, 8) + '...'
  }

  return (
    <>
      <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm">
        
        {/* --- Toolbar --- */}
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between p-4 border-b">
          <div className="flex flex-1 items-center gap-2 w-full">
             <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
               <Input 
                 placeholder="Suchen..." 
                 className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             
             <Select value={operationFilter} onValueChange={(val) => updateFilter('action', val)}>
               <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                 <SelectValue placeholder="Aktion" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="ALL">Alle Aktionen</SelectItem>
                 <SelectItem value="INSERT">Erstellt</SelectItem>
                 <SelectItem value="UPDATE">Bearbeitet</SelectItem>
                 <SelectItem value="DELETE">Gelöscht</SelectItem>
               </SelectContent>
             </Select>

             <Select value={tableFilter} onValueChange={(val) => updateFilter('table', val)}>
               <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                 <SelectValue placeholder="Tabelle" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="ALL">Alle Tabellen</SelectItem>
                 <SelectItem value="profiles">Benutzer</SelectItem>
                 <SelectItem value="facilities">Einrichtung</SelectItem>
                 <SelectItem value="providers">Träger</SelectItem>
               </SelectContent>
             </Select>
             
             {(searchTerm || operationFilter !== 'ALL' || tableFilter !== 'ALL') && (
               <Button variant="ghost" size="icon" onClick={() => {
                 setSearchTerm('')
                 updateFilter('action', 'ALL')
                 updateFilter('table', 'ALL')
                 router.push('/admin/logs')
               }}>
                 <X className="h-4 w-4" />
               </Button>
             )}
          </div>
          
          <div className="text-sm text-slate-500">
             {logs.length} Einträge (Server)
          </div>
        </div>

        {/* --- Table --- */}
        <div>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('created_at')}>
                  <div className="flex items-center gap-1 font-semibold text-slate-900">
                    Zeitpunkt
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1 font-semibold text-slate-900">
                     Akteur
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-900">Aktion</TableHead>
                <TableHead>
                   <div className="flex items-center gap-1 font-semibold text-slate-900">
                     Objekt
                   </div>
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-900">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      Keine Logs gefunden.
                    </TableCell>
                  </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 border-b-0">
                    <TableCell className="font-mono text-xs text-slate-500">
                      {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{log.actor_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getOperationBadge(log.operation)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                         {getTableLabel(log.table_name)}
                      </span>
                      <span className="text-slate-400 mx-2">:</span>
                      <span className="font-medium text-slate-500">
                        {getObjectLabel(log)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(log)}>
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => handleDelete(log.id, e)}
                          disabled={deletingId === log.id}
                          className="hover:text-red-600 hover:bg-red-50"
                        >
                           {deletingId === log.id ? (
                             <span className="animate-spin">⌛</span> 
                           ) : (
                             <Trash2 className="h-4 w-4" />
                           )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedLog && (
        <AuditDiffViewer 
          open={viewerOpen} 
          onOpenChange={setViewerOpen}
          oldData={selectedLog.old_data}
          newData={selectedLog.new_data}
          operation={selectedLog.operation}
          tableName={getTableLabel(selectedLog.table_name)}
          agencyMap={agencyMap}
        />
      )}
    </>
  )
}
