export const IGNORED_KEYS = new Set([
  'id',
  'created_at',
  'updated_at',
  'user_metadata',
  'email_confirm',
  'last_sign_in_at',
  'encrypted_password',
  'confirmation_token',
  'recovery_token',
  'email_change_token_new',
  'email_change',
  'aud',
  'is_sso_user'
])

const KEY_TRANSLATIONS: Record<string, string> = {
  first_name: 'Vorname',
  last_name: 'Nachname',
  email: 'E-Mail',
  role: 'Rolle',
  avatar_url: 'Profilbild',
  agency_id: 'Einrichtung',
  is_active: 'Aktiv',
  phone: 'Telefon',
  street: 'Straße',
  zip: 'PLZ',
  city: 'Stadt',
  name: 'Name',
  description: 'Beschreibung',
  address: 'Adresse',
  status: 'Status',
  password: 'Passwort',
  table_name: 'Tabelle',
  operation: 'Operation'
}

export function formatKey(key: string): string {
  return KEY_TRANSLATIONS[key] || key
}

export function getChangedKeys(oldData: any, newData: any, operation: string): string[] {
  if (!oldData && !newData) return []
  
  // Filter helper
  const clean = (data: any) => {
    if (!data) return {}
    const res: any = {}
    Object.keys(data).forEach(key => {
      if (!IGNORED_KEYS.has(key)) res[key] = data[key]
    })
    return res
  }

  const cOld = clean(oldData)
  const cNew = clean(newData)

  if (operation === 'INSERT') {
    return Object.keys(cNew)
  }
  if (operation === 'DELETE') {
    return Object.keys(cOld)
  }

  // UPDATE
  const keys = new Set([...Object.keys(cOld), ...Object.keys(cNew)])
  const changed: string[] = []
  
  keys.forEach(key => {
    const v1 = JSON.stringify(cOld[key])
    const v2 = JSON.stringify(cNew[key])
    if (v1 !== v2) {
      changed.push(key)
    }
  })
  
  return changed
}

export function getDiffs(oldData: any, newData: any, operation: string) {
    const keys = getChangedKeys(oldData, newData, operation)
    // Re-construct detailed diff object if needed, or just return keys above.
    // For the Viewer, we need values.
    // Let's keep logic simple: The viewer can use getChangedKeys to know WHAT, 
    // but typically iterates itself. 
    // Actually, let's just export the sets and a simple key getter for the table.
    return keys
}
