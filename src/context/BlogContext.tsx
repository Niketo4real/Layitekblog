import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseSignOut } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { ArticleSummary, CategoryItem, SiteSettingsMap } from '../types';

export interface AdminIdentity {
  uid: string;
  email: string | null;
}

interface BlogContextValue {
  settings: SiteSettingsMap | null;
  categories: CategoryItem[];
  featuredArticles: ArticleSummary[];
  latestArticles: ArticleSummary[];
  popularArticles: ArticleSummary[];
  totalPublished: number;
  loading: boolean;
  error: string | null;
  refreshPublicData: () => Promise<void>;
  // Auth state (token kept strictly in memory per security guidelines)
  currentUser: AdminIdentity | null;
  authLoading: boolean;
  getAuthToken: () => Promise<string | null>;
  signOutAdmin: () => Promise<void>;
}

const BlogContext = createContext<BlogContextValue | undefined>(undefined);

const FALLBACK_SETTINGS: SiteSettingsMap = {
  branding: {
    siteName: 'Layitek Blog',
    parentCompany: 'Layitek Limited',
    domain: 'layitek.com',
    logoUrl: '/assets/aistudio/LAYITEK_LOGO_FOR_BLOG2_197cbf30.png',
    faviconUrl: '/api/media/favicon.svg',
    primaryColor: '#0B3C8C',
    secondaryColor: '#007A4D',
    accentColor: '#D97706',
  },
  homepage: {
    heroHeadline: 'Practical Knowledge. Smarter Technology. Better Business.',
    heroDescription:
      'Your trusted source for practical technology guides, gadget reviews, telecommunications updates, business registration information and professional branding insights.',
    heroSearchPlaceholder: 'Search articles, guides and tutorials...',
    heroCtaText: 'Explore Articles',
    introTitle: 'Technology & Business Intelligence for Modern Nigeria',
    introDescription:
      'Published by Layitek Limited, our editorial desk translates complex hardware specifications, telecommunications policies, Corporate Affairs Commission (CAC) procedures, and corporate print standards into actionable guides.',
    promoTitle: 'Partner with Layitek Limited for Technology, CAC & Branding Solutions',
    promoDescription:
      'From enterprise IT procurement and networking hardware to seamless CAC business registration and high-impact corporate printing, Layitek Limited delivers dependable execution across Nigeria.',
    promoButtonText: 'Contact Layitek Limited',
    promoButtonUrl: 'https://layitek.com/contact',
  },
  contact: {
    companyEmail: 'info@layitek.com',
    phoneNumber: '+234 803 000 0000',
    whatsappNumber: '+234 803 000 0000',
    officeAddress: 'Lagos, Nigeria',
    aboutUrl: 'https://layitek.com/about',
    contactUrl: 'https://layitek.com/contact',
    socialLinks: {
      facebook: 'https://facebook.com/layitek',
      twitter: 'https://x.com/layitek',
      linkedin: 'https://linkedin.com/company/layitek',
      instagram: 'https://instagram.com/layitek',
      youtube: 'https://youtube.com/@layitek',
    },
  },
  footer: {
    footerDescription:
      'Layitek Blog is the official knowledge and advisory publication of Layitek Limited, a Nigerian technology and business services company.',
    copyrightText: `© ${new Date().getFullYear()} Layitek Limited. All Rights Reserved.`,
    quickLinks: [],
  },
  seo: {
    metaTitle: 'Layitek Blog – Practical Technology, CAC Business Guides & Branding in Nigeria',
    metaDescription:
      'Your trusted source by Layitek Limited for practical technology guides, gadget reviews, telecom updates, CAC registration information, and professional branding insights.',
    ogImage: '/api/media/illustration/layitek-og-cover.svg',
    allowIndexing: true,
  },
};

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettingsMap>(FALLBACK_SETTINGS);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleSummary[]>([]);
  const [latestArticles, setLatestArticles] = useState<ArticleSummary[]>([]);
  const [popularArticles, setPopularArticles] = useState<ArticleSummary[]>([]);
  const [totalPublished, setTotalPublished] = useState<number>(60);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [firebaseUser, setFirebaseUser] = useState<AdminIdentity | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<AdminIdentity | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const refreshPublicData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/bootstrap');
      if (!res.ok) {
        throw new Error('Failed to load blog data from server');
      }
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        if (data.settings.branding?.primaryColor) {
          document.documentElement.style.setProperty(
            '--brand-primary',
            data.settings.branding.primaryColor
          );
        }
        if (data.settings.branding?.faviconUrl) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
          if (link) {
            link.href = data.settings.branding.faviconUrl;
          }
        }
      }
      if (data.categories) setCategories(data.categories);
      if (data.featuredArticles) setFeaturedArticles(data.featuredArticles);
      if (data.latestArticles) setLatestArticles(data.latestArticles);
      if (data.popularArticles) setPopularArticles(data.popularArticles);
      if (typeof data.totalPublished === 'number') setTotalPublished(data.totalPublished);
    } catch (err: any) {
      console.error('Error loading bootstrap data:', err);
      setError(err.message || 'Unable to connect to blog service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPublicData();
  }, [refreshPublicData]);

  useEffect(() => {
    const unsubFirebase = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser({ uid: user.uid, email: user.email });
      } else {
        setFirebaseUser(null);
      }
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSupabaseUser({
          uid: data.session.user.id,
          email: data.session.user.email ?? null,
        });
      }
    });

    const { data: sbListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser({
          uid: session.user.id,
          email: session.user.email ?? null,
        });
      } else {
        setSupabaseUser(null);
      }
    });

    return () => {
      unsubFirebase();
      sbListener.subscription.unsubscribe();
    };
  }, []);

  const currentUser = firebaseUser || supabaseUser;

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch (err) {
        console.error('Failed to retrieve Firebase ID token:', err);
      }
    }
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        return data.session.access_token;
      }
    } catch (err) {
      console.error('Failed to retrieve Supabase session token:', err);
    }
    return null;
  }, []);

  const signOutAdmin = useCallback(async () => {
    await Promise.allSettled([firebaseSignOut(auth), supabase.auth.signOut()]);
    setFirebaseUser(null);
    setSupabaseUser(null);
  }, []);

  return (
    <BlogContext.Provider
      value={{
        settings,
        categories,
        featuredArticles,
        latestArticles,
        popularArticles,
        totalPublished,
        loading,
        error,
        refreshPublicData,
        currentUser,
        authLoading,
        getAuthToken,
        signOutAdmin,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return ctx;
}
