import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { fetchBlogArticles } from '../lib/supabase';
import { ArticleCard } from '../components/ArticleCard';
import { SeoHead } from '../components/SeoHead';
import { ArticleSummary } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const { categories } = useBlog();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'title'>('latest');
  const [results, setResults] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchBlogArticles({
      sort: sortBy,
      limit: 100,
      search: query.trim() || undefined,
      category:
        selectedCategory && selectedCategory !== 'all'
          ? selectedCategory
          : undefined,
    })
      .then((data) => {
        if (!cancelled && data.items) {
          setResults(data.items);
        }
      })
      .catch((err) => console.error('Search error:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (selectedCategory !== 'all') next.set('category', selectedCategory);
    setSearchParams(next);
  };

  return (
    <>
      <SeoHead
        title={
          query
            ? `Search Results for "${query}" | Layitek Blog`
            : 'Search All Articles & Guides | Layitek Blog'
        }
        description="Search across all 60+ original technology, smartphone, telecommunications, CAC business registration, and branding guides on Layitek Blog."
        canonicalPath="/search"
      />

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Search Layitek Blog
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Find practical guides by keyword, topic, hardware specification, or CAC compliance procedure.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleCount(12);
                }}
                placeholder="Search articles, guides and tutorials..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-[#FAFAFA] text-sm focus:bg-white focus:outline-none focus:border-[#0B3C8C]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold hover:bg-blue-900 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Category Filters & Sort */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setVisibleCount(12);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === 'all'
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
                    setSelectedCategory(cat.slug);
                    setVisibleCount(12);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-[#0B3C8C] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-500 tabular-nums">
                {results.length} {results.length === 1 ? 'result' : 'results'} found
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="latest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Title (A–Z)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-72 rounded-xl bg-slate-200/70 animate-pulse"
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              No articles matched your search
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Try a broader term such as "laptop", "power bank", "router", "CAC", or "logo".
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-5 py-2.5 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold cursor-pointer"
            >
              Show All 60+ Articles
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.slice(0, visibleCount).map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>

            {visibleCount < results.length && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 12)}
                  className="px-6 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Load More Results ({results.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <SeoHead title="Page Not Found (404) | Layitek Blog" />
      <span className="text-xs font-bold uppercase tracking-widest text-[#0B3C8C]">
        Error 404
      </span>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
        Page Not Found
      </h1>
      <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
        We couldn’t find the page you were looking for. Explore our six categories or search our library of 60+ guides.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold hover:bg-blue-900 transition-colors"
        >
          Back to Homepage
        </Link>
        <Link
          to="/search"
          className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          Search Articles
        </Link>
      </div>
    </div>
  );
};
