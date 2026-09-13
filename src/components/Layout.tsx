import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  MessageCircleHeart,
  BookOpenText,
  History,
  ShieldCheck,
  Settings2,
  LogOut,
  Menu,
  X,
  Gauge,
} from 'lucide-react'
import { Brand } from '@/components/ui'
import { MedicalDisclaimerBar } from '@/components/Disclaimer'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/assessment', label: 'Assessment', icon: ClipboardList },
  { to: '/app/assistant', label: 'Assistant', icon: MessageCircleHeart },
  { to: '/app/knowledge', label: 'Knowledge Base', icon: BookOpenText },
  { to: '/app/history', label: 'My History', icon: History },
  { to: '/app/privacy', label: 'Privacy & Data', icon: ShieldCheck },
  { to: '/app/profile', label: 'Profile', icon: Settings2 },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const nav = user?.role === 'admin' ? [...NAV, { to: '/app/admin', label: 'Admin', icon: Gauge }] : NAV

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-sage-50">
      <MedicalDisclaimerBar />
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-sage-100 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 py-4">
              <Link to="/app" onClick={() => setOpen(false)}>
                <Brand />
              </Link>
              <button className="btn-ghost lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-2">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-sage-100 text-sage-900' : 'text-sage-600 hover:bg-sage-50 hover:text-sage-900'
                    }`
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-sage-100 p-3">
              <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-sage-600 text-sm font-semibold text-white">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-sage-900">{user?.name}</p>
                  <p className="truncate text-xs text-sage-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-ghost w-full justify-start text-sage-600">
                <LogOut className="h-[18px] w-[18px]" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-30 bg-sage-950/30 lg:hidden" onClick={() => setOpen(false)} />
        )}

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-sage-100 bg-sage-50/80 px-4 py-3 backdrop-blur lg:hidden">
            <button className="btn-ghost" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <Brand compact />
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export function PublicLayout() {
  const { user } = useAuth()
  return (
    <div className="flex min-h-screen flex-col bg-sage-50">
      <header className="sticky top-0 z-20 border-b border-sage-100 bg-sage-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/">
            <Brand />
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/knowledge" className="btn-ghost hidden sm:inline-flex">
              Knowledge Base
            </Link>
            {user ? (
              <Link to="/app" className="btn-primary">
                Open app
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-sage-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Brand />
            <p className="max-w-md text-xs text-sage-500">
              AyurSage offers general educational wellness information rooted in Ayurvedic tradition. It does not
              diagnose, treat, prescribe, or cure. Always consult a qualified healthcare professional.
            </p>
          </div>
          <p className="mt-6 text-xs text-sage-400">© {new Date().getFullYear()} AyurSage · Safety-first wellness.</p>
        </div>
      </footer>
    </div>
  )
}
