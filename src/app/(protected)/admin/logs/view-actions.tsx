"use client"

import { useQueryState, parseAsString } from 'nuqs'
import { Eye, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteAuditLog } from '@/app/(protected)/admin/logs/actions'
import { toast } from 'sonner'
import { useState } from 'react'
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

interface ViewActionsProps {
  logId: string
}

export function ViewActions({ logId }: ViewActionsProps) {
  const [, setViewId] = useQueryState('view', parseAsString.withOptions({ shallow: false })) 
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    setShowDeleteDialog(false)
    
    try {
      const result = await deleteAuditLog(logId)
      if (result && result.error) {
        toast.error('Fehler beim Löschen')
      } else {
        toast.success('Eintrag gelöscht')
      }
    } catch {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => setViewId(logId)}>
          <Eye className="h-4 w-4 text-slate-500" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
          className="hover:text-red-600 hover:bg-red-50"
        >
           {isDeleting ? (
             <span className="animate-spin">⌛</span> 
           ) : (
             <Trash2 className="h-4 w-4" />
           )}
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Eintrag löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Log-Eintrag wirklich löschen?
              <br/><br/>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

