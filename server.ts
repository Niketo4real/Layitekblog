import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import { ensureDatabaseSeeded } from './src/db/seed.ts';
import {
  getAllCategories,
  queryArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticleById,
  scheduleArticleById,
  cancelArticleScheduleById,
  processDueScheduledArticles,
  getSchedulerRuntimeInfo,
  getSiteSettingsMap,
  updateSiteSettingsMap,
  addNewsletterSubscriber,
  getAllSubscribers,
  saveUploadedImage,
  getAllUploadedImages,
  getUploadedImageById,
  updateUploadedImageAlt,
  deleteUploadedImage,
  getAdminDashboardStats,
  syncDatabaseToSupabase,
} from './src/db/queries.ts';
import {
  generateLayitekLogoSvg,
  generateLayitekFaviconSvg,
  generateArticleIllustrationSvg,
} from './src/lib/svg-illustrations.ts';
import {
  authenticateAdminWithEmailPassword,
  updateAdminPassword,
} from './src/db/users.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support base64 image uploads from laptops and mobile phones up to 12MB
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ extended: true, limit: '12mb' }));

  // ---------------------------------------------------------------------------
  // 1. Dynamic Media & Brand Assets (Logo, Favicon, Illustrations, Device Uploads)
  // ---------------------------------------------------------------------------
  app.get('/api/media/layitek-logo.svg', (_req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateLayitekLogoSvg());
  });

  app.get('/api/media/favicon.svg', (_req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateLayitekFaviconSvg());
  });

  app.get('/api/media/illustration/:slug', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateArticleIllustrationSvg(req.params.slug));
  });

  app.get('/api/media/upload/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send('Invalid image ID');
      }
      const img = await getUploadedImageById(id);
      if (!img) {
        return res.status(404).send('Image not found');
      }

      const matches = img.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);
      }

      return res.redirect(img.dataUrl);
    } catch (error) {
      console.error('Failed to serve uploaded image:', error);
      return res.status(500).send('Failed to load image');
    }
  });

  // ---------------------------------------------------------------------------
  // 2. SEO Routes: Dynamic XML Sitemap & Robots.txt
  // ---------------------------------------------------------------------------
  app.get('/robots.txt', (req, res) => {
    const baseUrl =
      process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')
        ? process.env.APP_URL.replace(/\/$/, '')
        : `${req.protocol}://${req.get('host')}`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(
      `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      await ensureDatabaseSeeded();
      const baseUrl =
        process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')
          ? process.env.APP_URL.replace(/\/$/, '')
          : `${req.protocol}://${req.get('host')}`;

      const cats = await getAllCategories();
      const { items: pubArticles } = await queryArticles({
        status: 'published',
        limit: 500,
      });

      const urls: string[] = [
        `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      ];

      for (const cat of cats) {
        urls.push(
          `  <url><loc>${baseUrl}/${cat.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
        );
      }

      for (const art of pubArticles) {
        const lastMod = new Date(art.updatedAt || art.publishedAt)
          .toISOString()
          .split('T')[0];
        urls.push(
          `  <url><loc>${baseUrl}/${art.categorySlug}/${art.slug}</loc><lastmod>${lastMod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
        );
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
        '\n'
      )}\n</urlset>`;

      res.setHeader('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Public Blog API Endpoints
  // ---------------------------------------------------------------------------
  app.get('/api/bootstrap', async (_req, res) => {
    try {
      await ensureDatabaseSeeded();
      await processDueScheduledArticles();
      const [settings, categories, featuredResult, latestResult, popularResult] =
        await Promise.all([
          getSiteSettingsMap(),
          getAllCategories(),
          queryArticles({ status: 'published', featuredOnly: true, limit: 6 }),
          queryArticles({ status: 'published', sortBy: 'latest', limit: 12 }),
          queryArticles({ status: 'published', sortBy: 'popular', limit: 6 }),
        ]);

      res.json({
        settings,
        categories,
        featuredArticles: featuredResult.items,
        latestArticles: latestResult.items,
        popularArticles: popularResult.items,
        totalPublished: latestResult.total,
      });
    } catch (error: any) {
      console.error('Failed to bootstrap public blog data:', error);
      res.status(500).json({
        error: error.message || 'Failed to load blog data',
      });
    }
  });

  app.get('/api/articles', async (req, res) => {
    try {
      await ensureDatabaseSeeded();
      const categorySlug = (req.query.category as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const sortBy = (req.query.sort as any) || 'latest';
      const limit = req.query.limit ? Number(req.query.limit) : 12;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const featuredOnly = req.query.featured === 'true';
      const popularOnly = req.query.popular === 'true';

      const result = await queryArticles({
        status: 'published',
        categorySlug,
        search,
        sortBy,
        limit,
        offset,
        featuredOnly,
        popularOnly,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error in GET /api/articles:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch articles' });
    }
  });

  app.get('/api/articles/by-slug/:slug', async (req, res) => {
    try {
      await ensureDatabaseSeeded();
      const article = await getArticleBySlug(req.params.slug, false);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json(article);
    } catch (error: any) {
      console.error('Error in GET /api/articles/by-slug/:slug:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch article' });
    }
  });

  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      await ensureDatabaseSeeded();
      const { email } = req.body || {};
      if (
        !email ||
        typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res
          .status(400)
          .json({ error: 'Please enter a valid email address.' });
      }

      const subscriber = await addNewsletterSubscriber(email);
      res.json({
        message:
          'Thank you for subscribing to the Layitek Blog newsletter! You will receive our latest practical technology and business guides.',
        subscriber: {
          email: subscriber.email,
          createdAt: subscriber.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({
        error: error.message || 'Unable to complete subscription right now.',
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Protected Administrator API Routes
  // ---------------------------------------------------------------------------
  app.post('/api/admin/auth/login', async (req, res) => {
    try {
      await ensureDatabaseSeeded();
      const { email, password } = req.body || {};
      const session = await authenticateAdminWithEmailPassword(
        email || '',
        password || ''
      );
      res.json(session);
    } catch (error: any) {
      res.status(401).json({
        error: error.message || 'Invalid administrator email or password.',
      });
    }
  });

  app.post(
    '/api/admin/auth/password',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const { newPassword } = req.body || {};
        await updateAdminPassword(newPassword || '');
        res.json({
          message: 'Administrator password updated successfully.',
        });
      } catch (error: any) {
        res.status(400).json({
          error: error.message || 'Failed to update administrator password.',
        });
      }
    }
  );

  app.get('/api/admin/overview', requireAuth, async (req: AuthRequest, res) => {
    try {
      await ensureDatabaseSeeded();
      const [stats, categories, subscribers, settings] = await Promise.all([
        getAdminDashboardStats(),
        getAllCategories(),
        getAllSubscribers(),
        getSiteSettingsMap(),
      ]);

      res.json({
        adminUser: req.dbUser,
        stats,
        categories,
        subscribers,
        settings,
      });
    } catch (error: any) {
      console.error('Admin overview failed:', error);
      res.status(500).json({ error: error.message || 'Failed to load admin overview' });
    }
  });

  // Manual trigger & status check for Scheduled Article Publisher
  app.post('/api/admin/scheduler/run', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const result = await processDueScheduledArticles();
      res.json({
        ...result,
        runtime: getSchedulerRuntimeInfo(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to execute scheduled articles job',
      });
    }
  });

  // Synchronize all Categories, 60+ Articles, Subscribers, and Settings to Supabase
  app.post('/api/admin/supabase/sync', requireAuth, async (_req: AuthRequest, res) => {
    try {
      await ensureDatabaseSeeded();
      const result = await syncDatabaseToSupabase();
      res.json({
        message: `Successfully synchronized ${result.syncedCategories} categories, ${result.syncedArticles} articles, and ${result.syncedSubscribers} subscribers to Supabase (${result.projectUrl}).`,
        ...result,
      });
    } catch (error: any) {
      console.error('Supabase sync error:', error);
      res.status(400).json({
        error:
          error.message ||
          'Failed to synchronize data to Supabase. Ensure the SQL schema script has been executed in your Supabase SQL Editor.',
      });
    }
  });

  app.post(
    '/api/admin/articles/:id/schedule',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        const { scheduledAt } = req.body || {};
        if (!scheduledAt) {
          return res.status(400).json({
            error: 'Please select a future date and time for scheduled publication.',
          });
        }
        const scheduled = await scheduleArticleById(id, scheduledAt);
        if (!scheduled) {
          return res.status(404).json({ error: 'Article not found' });
        }
        res.json(scheduled);
      } catch (error: any) {
        res.status(400).json({
          error: error.message || 'Failed to schedule article.',
        });
      }
    }
  );

  app.post(
    '/api/admin/articles/:id/unschedule',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        const targetStatus =
          req.body?.targetStatus === 'published' ? 'published' : 'draft';
        const updated = await cancelArticleScheduleById(id, targetStatus);
        if (!updated) {
          return res.status(404).json({ error: 'Article not found' });
        }
        res.json(updated);
      } catch (error: any) {
        res.status(400).json({
          error: error.message || 'Failed to unschedule article.',
        });
      }
    }
  );

  app.get('/api/admin/articles', requireAuth, async (req: AuthRequest, res) => {
    try {
      await ensureDatabaseSeeded();
      const categorySlug = (req.query.category as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || 'all';
      const sortBy = (req.query.sort as any) || 'latest';

      const result = await queryArticles({
        categorySlug,
        search,
        status,
        sortBy,
        limit: 200,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Admin articles list failed:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch admin articles' });
    }
  });

  app.get('/api/admin/articles/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const article = await getArticleById(id);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch article' });
    }
  });

  app.post('/api/admin/articles', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, slug, categorySlug, excerpt, content } = req.body || {};
      if (!title || !slug || !categorySlug || !excerpt || !content) {
        return res.status(400).json({
          error: 'Title, URL slug, category, excerpt, and article content are required.',
        });
      }

      const created = await createArticle(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create article' });
    }
  });

  app.put('/api/admin/articles/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await updateArticle(id, req.body || {});
      if (!updated) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update article' });
    }
  });

  app.delete('/api/admin/articles/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await deleteArticleById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json({ message: 'Article deleted successfully', id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete article' });
    }
  });

  app.get('/api/admin/images', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const images = await getAllUploadedImages();
      res.json({ items: images });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load images' });
    }
  });

  app.post('/api/admin/images', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { filename, mimeType, dataUrl, altText, articleId, categorySlug, fileSize } =
        req.body || {};

      if (!filename || !dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ error: 'Valid image file is required.' });
      }

      const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (mimeType && !allowedMime.includes(mimeType.toLowerCase())) {
        return res.status(400).json({
          error: 'Unsupported image format. Please upload JPG, PNG, WebP, or SVG.',
        });
      }

      const saved = await saveUploadedImage({
        filename,
        mimeType: mimeType || 'image/jpeg',
        dataUrl,
        altText: altText || filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        articleId: articleId ? Number(articleId) : undefined,
        categorySlug,
        fileSize: Number(fileSize) || dataUrl.length,
        uploadedByUid: req.user?.uid,
      });

      res.status(201).json({
        ...saved,
        url: `/api/media/upload/${saved.id}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
  });

  app.patch('/api/admin/images/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { altText } = req.body || {};
      const updated = await updateUploadedImageAlt(id, altText || '');
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update image ALT text' });
    }
  });

  app.delete('/api/admin/images/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      await deleteUploadedImage(id);
      res.json({ message: 'Image removed', id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete image' });
    }
  });

  app.put('/api/admin/settings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await updateSiteSettingsMap(req.body || {});
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save website settings' });
    }
  });

  // ---------------------------------------------------------------------------
  // 5. Vite Dev Middleware / Production SPA Fallback
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Layitek Blog server running on http://0.0.0.0:${PORT}`);

    // Background cron job to check and publish scheduled articles every 30 seconds
    setInterval(async () => {
      try {
        const result = await processDueScheduledArticles();
        if (result.publishedCount > 0) {
          console.log(
            `[Scheduler] Auto-published ${result.publishedCount} scheduled article(s).`
          );
        }
      } catch (err) {
        console.error('[Scheduler] Background check failed:', err);
      }
    }, 30_000);
  });
}

startServer();
