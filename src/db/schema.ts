import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').default('Layitek Administrator'),
  role: text('role').default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description').notNull(),
  iconName: text('icon_name').notNull(),
  accentColor: text('accent_color').notNull(),
  displayOrder: integer('display_order').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface InArticleImageItem {
  url: string;
  alt: string;
  caption?: string;
}

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
  categorySlug: text('category_slug').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  featuredImage: text('featured_image').notNull(),
  featuredImageAlt: text('featured_image_alt').notNull(),
  inArticleImages: jsonb('in_article_images').$type<InArticleImageItem[]>().default([]),
  faqs: jsonb('faqs').$type<ArticleFaqItem[]>().default([]),
  seoTitle: text('seo_title').notNull(),
  seoDescription: text('seo_description').notNull(),
  status: text('status').default('published').notNull(), // 'published' | 'draft' | 'scheduled'
  isScheduled: boolean('is_scheduled').default(false).notNull(),
  scheduledAt: timestamp('scheduled_at'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPopular: boolean('is_popular').default(false).notNull(),
  viewsCount: integer('views_count').default(120).notNull(),
  readingTimeMinutes: integer('reading_time_minutes').default(6).notNull(),
  authorName: text('author_name').default('Layitek Editorial Desk').notNull(),
  authorRole: text('author_role').default('Technology & Business Advisory Team').notNull(),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const articleImages = pgTable('article_images', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  dataUrl: text('data_url').notNull(),
  altText: text('alt_text').notNull(),
  articleId: integer('article_id'),
  categorySlug: text('category_slug'),
  fileSize: integer('file_size').default(0).notNull(),
  uploadedByUid: text('uploaded_by_uid'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
}));
