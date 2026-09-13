import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-sage-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              AyurSage blends classical Ayurvedic wisdom with a safety-first, explainable AI architecture — where
              deterministic rules protect you and AI helps explain. Educational wellness guidance only.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link to="/knowledge" className="hover:text-sage-700">Knowledge base</Link></li>
              <li><Link to="/assessment" className="hover:text-sage-700">Wellness assessment</Link></li>
              <li><Link to="/assistant" className="hover:text-sage-700">AI assistant</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900">Trust &amp; safety</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link to="/privacy" className="hover:text-sage-700">Privacy &amp; data</Link></li>
              <li><Link to="/safety" className="hover:text-sage-700">Safety architecture</Link></li>
              <li><a href="tel:112" className="hover:text-sage-700">Emergency: dial local number</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-sage-100 pt-6 text-xs leading-relaxed text-ink-400">
          <p>
            © {new Date().getFullYear()} AyurSage. For education and wellness only. Not medical advice, diagnosis, or
            treatment. Always consult a licensed healthcare professional and never stop prescribed medication based on
            this tool. In an emergency, contact your local emergency services immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
