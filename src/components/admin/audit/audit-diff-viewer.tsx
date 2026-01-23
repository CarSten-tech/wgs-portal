'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

import { IGNORED_KEYS, formatKey } from '@/lib/audit-utils'

interface AuditDiffViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  oldData: any | null
  newData: any | null
  operation: string
  tableName: string
  agencyMap?: Record<string, string>
}

export function AuditDiffViewer({
  open,
  onOpenChange,
  oldData,
  newData,
  operation,
  tableName,
  agencyMap = {}
}: AuditDiffViewerProps) {
  
  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return <span className="text-slate-400 italic">Leer</span>
    if (key === 'agency_id' && agencyMap[value]) {
       return <span className="font-semibold text-blue-600">{agencyMap[value]}</span>
    }
    // Boolean mapping
    if (typeof value === 'boolean') {
      return value ? 'Ja' : 'Nein'
    }
    return JSON.stringify(value).replace(/^"|"$/g, '') 
  }

  const getDiff = () => {
    // Helper to filter keys
    const filterKeys = (data: any) => {
        if (!data) return {}
        const result: any = {}
        Object.keys(data).forEach(key => {
            if (!IGNORED_KEYS.has(key)) {
                result[key] = data[key]
            }
        })
        return result
    }

    const cleanNew = filterKeys(newData)
    const cleanOld = filterKeys(oldData)

    if (operation === 'INSERT') {
      return Object.entries(cleanNew).map(([key, value]) => ({
        key,
        oldVal: undefined,
        newVal: value,
        status: 'added'
      }))
    }
    if (operation === 'DELETE') {
      return Object.entries(cleanOld).map(([key, value]) => ({
        key,
        oldVal: value,
        newVal: undefined,
        status: 'removed'
      }))
    }
    
    // UPDATE
    const keys = new Set([...Object.keys(cleanOld), ...Object.keys(cleanNew)])
    const diffs: any[] = []
    
    keys.forEach(key => {
      const oldVal = cleanOld[key]
      const newVal = cleanNew[key]
      
      // Strict equality check (or simple JSON stringify check for objects)
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push({
          key,
          oldVal,
          newVal,
          status: 'modified'
        })
      }
    })
    return diffs
  }

  const diffs = getDiff()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Detailansicht: {tableName}</SheetTitle>
          <SheetDescription>
            Änderungen für Operation: <Badge variant="outline">{operation}</Badge>
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-150px)] mt-6 pr-4">
          <div className="space-y-6">
            {diffs.length === 0 ? (
              <div className="text-slate-500 italic text-center py-8 bg-slate-50 rounded-lg">
                Keine sichtbaren inhaltlichen Änderungen.
                <br/>
                <span className="text-xs opacity-70">(Metadaten ausgeblendet)</span>
              </div>
            ) : (
              diffs.map((diff) => (
                <div key={diff.key} className="space-y-2">
                   <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                     {diff.key === 'agency_id' ? 'Einrichtung' : diff.key}
                   </div>
                   
                   <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded-md p-3 border space-y-2">
                      {diff.status === 'added' && (
                         <div className="bg-emerald-50 text-emerald-700 p-2 rounded border border-emerald-100 break-all">
                           {formatValue(diff.key, diff.newVal)}
                         </div>
                      )}
                      
                      {diff.status === 'removed' && (
                         <div className="bg-red-50 text-red-700 p-2 rounded border border-red-100 break-all">
                           {formatValue(diff.key, diff.oldVal)}
                         </div>
                      )}
                      
                      {diff.status === 'modified' && (
                        <div className="flex flex-col gap-2">
                          <div className="bg-red-50 text-red-700 p-2 rounded border border-red-100 break-all relative group">
                             <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 rounded-l"></span>
                             <span className="line-through opacity-60 mr-2">{formatValue(diff.key, diff.oldVal)}</span>
                          </div>
                          <div className="flex justify-center text-slate-400">↓</div>
                          <div className="bg-emerald-50 text-emerald-700 p-2 rounded border border-emerald-100 break-all relative">
                             <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-l"></span>
                             <span>{formatValue(diff.key, diff.newVal)}</span>
                          </div>
                        </div>
                      )}
                   </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
