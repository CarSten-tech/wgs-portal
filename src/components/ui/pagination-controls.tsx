"use client"

import { useQueryState } from 'nuqs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { parsers } from '@/app/(protected)/admin/logs/search-params'

interface PaginationControlsProps {
  total: number
}

export function PaginationControls({ total }: PaginationControlsProps) {
  const [page, setPage] = useQueryState('page', parsers.page.withOptions({ shallow: false }))
  const [perPage, setPerPage] = useQueryState('perPage', parsers.perPage.withOptions({ shallow: false }))

  const currentPage = page || 1
  const currentPerPage = perPage || 20
  const totalPages = Math.ceil(total / currentPerPage)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value))
    setPage(1) // Reset to page 1
  }

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex-1 text-sm text-slate-500 hidden sm:block">
        {total} Einträge gesamt
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-slate-500 hidden sm:block">Zeilen pro Seite</p>
          <Select
            value={currentPerPage.toString()}
            onValueChange={handlePerPageChange}
          >
            <SelectTrigger className="h-8 w-[70px] bg-transparent border-slate-200 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder={currentPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} className="cursor-pointer">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium text-slate-600">
          Seite {currentPage} von {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="hidden h-8 w-8 p-0 lg:flex text-slate-500 hover:text-slate-900"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
          >
            <span className="sr-only">Erste Seite</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <span className="sr-only">Vorherige</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <span className="sr-only">Nächste</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="hidden h-8 w-8 p-0 lg:flex text-slate-500 hover:text-slate-900"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
          >
            <span className="sr-only">Letzte Seite</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
