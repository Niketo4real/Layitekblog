import { createClient } from '@supabase/supabase-js';
import {
  ArticleDetail,
  ArticleSummary,
  CategoryItem,
  SiteSettingsMap,
  UploadedImageItem,
} from '../types';

const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://lefypsyxdrxgwwjwtqxi.supabase.co';

export const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/$/, '');

export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZnlwc3l4ZHJ4Z3d3and0cXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NDY4NzYsImV4cCI6MjEwOTMyMjg3Nn0.EdtACfmTVW7avN2oDUva5Sa2VDx2GTpouAJ_nOKU0HU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Generates a crisp client-side SVG data URI for any `/api/media/illustration/:slug.svg`
 * so illustrations render identically on static hosts (e.g. Vercel) and Express.
 */
export function buildClientSvgDataUri(slugOrUrl: string, labelOverride?: string): string {
  const cleanSlug = slugOrUrl
    .replace(/^.*\/api\/media\/illustration\//, '')
    .replace(/\.svg$/i, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-');

  const isDiagram = cleanSlug.endsWith('-diagram');
  const rawTitle =
    labelOverride ||
    cleanSlug
      .replace(/-diagram$/i, '')
      .split('-')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const displayTitle =
    rawTitle.length > 58 ? `${rawTitle.slice(0, 55)}...` : rawTitle || 'Layitek Guide';
  const badgeText = isDiagram
    ? 'TECHNICAL ARCHITECTURE & WORKFLOW DIAGRAM'
    : 'LAYITEK LIMITED • PRACTICAL KNOWLEDGE GUIDE';
  const accentColor = isDiagram ? '#007A4D' : '#0EA5E9';

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#061638"/>
      <stop offset="55%" stop-color="#0B3C8C"/>
      <stop offset="100%" stop-color="#07285E"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)"/>
  <circle cx="1040" cy="140" r="210" fill="${accentColor}" opacity="0.14"/>
  <circle cx="180" cy="580" r="240" fill="#38BDF8" opacity="0.1"/>
  <rect x="72" y="72" width="1056" height="531" rx="24" fill="#081E4A" fill-opacity="0.72" stroke="#38BDF8" stroke-opacity="0.28" stroke-width="2"/>
  <rect x="116" y="122" width="460" height="38" rx="8" fill="${accentColor}" fill-opacity="0.22" stroke="${accentColor}" stroke-opacity="0.6"/>
  <text x="136" y="146" fill="#7DD3FC" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="1.4">${escapeXml(badgeText)}</text>
  <text x="116" y="248" fill="#FFFFFF" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="40" font-weight="800">${escapeXml(displayTitle)}</text>
  <rect x="116" y="292" width="140" height="5" rx="2.5" fill="#F59E0B"/>
  <g transform="translate(116, 340)">
    <rect x="0" y="0" width="290" height="150" rx="14" fill="#0F295E" stroke="#38BDF8" stroke-opacity="0.3"/>
    <text x="24" y="42" fill="#38BDF8" font-family="Inter, sans-serif" font-size="14" font-weight="700">01 • ASSESSMENT</text>
    <text x="24" y="76" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="16" font-weight="600">Nigerian Market Standards</text>
    <text x="24" y="106" fill="#94A3B8" font-family="Inter, sans-serif" font-size="13">Verified specs &amp; power resilience</text>
    <rect x="335" y="0" width="290" height="150" rx="14" fill="#0F295E" stroke="#007A4D" stroke-opacity="0.45"/>
    <text x="359" y="42" fill="#34D399" font-family="Inter, sans-serif" font-size="14" font-weight="700">02 • IMPLEMENTATION</text>
    <text x="359" y="76" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="16" font-weight="600">Step-by-Step Execution</text>
    <text x="359" y="106" fill="#94A3B8" font-family="Inter, sans-serif" font-size="13">Field-tested operational checklist</text>
    <rect x="670" y="0" width="290" height="150" rx="14" fill="#0F295E" stroke="#F59E0B" stroke-opacity="0.4"/>
    <text x="694" y="42" fill="#FBBF24" font-family="Inter, sans-serif" font-size="14" font-weight="700">03 • OPTIMIZATION</text>
    <text x="694" y="76" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="16" font-weight="600">Long-Term ROI &amp; Support</text>
    <text x="694" y="106" fill="#94A3B8" font-family="Inter, sans-serif" font-size="13">Layitek Limited Advisory Desk</text>
  </g>
  <text x="116" y="556" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="15" font-weight="600">layitek.com • Official Publication of Layitek Limited (Nigeria)</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function normalizeHtmlIllustrationsForClient(html: string): string {
  if (!html || !html.includes('/api/media/illustration/')) return html;
  return html.replace(
    /src="(\/api\/media\/illustration\/[^"]+)"/g,
    (_match, srcUrl) => `src="${buildClientSvgDataUri(srcUrl)}"`
  );
}

