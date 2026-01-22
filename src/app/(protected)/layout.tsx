import { HeaderServer } from '@/components/layout/header-server'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-black">
      <HeaderServer />
      <main className="flex-1 px-4 pt-24 md:px-8">
        {children}
      </main>
    </div>
  )
}
