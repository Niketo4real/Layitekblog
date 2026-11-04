import { db } from './index.ts';
import {
  articles,
  categories,
  articleImages,
  newsletterSubscribers,
  siteSettings,
  ArticleFaqItem,
  InArticleImageItem,
} from './schema.ts';
import { DEFAULT_SITE_SETTINGS } from './seed-categories.ts';
import { eq, desc, asc, and, or, ilike, ne, lte, isNotNull } from 'drizzle-orm';
import {
  mirrorArticleToSupabase,
  deleteArticleFromSupabase,
  mirrorSubscriberToSupabase,
  mirrorSiteSettingsToSupabase,
  mirrorUploadedImageToSupabase,
  runSupabaseScheduledPublishJob,
  syncAllDataToSupabase,
  getSupabaseRestConfig,
} from '../lib/supabase-sync.ts';

let lastSchedulerCheckAt: string | null = null;
let totalAutoPublishedCount = 0;

export function getSchedulerRuntimeInfo() {
  return {
    lastSchedulerCheckAt,
    totalAutoPublishedCount,
  };
}

/**
 * Checks for scheduled articles whose `scheduled_at` timestamp has arrived
 * (`scheduled_at <= NOW()`) and automatically publishes them.
 */
export async function processDueScheduledArticles() {
  try {
    const now = new Date();
    lastSchedulerCheckAt = now.toISOString();
    void runSupabaseScheduledPublishJob();

    const dueArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        categorySlug: articles.categorySlug,
        scheduledAt: articles.scheduledAt,
      })
      .from(articles)
      .where(
        and(
          or(eq(articles.isScheduled, true), eq(articles.status, 'scheduled')),
          isNotNull(articles.scheduledAt),
          lte(articles.scheduledAt, now)
        )
      );

    if (dueArticles.length === 0) {
      return {
        publishedCount: 0,
        publishedArticles: [],
        checkedAt: lastSchedulerCheckAt,
      };
    }

    const publishedList = [];
    for (const due of dueArticles) {
      const updatedRows = await db
        .update(articles)
        .set({
          status: 'published',
          isScheduled: false,
          publishedAt: due.scheduledAt || now,
          updatedAt: now,
        })
        .where(eq(articles.id, due.id))
        .returning({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          categorySlug: articles.categorySlug,
          publishedAt: articles.publishedAt,
        });

      if (updatedRows[0]) {
        publishedList.push(updatedRows[0]);
      }
    }

    totalAutoPublishedCount += publishedList.length;

    return {
      publishedCount: publishedList.length,
      publishedArticles: publishedList,
      checkedAt: lastSchedulerCheckAt,
    };
  } catch (error) {
    console.error('Database query failed in processDueScheduledArticles:', error);
    return {
      publishedCount: 0,
      publishedArticles: [],
      checkedAt: new Date().toISOString(),
    };
  }
}

export async function getAllCategories() {
  try {
    await processDueScheduledArticles();
    const cats = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder));
    const allPublished = await db
      .select({ categorySlug: articles.categorySlug })
      .from(articles)
      .where(eq(articles.status, 'published'));

    const counts: Record<string, number> = {};
    for (const row of allPublished) {
      counts[row.categorySlug] = (counts[row.categorySlug] || 0) + 1;
    }

    return cats.map((c) => ({
      ...c,
      articleCount: counts[c.slug] || 0,
    }));
  } catch (error) {
    console.error('Database query failed in getAllCategories:', error);
    throw new Error('Failed to fetch blog categories.', { cause: error });
  }
}

export interface ArticleFilterOptions {
  categorySlug?: string;
  search?: string;
  status?: string; // 'published' | 'draft' | 'scheduled' | 'all'
  featuredOnly?: boolean;
  popularOnly?: boolean;
  sortBy?: 'latest' | 'popular' | 'oldest' | 'title' | 'scheduled';
  limit?: number;
  offset?: number;
}

