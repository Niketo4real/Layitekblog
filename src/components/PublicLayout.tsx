import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  ArrowUp,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';

const MAIN_CATEGORY_LINKS = [
  { label: 'Computers', path: '/computers' },
  { label: 'Phones & Accessories', path: '/phones-accessories' },
  { label: 'Gadgets', path: '/gadgets' },
  { label: 'Telecommunications', path: '/telecommunications' },
  { label: 'CAC Arena', path: '/cac-arena' },
  { label: 'Branding & Printing', path: '/branding-printing' },
];

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useBlog();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [cookieDismissed, setCookieDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('layitek_cookie_notice') === '1';
    } catch {
      return false;
    }
  });
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const dismissCookies = () => {
    setCookieDismissed(true);
    try {
      sessionStorage.setItem('layitek_cookie_notice', '1');
    } catch {
      // ignore
    }
  };

  const aboutUrl = settings?.contact?.aboutUrl || 'https://layitek.com/about';
  const contactUrl = settings?.contact?.contactUrl || 'https://layitek.com/contact';
  const logoUrl =
    settings?.branding?.logoUrl &&
    settings.branding.logoUrl !== '/api/media/layitek-logo.svg'
      ? settings.branding.logoUrl
      : '/assets/aistudio/LAYITEK_LOGO_FOR_BLOG2_197cbf30.png';
  const siteName = settings?.branding?.siteName || 'Layitek Blog';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900">
      {/* Header following 3-zone Top Bar discipline */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark / Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus:outline-none py-1"
            aria-label={siteName}
          >
            <img
              src={logoUrl}
              alt={siteName}
              referrerPolicy="no-referrer"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            className="hidden xl:flex items-center gap-5 text-[13px] font-medium text-slate-700"
            aria-label="Main Navigation"
          >
            <Link
              to="/"
              className={`hover:text-[#0B3C8C] transition-colors whitespace-nowrap shrink-0 py-1 ${
                location.pathname === '/'
                  ? 'text-[#0B3C8C] font-semibold border-b-2 border-[#0B3C8C]'
                  : ''
              }`}
            >
              Home
            </Link>
            {MAIN_CATEGORY_LINKS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`hover:text-[#0B3C8C] transition-colors whitespace-nowrap shrink-0 py-1 ${
                    isActive
                      ? 'text-[#0B3C8C] font-semibold border-b-2 border-[#0B3C8C]'
                      : ''
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={aboutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0B3C8C] transition-colors whitespace-nowrap shrink-0 py-1 inline-flex items-center gap-1"
            >
              <span>About Layitek</span>
            </a>
          </nav>

          {/* Medium Desktop Compact Nav (md to lg) */}
          <nav
            className="hidden md:flex xl:hidden items-center gap-5 text-xs font-medium text-slate-700"
            aria-label="Tablet Navigation"
          >
            <Link to="/" className="hover:text-[#0B3C8C] whitespace-nowrap shrink-0">
              Home
            </Link>
            <Link
              to="/computers"
              className="hover:text-[#0B3C8C] whitespace-nowrap shrink-0"
            >
              Computers
            </Link>
            <Link
              to="/phones-accessories"
              className="hover:text-[#0B3C8C] whitespace-nowrap shrink-0"
            >
              Phones
            </Link>
            <Link
              to="/cac-arena"
              className="hover:text-[#0B3C8C] whitespace-nowrap shrink-0"
            >
              CAC Arena
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen((v) => !v)}
                className="inline-flex items-center gap-1 hover:text-[#0B3C8C] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>More Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/gadgets"
                    className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Gadgets
                  </Link>
                  <Link
                    to="/telecommunications"
                    className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Telecommunications
                  </Link>
                  <Link
                    to="/branding-printing"
                    className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Branding &amp; Printing
                  </Link>
                  <a
                    href={aboutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    About Layitek
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Search & Contact Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search articles"
              className="p-2 rounded-lg text-slate-600 hover:text-[#0B3C8C] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            >
              <span>Contact Us</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="xl:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-slate-50 py-3 px-4 sm:px-6 lg:px-8">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, guides and tutorials..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0B3C8C]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold hover:bg-blue-900 transition-colors whitespace-nowrap cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides and tutorials..."
                className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0B3C8C]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold whitespace-nowrap"
              >
                Go
              </button>
            </form>

            <div className="grid grid-cols-1 gap-1 text-sm font-medium text-slate-800">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Home
              </Link>
              {MAIN_CATEGORY_LINKS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-2">
                <a
                  href={aboutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 inline-flex items-center justify-between text-slate-700"
                >
                  <span>About Layitek</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg bg-[#0B3C8C] text-white text-center text-xs font-semibold"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-4">
              <Link
                to="/"
                className="inline-flex items-center bg-white px-4 py-2.5 rounded-xl shadow-sm"
              >
                <img
                  src={logoUrl}
                  alt={siteName}
                  referrerPolicy="no-referrer"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed">
                {settings?.footer?.footerDescription ||
                  'Layitek Blog is the official technology and business publication of Layitek Limited, delivering practical guides on computing, smartphones, telecommunications, CAC compliance, and corporate branding in Nigeria.'}
              </p>
              <div className="text-xs text-slate-400 space-y-1 pt-1">
                {settings?.contact?.companyEmail && (
                  <p>Email: {settings.contact.companyEmail}</p>
                )}
                {settings?.contact?.officeAddress && (
                  <p>Location: {settings.contact.officeAddress}</p>
                )}
              </div>
            </div>

            {/* Categories Column */}
            <div className="lg:col-span-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Blog Categories
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                {MAIN_CATEGORY_LINKS.map((cat) => (
                  <li key={cat.path}>
                    <Link
                      to={cat.path}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company & Quick Links */}
            <div className="lg:col-span-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Layitek Limited &amp; Quick Links
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <a
                    href={aboutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>About Us (layitek.com/about)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href={contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Contact Us (layitek.com/contact)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <Link
                    to="/search"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Search All 60+ Guides
                  </Link>
                </li>
                <li>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    XML Sitemap
                  </a>
                </li>
              </ul>

              {/* Configurable Social Media Links */}
              {settings?.contact?.socialLinks && (
                <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {settings.contact.socialLinks.linkedin && (
                    <a
                      href={settings.contact.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                  {settings.contact.socialLinks.twitter && (
                    <a
                      href={settings.contact.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      X (Twitter)
                    </a>
                  )}
                  {settings.contact.socialLinks.facebook && (
                    <a
                      href={settings.contact.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Facebook
                    </a>
                  )}
                  {settings.contact.socialLinks.instagram && (
                    <a
                      href={settings.contact.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                  {settings.contact.socialLinks.youtube && (
                    <a
                      href={settings.contact.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              {settings?.footer?.copyrightText ||
                `© ${new Date().getFullYear()} Layitek Limited. All Rights Reserved.`}
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href={aboutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                About Layitek Limited
              </a>
              <a
                href={contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Contact Advisory Desk
              </a>
              <Link
                to="/admin"
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Subtle Privacy / Cookie Notice */}
      {!cookieDismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-white border border-slate-200 shadow-lg rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Layitek Blog uses essential cookies to ensure fast page loading and remember your reading preferences.
          </p>
          <button
            type="button"
            onClick={dismissCookies}
            className="px-3.5 py-1.5 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold hover:bg-blue-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Got It
          </button>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-30 p-3 rounded-full bg-[#0B3C8C] text-white shadow-md hover:bg-blue-900 transition-colors cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
