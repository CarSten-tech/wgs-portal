import { createClient } from '@/lib/supabase/server'
import { Header } from './header'

export async function HeaderServer() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      first_name,
      last_name,
      role,
      agency:agencies!agency_id (
        name
      )
    `)
    .eq('id', user.id)
    .single()

  const userData = {
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    role: profile?.role || 'User',
    agencyName: Array.isArray(profile?.agency) ? profile?.agency[0]?.name : profile?.agency?.name || 'Behörde',
    email: user.email,
    id: user.id,
  }

  return <Header user={userData} />
}