export async function queryArticles(options: ArticleFilterOptions = {}) {
  try {
    await processDueScheduledArticles();

    const conditions = [];

    if (!options.status || options.status === 'published') {
      conditions.push(eq(articles.status, 'published'));
    } else if (options.status === 'scheduled') {
      conditions.push(
        or(eq(articles.status, 'scheduled'), eq(articles.isScheduled, true))
      );
    } else if (options.status !== 'all') {
      conditions.push(eq(articles.status, options.status));
    }

    if (options.categorySlug && options.categorySlug !== 'all') {
      conditions.push(eq(articles.categorySlug, options.categorySlug));
    }

    if (options.featuredOnly) {
      conditions.push(eq(articles.isFeatured, true));
    }

    if (options.popularOnly) {
      conditions.push(eq(articles.isPopular, true));
    }

    if (options.search && options.search.trim().length > 0) {
      const q = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(articles.title, q),
          ilike(articles.excerpt, q),
          ilike(articles.content, q),
          ilike(articles.categorySlug, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause = desc(articles.publishedAt);
    if (options.sortBy === 'popular') {
      orderByClause = desc(articles.viewsCount);
    } else if (options.sortBy === 'oldest') {
      orderByClause = asc(articles.publishedAt);
    } else if (options.sortBy === 'title') {
      orderByClause = asc(articles.title);
    } else if (options.sortBy === 'scheduled') {
      orderByClause = asc(articles.scheduledAt);
    }

    const allMatching = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        categoryId: articles.categoryId,
        categorySlug: articles.categorySlug,
        excerpt: articles.excerpt,
        featuredImage: articles.featuredImage,
        featuredImageAlt: articles.featuredImageAlt,
        seoTitle: articles.seoTitle,
        seoDescription: articles.seoDescription,
        status: articles.status,
        isFeatured: articles.isFeatured,
        isPopular: articles.isPopular,
        isScheduled: articles.isScheduled,
        scheduledAt: articles.scheduledAt,
        viewsCount: articles.viewsCount,
        readingTimeMinutes: articles.readingTimeMinutes,
        authorName: articles.authorName,
        authorRole: articles.authorRole,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .where(whereClause)
      .orderBy(orderByClause);

    const total = allMatching.length;
    const offset = options.offset || 0;
    const limit = options.limit || total;
    const items = allMatching.slice(offset, offset + limit);

    return {
      items,
      total,
      offset,
      limit,
    };
  } catch (error) {
    console.error('Database query failed in queryArticles:', error);
    throw new Error('Failed to load articles.', { cause: error });
  }
}

export async function getArticleBySlug(slug: string, includeDrafts = false) {
  try {
    await processDueScheduledArticles();

    const result = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug));

    const article = result[0];
    if (!article) {
      return null;
    }

    if (!includeDrafts && article.status !== 'published') {
      return null;
    }

    // Increment view count asynchronously for public reads
    if (!includeDrafts) {
      await db
        .update(articles)
        .set({ viewsCount: (article.viewsCount || 0) + 1 })
        .where(eq(articles.id, article.id));
    }

    // Fetch related articles in the same category
    const related = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        categorySlug: articles.categorySlug,
        excerpt: articles.excerpt,
        featuredImage: articles.featuredImage,
        featuredImageAlt: articles.featuredImageAlt,
        readingTimeMinutes: articles.readingTimeMinutes,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .where(
        and(
          eq(articles.categorySlug, article.categorySlug),
          eq(articles.status, 'published'),
          ne(articles.slug, article.slug)
        )
      )
      .orderBy(desc(articles.viewsCount))
      .limit(4);

    return {
      ...article,
      relatedArticles: related,
    };
  } catch (error) {
    console.error('Database query failed in getArticleBySlug:', error);
    throw new Error('Failed to retrieve article details.', { cause: error });
  }
}

export async function getArticleById(id: number) {
  try {
    await processDueScheduledArticles();
    const result = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in getArticleById:', error);
    throw new Error('Failed to retrieve article by ID.', { cause: error });
  }
}

export interface UpsertArticlePayload {
  title: string;
  slug: string;
  categorySlug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  inArticleImages?: InArticleImageItem[];
  faqs?: ArticleFaqItem[];
  seoTitle?: string;
  seoDescription?: string;
  status?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isScheduled?: boolean;
  scheduledAt?: string | null;
  readingTimeMinutes?: number;
  authorName?: string;
  authorRole?: string;
  publishedAt?: string;
}

function resolveSchedulingFields(payload: Partial<UpsertArticlePayload>) {
  const now = new Date();
  const wantsScheduled =
    payload.isScheduled === true || payload.status === 'scheduled';

  if (wantsScheduled && payload.scheduledAt) {
    const parsedSchedule = new Date(payload.scheduledAt);
    if (!Number.isNaN(parsedSchedule.getTime())) {
      if (parsedSchedule.getTime() > now.getTime()) {
        return {
          status: 'scheduled',
          isScheduled: true,
          scheduledAt: parsedSchedule,
          publishedAt: parsedSchedule,
        };
      }
      // If scheduled time is already in the past or present, publish immediately
      return {
        status: 'published',
        isScheduled: false,
        scheduledAt: null,
        publishedAt: parsedSchedule,
      };
    }
  }

  if (payload.status === 'published' || payload.status === 'draft') {
    return {
      status: payload.status,
      isScheduled: false,
      scheduledAt: null,
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
    };
  }

  return {
    status: payload.status,
    isScheduled: payload.isScheduled,
    scheduledAt:
      payload.scheduledAt === null
        ? null
        : payload.scheduledAt
        ? new Date(payload.scheduledAt)
        : undefined,
    publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
  };
}