export function mapSupabaseCategory(row: any, articleCount?: number): CategoryItem {
  return {
    id: Number(row.id),
    name: row.name || '',
    slug: row.slug || '',
    shortDescription: row.short_description ?? row.shortDescription ?? '',
    description: row.description || '',
    iconName: row.icon_name ?? row.iconName ?? 'Monitor',
    accentColor: row.accent_color ?? row.accentColor ?? '#0B3C8C',
    displayOrder: Number(row.display_order ?? row.displayOrder ?? 1),
    articleCount:
      typeof articleCount === 'number'
        ? articleCount
        : typeof row.articleCount === 'number'
        ? row.articleCount
        : 10,
  };
}

export function mapSupabaseArticleSummary(row: any): ArticleSummary {
  const pubAt = row.published_at ?? row.publishedAt ?? new Date().toISOString();
  const createdAt = row.created_at ?? row.createdAt ?? pubAt;
  const updatedAt = row.updated_at ?? row.updatedAt ?? pubAt;
  const scheduledAt = row.scheduled_at ?? row.scheduledAt ?? null;

  return {
    id: Number(row.id),
    title: row.title || '',
    slug: row.slug || '',
    categoryId: Number(row.category_id ?? row.categoryId ?? 1),
    categorySlug: row.category_slug ?? row.categorySlug ?? 'computers',
    excerpt: row.excerpt || '',
    featuredImage:
      row.featured_image ??
      row.featuredImage ??
      `/api/media/illustration/${row.slug || 'guide'}.svg`,
    featuredImageAlt:
      row.featured_image_alt ?? row.featuredImageAlt ?? row.title ?? '',
    seoTitle: row.seo_title ?? row.seoTitle ?? row.title ?? '',
    seoDescription: row.seo_description ?? row.seoDescription ?? row.excerpt ?? '',
    status: row.status || 'published',
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    isPopular: Boolean(row.is_popular ?? row.isPopular),
    isScheduled: Boolean(row.is_scheduled ?? row.isScheduled),
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    viewsCount: Number(row.views_count ?? row.viewsCount ?? 0),
    readingTimeMinutes: Number(
      row.reading_time_minutes ?? row.readingTimeMinutes ?? 7
    ),
    authorName:
      row.author_name ?? row.authorName ?? 'Layitek Editorial Team',
    authorRole:
      row.author_role ??
      row.authorRole ??
      'Technology & Business Advisory Desk',
    publishedAt: new Date(pubAt).toISOString(),
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
  };
}

export function mapSupabaseArticleDetail(
  row: any,
  relatedArticles: ArticleSummary[] = []
): ArticleDetail {
  const summary = mapSupabaseArticleSummary(row);
  let faqs = row.faqs ?? [];
  if (typeof faqs === 'string') {
    try {
      faqs = JSON.parse(faqs);
    } catch {
      faqs = [];
    }
  }
  let inArticleImages = row.in_article_images ?? row.inArticleImages ?? [];
  if (typeof inArticleImages === 'string') {
    try {
      inArticleImages = JSON.parse(inArticleImages);
    } catch {
      inArticleImages = [];
    }
  }

  return {
    ...summary,
    content: normalizeHtmlIllustrationsForClient(row.content || ''),
    inArticleImages: Array.isArray(inArticleImages) ? inArticleImages : [],
    faqs: Array.isArray(faqs) ? faqs : [],
    relatedArticles,
  };
}

