/**
 * Supabase Edge Function: publish-scheduled-articles
 *
 * Scheduled via Supabase Cron / pg_net or invoked periodically to check for
 * articles where `is_scheduled = true` and `scheduled_at <= now()`, and
 * automatically transition them to `status = 'published'` and `is_scheduled = false`.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore - Deno runtime global in Supabase Edge Functions
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // @ts-ignore - Deno env in Supabase Edge Runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    // @ts-ignore - Deno env in Supabase Edge Runtime
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const nowIso = new Date().toISOString();

    // 1. Find all scheduled articles whose scheduled_at time has arrived
    const { data: dueArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, slug, category_slug, scheduled_at')
      .or('is_scheduled.eq.true,status.eq.scheduled')
      .not('scheduled_at', 'is', null)
      .lte('scheduled_at', nowIso);

    if (fetchError) {
      throw fetchError;
    }

    if (!dueArticles || dueArticles.length === 0) {
      return new Response(
        JSON.stringify({
          publishedCount: 0,
          publishedArticles: [],
          checkedAt: nowIso,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // 2. Publish each due article and clear is_scheduled
    const publishedArticles = [];
    for (const article of dueArticles) {
      const { data: updated, error: updateError } = await supabase
        .from('articles')
        .update({
          status: 'published',
          is_scheduled: false,
          published_at: article.scheduled_at || nowIso,
          updated_at: nowIso,
        })
        .eq('id', article.id)
        .select('id, title, slug, category_slug, published_at')
        .single();

      if (!updateError && updated) {
        publishedArticles.push(updated);
      }
    }

    return new Response(
      JSON.stringify({
        publishedCount: publishedArticles.length,
        publishedArticles,
        checkedAt: nowIso,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || 'Failed to process scheduled articles',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
