// Supabase Edge Function: push-cron
// Deploy with: supabase functions deploy push-cron
// Set secrets: CRON_SECRET, APP_URL
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const expected = Deno.env.get("CRON_SECRET") ?? "";
    const appUrl = Deno.env.get("APP_URL") ?? "";

    if (expected && auth !== `Bearer ${expected}`) {
      return new Response(JSON.stringify({ ok:false, error:"Unauthorized" }), { status: 401 });
    }

    if (!appUrl) {
      return new Response(JSON.stringify({ ok:false, error:"APP_URL missing" }), { status: 500 });
    }

    const res = await fetch(`${appUrl}/api/push-cron`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${expected}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: "supabase-edge-function" }),
    });

    const text = await res.text();
    return new Response(JSON.stringify({ ok: res.ok, status: res.status, body: text }), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: String(e) }), { status: 500 });
  }
});