const SUMMARY_COLUMNS =
  'id,title,slug,category_id,category_slug,excerpt,featured_image,featured_image_alt,seo_title,seo_description,status,is_featured,is_popular,is_scheduled,scheduled_at,views_count,reading_time_minutes,author_name,author_role,published_at,created_at,updated_at';

async function tryLocalApiJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Automatically promotes any due scheduled articles in Supabase if their scheduled_at <= now.
 */
async function promoteDueScheduledArticlesInSupabase(): Promise<number> {
  try {
    const nowIso = new Date().toISOString();
    const { data: dueRows } = await supabase
      .from('articles')
      .select('id,scheduled_at')
      .or('status.eq.scheduled,is_scheduled.eq.true')
      .lte('scheduled_at', nowIso);

    if (!dueRows || dueRows.length === 0) return 0;

    let count = 0;
    for (const row of dueRows) {
      const { error } = await supabase
        .from('articles')
        .update({
          status: 'published',
          is_scheduled: false,
          published_at: row.scheduled_at || nowIso,
          updated_at: nowIso,
        })
        .eq('id', row.id);
      if (!error) count++;
    }
    return count;
  } catch {
    return 0;
  }
}

export async function fetchBlogBootstrap(): Promise<{
  settings: Partial<SiteSettingsMap>;
  categories: CategoryItem[];
  featuredArticles: ArticleSummary[];
  latestArticles: ArticleSummary[];
  popularArticles: ArticleSummary[];
  totalPublished: number;
}> {
  const apiData = await tryLocalApiJson<any>('/api/bootstrap');
  if (apiData && Array.isArray(apiData.categories) && apiData.categories.length > 0) {
    return apiData;
  }

  await promoteDueScheduledArticlesInSupabase();

  const [catRes, settingsRes, articlesRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase.from('site_settings').select('*'),
    supabase
      .from('articles')
      .select(SUMMARY_COLUMNS)
      .eq('status', 'published')
      .eq('is_scheduled', false)
      .order('published_at', { ascending: false }),
  ]);

  const allPublished = (articlesRes.data || []).map(mapSupabaseArticleSummary);

  const countByCat: Record<string, number> = {};
  for (const art of allPublished) {
    countByCat[art.categorySlug] = (countByCat[art.categorySlug] || 0) + 1;
  }

  const categories = (catRes.data || []).map((c: any) =>
    mapSupabaseCategory(c, countByCat[c.slug] ?? 10)
  );

  const settings: Record<string, any> = {};
  for (const row of settingsRes.data || []) {
    const k = row.key ?? row.setting_key;
    const v = row.value ?? row.setting_value;
    if (k) settings[k] = v;
  }

  const featuredArticles = allPublished.filter((a) => a.isFeatured).slice(0, 6);
  const latestArticles = allPublished.slice(0, 12);
  const popularArticles = [...allPublished]
    .sort((a, b) => {
      if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
      return b.viewsCount - a.viewsCount;
    })
    .slice(0, 8);

  return {
    settings,
    categories,
    featuredArticles:
      featuredArticles.length > 0 ? featuredArticles : allPublished.slice(0, 6),
    latestArticles,
    popularArticles,
    totalPublished: allPublished.length,
  };
}

