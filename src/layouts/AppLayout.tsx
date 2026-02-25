/**
 * AppLayout — wraps every page with the global Navbar.
 * All routes using this layout get the sticky Navbar at the top.
 */

import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '@/components/navbar/Navbar'
import { ToastProvider } from '@/components/Toast'
import { LanguageProvider } from '@/contexts/LanguageContext'

// Wraps page content — remounts on path change via `key` → triggers CSS fade-in
// Uses pathname (not location.key) so search-param changes (e.g. ?tab=) don't remount
function PageTransition() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-fade-in flex-1 flex flex-col">
      <Outlet />
    </div>
  )
}

export default function AppLayout() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-[var(--wm-bg-01)]">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <PageTransition />
          </main>
        </div>
      </ToastProvider>
    </LanguageProvider>
  )
}
