import { Link } from 'react-router-dom'
import { Brand } from '@/components/ui'
import { Home } from 'lucide-react'

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Brand />
      <p className="mt-8 text-6xl font-bold text-sage-300">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-sage-900">Page not found</h1>
      <p className="mt-2 text-sage-600">The page you’re looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6">
        <Home className="h-4 w-4" /> Back home
      </Link>
    </div>
  )
}
