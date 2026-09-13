import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';
import {
  Menu,
  X,
  BookOpen,
  ClipboardList,
  MessageCircleHeart,
  History,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

const PUBLIC_LINKS = [
  { to: '/knowledge', label: 'Knowledge base', icon: BookOpen },
  { to: '/assessment', label: 'Assessment', icon: ClipboardList },
  { to: '/assistant', label: 'AI assistant', icon: MessageCircleHeart },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenu(false);
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sage-100 bg-sage-50/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="AyurSage home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive ? 'bg-sage-100 text-sage-800' : 'text-ink-600 hover:bg-sage-100/60 hover:text-ink-900',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-sage-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink-800 hover:border-sage-300"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-700 text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(' ')[0]}
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-sage-100 bg-white p-1.5 shadow-card animate-scale-in">
                    <MenuLink to="/history" icon={History} label="My history" onClick={() => setMenu(false)} />
                    <MenuLink to="/privacy" icon={ShieldCheck} label="Privacy & data" onClick={() => setMenu(false)} />
                    {user.role === 'admin' && (
                      <MenuLink
                        to="/admin"
                        icon={LayoutDashboard}
                        label="Admin dashboard"
                        onClick={() => setMenu(false)}
                      />
                    )}
                    <div className="my-1 h-px bg-sage-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-clay-700 hover:bg-clay-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link to="/login?mode=register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-sage-100 bg-white px-4 py-3 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {PUBLIC_LINKS.map((l) => (
              <MobileLink key={l.to} to={l.to} icon={l.icon} label={l.label} onClick={() => setOpen(false)} />
            ))}
            {user ? (
              <>
                <div className="my-1 h-px bg-sage-100" />
                <MobileLink to="/history" icon={History} label="My history" onClick={() => setOpen(false)} />
                <MobileLink to="/privacy" icon={ShieldCheck} label="Privacy & data" onClick={() => setOpen(false)} />
                {user.role === 'admin' && (
                  <MobileLink to="/admin" icon={LayoutDashboard} label="Admin dashboard" onClick={() => setOpen(false)} />
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-clay-700 hover:bg-clay-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <div className="my-1 h-px bg-sage-100" />
                <MobileLink to="/login" icon={UserIcon} label="Sign in" onClick={() => setOpen(false)} />
                <Link to="/login?mode=register" className="btn-primary mt-1" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: typeof History;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-sage-50"
    >
      <Icon className="h-4 w-4 text-sage-600" /> {label}
    </Link>
  );
}

function MobileLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: typeof History;
  label: string;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium',
          isActive ? 'bg-sage-100 text-sage-800' : 'text-ink-700 hover:bg-sage-50',
        )
      }
    >
      <Icon className="h-4 w-4" /> {label}
    </NavLink>
  );
}
