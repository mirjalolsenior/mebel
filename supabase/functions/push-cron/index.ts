// supabase/functions/push-cron/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PushRow = {
  user_id: string | null;
  push_token: string | null;
};

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    // 1) CRON_SECRET tekshiruvi
    const auth = req.headers.get("authorization") ?? "";
    const expected = `Bearer ${Deno.env.get("CRON_SECRET") ?? ""}`;
    if (!Deno.env.get("CRON_SECRET") || auth !== expected) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    // 2) Supabase client (service role bilan)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRole);

    // 3) Tokenlarni olish
    const { data, error } = await supabase
      .from("user_push_tokens")
      .select("user_id,push_token")
      .not("push_token", "is", null);

    if (error) {
      return json({ ok: false, error: `DB error: ${error.message}` }, 500);
    }

    const rows = (data ?? []) as PushRow[];
    const tokens = rows
      .map((r) => r.push_token?.trim() ?? "")
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      return json({ ok: true, message: "Token topilmadi", sent: 0, failed: 0 }, 200);
    }

    // 4) Expo message tayyorlash
    // (xohlasangiz title/body ni req.json() dan ham olishingiz mumkin)
    const now = new Date();
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: "Eslatma",
      body: "Omborda yangilanish bor",
      data: { source: "cron", at: now.toISOString() },
    }));

    // 5) Expo ga yuborish (chunklab)
    const chunks = chunk(messages, 100); // expo tavsiya: batch
    let sent = 0;
    let failed = 0;
    const badTokens: string[] = [];
    const tickets: unknown[] = [];

    for (const c of chunks) {
      const resp = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(c),
      });

      const text = await resp.text();

      if (!resp.ok) {
        // butun chunk xato bo‘lsa
        failed += c.length;
        console.error("Expo HTTP error:", resp.status, text);
        continue;
      }

      const parsed = safeJson(text);
      if (!parsed?.data || !Array.isArray(parsed.data)) {
        failed += c.length;
        console.error("Expo parse error:", text);
        continue;
      }

      // Ticketlarni tahlil qilish
      parsed.data.forEach((t: any, idx: number) => {
        tickets.push(t);
        if (t?.status === "ok") {
          sent += 1;
        } else {
          failed += 1;
          const detailsError = t?.details?.error;
          if (
            detailsError === "DeviceNotRegistered" ||
            detailsError === "InvalidCredentials" ||
            detailsError === "MessageRateExceeded"
          ) {
            // DeviceNotRegistered bo‘lsa tokenni keyin o‘chirish mumkin
            badTokens.push(c[idx].to);
          }
        }
      });
    }

    // 6) Yaroqsiz tokenlarni tozalash (ixtiyoriy, lekin foydali)
    // Faqat DeviceNotRegistered tipidagi tokenlarni o‘chirish yaxshiroq.
    if (badTokens.length > 0) {
      const uniqueBad = [...new Set(badTokens)];
      const { error: delErr } = await supabase
        .from("user_push_tokens")
        .delete()
        .in("push_token", uniqueBad);

      if (delErr) {
        console.error("Bad token delete error:", delErr.message);
      }
    }

    return json(
      {
        ok: true,
        message: "Push yuborish tugadi",
        total_tokens: tokens.length,
        sent,
        failed,
      },
      200
    );
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function safeJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
