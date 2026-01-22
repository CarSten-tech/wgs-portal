import { createAdminClient } from '@/lib/supabase/admin'
import { UserTable } from '@/components/admin/users/user-table'
import { CreateUserDialog } from '@/components/admin/users/create-user-dialog'

export default async function UsersPage() {
  const supabase = createAdminClient()

  // Fetch Profiles with Agency Name
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      agency:agency_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch Agencies for the dropdowns
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, name')
    .order('name')

  if (error) {
    return <div>Fehler beim Laden der Benutzer: {error.message}</div>
  }

  // Transform data for the table
  const users = profiles?.map(profile => ({
    id: profile.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    email: profile.email || '',
    role: profile.role || 'user',
    agencyId: profile.agency_id,
    agencyName: profile.agency?.name,
    isActive: profile.is_active ?? true // Default to true if null
  })) || []

  const agencyList = agencies || []

  return (
    <div className="h-full border-none shadow-none bg-transparent space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Benutzerverwaltung
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verwalten Sie Zugänge und Berechtigungen für Ihre Mitarbeiter.
          </p>
        </div>
        <CreateUserDialog agencies={agencyList} />
      </div>

      <UserTable users={users} agencies={agencyList} />
    </div>
  )
}
