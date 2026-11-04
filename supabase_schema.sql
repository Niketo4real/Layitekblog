-- =============================================================================
-- LAYITEK BLOG (LAYITEK LIMITED) - COMPLETE SUPABASE POSTGRESQL SQL SCRIPT
-- Run this script in your Supabase Dashboard -> SQL Editor -> New Query
-- =============================================================================

-- 1. USERS TABLE (ADMINISTRATORS)
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT 'Layitek Administrator',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. CATEGORIES TABLE (THE 6 CORE BLOG CATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. ARTICLES TABLE (WITH SCHEDULING FIELDS: is_scheduled & scheduled_at)
CREATE TABLE IF NOT EXISTS public.articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  category_slug TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  featured_image_alt TEXT NOT NULL,
  in_article_images JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_scheduled BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER NOT NULL DEFAULT 120,
  reading_time_minutes INTEGER NOT NULL DEFAULT 6,
  author_name TEXT NOT NULL DEFAULT 'Layitek Editorial Desk',
  author_role TEXT NOT NULL DEFAULT 'Technology & Business Advisory Team',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ensure scheduling columns exist even if the articles table was created previously
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_articles_category_slug ON public.articles(category_slug);
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled ON public.articles(is_scheduled, scheduled_at) WHERE is_scheduled = TRUE;

-- 4. ARTICLE IMAGES TABLE (DEVICE IMAGE UPLOADS)
CREATE TABLE IF NOT EXISTS public.article_images (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  data_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  article_id INTEGER,
  category_slug TEXT,
  file_size INTEGER NOT NULL DEFAULT 0,
  uploaded_by_uid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. SITE SETTINGS TABLE (BRANDING, HERO, CONTACT, FOOTER, SEO)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 7. SEED THE 6 CORE LAYITEK BLOG CATEGORIES
-- =============================================================================
INSERT INTO public.categories (name, slug, short_description, description, icon_name, accent_color, display_order)
VALUES
  (
    'Computers',
    'computers',
    'Desktops, laptops, hardware upgrades, Windows maintenance & cybersecurity.',
    'Comprehensive guides on desktop and laptop computers, buying advice for Nigerian professionals and students, SSD and RAM upgrades, Windows operating system optimisation, power protection, data backup, and troubleshooting common hardware or software problems.',
    'Monitor',
    '#0B3C8C',
    1
  ),
  (
    'Phones & Accessories',
    'phones-accessories',
    'Smartphones, power banks, fast chargers, audio gear & mobile security.',
    'Practical insights on Android smartphones and iPhones, mobile phone buying guides, battery health preservation, choosing reliable power banks, original chargers and cables, Bluetooth audio accessories, mobile banking security, and maintenance advice.',
    'Smartphone',
    '#0369A1',
    2
  ),
  (
    'Gadgets',
    'gadgets',
    'Smartwatches, Bluetooth speakers, smart TVs, home electronics & reviews.',
    'In-depth reviews, comparisons, and buying guides for Bluetooth speakers, smartwatches, smart home devices, portable rechargeable electronics, Smart TVs, wearable technology, and productivity gadgets tailored to everyday Nigerian living and business.',
    'Cpu',
    '#0F766E',
    3
  ),
  (
    'Telecommunications',
    'telecommunications',
    'SIM registration, MTN/Airtel/Glo/9mobile networks, routers, MiFi & broadband.',
    'Authoritative updates and practical guides on SIM registration and replacement, NIN linkage, MTN, Airtel, Glo and 9mobile data plans, 4G/5G routers, MiFi devices, Smartboxes, wireless networking, internet speed optimisation, and NCC telecom regulations in Nigeria.',
    'Wifi',
    '#1D4ED8',
    4
  ),
  (
    'CAC Arena',
    'cac-arena',
    'Business Name, Limited Company & NGO registration, annual returns & compliance.',
    'Practical educational guides covering Corporate Affairs Commission (CAC) registration and compliance in Nigeria under CAMA 2020: Business Name registration, Limited Liability Companies, Incorporated Trustees (NGOs), annual returns filing, status reports, and post-incorporation changes.',
    'Briefcase',
    '#007A4D',
    5
  ),
  (
    'Branding & Printing',
    'branding-printing',
    'Corporate identity, logos, business cards, company profiles & print production.',
    'Expert advice on brand identity design, business naming, logo systems, executive business cards, flyers, brochures, company profiles, large-format printing, product packaging design, and maintaining consistent corporate branding across physical and digital touchpoints.',
    'Palette',
    '#B45309',
    6
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  accent_color = EXCLUDED.accent_color,
  display_order = EXCLUDED.display_order;

-- =============================================================================
-- 8. AUTOMATED SCHEDULED ARTICLE PUBLISHER (FUNCTION + PG_CRON)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.publish_due_scheduled_articles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  published_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE public.articles
    SET
      status = 'published',
      is_scheduled = FALSE,
      published_at = COALESCE(scheduled_at, NOW()),
      updated_at = NOW()
    WHERE
      (is_scheduled = TRUE OR status = 'scheduled')
      AND scheduled_at IS NOT NULL
      AND scheduled_at <= NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO published_count FROM updated;

  RETURN published_count;
END;
$$;

-- Optional: Automatically enable pg_cron every minute if the pg_cron extension is active
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'layitek-publish-scheduled-articles',
      '* * * * *',
      'SELECT public.publish_due_scheduled_articles();'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not enabled yet; skipping cron.schedule setup.';
END;
$$;

-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- =============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of categories" ON public.categories;
CREATE POLICY "Allow public read of categories"
  ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read of published articles" ON public.articles;
CREATE POLICY "Allow public read of published articles"
  ON public.articles FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Allow public read of site settings" ON public.site_settings;
CREATE POLICY "Allow public read of site settings"
  ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read of article images" ON public.article_images;
CREATE POLICY "Allow public read of article images"
  ON public.article_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public newsletter subscription insert" ON public.newsletter_subscribers;
CREATE POLICY "Allow public newsletter subscription insert"
  ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
