export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  iconName: string;
  accentColor: string;
  displayOrder: number;
  articleCount?: number;
}

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface InArticleImageItem {
  url: string;
  alt: string;
  caption?: string;
}

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  categorySlug: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
  isFeatured: boolean;
  isPopular: boolean;
  isScheduled: boolean;
  scheduledAt?: string | null;
  viewsCount: number;
  readingTimeMinutes: number;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
  inArticleImages: InArticleImageItem[];
  faqs: ArticleFaqItem[];
  relatedArticles: ArticleSummary[];
}

export interface UploadedImageItem {
  id: number;
  filename: string;
  mimeType: string;
  url: string;
  altText: string;
  articleId?: number | null;
  categorySlug?: string | null;
  fileSize: number;
  createdAt: string;
}

export interface SiteSettingsMap {
  branding: {
    siteName: string;
    parentCompany: string;
    domain: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  homepage: {
    heroHeadline: string;
    heroDescription: string;
    heroSearchPlaceholder: string;
    heroCtaText: string;
    introTitle: string;
    introDescription: string;
    promoTitle: string;
    promoDescription: string;
    promoButtonText: string;
    promoButtonUrl: string;
  };
  contact: {
    companyEmail: string;
    phoneNumber: string;
    whatsappNumber: string;
    officeAddress: string;
    aboutUrl: string;
    contactUrl: string;
    socialLinks: {
      facebook: string;
      twitter: string;
      linkedin: string;
      instagram: string;
      youtube: string;
    };
  };
  footer: {
    footerDescription: string;
    copyrightText: string;
    quickLinks: { label: string; url: string; external?: boolean }[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    allowIndexing: boolean;
  };
}
