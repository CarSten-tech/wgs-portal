'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { 
  Home, 
  Moon, 
  Sun,
  Bell, 
  ChevronDown, 
  UserCog, 
  Shield, 
  LogOut 
} from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { NotificationBell } from '@/components/layout/notification-bell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  user: {
    firstName: string
    lastName: string
    role: string
    agencyName: string
    email?: string
    id: string
  }
}

export function Header({ user }: HeaderProps) {
  /* Existing code ... */
  const [mounted, setMounted] = useState(false)
  
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/verwaltung', label: 'Verwaltung' },
  ]

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
  const fallbackInitials = initials.length > 0 ? initials : 'U'
  const displayName = `${user.firstName} ${user.lastName}`.trim() || 'Benutzer'
  const displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1)
  const isAdmin = user.role === 'admin'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
        <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
             <div className="flex h-[72px] items-center justify-between px-6 lg:px-8">
                 <div className="flex items-center gap-3 select-none">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Home className="h-5 w-5 fill-current" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    WGS-Portal
                  </span>
                </div>
             </div>
        </header>
    )
  }

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex h-[72px] items-center justify-between px-6 lg:px-8">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Home className="h-5 w-5 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            WGS-Portal
          </span>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary py-1 border-b-2",
                  isActive 
                    ? "text-primary border-primary" 
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Moon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Sun className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <NotificationBell userId={user.id} />

          <div className="h-8 w-px bg-slate-200 mx-2 dark:bg-slate-800" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-full pl-2 pr-1 py-1 hover:bg-slate-50 transition-colors outline-none focus:outline-none focus-visible:ring-0">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100 dark:border-slate-900 dark:ring-slate-800">
                  <AvatarImage src="/avatars/max.jpg" alt={displayName} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">{fallbackInitials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block pr-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{displayName}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{displayRole}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 mr-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[340px] p-0 rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 mt-2" align="end" forceMount>
              
              {/* Header Section */}
              <div className="flex items-center gap-4 p-6 pb-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-md">
                   <span className="text-xl font-medium tracking-tight">{fallbackInitials}</span>
                </div>
                <div className="flex flex-col gap-1">
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{displayName}</h3>
                   <div className="flex flex-col text-sm text-slate-500 dark:text-slate-400">
                     <span>{displayRole}</span>
                     <span>{user.agencyName}</span>
                   </div>
                </div>
              </div>
              
              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                <DropdownMenuItem className="flex items-start gap-4 p-3 rounded-xl cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors outline-none focus:outline-none">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-slate-100 text-slate-500 shadow-sm">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Profil bearbeiten</span>
                    <span className="text-xs text-slate-500 font-medium">Persönliche Daten & Einstellungen</span>
                  </div>
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-start gap-4 p-3 rounded-xl !cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors outline-none focus:outline-none w-full">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200/50 text-slate-600 shadow-sm">
                        <Shield className="h-5 w-5 fill-slate-600/20" />
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Admin-Bereich</span>
                        <span className="text-xs text-slate-500 font-medium">Benutzer & Rechte verwalten</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Footer */}
              <div className="p-4">
                 <DropdownMenuItem 
                   className="flex items-center justify-center gap-2.5 p-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 cursor-pointer font-semibold transition-colors outline-none focus:outline-none"
                   onClick={async () => await signOut()}
                 >
                   <LogOut className="h-5 w-5" />
                   <span>Abmelden</span>
                 </DropdownMenuItem>
              </div>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
