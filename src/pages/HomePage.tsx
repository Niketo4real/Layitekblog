import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Monitor,
  Smartphone,
  Cpu,
  Wifi,
  Briefcase,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { ArticleCard } from '../components/ArticleCard';
import { NewsletterBox } from '../components/NewsletterBox';
import { SeoHead } from '../components/SeoHead';
import { ArticleSummary } from '../types';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  computers: <Monitor className="w-5 h-5 text-[#0B3C8C]" />,
  'phones-accessories': <Smartphone className="w-5 h-5 text-[#0369A1]" />,
  gadgets: <Cpu className="w-5 h-5 text-[#0F766E]" />,
  telecommunications: <Wifi className="w-5 h-5 text-[#1D4ED8]" />,
  'cac-arena': <Briefcase className="w-5 h-5 text-[#007A4D]" />,
  'branding-printing': <Palette className="w-5 h-5 text-[#B45309]" />,
};

export const HomePage: React.FC = () => {
  const {
    settings,
    categories,
    featuredArticles,
    latestArticles,
    popularArticles,
    loading,
  } = useBlog();
  const navigate = useNavigate();

  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [filteredLatest, setFilteredLatest] = useState<ArticleSummary[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [loadingTab, setLoadingTab] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCategoryTab === 'all') {
      setFilteredLatest(latestArticles);
      return;
    }

    let cancelled = false;
    setLoadingTab(true);
    fetch(`/api/articles?category=${encodeURIComponent(selectedCategoryTab)}&limit=12&sort=latest`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.items) {
          setFilteredLatest(data.items);
        }
      })
      .catch((err) => console.error('Category filter error:', err))
      .finally(() => {
        if (!cancelled) setLoadingTab(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryTab, latestArticles]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      const el = document.getElementById('featured-articles-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToExplore = () => {
    const el = document.getElementById('featured-articles-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const leadFeatured = featuredArticles[0] || latestArticles[0];
  const secondaryFeatured = featuredArticles.slice(1, 4);

  return (
    <>
      <SeoHead
        title={settings?.seo?.metaTitle}
        description={settings?.seo?.metaDescription}
        canonicalPath="/"
      />

      {/* 1. Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-[#0B3C8C] mb-3">
              Layitek Limited • Official Technology &amp; Business Publication
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {settings?.homepage?.heroHeadline ||
                'Practical Knowledge. Smarter Technology. Better Business.'}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {settings?.homepage?.heroDescription ||
                'Your trusted source for practical technology guides, gadget reviews, telecommunications updates, business registration information and professional branding insights.'}
            </p>

            {/* Prominent Search Bar + Explore Articles Button */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder={
                    settings?.homepage?.heroSearchPlaceholder ||
                    'Search articles, guides and tutorials...'
                  }
                  aria-label="Search articles, guides and tutorials"
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-300 bg-[#FAFAFA] text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:border-[#0B3C8C]"
                />
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="submit"
                  className="px-5 py-3.5 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={scrollToExplore}
                  className="px-5 py-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  {settings?.homepage?.heroCtaText || 'Explore Articles'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pt-12">
        {/* 2. Featured Articles Section (3-Tier Editorial Salience) */}
        <section id="featured-articles-section" className="scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3C8C]">
                Editor’s Selection
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Featured Articles
              </h2>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3C8C] hover:underline whitespace-nowrap"
            >
              <span>View All 60+ Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-xl bg-slate-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {leadFeatured && <ArticleCard article={leadFeatured} variant="lead" />}

              {secondaryFeatured.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {secondaryFeatured.map((art) => (
                    <ArticleCard key={art.id} article={art} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 3. Browse by Category */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#007A4D]">
                Knowledge Hubs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Browse by Category
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Six specialized desks covering technology, telecommunications, CAC compliance &amp; branding
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/${cat.slug}`}
                className="group bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between transition-colors hover:border-[#0B3C8C]"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {CATEGORY_ICONS[cat.slug] || (
                        <Monitor className="w-5 h-5 text-[#0B3C8C]" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {cat.articleCount || 10} articles
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0B3C8C] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {cat.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3C8C]">
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Latest Articles with Interactive Category Filter Tabs */}
        <section>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3C8C]">
                Chronological Feed
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Latest Articles
              </h2>
            </div>

            {/* Interactive Segmented Filter Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryTab('all');
                  setVisibleCount(9);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategoryTab === 'all'
                    ? 'bg-[#0B3C8C] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryTab(cat.slug);
                    setVisibleCount(9);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategoryTab === cat.slug
                      ? 'bg-[#0B3C8C] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {loadingTab ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-72 rounded-xl bg-slate-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLatest.slice(0, visibleCount).map((art) => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                {visibleCount < filteredLatest.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + 6)}
                    className="px-6 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Load More Articles
                  </button>
                )}
                {selectedCategoryTab !== 'all' && (
                  <Link
                    to={`/${selectedCategoryTab}`}
                    className="px-6 py-2.5 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-semibold transition-colors"
                  >
                    Open Full Category Archive
                  </Link>
                )}
              </div>
            </>
          )}
        </section>

        {/* 5. Popular Articles + Layitek Corporate Advisory Spotlight */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <div className="mb-6 pb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-[#007A4D]">
                Most Read by Nigerian Readers
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Popular Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {popularArticles.slice(0, 4).map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-slate-900 pb-3 mb-4 border-b border-slate-200">
                Top Read Guides This Week
              </h3>
              <div>
                {popularArticles.slice(0, 6).map((art) => (
                  <ArticleCard key={art.id} article={art} variant="compact" />
                ))}
              </div>
            </div>

            {/* About Layitek Promotional Box */}
            <div className="bg-[#0F172A] text-white rounded-xl p-6 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Layitek Limited • Nigeria
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">
                {settings?.homepage?.promoTitle ||
                  'Partner with Layitek Limited for Technology, CAC & Branding Solutions'}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {settings?.homepage?.promoDescription ||
                  'From enterprise IT procurement and networking hardware to seamless CAC business registration and high-impact corporate printing, Layitek Limited delivers dependable execution across Nigeria.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={settings?.contact?.contactUrl || 'https://layitek.com/contact'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#007A4D] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <span>
                    {settings?.homepage?.promoButtonText || 'Contact Layitek Limited'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={settings?.contact?.aboutUrl || 'https://layitek.com/about'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  <span>About Us</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </aside>
        </section>

        {/* 6. Newsletter Subscription */}
        <NewsletterBox />
      </div>
    </>
  );
};
