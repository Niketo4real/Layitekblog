import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Settings,
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Upload,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Table,
  AlignLeft,
  AlignCenter,
  Undo,
  Redo,
  Lock,
  Mail,
  Calendar,
  Clock,
  Play,
  XCircle,
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from '../lib/firebase';
import { supabase } from '../lib/supabase';
import {
  ArticleSummary,
  ArticleDetail,
  ArticleFaqItem,
  UploadedImageItem,
  SiteSettingsMap,
} from '../types';
import { formatCategoryName, formatEditorialDate } from '../components/ArticleCard';
import { ResilientImage } from '../components/ResilientImage';
import { SeoHead } from '../components/SeoHead';

function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toLocalDatetimeInputValue(dateInput?: string | Date | null): string {
  const d = dateInput ? new Date(dateInput) : new Date(Date.now() + 3600 * 1000);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date(Date.now() + 3600 * 1000);
    const offset = fallback.getTimezoneOffset() * 60000;
    return new Date(fallback.getTime() - offset).toISOString().slice(0, 16);
  }
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

function getFuturePresetLocalInput(preset: '1h' | 'tomorrow9am' | 'nextMonday8am' | 'nextWeek'): string {
  const now = new Date();
  const target = new Date(now.getTime());
  if (preset === '1h') {
    target.setHours(target.getHours() + 1);
    target.setMinutes(0, 0, 0);
  } else if (preset === 'tomorrow9am') {
    target.setDate(target.getDate() + 1);
    target.setHours(9, 0, 0, 0);
  } else if (preset === 'nextMonday8am') {
    const day = target.getDay();
    const daysUntilMonday = ((8 - day) % 7) || 7;
    target.setDate(target.getDate() + daysUntilMonday);
    target.setHours(8, 0, 0, 0);
  } else if (preset === 'nextWeek') {
    target.setDate(target.getDate() + 7);
    target.setHours(9, 0, 0, 0);
  }
  return toLocalDatetimeInputValue(target);
}

function formatScheduleCountdown(scheduledAt?: string | null): string {
  if (!scheduledAt) return 'Not scheduled';
  const targetMs = new Date(scheduledAt).getTime();
  const diffMs = targetMs - Date.now();
  if (diffMs <= 0) return 'Due now (ready to publish)';
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;
  if (days > 0) return `In ${days}d ${hours}h`;
  if (hours > 0) return `In ${hours}h ${mins}m`;
  return `In ${mins}m`;
}

