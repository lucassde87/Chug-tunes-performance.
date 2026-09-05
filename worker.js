export default {
  async fetch(request, env) {
    const allowedOrigin = "https://lucassde87.github.io";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return new Response("Not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    let data;

    try {
      data = await request.json();
    } catch {
      return new Response("Bad JSON", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (
      !data?.email ||
      !data?.method ||
      !Array.isArray(data.items)
    ) {
      return new Response("Missing fields", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (
      !["PayPal", "Paysafecard", "Amazon Card"].includes(data.method)
    ) {
      return new Response("Unsupported method", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const content = [
      "🛒 **Neue Bestellung – manuelle Prüfung**",
      `**Zahlungsart:** ${data.method}`,
      `**E-Mail:** ${String(data.email).slice(0, 160)}`,
      `**Produkte:** ${data.items
        .map(
          x =>
            `${String(x.name).slice(0, 100)} (${Number(x.price).toFixed(2)} €)`
        )
        .join(", ")}`,
      `**Gesamt:** ${Number(data.total || 0).toFixed(2)} €`,
      "**Status:** Zahlung zur Prüfung eingereicht",
      "ℹ️ Der vollständige Gutschein-Code wird nicht an Discord übertragen.",
    ].join("\n");

    if (!env.DISCORD_WEBHOOK_URL) {
      return new Response("Discord webhook not configured", {
        status: 500,
        headers: corsHeaders,
      });
    }

    try {
      const discordResponse = await fetch(
        env.DISCORD_WEBHOOK_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            allowed_mentions: {
              parse: [],
            },
          }),
        }
      );

      if (!discordResponse.ok) {
        return new Response("Discord notification failed", {
          status: 502,
          headers: corsHeaders,
        });
      }

      return new Response(
        JSON.stringify({ ok: true }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      return new Response("Discord request failed", {
        status: 502,
        headers: corsHeaders,
      });
    }
  },
};