export async function createArticle(payload: UpsertArticlePayload) {
  try {
    const catRows = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, payload.categorySlug));

    const category = catRows[0];
    if (!category) {
      throw new Error(`Invalid category: ${payload.categorySlug}`);
    }

    const wordCount = payload.content.replace(/<[^>]*>/g, ' ').split(/\s+/).length;
    const calculatedReadTime = Math.max(3, Math.round(wordCount / 180));
    const resolved = resolveSchedulingFields(payload);

    const inserted = await db
      .insert(articles)
      .values({
        title: payload.title,
        slug: payload.slug,
        categoryId: category.id,
        categorySlug: category.slug,
        excerpt: payload.excerpt,
        content: payload.content,
        featuredImage:
          payload.featuredImage || `/api/media/illustration/${payload.slug}.svg`,
        featuredImageAlt: payload.featuredImageAlt || payload.title,
        inArticleImages: payload.inArticleImages || [],
        faqs: payload.faqs || [],
        seoTitle: payload.seoTitle || `${payload.title} | Layitek Blog`,
        seoDescription: payload.seoDescription || payload.excerpt,
        status: resolved.status || 'published',
        isFeatured: Boolean(payload.isFeatured),
        isPopular: Boolean(payload.isPopular),
        isScheduled: Boolean(resolved.isScheduled),
        scheduledAt: resolved.scheduledAt ?? null,
        readingTimeMinutes: payload.readingTimeMinutes || calculatedReadTime,
        authorName: payload.authorName || 'Layitek Editorial Desk',
        authorRole: payload.authorRole || 'Technology & Business Advisory Team',
        publishedAt: resolved.publishedAt || new Date(),
      })
      .returning();

    const created = inserted[0];
    void mirrorArticleToSupabase(created);
    return created;
  } catch (error) {
    console.error('Database query failed in createArticle:', error);
    throw new Error(
      'Failed to create new article. Check that the URL slug is unique.',
      {
        cause: error,
      }
    );
  }
}

export async function updateArticle(
  id: number,
  payload: Partial<UpsertArticlePayload>
) {
  try {
    let categoryId: number | undefined;
    if (payload.categorySlug) {
      const catRows = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, payload.categorySlug));
      if (catRows[0]) {
        categoryId = catRows[0].id;
      }
    }

    const resolved = resolveSchedulingFields(payload);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.categorySlug !== undefined)
      updateData.categorySlug = payload.categorySlug;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (payload.excerpt !== undefined) updateData.excerpt = payload.excerpt;
    if (payload.content !== undefined) updateData.content = payload.content;
    if (payload.featuredImage !== undefined)
      updateData.featuredImage = payload.featuredImage;
    if (payload.featuredImageAlt !== undefined)
      updateData.featuredImageAlt = payload.featuredImageAlt;
    if (payload.inArticleImages !== undefined)
      updateData.inArticleImages = payload.inArticleImages;
    if (payload.faqs !== undefined) updateData.faqs = payload.faqs;
    if (payload.seoTitle !== undefined) updateData.seoTitle = payload.seoTitle;
    if (payload.seoDescription !== undefined)
      updateData.seoDescription = payload.seoDescription;
    if (resolved.status !== undefined) updateData.status = resolved.status;
    if (payload.isFeatured !== undefined)
      updateData.isFeatured = payload.isFeatured;
    if (payload.isPopular !== undefined)
      updateData.isPopular = payload.isPopular;
    if (resolved.isScheduled !== undefined)
      updateData.isScheduled = resolved.isScheduled;
    if (resolved.scheduledAt !== undefined)
      updateData.scheduledAt = resolved.scheduledAt;
    if (payload.readingTimeMinutes !== undefined)
      updateData.readingTimeMinutes = payload.readingTimeMinutes;
    if (payload.authorName !== undefined)
      updateData.authorName = payload.authorName;
    if (resolved.publishedAt !== undefined)
      updateData.publishedAt = resolved.publishedAt;

    const updated = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();

    const updatedRow = updated[0] || null;
    if (updatedRow) {
      void mirrorArticleToSupabase(updatedRow);
    }
    return updatedRow;
  } catch (error) {
    console.error('Database query failed in updateArticle:', error);
    throw new Error('Failed to update article.', { cause: error });
  }
}

