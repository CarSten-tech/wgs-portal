'use client'

import { useState, useMemo } from 'react'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  KeyRound,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
  Shield,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

import { toggleUserStatus, deleteUser } from '@/app/(protected)/admin/users/actions'
import { EditUserDialog } from './edit-user-dialog'
import { ResetPasswordDialog } from './reset-password-dialog'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  agencyId?: string
  agencyName?: string
  isActive: boolean
}

interface UserTableProps {
  users: User[]
  agencies: { id: string; name: string }[]
}

export function UserTable({ users, agencies }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [pwResetUser, setPwResetUser] = useState<User | null>(null)
  const [pwResetOpen, setPwResetOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Filter & Pagination Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.agencyName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleUserStatus(id, !currentStatus)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(currentStatus ? 'Benutzer deaktiviert' : 'Benutzer aktiviert')
      }
    } catch (e) {
      toast.error('Fehler beim Statuswechsel')
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    try {
      const result = await deleteUser(deletingUser.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Benutzer gelöscht')
      }
    } catch (e) {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeletingUser(null)
    }
  }

  // Improved Initials Logic
  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase()
    }
    return (email?.[0] || 'U').toUpperCase()
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Suchen nach Name, Email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border bg-white dark:bg-slate-950">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="w-[300px]">Benutzer</TableHead>
                <TableHead>Einrichtung</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    Keine Benutzer gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {getInitials(user.firstName, user.lastName, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-slate-500">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.agencyName ? (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="text-sm">{user.agencyName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-sm">Keine Zuordnung</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200 shadow-none gap-1 pl-1.5">
                            <Shield className="h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200 shadow-none gap-1 pl-1.5">
                            <UserIcon className="h-3 w-3" /> User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Aktiv</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gesperrt</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menü öffnen</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                                setEditingUser(user)
                                setEditOpen(true)
                          }} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                                setPwResetUser(user)
                                setPwResetOpen(true)
                          }} className="cursor-pointer">
                            <KeyRound className="mr-2 h-4 w-4" />
                            Passwort zurücksetzen
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.isActive)} className="cursor-pointer">
                            {user.isActive ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            {user.isActive ? 'Deaktivieren' : 'Aktivieren'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingUser(user)} 
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between p-4 border-t bg-slate-50/50 dark:bg-slate-900/30">
            <div className="text-sm text-slate-500">
               Zeigt {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} bis {Math.min(currentPage * itemsPerPage, filteredUsers.length)} von {filteredUsers.length} Einträgen
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    Zurück
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Weiter
                </Button>
            </div>
          </div>
        </div>
      </div>

      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          agencies={agencies} 
          open={editOpen} 
          onOpenChange={setEditOpen} 
        />
      )}

      {pwResetUser && (
        <ResetPasswordDialog 
          userId={pwResetUser.id}
          userName={`${pwResetUser.firstName} ${pwResetUser.lastName}`}
          open={pwResetOpen} 
          onOpenChange={setPwResetOpen} 
        />
      )}

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Benutzer löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Benutzer <strong>{deletingUser?.firstName} {deletingUser?.lastName}</strong> wirklich löschen?
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
