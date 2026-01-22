import Link from 'next/link'
import { 
  Users, 
  Settings, 
  Database,
  FileText,
  Plus,
  Download
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Card,
} from "@/components/ui/card"

export default function AdminDashboardPage() {
  const quickAccess = [
    {
      title: "Benutzer verwalten",
      description: "Rechte & Rollen zuweisen",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Systemlogs",
      description: "Fehlerprotokolle einsehen",
      icon: FileText,
      href: "/admin/logs",
    },
    {
      title: "Stammdaten",
      description: "Kataloge & Listen",
      icon: Database,
      href: "/admin/master-data",
    },
    {
      title: "Einstellungen",
      description: "Globale Konfiguration",
      icon: Settings,
      href: "/admin/settings",
    }
  ]

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Administration</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Systemsteuerung und zentrale Übersicht der Jugendämter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white dark:bg-transparent">
            <Download className="h-4 w-4" />
            Exportieren
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Neuer Eintrag
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickAccess.map((tile) => (
          <Link key={tile.href} href={tile.href}>
            <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all p-6">
              <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-4 dark:bg-slate-800 dark:text-slate-400">
                <tile.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                {tile.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tile.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