export async function scheduleArticleById(id: number, scheduledAtIso: string) {
  try {
    const targetDate = new Date(scheduledAtIso);
    if (Number.isNaN(targetDate.getTime())) {
      throw new Error('Invalid schedule date and time provided.');
    }

    if (targetDate.getTime() <= Date.now()) {
      throw new Error('Scheduled publication date and time must be in the future.');
    }

    const updated = await db
      .update(articles)
      .set({
        status: 'scheduled',
        isScheduled: true,
        scheduledAt: targetDate,
        publishedAt: targetDate,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning();

    const updatedRow = updated[0] || null;
    if (updatedRow) {
      void mirrorArticleToSupabase(updatedRow);
    }
    return updatedRow;
  } catch (error) {
    console.error('Database query failed in scheduleArticleById:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to schedule article.', { cause: error });
  }
}

export async function cancelArticleScheduleById(
  id: number,
  targetStatus: 'draft' | 'published' = 'draft'
) {
  try {
    const now = new Date();
    const updated = await db
      .update(articles)
      .set({
        status: targetStatus,
        isScheduled: false,
        scheduledAt: null,
        publishedAt: targetStatus === 'published' ? now : undefined,
        updatedAt: now,
      })
      .where(eq(articles.id, id))
      .returning();

    const updatedRow = updated[0] || null;
    if (updatedRow) {
      void mirrorArticleToSupabase(updatedRow);
    }
    return updatedRow;
  } catch (error) {
    console.error('Database query failed in cancelArticleScheduleById:', error);
    throw new Error('Failed to cancel article schedule.', { cause: error });
  }
}

export async function deleteArticleById(id: number) {
  try {
    const deleted = await db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning();
    const removed = deleted[0] || null;
    if (removed?.slug) {
      void deleteArticleFromSupabase(removed.slug);
    }
    return removed;
  } catch (error) {
    console.error('Database query failed in deleteArticleById:', error);
    throw new Error('Failed to delete article.', { cause: error });
  }
}

export async function getSiteSettingsMap() {
  try {
    const rows = await db.select().from(siteSettings);
    const merged: Record<string, any> = {
      ...DEFAULT_SITE_SETTINGS,
    };

    for (const row of rows) {
      merged[row.key] = {
        ...(merged[row.key] || {}),
        ...(row.value as Record<string, any>),
      };
    }

    return merged;
  } catch (error) {
    console.error('Database query failed in getSiteSettingsMap:', error);
    throw new Error('Failed to load site settings.', { cause: error });
  }
}

export async function updateSiteSettingsMap(updates: Record<string, any>) {
  try {
    for (const [key, value] of Object.entries(updates)) {
      await db
        .insert(siteSettings)
        .values({
          key,
          value,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value,
            updatedAt: new Date(),
          },
        });
    }
    const merged = await getSiteSettingsMap();
    void mirrorSiteSettingsToSupabase(merged);
    return merged;
  } catch (error) {
    console.error('Database query failed in updateSiteSettingsMap:', error);
    throw new Error('Failed to save site settings.', { cause: error });
  }
}

export async function addNewsletterSubscriber(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const result = await db
      .insert(newsletterSubscribers)
      .values({
        email: cleanEmail,
        status: 'active',
      })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: {
          status: 'active',
        },
      })
      .returning();

    const subscriber = result[0];
    if (subscriber) {
      void mirrorSubscriberToSupabase(subscriber.email, subscriber.status);
    }
    return subscriber;
  } catch (error) {
    console.error('Database query failed in addNewsletterSubscriber:', error);
    throw new Error('Failed to process newsletter subscription.', {
      cause: error,
    });
  }
}

export async function getAllSubscribers() {
  try {
    return await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllSubscribers:', error);
    throw new Error('Failed to load newsletter subscribers.', { cause: error });
  }
}

export async function saveUploadedImage(params: {
  filename: string;
  mimeType: string;
  dataUrl: string;
  altText: string;
  articleId?: number;
  categorySlug?: string;
  fileSize: number;
  uploadedByUid?: string;
}) {
  try {
    const inserted = await db
      .insert(articleImages)
      .values({
        filename: params.filename,
        mimeType: params.mimeType,
        dataUrl: params.dataUrl,
        altText: params.altText,
        articleId: params.articleId,
        categorySlug: params.categorySlug,
        fileSize: params.fileSize,
        uploadedByUid: params.uploadedByUid,
      })
      .returning();

    const createdImg = inserted[0];
    if (createdImg) {
      void mirrorUploadedImageToSupabase(createdImg);
    }
    return createdImg;
  } catch (error) {
    console.error('Database query failed in saveUploadedImage:', error);
    throw new Error('Failed to store uploaded image in database.', {
      cause: error,
    });
  }
}