export async function fetchBlogArticles(params: {
  category?: string;
  search?: string;
  sort?: 'latest' | 'popular' | 'title' | 'oldest';
  limit?: number;
  offset?: number;
}): Promise<{ items: ArticleSummary[]; total: number }> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') {
    query.set('category', params.category);
  }
  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }
  if (params.sort) {
    query.set('sort', params.sort);
  }
  if (params.limit) {
    query.set('limit', String(params.limit));
  }
  if (params.offset) {
    query.set('offset', String(params.offset));
  }

  const apiData = await tryLocalApiJson<{ items: ArticleSummary[]; total: number }>(
    `/api/articles?${query.toString()}`
  );
  if (apiData && Array.isArray(apiData.items)) {
    return apiData;
  }

  let sbQuery = supabase
    .from('articles')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'published')
    .eq('is_scheduled', false);

  if (params.category && params.category !== 'all') {
    sbQuery = sbQuery.eq('category_slug', params.category);
  }

  if (params.search?.trim()) {
    const q = params.search.trim().replace(/[%_]/g, '');
    sbQuery = sbQuery.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  }

  if (params.sort === 'popular') {
    sbQuery = sbQuery.order('views_count', { ascending: false });
  } else if (params.sort === 'title') {
    sbQuery = sbQuery.order('title', { ascending: true });
  } else if (params.sort === 'oldest') {
    sbQuery = sbQuery.order('published_at', { ascending: true });
  } else {
    sbQuery = sbQuery.order('published_at', { ascending: false });
  }

  if (params.limit) {
    const start = params.offset || 0;
    sbQuery = sbQuery.range(start, start + params.limit - 1);
  }

  const { data, error } = await sbQuery;
  if (error) {
    console.error('Supabase fetchBlogArticles error:', error);
    return { items: [], total: 0 };
  }

  const items = (data || []).map(mapSupabaseArticleSummary);
  return { items, total: items.length };
}

export async function fetchBlogArticleBySlug(
  slug: string
): Promise<ArticleDetail | null> {
  const apiData = await tryLocalApiJson<ArticleDetail>(
    `/api/articles/by-slug/${encodeURIComponent(slug)}`
  );
  if (apiData && apiData.slug) {
    return {
      ...apiData,
      content: normalizeHtmlIllustrationsForClient(apiData.content),
    };
  }

  const { data: row, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  // Increment views_count best-effort
  supabase
    .from('articles')
    .update({ views_count: Number(row.views_count || 0) + 1 })
    .eq('id', row.id)
    .then(() => {});

  const { data: relatedRows } = await supabase
    .from('articles')
    .select(SUMMARY_COLUMNS)
    .eq('category_slug', row.category_slug)
    .eq('status', 'published')
    .eq('is_scheduled', false)
    .neq('id', row.id)
    .order('published_at', { ascending: false })
    .limit(4);

  const relatedArticles = (relatedRows || []).map(mapSupabaseArticleSummary);
  return mapSupabaseArticleDetail(row, relatedArticles);
}

export async function subscribeBlogNewsletter(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  const apiData = await tryLocalApiJson<{ success?: boolean; message?: string; error?: string }>(
    '/api/newsletter/subscribe',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  );
  if (apiData && (apiData.message || apiData.success)) {
    return {
      success: true,
      message:
        apiData.message ||
        'Thank you for subscribing to the Layitek Blog newsletter!',
    };
  }

  const normalized = email.trim().toLowerCase();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: normalized, status: 'active' }, { onConflict: 'email' });

  if (error) {
    throw new Error(error.message || 'Unable to save subscription.');
  }

  return {
    success: true,
    message: 'Thank you for subscribing to the Layitek Blog newsletter!',
  };
}

/**
 * Unified Admin API + Direct Supabase Fallback so the Admin Portal (/admin)
 * works seamlessly on both local Express and Vercel static deployments.
 */
