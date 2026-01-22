'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login } from '@/app/login/actions'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2
} from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort wird benötigt'),
})

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      
      const result = await login(null, formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">E-Mail-Adresse</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input 
                    placeholder="name@behoerde.de" 
                    className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Passwort</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className="pl-10 pr-10 h-10 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between text-sm">
           <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <Checkbox id="stay-signed-in" className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <span className="text-sm">Angemeldet bleiben</span>
           </label>
           <a href="#" className="font-semibold text-primary hover:text-blue-700 hover:underline">
             Passwort vergessen?
           </a>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary text-primary-foreground hover:bg-blue-700 h-11 text-base font-semibold shadow-sm transition-all active:scale-[0.98]" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Anmeldung...
            </>
          ) : (
            <>
              Anmelden
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