async function readFileAsOptimizedDataUrl(
  file: File,
  maxWidth = 1400
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected file'));
    reader.onload = () => {
      const result = reader.result as string;
      if (file.type === 'image/svg+xml' || file.size < 350 * 1024) {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        if (img.width <= maxWidth) {
          resolve(result);
          return;
        }
        const scale = maxWidth / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const outputMime =
          file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputMime, 0.86));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export const AdminPage: React.FC = () => {
  const {
    currentUser,
    authLoading,
    getAuthToken,
    signOutAdmin,
    categories,
    settings: publicSettings,
    refreshPublicData,
  } = useBlog();

  // Authentication Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Admin Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'articles'
    | 'schedule'
    | 'editor'
    | 'media'
    | 'settings'
    | 'subscribers'
  >('overview');

  // Admin Data State
  const [stats, setStats] = useState<any>(null);
  const [adminArticles, setAdminArticles] = useState<ArticleSummary[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [editableSettings, setEditableSettings] = useState<SiteSettingsMap | null>(
    null
  );
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Articles Filter State
  const [articleSearch, setArticleSearch] = useState('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');
  const [articleStatusFilter, setArticleStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Article Editor State
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorSlug, setEditorSlug] = useState('');
  const [editorCategorySlug, setEditorCategorySlug] = useState('computers');
  const [editorExcerpt, setEditorExcerpt] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorFeaturedImage, setEditorFeaturedImage] = useState('');
  const [editorFeaturedImageAlt, setEditorFeaturedImageAlt] = useState('');
  const [editorSeoTitle, setEditorSeoTitle] = useState('');
  const [editorSeoDescription, setEditorSeoDescription] = useState('');
  const [editorStatus, setEditorStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [editorIsScheduled, setEditorIsScheduled] = useState(false);
  const [editorScheduledAt, setEditorScheduledAt] = useState(() =>
    getFuturePresetLocalInput('tomorrow9am')
  );
  const [editorIsFeatured, setEditorIsFeatured] = useState(false);
  const [editorIsPopular, setEditorIsPopular] = useState(false);
  const [editorPublishedAt, setEditorPublishedAt] = useState('');
  const [editorFaqs, setEditorFaqs] = useState<ArticleFaqItem[]>([]);
  const [editorPreviewMode, setEditorPreviewMode] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);

  // Quick Scheduling Queue State
  const [quickScheduleArticleId, setQuickScheduleArticleId] = useState<string>('');
  const [quickScheduleDateTime, setQuickScheduleDateTime] = useState<string>(() =>
    getFuturePresetLocalInput('tomorrow9am')
  );
  const [rescheduleMap, setRescheduleMap] = useState<Record<number, string>>({});
  const [runningSchedulerJob, setRunningSchedulerJob] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);

  // Undo / Redo Stack for Editor
  const [contentHistory, setContentHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Device Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadAltInput, setUploadAltInput] = useState('');
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    'none' | 'featured' | 'inline' | 'logo' | 'favicon'
  >('none');

  const showNotice = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication session expired. Please sign in again.');
      }
      const headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${token}`);
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      return data;
    },
    [getAuthToken]
  );

  const loadAdminDashboard = useCallback(async () => {
    if (!currentUser) return;
    setLoadingAdmin(true);
    try {
      const [overviewData, articlesData, imagesData] = await Promise.all([
        authFetch('/api/admin/overview'),
        authFetch('/api/admin/articles?status=all'),
        authFetch('/api/admin/images'),
      ]);

      setStats(overviewData.stats);
      setSubscribers(overviewData.subscribers || []);
      setEditableSettings(overviewData.settings || publicSettings);
      setAdminArticles(articlesData.items || []);
      setUploadedImages(imagesData.items || []);
    } catch (err: any) {
      console.error('Admin load error:', err);
      showNotice('error', err.message || 'Failed to load dashboard data.');
    } finally {
      setLoadingAdmin(false);
    }
  }, [currentUser, authFetch, publicSettings, showNotice]);

  useEffect(() => {
    if (currentUser) {
      loadAdminDashboard();
    }
  }, [currentUser, loadAdminDashboard]);

  // Sign-In Handlers
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setResetMessage(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setAuthError(
        err.message || 'Google Sign-In was cancelled or could not complete.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetMessage(null);
    const email = loginEmail.trim();
    if (!email || !loginPassword) {
      setAuthError('Please enter both your administrator email and password.');
      return;
    }
    setSigningIn(true);
    try {
      // 1. Try Supabase Email/Password Sign-In
      const { data: sbSignIn, error: sbError } =
        await supabase.auth.signInWithPassword({
          email,
          password: loginPassword,
        });
      if (!sbError && sbSignIn?.session) {
        return;
      }

      // 2. Try Firebase Email/Password Sign-In
      try {
        await signInWithEmailAndPassword(auth, email, loginPassword);
        return;
      } catch {
        // Proceed to check if first-time admin registration
      }

      // 3. Try creating the administrator account in Supabase or Firebase if first time
      const { data: sbSignUp, error: sbSignUpErr } =
        await supabase.auth.signUp({
          email,
          password: loginPassword,
          options: {
            data: { full_name: 'Layitek Administrator' },
          },
        });
      if (!sbSignUpErr && sbSignUp?.session) {
        return;
      }

      await createUserWithEmailAndPassword(auth, email, loginPassword);
    } catch (err: any) {
      setAuthError(
        'Invalid email or password (passwords must be at least 6 characters), or sign in directly with your Google Account above.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    setAuthError(null);
    setResetMessage(null);
    const email = loginEmail.trim();
    if (!email) {
      setAuthError(
        'Enter your administrator email address above first to request a password reset link.'
      );
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        await sendPasswordResetEmail(auth, email);
      }
      setResetMessage(
        `Password reset instructions have been sent to ${email}.`
      );
    } catch (err: any) {
      setAuthError(err.message || 'Unable to send password reset email.');
    }
  };

  // Start Creating or Editing an Article
  const startNewArticle = () => {
    setEditingArticleId(null);
    setEditorTitle('');
    setEditorSlug('');
    setEditorCategorySlug('computers');
    setEditorExcerpt('');
    const initialBody =
      '<p>Write your introductory paragraph here explaining the practical problem and why it matters to Nigerian readers.</p>\n\n<h2 id="key-section-1">1. Main Section Heading</h2>\n<p>Provide clear, well-researched explanations and practical steps here.</p>\n\n<h2 id="conclusion">Conclusion</h2>\n<p>Summarize the key takeaway for your readers.</p>';
    setEditorContent(initialBody);
    setContentHistory([initialBody]);
    setHistoryIndex(0);
    setEditorFeaturedImage('/api/media/illustration/new-layitek-guide.svg');
    setEditorFeaturedImageAlt('');
    setEditorSeoTitle('');
    setEditorSeoDescription('');
    setEditorStatus('published');
    setEditorIsScheduled(false);
    setEditorScheduledAt(getFuturePresetLocalInput('tomorrow9am'));
    setEditorIsFeatured(false);
    setEditorIsPopular(false);
    setEditorPublishedAt(toLocalDatetimeInputValue(new Date()));
    setEditorFaqs([
      {
        question: 'What is the most important takeaway from this guide?',
        answer: 'Provide a concise, practical answer for readers.',
      },
    ]);
    setEditorPreviewMode(false);
    setActiveTab('editor');
  };

  const startEditArticle = async (id: number) => {
    try {
      const detail: ArticleDetail = await authFetch(`/api/admin/articles/${id}`);
      setEditingArticleId(detail.id);
      setEditorTitle(detail.title);
      setEditorSlug(detail.slug);
      setEditorCategorySlug(detail.categorySlug);
      setEditorExcerpt(detail.excerpt);
      setEditorContent(detail.content);
      setContentHistory([detail.content]);
      setHistoryIndex(0);
      setEditorFeaturedImage(detail.featuredImage);
      setEditorFeaturedImageAlt(detail.featuredImageAlt);
      setEditorSeoTitle(detail.seoTitle);
      setEditorSeoDescription(detail.seoDescription);
      const isSched =
        Boolean(detail.isScheduled) || detail.status === 'scheduled';
      setEditorStatus(isSched ? 'scheduled' : ((detail.status as any) || 'published'));
      setEditorIsScheduled(isSched);
      setEditorScheduledAt(
        detail.scheduledAt
          ? toLocalDatetimeInputValue(detail.scheduledAt)
          : getFuturePresetLocalInput('tomorrow9am')
      );
      setEditorIsFeatured(Boolean(detail.isFeatured));
      setEditorIsPopular(Boolean(detail.isPopular));
      setEditorPublishedAt(
        detail.publishedAt
          ? toLocalDatetimeInputValue(detail.publishedAt)
          : toLocalDatetimeInputValue(new Date())
      );
      setEditorFaqs(detail.faqs || []);
      setEditorPreviewMode(false);
      setActiveTab('editor');
    } catch (err: any) {
      showNotice('error', err.message || 'Could not load article for editing.');
    }
  };

  // Rich-Text Editor Toolbar Helpers
  const pushEditorContent = (nextContent: string) => {
    setEditorContent(nextContent);
    const sliced = contentHistory.slice(0, historyIndex + 1);
    setContentHistory([...sliced, nextContent]);
    setHistoryIndex(sliced.length);
  };

  const insertFormattingTag = (
    type:
      | 'h2'
      | 'h3'
      | 'bold'
      | 'italic'
      | 'ul'
      | 'ol'
      | 'link'
      | 'blockquote'
      | 'table'
      | 'align-left'
      | 'align-center'
  ) => {
    const textarea = contentTextareaRef.current;
    const start = textarea ? textarea.selectionStart : editorContent.length;
    const end = textarea ? textarea.selectionEnd : editorContent.length;
    const selected = editorContent.slice(start, end) || 'Section Text';

    let replacement = '';
    switch (type) {
      case 'h2': {
        const id = slugifyText(selected) || 'section-heading';
        replacement = `\n<h2 id="${id}">${selected}</h2>\n`;
        break;
      }
      case 'h3': {
        const id = slugifyText(selected) || 'sub-heading';
        replacement = `\n<h3 id="${id}">${selected}</h3>\n`;
        break;
      }
      case 'bold':
        replacement = `<strong>${selected}</strong>`;
        break;
      case 'italic':
        replacement = `<em>${selected}</em>`;
        break;
      case 'ul':
        replacement = `\n<ul>\n  <li>${selected}</li>\n  <li>Second practical point</li>\n</ul>\n`;
        break;
      case 'ol':
        replacement = `\n<ol>\n  <li>${selected}</li>\n  <li>Second step</li>\n</ol>\n`;
        break;
      case 'link':
        replacement = `<a href="/computers/how-to-maintain-your-laptop">${selected}</a>`;
        break;
      case 'blockquote':
        replacement = `\n<blockquote>${selected}</blockquote>\n`;
        break;
      case 'table':
        replacement = `\n<table>\n  <thead>\n    <tr><th>Specification</th><th>Recommendation</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>${selected}</td><td>Enterprise Standard</td></tr>\n  </tbody>\n</table>\n`;
        break;
      case 'align-left':
        replacement = `<div class="text-left">${selected}</div>`;
        break;
      case 'align-center':
        replacement = `<div class="text-center">${selected}</div>`;
        break;
    }

    const updated =
      editorContent.slice(0, start) + replacement + editorContent.slice(end);
    pushEditorContent(updated);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setEditorContent(contentHistory[nextIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < contentHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setEditorContent(contentHistory[nextIdx]);
    }
  };

  const handleSaveArticle = async (
    overrideStatus?: 'published' | 'draft' | 'scheduled'
  ) => {
    const finalStatus =
      overrideStatus || (editorIsScheduled ? 'scheduled' : editorStatus);
    const isScheduling = finalStatus === 'scheduled';
    const finalSlug = editorSlug.trim() || slugifyText(editorTitle);

    if (
      !editorTitle.trim() ||
      !finalSlug ||
      !editorExcerpt.trim() ||
      !editorContent.trim()
    ) {
      showNotice(
        'error',
        'Please complete the article title, excerpt, and body content before saving.'
      );
      return;
    }

    if (isScheduling) {
      if (!editorScheduledAt) {
        showNotice(
          'error',
          'Please select a future date and time for scheduled publication.'
        );
        return;
      }
      const scheduledDate = new Date(editorScheduledAt);
      if (
        Number.isNaN(scheduledDate.getTime()) ||
        scheduledDate.getTime() <= Date.now()
      ) {
        showNotice(
          'error',
          'Scheduled publication date and time must be set in the future.'
        );
        return;
      }
    }

    setSavingArticle(true);
    try {
      const scheduledIso = isScheduling
        ? new Date(editorScheduledAt).toISOString()
        : null;

      const payload = {
        title: editorTitle.trim(),
        slug: finalSlug,
        categorySlug: editorCategorySlug,
        excerpt: editorExcerpt.trim(),
        content: editorContent,
        featuredImage:
          editorFeaturedImage.trim() ||
          `/api/media/illustration/${finalSlug}.svg`,
        featuredImageAlt:
          editorFeaturedImageAlt.trim() || editorTitle.trim(),
        seoTitle:
          editorSeoTitle.trim() || `${editorTitle.trim()} | Layitek Blog`,
        seoDescription:
          editorSeoDescription.trim() || editorExcerpt.trim(),
        status: finalStatus,
        isScheduled: isScheduling,
        scheduledAt: scheduledIso,
        isFeatured: editorIsFeatured,
        isPopular: editorIsPopular,
        faqs: editorFaqs.filter(
          (f) => f.question.trim() && f.answer.trim()
        ),
        publishedAt: isScheduling && scheduledIso
          ? scheduledIso
          : editorPublishedAt
          ? new Date(editorPublishedAt).toISOString()
          : new Date().toISOString(),
      };

      if (editingArticleId) {
        await authFetch(`/api/admin/articles/${editingArticleId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showNotice(
          'success',
          isScheduling
            ? `Article scheduled for automatic publication on ${new Date(
                editorScheduledAt
              ).toLocaleString()}.`
            : 'Article updated and saved to database.'
        );
      } else {
        const created = await authFetch('/api/admin/articles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setEditingArticleId(created.id);
        showNotice(
          'success',
          isScheduling
            ? `New article created and scheduled for ${new Date(
                editorScheduledAt
              ).toLocaleString()}.`
            : 'New article created and saved to database.'
        );
      }

      setEditorStatus(finalStatus);
      setEditorIsScheduled(isScheduling);
      await Promise.all([loadAdminDashboard(), refreshPublicData()]);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save article.');
    } finally {
      setSavingArticle(false);
    }
  };

  const handleQuickScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(quickScheduleArticleId);
    if (!id || Number.isNaN(id)) {
      showNotice('error', 'Please select an article to schedule.');
      return;
    }
    if (!quickScheduleDateTime) {
      showNotice('error', 'Please choose a future publication date and time.');
      return;
    }
    const targetDate = new Date(quickScheduleDateTime);
    if (Number.isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
      showNotice(
        'error',
        'Scheduled date and time must be in the future.'
      );
      return;
    }

    try {
      await authFetch(`/api/admin/articles/${id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ scheduledAt: targetDate.toISOString() }),
      });
      showNotice(
        'success',
        `Article scheduled for automatic publication on ${targetDate.toLocaleString()}.`
      );
      setQuickScheduleArticleId('');
      await Promise.all([loadAdminDashboard(), refreshPublicData()]);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to schedule article.');
    }
  };

  const handleRescheduleArticle = async (id: number, nextDateTime: string) => {
    if (!nextDateTime) {
      showNotice('error', 'Please select a valid future date and time.');
      return;
    }
    const targetDate = new Date(nextDateTime);
    if (Number.isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
      showNotice('error', 'New schedule time must be in the future.');
      return;
    }

    try {
      await authFetch(`/api/admin/articles/${id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ scheduledAt: targetDate.toISOString() }),
      });
      showNotice(
        'success',
        `Updated schedule to ${targetDate.toLocaleString()}.`
      );
      await Promise.all([loadAdminDashboard(), refreshPublicData()]);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to reschedule article.');
    }
  };

  const handleUnscheduleArticle = async (
    id: number,
    targetStatus: 'draft' | 'published'
  ) => {
    try {
      await authFetch(`/api/admin/articles/${id}/unschedule`, {
        method: 'POST',
        body: JSON.stringify({ targetStatus }),
      });
      showNotice(
        'success',
        targetStatus === 'published'
          ? 'Scheduled article published immediately!'
          : 'Schedule cancelled and article reverted to draft.'
      );
      await Promise.all([loadAdminDashboard(), refreshPublicData()]);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update scheduled article.');
    }
  };

  const handleRunSchedulerNow = async () => {
    setRunningSchedulerJob(true);
    try {
      const result = await authFetch('/api/admin/scheduler/run', {
        method: 'POST',
      });
      if (result.publishedCount > 0) {
        showNotice(
          'success',
          `Scheduler job published ${result.publishedCount} due article(s) automatically!`
        );
      } else {
        showNotice(
          'success',
          'Scheduler job ran: all due articles are up to date.'
        );
      }
      await Promise.all([loadAdminDashboard(), refreshPublicData()]);
    } catch (err: any) {
      showNotice('error', err.message || 'Scheduler check failed.');
    } finally {
      setRunningSchedulerJob(false);
    }
  };

  const handleSyncWithSupabase = async () => {
    setSyncingSupabase(true);
    try {
      const result = await authFetch('/api/admin/supabase/sync', {
        method: 'POST',
      });
      showNotice(
        'success',
        result.message || 'All blog data synchronized to Supabase!'
      );
      await loadAdminDashboard();
    } catch (err: any) {
      showNotice(
        'error',
        err.message || 'Failed to sync with Supabase.'
      );
    } finally {
      setSyncingSupabase(false);
    }
  };

  const handleToggleQuickPublish = async (article: ArticleSummary) => {
    const nextStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      await authFetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: nextStatus,
          isScheduled: false,
          scheduledAt: null,
        }),
      });
      showNotice(
        'success',
        `Article "${article.title}" marked as ${nextStatus.toUpperCase()}.`
      );
      await Promise.all([loadAdminDashboard(), refreshPublicData()]);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update article status.');
    }
  };

  const handleConfirmDeleteArticle = async (id: number) => {
    try {
      await authFetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      showNotice('success', 'Article permanently deleted.');
      await Promise.all([loadAdminDashboard(), refreshPublicData()]);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete article.');
    }
  };

  // Direct Device Image Upload (Laptop, Desktop, Android, iPhone)
  const handleDeviceFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetUsage: 'library' | 'featured' | 'inline' | 'logo' | 'favicon'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadProgress(25);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file);
      setUploadProgress(65);

      const defaultAlt =
        uploadAltInput.trim() ||
        file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const uploaded: UploadedImageItem = await authFetch('/api/admin/images', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'image/jpeg',
          dataUrl,
          altText: defaultAlt,
          articleId: editingArticleId || undefined,
          categorySlug: editorCategorySlug,
          fileSize: file.size,
        }),
      });

      setUploadProgress(100);
      setUploadAltInput('');
      setUploadedImages((prev) => [uploaded, ...prev]);

      if (targetUsage === 'featured') {
        setEditorFeaturedImage(uploaded.url);
        if (!editorFeaturedImageAlt) {
          setEditorFeaturedImageAlt(uploaded.altText);
        }
        showNotice('success', 'Featured image uploaded from device and applied.');
      } else if (targetUsage === 'inline') {
        const figureHtml = `\n<figure class="my-6 rounded-lg border border-slate-200 bg-white p-3"><img src="${uploaded.url}" alt="${uploaded.altText}" class="w-full rounded object-cover" loading="lazy" referrerPolicy="no-referrer" /><figcaption class="mt-2 text-xs text-slate-500 italic text-center">${uploaded.altText}</figcaption></figure>\n`;
        pushEditorContent(editorContent + figureHtml);
        showNotice('success', 'Image uploaded and inserted into article body.');
      } else if (targetUsage === 'logo' && editableSettings) {
        setEditableSettings({
          ...editableSettings,
          branding: { ...editableSettings.branding, logoUrl: uploaded.url },
        });
        showNotice('success', 'New website logo uploaded. Click Save Website Settings to publish.');
      } else if (targetUsage === 'favicon' && editableSettings) {
        setEditableSettings({
          ...editableSettings,
          branding: { ...editableSettings.branding, faviconUrl: uploaded.url },
        });
        showNotice('success', 'New favicon uploaded. Click Save Website Settings to publish.');
      } else {
        showNotice('success', `Uploaded "${file.name}" to Media Library.`);
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Image upload failed.');
    } finally {
      setTimeout(() => {
        setUploadingImage(false);
        setUploadProgress(0);
      }, 400);
      e.target.value = '';
    }
  };

  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableSettings) return;
    try {
      await authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(editableSettings),
      });
      await refreshPublicData();
      showNotice(
        'success',
        'Website branding, homepage, contact, footer, and SEO settings saved and live!'
      );
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save website settings.');
    }
  };

  // Filtered Articles for CMS Table
  const filteredCmsArticles = adminArticles.filter((art) => {
    const matchesCat =
      articleCategoryFilter === 'all' ||
      art.categorySlug === articleCategoryFilter;
    const isArtScheduled = Boolean(art.isScheduled) || art.status === 'scheduled';
    const matchesStatus =
      articleStatusFilter === 'all' ||
      (articleStatusFilter === 'scheduled'
        ? isArtScheduled
        : art.status === articleStatusFilter);
    const matchesSearch =
      !articleSearch.trim() ||
      art.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      art.slug.toLowerCase().includes(articleSearch.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const scheduledArticlesQueue = adminArticles
    .filter((art) => Boolean(art.isScheduled) || art.status === 'scheduled')
    .sort((a, b) => {
      const tA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const tB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return tA - tB;
    });

  // ---------------------------------------------------------------------------
  // Render 1: Loading Auth Session
  // ---------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-300">
            Verifying Administrator Session...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render 2: Secure Administrator Login Screen (No hardcoded credentials/hints)
  // ---------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SeoHead title="Administrator Sign In | Layitek Blog" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src={
                  publicSettings?.branding?.logoUrl &&
                  publicSettings.branding.logoUrl !== '/api/media/layitek-logo.svg'
                    ? publicSettings.branding.logoUrl
                    : '/assets/aistudio/LAYITEK_LOGO_FOR_BLOG2_197cbf30.png'
                }
                alt="Layitek Limited"
                className="h-11 w-auto object-contain mb-4"
              />
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B3C8C]">
                <Lock className="w-3.5 h-3.5" />
                <span>Restricted Portal</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mt-1">
                Administrator Sign In
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Authenticate to manage Layitek Blog articles, media, and website settings.
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {resetMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetMessage}</span>
              </div>
            )}

            {/* Primary Google OAuth Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full py-3 px-4 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>
                {signingIn
                  ? 'Authenticating...'
                  : 'Sign In with Authorised Google Account'}
              </span>
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold uppercase text-slate-400">
                Or Email &amp; Password
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@layitek.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#0B3C8C]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-[11px] font-semibold text-[#0B3C8C] hover:underline cursor-pointer"
                  >
                    Reset Password
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#0B3C8C]"
                />
              </div>

              <button
                type="submit"
                disabled={signingIn}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign In with Email
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link
                to="/"
                className="text-xs font-semibold text-slate-500 hover:text-[#0B3C8C]"
              >
                ← Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render 3: Authenticated Administrator Dashboard
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <SeoHead title="Admin Dashboard | Layitek Blog" />

      {/* Top Admin Header */}
      <header className="bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="bg-white px-3 py-1.5 rounded-lg shrink-0">
              <img
                src={
                  publicSettings?.branding?.logoUrl &&
                  publicSettings.branding.logoUrl !== '/api/media/layitek-logo.svg'
                    ? publicSettings.branding.logoUrl
                    : '/assets/aistudio/LAYITEK_LOGO_FOR_BLOG2_197cbf30.png'
                }
                alt="Layitek Blog"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 hidden sm:inline">
              CMS &amp; Administration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startNewArticle}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#007A4D] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Article</span>
            </button>

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors whitespace-nowrap"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <span className="hidden md:inline text-xs text-slate-400 truncate max-w-[180px]">
              {currentUser.email}
            </span>

            <button
              type="button"
              onClick={signOutAdmin}
              title="Sign out"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#0B3C8C] text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-[#0B3C8C] text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Articles ({adminArticles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-[#0B3C8C] text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Scheduling Queue ({scheduledArticlesQueue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!editorTitle && !editingArticleId) {
                  startNewArticle();
                } else {
                  setActiveTab('editor');
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-[#0B3C8C] text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editingArticleId ? 'Edit Article' : 'Article Editor'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-[#0B3C8C] text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Media &amp; Uploads ({uploadedImages.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0B3C8C] text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Website Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subscribers')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'subscribers'
                  ? 'bg-[#0B3C8C] text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Subscribers ({subscribers.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {toast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{toast.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-slate-800 ml-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Dashboard Overview
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time Layitek Blog publishing metrics, category distribution, and recent updates.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start">
                <button
                  type="button"
                  disabled={syncingSupabase}
                  onClick={handleSyncWithSupabase}
                  className="px-4 py-2 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                >
                  {syncingSupabase
                    ? 'Syncing to Supabase...'
                    : 'Sync All Data to Supabase'}
                </button>
                <button
                  type="button"
                  onClick={loadAdminDashboard}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {loadingAdmin ? 'Refreshing...' : 'Refresh Statistics'}
                </button>
              </div>
            </div>

            {/* Summary Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs font-medium text-slate-500">
                  Total Articles
                </span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {stats?.totalArticles ?? adminArticles.length}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs font-medium text-slate-500">
                  Published
                </span>
                <p className="text-2xl font-extrabold text-[#007A4D] mt-1 tabular-nums">
                  {stats?.publishedArticles ??
                    adminArticles.filter((a) => a.status === 'published').length}
                </p>
              </div>

              <div
                onClick={() => setActiveTab('schedule')}
                className="bg-white border border-slate-200 hover:border-[#0B3C8C] rounded-xl p-5 cursor-pointer transition-colors"
              >
                <span className="text-xs font-medium text-slate-500 flex items-center justify-between">
                  <span>Scheduled</span>
                  <Clock className="w-3.5 h-3.5 text-[#0B3C8C]" />
                </span>
                <p className="text-2xl font-extrabold text-[#0B3C8C] mt-1 tabular-nums">
                  {stats?.scheduledArticles ?? scheduledArticlesQueue.length}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs font-medium text-slate-500">
                  Drafts
                </span>
                <p className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
                  {stats?.draftArticles ??
                    adminArticles.filter(
                      (a) => a.status === 'draft' && !a.isScheduled
                    ).length}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs font-medium text-slate-500">
                  Categories
                </span>
                <p className="text-2xl font-extrabold text-[#0B3C8C] mt-1 tabular-nums">
                  {stats?.totalCategories ?? 6}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs font-medium text-slate-500">
                  Subscribers
                </span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {stats?.totalSubscribers ?? subscribers.length}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs font-medium text-slate-500">
                  Total Views
                </span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {(stats?.totalViews ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Category Distribution Chart */}
            {stats?.categoryBreakdown && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-base font-bold text-slate-900 mb-4">
                  Articles by Category
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.categoryBreakdown.map((item: any) => (
                    <div
                      key={item.slug}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500">/{item.slug}</p>
                      </div>
                      <span className="text-lg font-extrabold text-[#0B3C8C] tabular-nums">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent & Recently Updated Articles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent Published Articles
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    className="text-xs font-semibold text-[#0B3C8C] hover:underline cursor-pointer"
                  >
                    Manage All
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {(stats?.recentArticles || adminArticles.slice(0, 6)).map(
                    (art: any) => (
                      <div
                        key={art.id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {art.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {formatCategoryName(art.categorySlug)} ·{' '}
                            {formatEditorialDate(art.publishedAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => startEditArticle(art.id)}
                          className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shrink-0 cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">
                    Recently Updated Articles
                  </h2>
                  <button
                    type="button"
                    onClick={startNewArticle}
                    className="text-xs font-semibold text-[#007A4D] hover:underline cursor-pointer"
                  >
                    + Create New
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {(stats?.recentlyUpdated || adminArticles.slice(0, 6)).map(
                    (art: any) => (
                      <div
                        key={art.id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {art.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Status: {art.status.toUpperCase()} · Views:{' '}
                            {art.viewsCount}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            to={`/${art.categorySlug}/${art.slug}`}
                            target="_blank"
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:text-slate-900"
                            title="View Article"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => startEditArticle(art.id)}
                            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTENT MANAGEMENT SYSTEM (ARTICLES LIST) */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Manage Articles ({filteredCmsArticles.length})
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Search, filter, edit, publish, unpublish, or delete articles across all 6 categories.
                </p>
              </div>
              <button
                type="button"
                onClick={startNewArticle}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-semibold cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Article</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Filter by title or slug..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#0B3C8C]"
                />
              </div>

              <select
                value={articleCategoryFilter}
                onChange={(e) => setArticleCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="all">All 6 Categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={articleStatusFilter}
                onChange={(e) => setArticleStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published Only</option>
                <option value="scheduled">Scheduled Only</option>
                <option value="draft">Drafts Only</option>
              </select>
            </div>

            {/* Articles Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-3.5 px-4">Article</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Publication / Schedule Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredCmsArticles.map((art) => {
                      const isScheduledItem =
                        Boolean(art.isScheduled) || art.status === 'scheduled';
                      return (
                        <tr key={art.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 max-w-md">
                            <p className="font-bold text-slate-900 line-clamp-1">
                              {art.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              /{art.categorySlug}/{art.slug}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                            {formatCategoryName(art.categorySlug)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`font-bold uppercase text-[11px] ${
                                art.status === 'published'
                                  ? 'text-emerald-700'
                                  : isScheduledItem
                                  ? 'text-[#0B3C8C]'
                                  : 'text-amber-700'
                              }`}
                            >
                              {isScheduledItem ? 'scheduled' : art.status}
                            </span>
                            {art.isFeatured && (
                              <span className="ml-2 text-[11px] text-[#0B3C8C] font-semibold">
                                · Featured
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 tabular-nums">
                            {isScheduledItem && art.scheduledAt ? (
                              <div>
                                <p className="text-xs font-semibold text-[#0B3C8C]">
                                  {new Date(art.scheduledAt).toLocaleString()}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {formatScheduleCountdown(art.scheduledAt)}
                                </p>
                              </div>
                            ) : (
                              formatEditorialDate(art.publishedAt)
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleQuickPublish(art)}
                                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                              >
                                {art.status === 'published'
                                  ? 'Unpublish'
                                  : 'Publish Now'}
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditArticle(art.id)}
                                className="px-2.5 py-1 rounded bg-[#0B3C8C] text-white text-[11px] font-semibold hover:bg-blue-900 cursor-pointer"
                              >
                                Edit
                              </button>
                              {deleteConfirmId === art.id ? (
                                <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleConfirmDeleteArticle(art.id)
                                    }
                                    className="text-[11px] font-bold text-red-700 hover:underline cursor-pointer"
                                  >
                                    Confirm Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-[11px] text-slate-500 ml-1 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(art.id)}
                                  title="Delete article"
                                  className="p-1.5 rounded border border-slate-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2B: ADVANCED ARTICLE SCHEDULING QUEUE */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Article Scheduling &amp; Automated Publishing
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Set future publication dates and times for articles. Our background scheduler automatically publishes due articles when their scheduled time arrives.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start">
                <button
                  type="button"
                  disabled={runningSchedulerJob}
                  onClick={handleRunSchedulerNow}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer disabled:opacity-60"
                >
                  <Play className="w-3.5 h-3.5 text-[#007A4D]" />
                  <span>
                    {runningSchedulerJob
                      ? 'Checking Due Articles...'
                      : 'Run Scheduler Check Now'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startNewArticle();
                    setEditorIsScheduled(true);
                    setEditorStatus('scheduled');
                    setEditorScheduledAt(getFuturePresetLocalInput('tomorrow9am'));
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Scheduled Article</span>
                </button>
              </div>
            </div>

            {/* Quick Schedule Existing Article Card */}
            <form
              onSubmit={handleQuickScheduleSubmit}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Schedule an Existing Article or Draft
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select any article below and assign a future publication date and time (`scheduled_at` &amp; `is_scheduled = true`).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">
                    Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickScheduleDateTime(getFuturePresetLocalInput('1h'))
                    }
                    className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    +1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickScheduleDateTime(
                        getFuturePresetLocalInput('tomorrow9am')
                      )
                    }
                    className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    Tomorrow 9:00 AM
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickScheduleDateTime(
                        getFuturePresetLocalInput('nextMonday8am')
                      )
                    }
                    className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    Next Monday 8:00 AM
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Article to Schedule
                  </label>
                  <select
                    value={quickScheduleArticleId}
                    onChange={(e) => setQuickScheduleArticleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                  >
                    <option value="">-- Choose an article --</option>
                    {adminArticles.map((art) => (
                      <option key={art.id} value={art.id}>
                        [{art.status.toUpperCase()}] {art.title} (
                        {formatCategoryName(art.categorySlug)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Future Publication Date &amp; Time (`scheduled_at`)
                  </label>
                  <input
                    type="datetime-local"
                    value={quickScheduleDateTime}
                    onChange={(e) => setQuickScheduleDateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-[#007A4D] hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Schedule Article
                  </button>
                </div>
              </div>
            </form>

            {/* Scheduled Articles Queue Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Upcoming Scheduled Publication Queue ({scheduledArticlesQueue.length})
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Articles in this queue remain hidden from public visitors until their scheduled timestamp arrives.
                  </p>
                </div>
                {stats?.schedulerRuntime?.lastSchedulerCheckAt && (
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    Last Automated Check:{' '}
                    {new Date(
                      stats.schedulerRuntime.lastSchedulerCheckAt
                    ).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {scheduledArticlesQueue.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">
                    No articles are currently waiting in the schedule queue
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Use the form above to schedule any existing article for a future date and time, or toggle &ldquo;Schedule for Future Publication&rdquo; inside the Article Editor.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                        <th className="py-3.5 px-4">Article</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Scheduled For (`scheduled_at`)</th>
                        <th className="py-3.5 px-4">Reschedule Date/Time</th>
                        <th className="py-3.5 px-4 text-right">Queue Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {scheduledArticlesQueue.map((art) => {
                        const draftRescheduleVal =
                          rescheduleMap[art.id] ??
                          toLocalDatetimeInputValue(art.scheduledAt);
                        return (
                          <tr key={art.id} className="hover:bg-slate-50/80">
                            <td className="py-4 px-4 max-w-xs">
                              <p className="font-bold text-slate-900 line-clamp-1">
                                {art.title}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                /{art.categorySlug}/{art.slug}
                              </p>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-700">
                              {formatCategoryName(art.categorySlug)}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <p className="font-bold text-[#0B3C8C] tabular-nums">
                                {art.scheduledAt
                                  ? new Date(art.scheduledAt).toLocaleString()
                                  : 'Pending'}
                              </p>
                              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                                {formatScheduleCountdown(art.scheduledAt)}
                              </p>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="datetime-local"
                                  value={draftRescheduleVal}
                                  onChange={(e) =>
                                    setRescheduleMap((prev) => ({
                                      ...prev,
                                      [art.id]: e.target.value,
                                    }))
                                  }
                                  className="px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRescheduleArticle(
                                      art.id,
                                      draftRescheduleVal
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold cursor-pointer"
                                >
                                  Update Time
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUnscheduleArticle(art.id, 'published')
                                  }
                                  className="px-2.5 py-1.5 rounded bg-[#007A4D] hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Publish Now
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditArticle(art.id)}
                                  className="px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUnscheduleArticle(art.id, 'draft')
                                  }
                                  title="Cancel schedule and revert to draft"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-semibold cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Revert to Draft</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RICH ARTICLE EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {editingArticleId ? 'Edit Article' : 'Create New Article'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Rich-text article editor with direct device image upload, FAQ builder, and SEO controls.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditorPreviewMode((v) => !v)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {editorPreviewMode ? 'Back to Editor' : 'Preview Article'}
                </button>
                <button
                  type="button"
                  disabled={savingArticle}
                  onClick={() => handleSaveArticle('draft')}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Save as Draft
                </button>
                {editorIsScheduled ? (
                  <button
                    type="button"
                    disabled={savingArticle}
                    onClick={() => handleSaveArticle('scheduled')}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-bold cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {savingArticle ? 'Scheduling...' : 'Schedule Article'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={savingArticle}
                    onClick={() => handleSaveArticle('published')}
                    className="px-5 py-2 rounded-lg bg-[#007A4D] hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {savingArticle ? 'Saving...' : 'Publish Article'}
                  </button>
                )}
              </div>
            </div>

            {editorPreviewMode ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
                <div className="text-xs font-bold uppercase text-[#0B3C8C]">
                  Live Article Preview · {formatCategoryName(editorCategorySlug)}
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  {editorTitle || 'Untitled Article'}
                </h1>
                <p className="text-base text-slate-600">{editorExcerpt}</p>
                {editorFeaturedImage && (
                  <ResilientImage
                    src={editorFeaturedImage}
                    alt={editorFeaturedImageAlt || editorTitle}
                    className="w-full aspect-[16/9] rounded-xl object-cover"
                  />
                )}
                <div
                  className="article-prose"
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Editor Column */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Article Title (H1) *
                      </label>
                      <input
                        type="text"
                        value={editorTitle}
                        onChange={(e) => {
                          setEditorTitle(e.target.value);
                          if (!editingArticleId) {
                            setEditorSlug(slugifyText(e.target.value));
                          }
                        }}
                        placeholder="e.g., How to Choose a Reliable Solar Inverter in Nigeria"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold focus:outline-none focus:border-[#0B3C8C]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          URL Slug *
                        </label>
                        <input
                          type="text"
                          value={editorSlug}
                          onChange={(e) => setEditorSlug(slugifyText(e.target.value))}
                          placeholder="how-to-choose-solar-inverter"
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#0B3C8C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={editorCategorySlug}
                          onChange={(e) => setEditorCategorySlug(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                        >
                          {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Short Introductory Excerpt *
                      </label>
                      <textarea
                        rows={2}
                        value={editorExcerpt}
                        onChange={(e) => setEditorExcerpt(e.target.value)}
                        placeholder="Concise 1–2 sentence summary displayed on article cards and search results..."
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#0B3C8C]"
                      />
                    </div>

                    {/* Rich-Text Formatting Toolbar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Article Content (Rich HTML / Sections) *
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3C8C] hover:underline cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload &amp; Insert In-Article Image</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                            onChange={(e) => handleDeviceFileSelect(e, 'inline')}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-1 p-2 rounded-t-lg bg-slate-100 border border-b-0 border-slate-300">
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('h2')}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                          title="Insert H2 Heading"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('h3')}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                          title="Insert H3 Subheading"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('bold')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Bold"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('italic')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Italic"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('ul')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Bulleted List"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('ol')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Numbered List"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('blockquote')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Blockquote"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('link')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Insert Hyperlink"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('table')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Insert Table"
                        >
                          <Table className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('align-left')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Align Left"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormattingTag('align-center')}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Align Center"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleUndo}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer ml-auto"
                          title="Undo"
                        >
                          <Undo className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRedo}
                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          title="Redo"
                        >
                          <Redo className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        ref={contentTextareaRef}
                        rows={16}
                        value={editorContent}
                        onChange={(e) => pushEditorContent(e.target.value)}
                        className="w-full p-4 rounded-b-lg border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-[#0B3C8C]"
                      />
                    </div>
                  </div>

                  {/* FAQ Manager */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        Frequently Asked Questions (FAQ Schema)
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setEditorFaqs((prev) => [
                            ...prev,
                            { question: '', answer: '' },
                          ])
                        }
                        className="text-xs font-semibold text-[#0B3C8C] hover:underline cursor-pointer"
                      >
                        + Add FAQ Item
                      </button>
                    </div>
                    {editorFaqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">
                            Question #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditorFaqs((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-[11px] text-red-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const next = [...editorFaqs];
                            next[idx] = { ...next[idx], question: e.target.value };
                            setEditorFaqs(next);
                          }}
                          placeholder="Question..."
                          className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-semibold"
                        />
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const next = [...editorFaqs];
                            next[idx] = { ...next[idx], answer: e.target.value };
                            setEditorFaqs(next);
                          }}
                          placeholder="Answer..."
                          className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Sidebar: Featured Image Upload, Publishing & SEO */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Featured Image Upload Box */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Featured Image
                    </h3>

                    <div className="aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                      <ResilientImage
                        src={
                          editorFeaturedImage ||
                          `/api/media/illustration/${editorSlug || 'preview'}.svg`
                        }
                        alt={editorFeaturedImageAlt || editorTitle || 'Preview'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="w-full py-2.5 px-4 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-semibold text-center cursor-pointer inline-flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploadingImage
                            ? `Uploading (${uploadProgress}%)...`
                            : 'Upload Image From Device'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          onChange={(e) => handleDeviceFileSelect(e, 'featured')}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setMediaPickerTarget(
                            mediaPickerTarget === 'featured' ? 'none' : 'featured'
                          )
                        }
                        className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        Choose From Uploaded Media Library
                      </button>
                    </div>

                    {mediaPickerTarget === 'featured' &&
                      uploadedImages.length > 0 && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto grid grid-cols-3 gap-2">
                          {uploadedImages.map((img) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => {
                                setEditorFeaturedImage(img.url);
                                setEditorFeaturedImageAlt(img.altText);
                                setMediaPickerTarget('none');
                              }}
                              className="aspect-square rounded overflow-hidden border border-slate-300 hover:border-[#0B3C8C]"
                            >
                              <img
                                src={img.url}
                                alt={img.altText}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Image ALT Text (Accessibility &amp; SEO)
                      </label>
                      <input
                        type="text"
                        value={editorFeaturedImageAlt}
                        onChange={(e) => setEditorFeaturedImageAlt(e.target.value)}
                        placeholder="Descriptive ALT text for screen readers and Google Images..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Publication & Advanced Scheduling Settings */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Publishing, Scheduling &amp; Visibility
                    </h3>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Publication Mode
                      </label>
                      <select
                        value={editorIsScheduled ? 'scheduled' : editorStatus}
                        onChange={(e) => {
                          const val = e.target.value as
                            | 'published'
                            | 'draft'
                            | 'scheduled';
                          setEditorStatus(val);
                          setEditorIsScheduled(val === 'scheduled');
                          if (val === 'scheduled' && !editorScheduledAt) {
                            setEditorScheduledAt(
                              getFuturePresetLocalInput('tomorrow9am')
                            );
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      >
                        <option value="published">Publish Immediately (Public)</option>
                        <option value="scheduled">
                          Schedule for Future Date &amp; Time
                        </option>
                        <option value="draft">Save as Draft (Private)</option>
                      </select>
                    </div>

                    {/* Explicit Schedule Toggle */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                      <label className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0B3C8C]" />
                          <span>Schedule Future Publication (`is_scheduled`)</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={editorIsScheduled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditorIsScheduled(checked);
                            setEditorStatus(checked ? 'scheduled' : 'published');
                            if (checked && !editorScheduledAt) {
                              setEditorScheduledAt(
                                getFuturePresetLocalInput('tomorrow9am')
                              );
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                      </label>

                      {editorIsScheduled ? (
                        <div className="space-y-2.5 pt-2 border-t border-slate-200">
                          <div>
                            <label className="block text-[11px] font-bold text-[#0B3C8C] mb-1">
                              Scheduled Publish Date &amp; Time (`scheduled_at`) *
                            </label>
                            <input
                              type="datetime-local"
                              value={editorScheduledAt}
                              onChange={(e) => setEditorScheduledAt(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setEditorScheduledAt(
                                  getFuturePresetLocalInput('1h')
                                )
                              }
                              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                            >
                              +1 Hour
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditorScheduledAt(
                                  getFuturePresetLocalInput('tomorrow9am')
                                )
                              }
                              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                            >
                              Tomorrow 9 AM
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditorScheduledAt(
                                  getFuturePresetLocalInput('nextWeek')
                                )
                              }
                              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                            >
                              Next Week
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Status:{' '}
                            <span className="font-semibold text-[#0B3C8C]">
                              {formatScheduleCountdown(editorScheduledAt)}
                            </span>
                            . This article will automatically switch to{' '}
                            <strong>Published</strong> at the selected time.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Publication Date &amp; Time
                          </label>
                          <input
                            type="datetime-local"
                            value={editorPublishedAt}
                            onChange={(e) => setEditorPublishedAt(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editorIsFeatured}
                          onChange={(e) => setEditorIsFeatured(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span>Display in Homepage Featured Articles</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editorIsPopular}
                          onChange={(e) => setEditorIsPopular(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span>Highlight in Popular Articles</span>
                      </label>
                    </div>
                  </div>

                  {/* SEO Meta Settings */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Search Engine Optimisation (SEO)
                    </h3>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={editorSeoTitle}
                        onChange={(e) => setEditorSeoTitle(e.target.value)}
                        placeholder={`${editorTitle || 'Article Title'} | Layitek Blog`}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={editorSeoDescription}
                        onChange={(e) => setEditorSeoDescription(e.target.value)}
                        placeholder={editorExcerpt || '120–160 character summary for Google search snippets...'}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IMAGE MANAGEMENT (DIRECT DEVICE UPLOADS) */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">
                    Media Library &amp; Device Image Uploads
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload JPG, PNG, WebP, or SVG images directly from your laptop, desktop, Android phone, or iPhone.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    value={uploadAltInput}
                    onChange={(e) => setUploadAltInput(e.target.value)}
                    placeholder="Optional ALT text before upload..."
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                  <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B3C8C] hover:bg-blue-900 text-white text-xs font-semibold cursor-pointer whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadingImage
                        ? `Uploading (${uploadProgress}%)...`
                        : 'Select Image From Device'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={(e) => handleDeviceFileSelect(e, 'library')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {uploadingImage && (
                <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#007A4D] h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {uploadedImages.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h2 className="text-sm font-bold text-slate-900">
                  No custom device images uploaded yet
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  All 60 seed articles automatically render custom SVG vector illustrations. Upload photos from your computer or phone above to use in new or existing articles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {uploadedImages.map((img) => (
                  <div
                    key={img.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] bg-slate-900 overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.altText}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {img.filename}
                        </p>
                        <input
                          type="text"
                          defaultValue={img.altText}
                          onBlur={(e) => {
                            if (e.target.value !== img.altText) {
                              authFetch(`/api/admin/images/${img.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ altText: e.target.value }),
                              }).then(() =>
                                showNotice('success', 'Image ALT text updated.')
                              );
                            }
                          }}
                          placeholder="Image ALT text..."
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditorFeaturedImage(img.url);
                          setEditorFeaturedImageAlt(img.altText);
                          setActiveTab('editor');
                          showNotice(
                            'success',
                            'Selected image applied to Article Editor.'
                          );
                        }}
                        className="text-[11px] font-semibold text-[#0B3C8C] hover:underline cursor-pointer"
                      >
                        Use in Editor
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await authFetch(`/api/admin/images/${img.id}`, {
                            method: 'DELETE',
                          });
                          setUploadedImages((prev) =>
                            prev.filter((item) => item.id !== img.id)
                          );
                          showNotice('success', 'Image deleted.');
                        }}
                        className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WEBSITE SETTINGS MANAGEMENT */}
        {activeTab === 'settings' && editableSettings && (
          <form onSubmit={handleSaveWebsiteSettings} className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Website Settings Management
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Update Layitek Blog branding, logo, homepage hero, contact details, footer, and SEO without editing code.
                </p>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#007A4D] hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer self-start"
              >
                Save Website Settings
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Branding & Logo Replacement */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Branding &amp; Logo
                </h2>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <img
                    src={editableSettings.branding.logoUrl}
                    alt="Current Logo"
                    className="h-10 w-auto object-contain bg-white p-1.5 rounded border border-slate-200"
                  />
                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0B3C8C] text-white text-xs font-semibold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Replacement Logo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        onChange={(e) => handleDeviceFileSelect(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditableSettings({
                          ...editableSettings,
                          branding: {
                            ...editableSettings.branding,
                            logoUrl:
                              '/assets/aistudio/LAYITEK_LOGO_FOR_BLOG2_197cbf30.png',
                          },
                        })
                      }
                      className="block text-[11px] text-slate-500 hover:underline cursor-pointer"
                    >
                      Restore Default Layitek Logo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Website Name
                    </label>
                    <input
                      type="text"
                      value={editableSettings.branding.siteName}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          branding: {
                            ...editableSettings.branding,
                            siteName: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Brand Colour
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editableSettings.branding.primaryColor}
                        onChange={(e) =>
                          setEditableSettings({
                            ...editableSettings,
                            branding: {
                              ...editableSettings.branding,
                              primaryColor: e.target.value,
                            },
                          })
                        }
                        className="h-9 w-12 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editableSettings.branding.primaryColor}
                        onChange={(e) =>
                          setEditableSettings({
                            ...editableSettings,
                            branding: {
                              ...editableSettings.branding,
                              primaryColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Homepage Content */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Homepage Hero &amp; Promotional Section
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    value={editableSettings.homepage.heroHeadline}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        homepage: {
                          ...editableSettings.homepage,
                          heroHeadline: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hero Supporting Description
                  </label>
                  <textarea
                    rows={3}
                    value={editableSettings.homepage.heroDescription}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        homepage: {
                          ...editableSettings.homepage,
                          heroDescription: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Promotional Banner Title
                  </label>
                  <input
                    type="text"
                    value={editableSettings.homepage.promoTitle}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        homepage: {
                          ...editableSettings.homepage,
                          promoTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* 3. Contact & Social Media */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Contact Details &amp; Social Links
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Email
                    </label>
                    <input
                      type="email"
                      value={editableSettings.contact.companyEmail}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          contact: {
                            ...editableSettings.contact,
                            companyEmail: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={editableSettings.contact.phoneNumber}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          contact: {
                            ...editableSettings.contact,
                            phoneNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      About Us URL
                    </label>
                    <input
                      type="url"
                      value={editableSettings.contact.aboutUrl}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          contact: {
                            ...editableSettings.contact,
                            aboutUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Us URL
                    </label>
                    <input
                      type="url"
                      value={editableSettings.contact.contactUrl}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          contact: {
                            ...editableSettings.contact,
                            contactUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={editableSettings.contact.socialLinks.linkedin}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          contact: {
                            ...editableSettings.contact,
                            socialLinks: {
                              ...editableSettings.contact.socialLinks,
                              linkedin: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      X (Twitter) URL
                    </label>
                    <input
                      type="url"
                      value={editableSettings.contact.socialLinks.twitter}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          contact: {
                            ...editableSettings.contact,
                            socialLinks: {
                              ...editableSettings.contact.socialLinks,
                              twitter: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Footer & Global SEO */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. Footer &amp; Default SEO Metadata
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Footer Company Description
                  </label>
                  <textarea
                    rows={2}
                    value={editableSettings.footer.footerDescription}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        footer: {
                          ...editableSettings.footer,
                          footerDescription: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={editableSettings.footer.copyrightText}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        footer: {
                          ...editableSettings.footer,
                          copyrightText: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Website Meta Title
                  </label>
                  <input
                    type="text"
                    value={editableSettings.seo.metaTitle}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        seo: {
                          ...editableSettings.seo,
                          metaTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Website Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={editableSettings.seo.metaDescription}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        seo: {
                          ...editableSettings.seo,
                          metaDescription: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 6: NEWSLETTER SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  Newsletter Subscribers ({subscribers.length})
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Readers subscribed to receive Layitek Blog updates.
                </p>
              </div>
            </div>

            {subscribers.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No newsletter subscribers recorded yet. Test the subscription box on the homepage!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Subscribed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {subscribers.map((sub: any) => (
                      <tr key={sub.id}>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {sub.email}
                        </td>
                        <td className="py-3 px-4 text-emerald-700 font-semibold uppercase text-[11px]">
                          {sub.status}
                        </td>
                        <td className="py-3 px-4 text-slate-500 tabular-nums">
                          {formatEditorialDate(sub.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
