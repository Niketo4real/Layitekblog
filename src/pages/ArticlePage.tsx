import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Share2,
  Check,
  ExternalLink,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import {
  ArticleCard,
  formatCategoryName,
  formatEditorialDate,
} from '../components/ArticleCard';
import { ResilientImage } from '../components/ResilientImage';
import { NewsletterBox } from '../components/NewsletterBox';
import { SeoHead } from '../components/SeoHead';
import { ArticleDetail } from '../types';

interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

function extractHeadingsFromHtml(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /<h([23])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, '').trim();
    if (id && text) {
      headings.push({ id, text, level });
    }
  }
  return headings;
}

export const ArticlePage: React.FC = () => {
  const { categorySlug, articleSlug } = useParams<{
    categorySlug: string;
    articleSlug: string;
  }>();
  const navigate = useNavigate();
  const { categories, popularArticles, settings } = useBlog();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (!articleSlug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/articles/by-slug/${encodeURIComponent(articleSlug)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Not found');
        }
        return res.json();
      })
      .then((data: ArticleDetail) => {
        if (!cancelled) {
          setArticle(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [articleSlug]);

  const tocHeadings = useMemo(() => {
    if (!article?.content) return [];
    return extractHeadingsFromHtml(article.content);
  }, [article?.content]);

  const handleSidebarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (sidebarSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(sidebarSearch.trim())}`);
    }
  };

  const currentShareUrl =
    typeof window !== 'undefined' ? window.location.href : 'https://layitek.com';

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(currentShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-10 w-2/3 bg-slate-200 rounded animate-pulse" />
        <div className="h-96 w-full bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Article Not Found
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          The requested guide may have been moved or unpublished. Explore our categories below.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold"
          >
            Return to Homepage
          </Link>
          <Link
            to="/search"
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold"
          >
            Search Articles
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = formatCategoryName(article.categorySlug);
  const pubDate = formatEditorialDate(article.publishedAt);
  const aboutUrl = settings?.contact?.aboutUrl || 'https://layitek.com/about';
  const contactUrl = settings?.contact?.contactUrl || 'https://layitek.com/contact';

  return (
    <>
      <SeoHead
        title={article.seoTitle || `${article.title} | Layitek Blog`}
        description={article.seoDescription || article.excerpt}
        canonicalPath={`/${article.categorySlug}/${article.slug}`}
        ogImage={article.featuredImage}
        ogType="article"
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        authorName={article.authorName}
        categoryName={categoryName}
        faqs={article.faqs}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: categoryName, path: `/${article.categorySlug}` },
          { name: article.title, path: `/${article.categorySlug}/${article.slug}` },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Article Column (Uniform 16-Part Template) */}
          <article className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 lg:p-10">
            {/* 2. Article Category / Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-4"
            >
              <Link to="/" className="hover:text-[#0B3C8C]">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link
                to={`/${article.categorySlug}`}
                className="font-semibold text-[#0B3C8C] hover:underline"
              >
                {categoryName}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-600 truncate max-w-xs">
                {article.title}
              </span>
            </nav>

            {/* 3. Main Article Headline (H1) */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* 4. Short Introductory Excerpt */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              {article.excerpt}
            </p>

            {/* 5 & 6. Publication Date, Author & Estimated Reading Time (Unboxed Metadata) */}
            <div className="mt-5 pt-4 pb-6 border-y border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800">
                  {article.authorName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Published {pubDate}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-medium text-slate-700">
                  {article.readingTimeMinutes} min read
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 1. Featured Image */}
            <figure className="mt-6 mb-8 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <ResilientImage
                src={article.featuredImage}
                alt={article.featuredImageAlt || article.title}
                fallbackLabel={article.title}
                className="w-full aspect-[16/9] object-cover"
              />
              {article.featuredImageAlt && (
                <figcaption className="px-4 py-2.5 bg-slate-50 text-xs text-slate-500 border-t border-slate-200">
                  {article.featuredImageAlt}
                </figcaption>
              )}
            </figure>

            {/* 7. Table of Contents with Clickable Section Links */}
            {tocHeadings.length > 0 && (
              <div className="my-8 p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B3C8C] mb-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Table of Contents</span>
                </div>
                <ol className="space-y-2 text-sm">
                  {tocHeadings.map((h) => (
                    <li
                      key={h.id}
                      className={h.level === 3 ? 'pl-4 text-xs' : 'font-medium'}
                    >
                      <a
                        href={`#${h.id}`}
                        className="text-slate-700 hover:text-[#0B3C8C] hover:underline transition-colors"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                  {article.faqs && article.faqs.length > 0 && (
                    <li className="font-medium">
                      <a
                        href="#frequently-asked-questions"
                        className="text-slate-700 hover:text-[#0B3C8C] hover:underline transition-colors"
                      >
                        Frequently Asked Questions (FAQ)
                      </a>
                    </li>
                  )}
                </ol>
              </div>
            )}

            {/* 8, 9, 10, 12. Introduction, Main Sections (H2/H3), Practical Examples & Conclusion */}
            <div
              className="article-prose max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Additional Uploaded In-Article Images (if added via Admin CMS) */}
            {article.inArticleImages && article.inArticleImages.length > 1 && (
              <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {article.inArticleImages.slice(1).map((img, index) => (
                  <figure
                    key={index}
                    className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                  >
                    <ResilientImage
                      src={img.url}
                      alt={img.alt || article.title}
                      className="w-full h-52 object-cover"
                    />
                    {img.caption && (
                      <figcaption className="p-2.5 text-xs text-slate-500">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {/* 11. Frequently Asked Questions (FAQ) */}
            {article.faqs && article.faqs.length > 0 && (
              <section
                id="frequently-asked-questions"
                className="mt-12 pt-8 border-t border-slate-200 scroll-mt-24"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#007A4D] mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Common Reader Questions</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                  Frequently Asked Questions (FAQ)
                </h2>
                <div className="space-y-4">
                  {article.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <h3 className="text-base font-bold text-slate-900">
                        {faq.question}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 14. Share Article Buttons */}
            <section className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Share This Article:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${article.title} - ${currentShareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[#007A4D] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Share on WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    article.title
                  )}&url=${encodeURIComponent(currentShareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Post on X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    currentShareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Share on LinkedIn
                </a>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copiedLink ? 'Link Copied!' : 'Copy Link'}
                </button>
              </div>
            </section>

            {/* 15. About Layitek Promotional Section */}
            <section className="mt-10 p-6 sm:p-8 rounded-xl bg-[#08204E] text-white border border-blue-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                    About Layitek Limited
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Need Professional Technology, CAC Registration, or Corporate Branding Support?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Layitek Limited is a trusted Nigerian technology and business services company helping individuals, startups, and established enterprises with computing hardware, telecommunications, CAC compliance, and executive branding.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <a
                    href={contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg bg-[#007A4D] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <span>Contact Layitek</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={aboutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <span>About Us</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </section>
          </article>

          {/* Consistent Article Sidebar on Desktop */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sidebar Search */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Search Layitek Blog
              </h3>
              <form onSubmit={handleSidebarSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    placeholder="Keywords, guides..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#0B3C8C]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-[#0B3C8C] text-white text-xs font-semibold hover:bg-blue-900 transition-colors cursor-pointer"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Sidebar Related Articles */}
            {article.relatedArticles && article.relatedArticles.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-slate-900 pb-3 mb-3 border-b border-slate-200">
                  Related in {categoryName}
                </h3>
                <div>
                  {article.relatedArticles.map((rel) => (
                    <ArticleCard key={rel.id} article={rel} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar Popular Articles */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 pb-3 mb-3 border-b border-slate-200">
                Popular Articles
              </h3>
              <div>
                {popularArticles.slice(0, 5).map((pop) => (
                  <ArticleCard key={pop.id} article={pop} variant="compact" />
                ))}
              </div>
            </div>

            {/* Sidebar Blog Categories */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 pb-3 mb-3 border-b border-slate-200">
                Blog Categories
              </h3>
              <ul className="space-y-2 text-xs">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      to={`/${cat.slug}`}
                      className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${
                        cat.slug === (categorySlug || article.categorySlug)
                          ? 'bg-blue-50 text-[#0B3C8C] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-slate-400 tabular-nums">
                        {cat.articleCount || 10}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* 13. Related Articles Full Row */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <section className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Related Articles You May Like
              </h2>
              <Link
                to={`/${article.categorySlug}`}
                className="text-xs font-semibold text-[#0B3C8C] hover:underline"
              >
                More in {categoryName}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {article.relatedArticles.slice(0, 4).map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}

        <NewsletterBox />
      </div>
    </>
  );
};
