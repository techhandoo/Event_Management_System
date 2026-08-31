import { Link } from 'react-router-dom';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#stats' },
    { label: 'Browse Events', href: '/events' },
    { label: 'API Docs', href: '/api-docs', isLink: true },
  ],
  Company: [
    { label: 'About', href: '/about', isLink: true },
    { label: 'Blog', href: '/blog', isLink: true },
    { label: 'Careers', href: '/careers', isLink: true },
    { label: 'Contact', href: '/contact', isLink: true },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy', isLink: true },
    { label: 'Terms of Service', href: '/terms', isLink: true },
    { label: 'Cookie Policy', href: '/cookies', isLink: true },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 via-violet-500 to-brand-400 rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.3)]">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight"><span className="text-white">Event</span><span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">ry</span></span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed max-w-xs">
              The modern event management platform for organizers and attendees.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-surface-600 mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {'isLink' in link && link.isLink ? (
                      <Link to={link.href} className="text-sm text-surface-400 hover:text-surface-700 transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-surface-400 hover:text-surface-700 transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            &copy; {new Date().getFullYear()} Eventry. All rights reserved.
          </p>
          <p className="text-xs text-surface-400">Built with Spring Boot, Kafka &amp; React</p>
        </div>
      </div>
    </footer>
  );
}
