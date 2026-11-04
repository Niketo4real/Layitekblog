import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ArticleSummary } from '../types';
import { ResilientImage } from './ResilientImage';

const CATEGORY_LABELS: Record<string, string> = {
  computers: 'Computers',
  'phones-accessories': 'Phones & Accessories',
  gadgets: 'Gadgets',
  telecommunications: 'Telecommunications',
  'cac-arena': 'CAC Arena',
  'branding-printing': 'Branding & Printing',
};

export function formatCategoryName(slug: string): string {
  return (
    CATEGORY_LABELS[slug] ||
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

export function formatEditorialDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface ArticleCardProps {
  article: ArticleSummary;
  variant?: 'default' | 'lead' | 'compact';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'default',
}) => {
  const articleUrl = `/${article.categorySlug}/${article.slug}`;
  const categoryName = formatCategoryName(article.categorySlug);
  const pubDate = formatEditorialDate(article.publishedAt);

  if (variant === 'lead') {
    return (
      <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch transition-colors hover:border-slate-300">
        <Link
          to={articleUrl}
          className="lg:col-span-7 relative overflow-hidden bg-slate-900 min-h-[260px] lg:min-h-[380px] block"
        >
          <ResilientImage
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            fallbackLabel={article.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Unboxed editorial metadata per Zero-Pill Discipline */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0B3C8C] mb-3">
              <Link
                to={`/${article.categorySlug}`}
                className="hover:underline whitespace-nowrap"
              >
                {categoryName}
              </Link>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="text-slate-500 font-normal tabular-nums">
                {pubDate}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="text-slate-500 font-normal tabular-nums">
                {article.readingTimeMinutes} min read
              </span>
            </div>

            <Link to={articleUrl} className="block">
              <h3 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-900 leading-snug group-hover:text-[#0B3C8C] transition-colors">
                {article.title}
              </h3>
            </Link>

            <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-3">
              {article.excerpt}
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{article.authorName}</span>
            <Link
              to={articleUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3C8C] hover:text-blue-800 transition-colors whitespace-nowrap"
            >
              <span>Read More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group py-3.5 first:pt-0 last:pb-0 border-b border-slate-200/80 last:border-b-0 flex gap-3.5 items-start">
        <Link
          to={articleUrl}
          className="w-20 h-16 rounded-md overflow-hidden shrink-0 bg-slate-900 block"
        >
          <ResilientImage
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            fallbackLabel={article.title}
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
            <Link
              to={`/${article.categorySlug}`}
              className="font-semibold text-[#0B3C8C] hover:underline truncate"
            >
              {categoryName}
            </Link>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums whitespace-nowrap">
              {article.readingTimeMinutes} min read
            </span>
          </div>
          <Link to={articleUrl} className="block">
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#0B3C8C] transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h4>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-slate-300">
      <div>
        <Link
          to={articleUrl}
          className="aspect-[16/10] w-full overflow-hidden bg-slate-900 block"
        >
          <ResilientImage
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            fallbackLabel={article.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="p-5 sm:p-6">
          {/* Unboxed metadata row */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-2.5">
            <Link
              to={`/${article.categorySlug}`}
              className="font-semibold text-[#0B3C8C] hover:underline whitespace-nowrap"
            >
              {categoryName}
            </Link>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums whitespace-nowrap">{pubDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums whitespace-nowrap">
              {article.readingTimeMinutes} min read
            </span>
          </div>

          <Link to={articleUrl} className="block">
            <h3 className="text-lg font-semibold text-slate-900 leading-snug group-hover:text-[#0B3C8C] transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>

          <p className="mt-2.5 text-sm text-slate-600 leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 truncate">{article.authorName}</span>
        <Link
          to={articleUrl}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3C8C] hover:text-blue-800 transition-colors whitespace-nowrap shrink-0"
        >
          <span>Read More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};
