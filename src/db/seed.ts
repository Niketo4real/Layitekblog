import { db } from './index.ts';
import { categories, articles, siteSettings } from './schema.ts';
import { SEED_CATEGORIES, DEFAULT_SITE_SETTINGS } from './seed-categories.ts';
import { COMPUTERS_ARTICLES, SeedArticleInput } from './seeds/computers.ts';
import { PHONES_ARTICLES } from './seeds/phones.ts';
import { GADGETS_ARTICLES } from './seeds/gadgets.ts';
import { TELECOM_ARTICLES } from './seeds/telecommunications.ts';
import { CAC_ARTICLES } from './seeds/cac-arena.ts';
import { BRANDING_ARTICLES } from './seeds/branding.ts';
import { count } from 'drizzle-orm';

export const ALL_SEED_ARTICLES: SeedArticleInput[] = [
  ...COMPUTERS_ARTICLES,
  ...PHONES_ARTICLES,
  ...GADGETS_ARTICLES,
  ...TELECOM_ARTICLES,
  ...CAC_ARTICLES,
  ...BRANDING_ARTICLES,
];

let isSeedingInProgress = false;
let hasVerifiedSeed = false;

export async function ensureDatabaseSeeded(): Promise<void> {
  if (hasVerifiedSeed || isSeedingInProgress) {
    return;
  }

  isSeedingInProgress = true;
  try {
    // 1. Seed Categories
    const existingCategories = await db.select().from(categories);
    const categorySlugToId = new Map<string, number>();

    for (const cat of existingCategories) {
      categorySlugToId.set(cat.slug, cat.id);
    }

    for (const seedCat of SEED_CATEGORIES) {
      if (!categorySlugToId.has(seedCat.slug)) {
        const inserted = await db
          .insert(categories)
          .values({
            name: seedCat.name,
            slug: seedCat.slug,
            shortDescription: seedCat.shortDescription,
            description: seedCat.description,
            iconName: seedCat.iconName,
            accentColor: seedCat.accentColor,
            displayOrder: seedCat.displayOrder,
          })
          .onConflictDoNothing()
          .returning();

        if (inserted[0]) {
          categorySlugToId.set(seedCat.slug, inserted[0].id);
        }
      }
    }

    // Refresh map if any were skipped on conflict
    if (categorySlugToId.size < SEED_CATEGORIES.length) {
      const refreshed = await db.select().from(categories);
      for (const cat of refreshed) {
        categorySlugToId.set(cat.slug, cat.id);
      }
    }

    // 2. Seed Site Settings
    const existingSettings = await db.select().from(siteSettings);
    const existingKeys = new Set(existingSettings.map((s) => s.key));

    for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
      if (!existingKeys.has(key)) {
        await db
          .insert(siteSettings)
          .values({
            key,
            value,
          })
          .onConflictDoNothing();
      }
    }

    // 3. Seed All 60 Articles if fewer than 60 exist
    const [{ value: articleCount }] = await db
      .select({ value: count() })
      .from(articles);

    if (Number(articleCount) < ALL_SEED_ARTICLES.length) {
      const existingArticles = await db
        .select({ slug: articles.slug })
        .from(articles);
      const existingSlugs = new Set(existingArticles.map((a) => a.slug));

      for (const item of ALL_SEED_ARTICLES) {
        if (!existingSlugs.has(item.slug)) {
          const catId = categorySlugToId.get(item.categorySlug);
          if (catId) {
            await db
              .insert(articles)
              .values({
                title: item.title,
                slug: item.slug,
                categoryId: catId,
                categorySlug: item.categorySlug,
                excerpt: item.excerpt,
                content: item.content,
                featuredImage: item.featuredImage,
                featuredImageAlt: item.featuredImageAlt,
                inArticleImages: item.inArticleImages,
                faqs: item.faqs,
                seoTitle: item.seoTitle,
                seoDescription: item.seoDescription,
                status: 'published',
                isFeatured: item.isFeatured,
                isPopular: item.isPopular,
                viewsCount: item.viewsCount,
                readingTimeMinutes: item.readingTimeMinutes,
                authorName: 'Layitek Editorial Desk',
                authorRole: 'Technology & Business Advisory Team',
                publishedAt: new Date(item.publishedAt),
              })
              .onConflictDoNothing();
          }
        }
      }
    }

    hasVerifiedSeed = true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw new Error('Failed to initialize initial blog content.', {
      cause: error,
    });
  } finally {
    isSeedingInProgress = false;
  }
}
