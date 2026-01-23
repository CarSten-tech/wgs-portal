"use client"

import { useQueryState } from 'nuqs'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parsers } from '@/app/(protected)/admin/logs/search-params'

export function LogsToolbar({ children }: { children?: React.ReactNode }) {
  const [q, setQ] = useQueryState('q', parsers.q.withOptions({ shallow: false, throttleMs: 300 }))
  const [operation, setOperation] = useQueryState('operation', parsers.operation.withOptions({ shallow: false }))
  const [table, setTable] = useQueryState('table', parsers.table.withOptions({ shallow: false }))

  const isFiltered = !!q || !!operation || !!table

  const resetFilters = () => {
    setQ(null)
    setOperation(null)
    setTable(null)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
         <div className="relative w-full sm:w-[300px]">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
           <Input 
             placeholder="Suchen..." 
             className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors" 
             value={q || ''}
             onChange={(e) => setQ(e.target.value || null)}
           />
         </div>
         
         <Select 
           value={operation || 'ALL'} 
           onValueChange={(val) => setOperation(val === 'ALL' ? null : val)}
         >
           <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 cursor-pointer">
             <SelectValue placeholder="Aktion" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="ALL" className="cursor-pointer">Alle Aktionen</SelectItem>
             <SelectItem value="INSERT" className="cursor-pointer">Erstellt</SelectItem>
             <SelectItem value="UPDATE" className="cursor-pointer">Bearbeitet</SelectItem>
             <SelectItem value="DELETE" className="cursor-pointer">Gelöscht</SelectItem>
           </SelectContent>
         </Select>

         <Select 
           value={table || 'ALL'} 
           onValueChange={(val) => setTable(val === 'ALL' ? null : val)}
         >
           <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 cursor-pointer">
             <SelectValue placeholder="Tabelle" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="ALL" className="cursor-pointer">Alle Tabellen</SelectItem>
             <SelectItem value="profiles" className="cursor-pointer">Benutzer</SelectItem>
             <SelectItem value="facilities" className="cursor-pointer">Einrichtung</SelectItem>
             <SelectItem value="providers" className="cursor-pointer">Träger</SelectItem>
           </SelectContent>
         </Select>

         {isFiltered && (
           <Button variant="ghost" size="icon" onClick={resetFilters}>
             <X className="h-4 w-4" />
           </Button>
         )}
      </div>
      
      {/* Right Side Actions */}
      {children && (
        <div className="flex items-center gap-2">
            {children}
        </div>
      )}
    </div>
  )
}
