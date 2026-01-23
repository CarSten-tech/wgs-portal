"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getUnreadNotifications, markAllAsRead, markNotificationAsRead, Notification } from '@/app/(protected)/notifications/actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClient())

  // Helper to fetch notifications
  const fetchNotifications = async () => {
    console.log('[Bell] Fetching...')
    try {
      const data = await getUnreadNotifications()
      console.log(`[Bell] Received ${data.length} notifications`)
      setNotifications(data)
    } catch (error) {
      console.error('[Bell] Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Effect 1: Initial Fetch
  useEffect(() => {
    if (userId) {
      console.log(`[Bell] Initial fetch for ${userId}`)
      fetchNotifications()
    } else {
      console.log('[Bell] No userId for initial fetch')
    }
  }, [userId])

  // Effect 2: Realtime Subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
           console.log('Realtime Event:', payload)
           const newItem = payload.new as Notification
           
           // Filter for current user or global
           if (newItem.user_id === userId || newItem.user_id === null) {
              setNotifications(prev => [newItem, ...prev]) // Optimistic add to top
              toast.info(newItem.title || 'Neue Benachrichtigung')
           }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Effect 3: Refresh on Open (Fallback)
  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications()
    }
  }, [isOpen, userId])

  // Mark Read Handler
  const handleNotificationClick = async (id: string, link: string | null) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id))
    setIsOpen(false)
    
    // Navigate if link exists
    if (link) {
      router.push(link)
    }
    
    await markNotificationAsRead(id)
  }

  const handleMarkAllRead = async () => {
    // Optimistic
    setNotifications([])
    setIsOpen(false)
    await markAllAsRead()
    toast.success("Alle Benachrichtigungen entfernt")
  }

  const unreadCount = notifications.length
  console.log(`[Bell] Render: count=${unreadCount}`)

  const getIcon = (type: Notification['type']) => {
    switch (type) {
        case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
        case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
        case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getBg = (type: Notification['type']) => {
      switch (type) {
        case 'warning': return 'bg-amber-50/50 dark:bg-amber-900/10'
        case 'error': return 'bg-red-50/50 dark:bg-red-900/10'
        case 'success': return 'bg-emerald-50/50 dark:bg-emerald-900/10'
        default: return 'bg-blue-50/50 dark:bg-blue-900/10'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-slate-950">
               {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
         <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="text-sm font-semibold">Benachrichtigungen</h4>
            {unreadCount > 0 && (
                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-auto p-0 text-xs text-slate-500 hover:text-slate-900"
                   onClick={handleMarkAllRead}
                >
                   Alle gelesen
                   <Check className="ml-1 h-3 w-3" />
                </Button>
            )}
         </div>

         <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                    <BellOff className="h-8 w-8 opacity-20" />
                    <p className="text-sm">Keine neuen Nachrichten</p>
                </div>
            ) : (
                <div className="divide-y">
                    {notifications.map(notification => (
                        <div 
                           key={notification.id} 
                           className={cn(
                               "flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group relative",
                               getBg(notification.type)
                           )}
                           onClick={() => handleNotificationClick(notification.id, notification.link)}
                        >
                            <div className="mt-1 flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {notification.title}
                                </p>
                                {notification.message && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {notification.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-slate-400 pt-1">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: de })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>
      </PopoverContent>
    </Popover>
  )
}
