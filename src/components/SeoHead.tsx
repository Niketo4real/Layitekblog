import React, { useEffect } from 'react';
import { useBlog } from '../context/BlogContext';

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  categoryName?: string;
  faqs?: { question: string; answer: string }[];
  breadcrumbs?: { name: string; path: string }[];
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  publishedAt,
  updatedAt,
  authorName,
  categoryName,
  faqs,
  breadcrumbs,
}) => {
  const { settings } = useBlog();

  const resolvedTitle =
    title ||
    settings?.seo?.metaTitle ||
    'Layitek Blog – Practical Technology, CAC Business Guides & Branding';
  const resolvedDescription =
    description ||
    settings?.seo?.metaDescription ||
    'Your trusted Nigerian source by Layitek Limited for practical technology guides, gadget reviews, telecommunications updates, business registration information and branding insights.';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://layitek.com';
  const canonicalUrl = `${origin}${
    canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/')
  }`;
  const resolvedImage = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${origin}${ogImage}`
    : `${origin}${settings?.seo?.ogImage || '/api/media/illustration/layitek-og-cover.svg'}`;

  useEffect(() => {
    document.title = resolvedTitle;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', resolvedDescription);
    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      settings?.seo?.allowIndexing === false ? 'noindex, nofollow' : 'index, follow'
    );
    setMeta('meta[property="og:title"]', 'property', 'og:title', resolvedTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', resolvedDescription);
    setMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', resolvedImage);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', resolvedTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', resolvedDescription);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', resolvedImage);

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
  }, [resolvedTitle, resolvedDescription, canonicalUrl, resolvedImage, ogType, settings]);

  const jsonLdGraphs: Record<string, any>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings?.branding?.parentCompany || 'Layitek Limited',
      url: 'https://layitek.com',
      logo: `${origin}${settings?.branding?.logoUrl || '/api/media/layitek-logo.svg'}`,
      sameAs: Object.values(settings?.contact?.socialLinks || {}).filter(Boolean),
    },
  ];

  if (ogType === 'article') {
    jsonLdGraphs.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: resolvedTitle,
      description: resolvedDescription,
      image: [resolvedImage],
      datePublished: publishedAt,
      dateModified: updatedAt || publishedAt,
      articleSection: categoryName,
      author: {
        '@type': 'Organization',
        name: authorName || 'Layitek Editorial Desk',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Layitek Limited',
        logo: {
          '@type': 'ImageObject',
          url: `${origin}${settings?.branding?.logoUrl || '/api/media/layitek-logo.svg'}`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    jsonLdGraphs.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: `${origin}${b.path}`,
      })),
    });
  }

  if (faqs && faqs.length > 0) {
    jsonLdGraphs.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraphs) }}
    />
  );
};
