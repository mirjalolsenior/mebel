exports.handler = async function () {
  try {
    const resp = await fetch("https://gnjiffwwfbdievpgaaod.supabase.co/functions/v1/push-cron", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${process.env.CRON_SECRET || "YOUR_CRON_SECRET"}`,
      },
      body: JSON.stringify({
        source: "netlify-cron",
        at: new Date().toISOString(),
      }),
    });

    const text = await resp.text();

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: true,
        upstreamStatus: resp.status,
        upstreamBody: text,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: false,
        error: err?.message || String(err),
      }),
    };
  }
};
