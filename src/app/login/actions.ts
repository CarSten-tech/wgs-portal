'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validated = loginSchema.safeParse({ email, password })
  if (!validated.success) {
    return { error: 'Bitte geben Sie eine gültige E-Mail und ein Passwort ein.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error)
    return { error: 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.' }
  }

  console.log('Login successful for:', email)
  console.log('Redirecting to /dashboard')
  
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