export async function getAllUploadedImages() {
  try {
    const rows = await db
      .select({
        id: articleImages.id,
        filename: articleImages.filename,
        mimeType: articleImages.mimeType,
        altText: articleImages.altText,
        articleId: articleImages.articleId,
        categorySlug: articleImages.categorySlug,
        fileSize: articleImages.fileSize,
        createdAt: articleImages.createdAt,
      })
      .from(articleImages)
      .orderBy(desc(articleImages.createdAt));

    return rows.map((r) => ({
      ...r,
      url: `/api/media/upload/${r.id}`,
    }));
  } catch (error) {
    console.error('Database query failed in getAllUploadedImages:', error);
    throw new Error('Failed to load uploaded media library.', { cause: error });
  }
}

export async function getUploadedImageById(id: number) {
  try {
    const rows = await db
      .select()
      .from(articleImages)
      .where(eq(articleImages.id, id));
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getUploadedImageById:', error);
    throw new Error('Failed to retrieve uploaded image.', { cause: error });
  }
}

export async function updateUploadedImageAlt(id: number, altText: string) {
  try {
    const updated = await db
      .update(articleImages)
      .set({ altText })
      .where(eq(articleImages.id, id))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.error('Database query failed in updateUploadedImageAlt:', error);
    throw new Error('Failed to update image alt text.', { cause: error });
  }
}

export async function deleteUploadedImage(id: number) {
  try {
    const deleted = await db
      .delete(articleImages)
      .where(eq(articleImages.id, id))
      .returning();
    return deleted[0] || null;
  } catch (error) {
    console.error('Database query failed in deleteUploadedImage:', error);
    throw new Error('Failed to delete image.', { cause: error });
  }
}

export async function getAdminDashboardStats() {
  try {
    await processDueScheduledArticles();

    const allArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        categorySlug: articles.categorySlug,
        status: articles.status,
        viewsCount: articles.viewsCount,
        isFeatured: articles.isFeatured,
        isScheduled: articles.isScheduled,
        scheduledAt: articles.scheduledAt,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .orderBy(desc(articles.publishedAt));

    const allCats = await db.select().from(categories);
    const allSubs = await db.select().from(newsletterSubscribers);
    const allImgs = await db.select({ id: articleImages.id }).from(articleImages);

    const publishedCount = allArticles.filter(
      (a) => a.status === 'published'
    ).length;
    const scheduledList = allArticles
      .filter((a) => a.isScheduled || a.status === 'scheduled')
      .sort((a, b) => {
        const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return timeA - timeB;
      });
    const draftCount = allArticles.filter(
      (a) => a.status === 'draft' && !a.isScheduled
    ).length;
    const totalViews = allArticles.reduce(
      (sum, a) => sum + (a.viewsCount || 0),
      0
    );

    const categoryBreakdown = allCats.map((c) => ({
      name: c.name,
      slug: c.slug,
      accentColor: c.accentColor,
      count: allArticles.filter((a) => a.categorySlug === c.slug).length,
    }));

    const recentArticles = allArticles
      .filter((a) => a.status === 'published')
      .slice(0, 6);
    const recentlyUpdated = [...allArticles]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 6);

    const runtimeInfo = getSchedulerRuntimeInfo();
    const supabaseCfg = getSupabaseRestConfig();

    return {
      totalArticles: allArticles.length,
      publishedArticles: publishedCount,
      scheduledArticles: scheduledList.length,
      draftArticles: draftCount,
      totalCategories: allCats.length,
      totalSubscribers: allSubs.length,
      totalUploadedImages: allImgs.length,
      totalViews,
      categoryBreakdown,
      recentArticles,
      recentlyUpdated,
      upcomingScheduled: scheduledList,
      schedulerRuntime: runtimeInfo,
      supabaseConnected: Boolean(supabaseCfg),
      supabaseProjectUrl: supabaseCfg?.projectUrl || null,
    };
  } catch (error) {
    console.error('Database query failed in getAdminDashboardStats:', error);
    throw new Error('Failed to load dashboard overview metrics.', {
      cause: error,
    });
  }
}

export async function syncDatabaseToSupabase() {
  const [allCats, allArticles, allSubs, settings] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.displayOrder)),
    db.select().from(articles).orderBy(desc(articles.publishedAt)),
    db.select().from(newsletterSubscribers),
    getSiteSettingsMap(),
  ]);

  return await syncAllDataToSupabase({
    categories: allCats,
    articles: allArticles,
    subscribers: allSubs,
    settings,
  });
}
