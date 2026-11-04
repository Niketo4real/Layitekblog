import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const NewsletterBox: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed.');
      }
      setStatus('success');
      setMessage(
        data.message ||
          'Thank you for subscribing to the Layitek Blog newsletter!'
      );
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Could not subscribe at this moment. Please try again.');
    }
  };

  return (
    <section className="bg-[#08204E] text-white rounded-2xl p-8 sm:p-10 lg:p-12 border border-blue-900">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-white/10 text-sky-300 mb-4">
          <Mail className="w-5 h-5" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Get Practical Technology &amp; Business Guides in Your Inbox
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
          Join Nigerian business owners, engineers, and professionals receiving weekly insights on computing, telecommunications, CAC compliance, and corporate branding from Layitek Limited.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-lg mx-auto"
        >
          <label htmlFor="newsletter-email-input" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="flex-1 px-4 py-3 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="px-6 py-3 rounded-lg bg-[#007A4D] hover:bg-emerald-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {status === 'success' && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-4 py-2.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm text-amber-200 bg-amber-950/60 border border-amber-800 px-4 py-2.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Zero spam. Unsubscribe at any time. Published by Layitek Limited.
        </p>
      </div>
    </section>
  );
};
