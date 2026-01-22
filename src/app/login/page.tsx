import * as React from 'react'
import { ClientOnlyLoginForm } from '@/components/auth/client-only-login'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  LayoutGrid,
  HelpCircle,
  FileText,
  ShieldCheck
} from 'lucide-react'



export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-primary/10">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 w-full h-full login-grid-bg" />

      {/* Content Container */}
      <div className="relative z-10 flex w-full flex-col items-center p-4">
        
        {/* Branding Header */}
        <div className="mb-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="mb-3 flex items-center justify-center gap-2">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-blue-600/20">
               <LayoutGrid className="h-6 w-6" />
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900">WGS-Portal</h1>
          </div>
          <p className="text-sm font-medium text-slate-500">Wohngruppen-Service für Jugendämter</p>
        </div>

        <Card className="w-full max-w-[440px] border-slate-200 border-t-4 border-t-primary shadow-xl shadow-slate-200/60 transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in">
          <CardHeader className="space-y-1 pb-6 pt-8 text-center">
            <CardTitle className="text-left text-xl font-bold tracking-tight text-slate-900">Anmelden</CardTitle>
            <CardDescription className="text-left text-slate-500">
              Bitte geben Sie Ihre behördlichen Zugangsdaten ein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientOnlyLoginForm />

            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
               <a href="#" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <HelpCircle className="h-3.5 w-3.5" /> Hilfe & Support
               </a>
               <span className="text-slate-300">|</span>
               <a href="#" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <FileText className="h-3.5 w-3.5" /> Registrierung beantragen
               </a>
            </div>
          </CardContent>
        </Card>

        {/* Detail Footer */}
        <div className="mt-10 flex flex-col items-center gap-4 animate-in fade-in delay-200 duration-700">
          <div className="rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-[11px] font-semibold text-slate-400 shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
             <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Sichere Verbindung
          </div>
          <p className="text-xs text-slate-400">
             © 2024 WGS-Portal Deutschland. <a href="#" className="hover:text-slate-600 hover:underline transition-colors">Datenschutz</a> • <a href="#" className="hover:text-slate-600 hover:underline transition-colors">Impressum</a>
          </p>
        </div>

      </div>
    </div>
  )
}
