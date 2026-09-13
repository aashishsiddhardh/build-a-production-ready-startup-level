import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
        <Leaf className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-serif text-5xl font-semibold text-ink-900">404</h1>
      <p className="mt-2 text-ink-600">This page has wandered off the path. Let's get you back to center.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/knowledge" className="btn-outline">Browse knowledge base</Link>
      </div>
    </div>
  );
}