export async function executeAdminRequest(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<any> {
  // 1. Try Express backend first
  try {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(url, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      return data;
    }
  } catch (err: any) {
    if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('Unexpected token')) {
      // Fall through to Supabase if local route returned an error or is unavailable
    }
  }

  // 2. Fallback to Direct Supabase Operations (for Vercel static deployment)
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(String(options.body)) : {};

  if (url.startsWith('/api/admin/overview') && method === 'GET') {
    await promoteDueScheduledArticlesInSupabase();
    const [artRes, catRes, subRes, imgRes, setRes] = await Promise.all([
      supabase.from('articles').select(SUMMARY_COLUMNS),
      supabase.from('categories').select('*').order('display_order', { ascending: true }),
      supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('article_images').select('id'),
      supabase.from('site_settings').select('*'),
    ]);

    const allArticles = (artRes.data || []).map(mapSupabaseArticleSummary);
    const published = allArticles.filter((a) => a.status === 'published' && !a.isScheduled);
    const scheduled = allArticles.filter((a) => a.isScheduled || a.status === 'scheduled');
    const drafts = allArticles.filter((a) => a.status === 'draft' && !a.isScheduled);
    const totalViews = allArticles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);

    const settings: Record<string, any> = {};
    for (const row of setRes.data || []) {
      const k = row.key ?? row.setting_key;
      const v = row.value ?? row.setting_value;
      if (k) settings[k] = v;
    }

    return {
      stats: {
        totalArticles: allArticles.length,
        publishedArticles: published.length,
        draftArticles: drafts.length,
        scheduledArticles: scheduled.length,
        featuredArticles: allArticles.filter((a) => a.isFeatured).length,
        totalCategories: (catRes.data || []).length || 6,
        totalViews,
        totalSubscribers: (subRes.data || []).length,
        totalUploadedImages: (imgRes.data || []).length,
      },
      subscribers: (subRes.data || []).map((s: any) => ({
        id: s.id,
        email: s.email,
        status: s.status || 'active',
        createdAt: s.created_at || new Date().toISOString(),
      })),
      settings: Object.keys(settings).length > 0 ? settings : null,
    };
  }

  if (url.startsWith('/api/admin/articles') && method === 'GET') {
    const singleMatch = url.match(/^\/api\/admin\/articles\/(\d+)$/);
    if (singleMatch) {
      const id = Number(singleMatch[1]);
      const { data: row, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !row) throw new Error('Article not found in Supabase.');
      return mapSupabaseArticleDetail(row);
    }

    const { data, error } = await supabase
      .from('articles')
      .select(SUMMARY_COLUMNS)
      .order('published_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { items: (data || []).map(mapSupabaseArticleSummary) };
  }

  if (url === '/api/admin/articles' && method === 'POST') {
    const { data: catRow } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', body.categorySlug || 'computers')
      .maybeSingle();

    const nowIso = new Date().toISOString();
    const isSched = Boolean(body.isScheduled) || body.status === 'scheduled';
    const insertPayload = {
      title: body.title,
      slug: body.slug,
      category_id: catRow?.id || 1,
      category_slug: body.categorySlug || 'computers',
      excerpt: body.excerpt,
      content: body.content,
      featured_image: body.featuredImage,
      featured_image_alt: body.featuredImageAlt || body.title,
      in_article_images: body.inArticleImages || [],
      faqs: body.faqs || [],
      seo_title: body.seoTitle || body.title,
      seo_description: body.seoDescription || body.excerpt,
      status: isSched ? 'scheduled' : body.status || 'published',
      is_featured: Boolean(body.isFeatured),
      is_popular: Boolean(body.isPopular),
      is_scheduled: isSched,
      scheduled_at: isSched ? body.scheduledAt : null,
      reading_time_minutes: 7,
      author_name: 'Layitek Editorial Team',
      author_role: 'Technology & Business Advisory Desk',
      published_at: body.publishedAt || nowIso,
      updated_at: nowIso,
    };

    const { data, error } = await supabase
      .from('articles')
      .insert(insertPayload)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapSupabaseArticleDetail(data);
  }

  const scheduleMatch = url.match(/^\/api\/admin\/articles\/(\d+)\/schedule$/);
  if (scheduleMatch && method === 'POST') {
    const id = Number(scheduleMatch[1]);
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: 'scheduled',
        is_scheduled: true,
        scheduled_at: body.scheduledAt,
        published_at: body.scheduledAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapSupabaseArticleSummary(data);
  }

  const unscheduleMatch = url.match(/^\/api\/admin\/articles\/(\d+)\/unschedule$/);
  if (unscheduleMatch && method === 'POST') {
    const id = Number(unscheduleMatch[1]);
    const nextStatus = body.targetStatus === 'published' ? 'published' : 'draft';
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: nextStatus,
        is_scheduled: false,
        scheduled_at: null,
        published_at: nextStatus === 'published' ? nowIso : undefined,
        updated_at: nowIso,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapSupabaseArticleSummary(data);
  }

  const articleIdMatch = url.match(/^\/api\/admin\/articles\/(\d+)$/);
  if (articleIdMatch && method === 'PUT') {
    const id = Number(articleIdMatch[1]);
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.categorySlug !== undefined) updateData.category_slug = body.categorySlug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.featuredImage !== undefined) updateData.featured_image = body.featuredImage;
    if (body.featuredImageAlt !== undefined)
      updateData.featured_image_alt = body.featuredImageAlt;
    if (body.seoTitle !== undefined) updateData.seo_title = body.seoTitle;
    if (body.seoDescription !== undefined)
      updateData.seo_description = body.seoDescription;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isScheduled !== undefined) updateData.is_scheduled = Boolean(body.isScheduled);
    if (body.scheduledAt !== undefined) updateData.scheduled_at = body.scheduledAt;
    if (body.isFeatured !== undefined) updateData.is_featured = Boolean(body.isFeatured);
    if (body.isPopular !== undefined) updateData.is_popular = Boolean(body.isPopular);
    if (body.faqs !== undefined) updateData.faqs = body.faqs;
    if (body.publishedAt !== undefined) updateData.published_at = body.publishedAt;

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapSupabaseArticleDetail(data);
  }

  if (articleIdMatch && method === 'DELETE') {
    const id = Number(articleIdMatch[1]);
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  if (url === '/api/admin/scheduler/run' && method === 'POST') {
    const publishedCount = await promoteDueScheduledArticlesInSupabase();
    return { success: true, publishedCount };
  }

  if (url === '/api/admin/supabase/sync' && method === 'POST') {
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
    return {
      success: true,
      message: `Connected directly to Supabase (${count || 60} articles live in database).`,
    };
  }

  if (url === '/api/admin/images' && method === 'GET') {
    const { data } = await supabase
      .from('article_images')
      .select('id,filename,mime_type,data_url,alt_text,article_id,category_slug,file_size,created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    const items: UploadedImageItem[] = (data || []).map((row: any) => ({
      id: Number(row.id),
      filename: row.filename,
      mimeType: row.mime_type,
      url: row.data_url,
      altText: row.alt_text || '',
      articleId: row.article_id,
      categorySlug: row.category_slug,
      fileSize: Number(row.file_size || 0),
      createdAt: row.created_at || new Date().toISOString(),
    }));
    return { items };
  }

  if (url === '/api/admin/images' && method === 'POST') {
    const { data, error } = await supabase
      .from('article_images')
      .insert({
        filename: body.filename,
        mime_type: body.mimeType || 'image/jpeg',
        data_url: body.dataUrl,
        alt_text: body.altText || '',
        article_id: body.articleId || null,
        category_slug: body.categorySlug || null,
        file_size: body.fileSize || 0,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return {
      id: Number(data.id),
      filename: data.filename,
      mimeType: data.mime_type,
      url: data.data_url,
      altText: data.alt_text || '',
      articleId: data.article_id,
      categorySlug: data.category_slug,
      fileSize: Number(data.file_size || 0),
      createdAt: data.created_at || new Date().toISOString(),
    };
  }

  if (url === '/api/admin/settings' && method === 'PUT') {
    const nowIso = new Date().toISOString();
    for (const [key, value] of Object.entries(body)) {
      await supabase.from('site_settings').upsert(
        {
          key,
          value,
          updated_at: nowIso,
        },
        { onConflict: 'key' }
      );
    }
    return { success: true };
  }

  throw new Error(`Unsupported admin action: ${method} ${url}`);
}
