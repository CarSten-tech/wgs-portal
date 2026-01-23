'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUser } from '@/app/(protected)/admin/users/actions'

const formSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
  firstName: z.string().min(2, 'Mindestens 2 Zeichen'),
  lastName: z.string().min(2, 'Mindestens 2 Zeichen'),
  role: z.string().min(1, 'Bitte eine Rolle wählen'),
  agencyId: z.string().optional(),
})

interface CreateUserDialogProps {
  agencies: { id: string; name: string }[]
}

export function CreateUserDialog({ agencies }: CreateUserDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'user',
      agencyId: '',
    },
  })

  const generatePassword = () => {
    form.setValue('password', 'Start123!')
    toast.info('Passwort auf "Start123!" gesetzt')
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    // 1. Perform Server Action
    const result = await createUser({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
      agencyId: values.agencyId || '', 
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      // 2. Close Modal FIRST
      setOpen(false)
      form.reset() // Reset form logic

      // 3. Show Toast
      toast.success(`Benutzer erstellt. PW: ${values.password}`)
      
      // 4. Refresh Router
      startTransition(() => {
        router.refresh()
      })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          Neuer Benutzer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
          <DialogDescription>
            Erstellen Sie ein neues Benutzerkonto mit Start-Passwort.
            Der Benutzer wird beim ersten Login zur Änderung aufgefordert.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname</FormLabel>
                    <FormControl>
                      <Input placeholder="Max" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nachname</FormLabel>
                    <FormControl>
                      <Input placeholder="Mustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail</FormLabel>
                  <FormControl>
                    <Input placeholder="max@beispiel.de" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Passwort</FormLabel>
                    <FormControl>
                      <Input placeholder="Min. 6 Zeichen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="secondary" onClick={generatePassword} className="mb-[2px]">
                Generieren
              </Button>
            </div>

              <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Wähle eine Rolle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user" className="cursor-pointer">User</SelectItem>
                        <SelectItem value="admin" className="cursor-pointer">Admin</SelectItem>
                        <SelectItem value="power_user" className="cursor-pointer">Poweruser</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agencyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Einrichtung</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Wähle Einrichtung" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         <SelectItem value="none" className="cursor-pointer">Keine</SelectItem>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id} className="cursor-pointer">
                            {agency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Benutzer anlegen
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
