import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseRestConfig() {
  const rawUrl = (
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_REST_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://lefypsyxdrxgwwjwtqxi.supabase.co'
  ).trim();

  const publishableKey = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  const anonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const secretKey = (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();

  const activeKey = secretKey || anonKey || publishableKey;
  if (!rawUrl || !activeKey) {
    return null;
  }

  const projectUrl = rawUrl
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/$/, '');

  const restBaseUrl = `${projectUrl}/rest/v1`;

  return {
    projectUrl,
    restBaseUrl,
    apiKey: activeKey,
    anonKey: anonKey || publishableKey,
    hasSecretKey: Boolean(secretKey),
  };
}

export function getSupabaseServerClient(): SupabaseClient | null {
  const cfg = getSupabaseRestConfig();
  if (!cfg) return null;
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(cfg.projectUrl, cfg.apiKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedAdminClient;
}

export async function mirrorSubscriberToSupabase(
  email: string,
  status = 'active'
) {
  try {
    const client = getSupabaseServerClient();
    if (!client) return;
    const { error } = await client.from('newsletter_subscribers').upsert(
      {
        email: email.trim().toLowerCase(),
        status,
      },
      { onConflict: 'email' }
    );
    if (error) {
      console.warn('[Supabase Sync] Subscriber mirror warning:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Subscriber mirror skipped:', err);
  }
}

export async function mirrorArticleToSupabase(article: any) {
  try {
    const client = getSupabaseServerClient();
    if (!client || !article) return;

    const { error } = await client.from('articles').upsert(
      {
        title: article.title,
        slug: article.slug,
        category_id: article.categoryId,
        category_slug: article.categorySlug,
        excerpt: article.excerpt,
        content: article.content,
        featured_image: article.featuredImage,
        featured_image_alt: article.featuredImageAlt,
        in_article_images: article.inArticleImages || [],
        faqs: article.faqs || [],
        seo_title: article.seoTitle,
        seo_description: article.seoDescription,
        status: article.status,
        is_featured: Boolean(article.isFeatured),
        is_popular: Boolean(article.isPopular),
        is_scheduled: Boolean(article.isScheduled),
        scheduled_at: article.scheduledAt
          ? new Date(article.scheduledAt).toISOString()
          : null,
        views_count: article.viewsCount || 120,
        reading_time_minutes: article.readingTimeMinutes || 6,
        author_name: article.authorName || 'Layitek Editorial Desk',
        author_role:
          article.authorRole || 'Technology & Business Advisory Team',
        published_at: article.publishedAt
          ? new Date(article.publishedAt).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.warn('[Supabase Sync] Article mirror warning:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Article mirror skipped:', err);
  }
}

export async function deleteArticleFromSupabase(slug?: string) {
  try {
    const client = getSupabaseServerClient();
    if (!client || !slug) return;
    await client.from('articles').delete().eq('slug', slug);
  } catch (err) {
    console.warn('[Supabase Sync] Article delete skipped:', err);
  }
}

export async function mirrorSiteSettingsToSupabase(
  settingsMap: Record<string, any>
) {
  try {
    const client = getSupabaseServerClient();
    if (!client || !settingsMap) return;
    const rows = Object.entries(settingsMap).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));
    if (rows.length > 0) {
      await client.from('site_settings').upsert(rows, { onConflict: 'key' });
    }
  } catch (err) {
    console.warn('[Supabase Sync] Site settings mirror skipped:', err);
  }
}

export async function mirrorUploadedImageToSupabase(img: any) {
  try {
    const client = getSupabaseServerClient();
    if (!client || !img) return;
    await client.from('article_images').insert({
      filename: img.filename,
      mime_type: img.mimeType,
      data_url: img.dataUrl,
      alt_text: img.altText,
      article_id: img.articleId ?? null,
      category_slug: img.categorySlug ?? null,
      file_size: img.fileSize || 0,
      uploaded_by_uid: img.uploadedByUid ?? null,
    });
  } catch (err) {
    console.warn('[Supabase Sync] Image mirror skipped:', err);
  }
}

export async function runSupabaseScheduledPublishJob() {
  try {
    const client = getSupabaseServerClient();
    if (!client) return;
    const nowIso = new Date().toISOString();

    // Try calling the PostgreSQL stored function first
    const { error: rpcError } = await client.rpc(
      'publish_due_scheduled_articles'
    );
    if (!rpcError) return;

    // Fallback direct update via Supabase client
    await client
      .from('articles')
      .update({
        status: 'published',
        is_scheduled: false,
        updated_at: nowIso,
      })
      .eq('is_scheduled', true)
      .lte('scheduled_at', nowIso);
  } catch {
    // Non-blocking if table not yet initialized
  }
}

export async function syncAllDataToSupabase(payload: {
  categories: any[];
  articles: any[];
  subscribers: any[];
  settings: Record<string, any>;
}) {
  const client = getSupabaseServerClient();
  const cfg = getSupabaseRestConfig();
  if (!client || !cfg) {
    throw new Error('Supabase client is not configured.');
  }

  // 1. Upsert Categories
  if (payload.categories.length > 0) {
    const { error: catErr } = await client.from('categories').upsert(
      payload.categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        short_description: c.shortDescription,
        icon_name: c.iconName,
        accent_color: c.accentColor,
        display_order: c.displayOrder,
      })),
      { onConflict: 'slug' }
    );
    if (catErr) {
      throw new Error(
        `Supabase categories sync failed: ${catErr.message}. Please ensure you ran the SQL script in Supabase SQL Editor.`
      );
    }
  }

  // 2. Upsert Articles in batches of 20
  const formattedArticles = payload.articles.map((a) => ({
    title: a.title,
    slug: a.slug,
    category_id: a.categoryId,
    category_slug: a.categorySlug,
    excerpt: a.excerpt,
    content: a.content,
    featured_image: a.featuredImage,
    featured_image_alt: a.featuredImageAlt,
    in_article_images: a.inArticleImages || [],
    faqs: a.faqs || [],
    seo_title: a.seoTitle,
    seo_description: a.seoDescription,
    status: a.status,
    is_featured: Boolean(a.isFeatured),
    is_popular: Boolean(a.isPopular),
    is_scheduled: Boolean(a.isScheduled),
    scheduled_at: a.scheduledAt
      ? new Date(a.scheduledAt).toISOString()
      : null,
    views_count: a.viewsCount || 120,
    reading_time_minutes: a.readingTimeMinutes || 6,
    author_name: a.authorName || 'Layitek Editorial Desk',
    author_role: a.authorRole || 'Technology & Business Advisory Team',
    published_at: a.publishedAt
      ? new Date(a.publishedAt).toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  for (let i = 0; i < formattedArticles.length; i += 20) {
    const batch = formattedArticles.slice(i, i + 20);
    const { error: artErr } = await client
      .from('articles')
      .upsert(batch, { onConflict: 'slug' });
    if (artErr) {
      throw new Error(`Supabase articles sync failed: ${artErr.message}`);
    }
  }

  // 3. Upsert Subscribers
  if (payload.subscribers.length > 0) {
    await client.from('newsletter_subscribers').upsert(
      payload.subscribers.map((s) => ({
        email: s.email,
        status: s.status || 'active',
      })),
      { onConflict: 'email' }
    );
  }

  // 4. Upsert Site Settings
  const settingsEntries = Object.entries(payload.settings || {});
  if (settingsEntries.length > 0) {
    await client.from('site_settings').upsert(
      settingsEntries.map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'key' }
    );
  }

  return {
    projectUrl: cfg.projectUrl,
    syncedCategories: payload.categories.length,
    syncedArticles: payload.articles.length,
    syncedSubscribers: payload.subscribers.length,
  };
}
