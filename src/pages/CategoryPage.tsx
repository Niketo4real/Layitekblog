import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { fetchBlogArticles } from '../lib/supabase';
import { ArticleCard, formatCategoryName } from '../components/ArticleCard';
import { NewsletterBox } from '../components/NewsletterBox';
import { SeoHead } from '../components/SeoHead';
import { ArticleSummary } from '../types';

export const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { categories } = useBlog();

  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'title' | 'oldest'>('latest');
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const categoryInfo = categories.find((c) => c.slug === categorySlug);
  const categoryTitle = categoryInfo?.name || formatCategoryName(categorySlug || '');

  useEffect(() => {
    if (!categorySlug) return;
    let cancelled = false;
    setLoading(true);

    fetchBlogArticles({
      category: categorySlug,
      sort: sortBy,
      limit: 100,
      search: searchQuery.trim() || undefined,
    })
      .then((data) => {
        if (!cancelled && data.items) {
          setArticles(data.items);
        }
      })
      .catch((err) => console.error('Failed to load category articles:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug, sortBy, searchQuery]);

  return (
    <>
      <SeoHead
        title={`${categoryTitle} Articles & Practical Guides | Layitek Blog`}
        description={
          categoryInfo?.description ||
          `Browse all published ${categoryTitle} guides, reviews, and practical tutorials on Layitek Blog by Layitek Limited.`
        }
        canonicalPath={`/${categorySlug}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: categoryTitle, path: `/${categorySlug}` },
        ]}
      />

      {/* Category Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-slate-500 mb-4"
          >
            <Link to="/" className="hover:text-[#0B3C8C]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">{categoryTitle}</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {categoryTitle}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              {categoryInfo?.description ||
                `Comprehensive, practical ${categoryTitle} articles tailored for Nigerian businesses, professionals, and everyday users.`}
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(10);
                }}
                placeholder={`Filter ${categoryTitle} articles...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-[#FAFAFA] text-sm focus:bg-white focus:outline-none focus:border-[#0B3C8C]"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                {articles.length} {articles.length === 1 ? 'article' : 'articles'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort articles"
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0B3C8C]"
              >
                <option value="latest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Title (A–Z)</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
        {/* Category Switcher Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/${cat.slug}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                cat.slug === categorySlug
                  ? 'bg-[#0B3C8C] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-72 rounded-xl bg-slate-200/70 animate-pulse"
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              No matching articles found in {categoryTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Try clearing your filter keyword or explore another category above.
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, visibleCount).map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>

            {visibleCount < articles.length && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 9)}
                  className="px-6 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Load More ({articles.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

        <NewsletterBox />
      </div>
    </>
  );
};
