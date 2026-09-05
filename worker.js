export default {
  async fetch(request, env) {
    const allowedOrigin = "https://lucassde87.github.io";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

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
      `**Zahlungsart:** ${String(data.method).slice(0, 50)}`,
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

    /*
      Webhook-Secret bereinigen:
      Entfernt unsichtbare Steuerzeichen und Leerzeichen.
    */
    const webhookUrl = String(env.DISCORD_WEBHOOK_URL || "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .trim();

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "DISCORD_WEBHOOK_URL fehlt im Worker",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /*
      URL prüfen, ohne die URL an den Browser zurückzugeben.
    */
    try {
      new URL(webhookUrl);
    } catch {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "DISCORD_WEBHOOK_URL ist keine gültige URL",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    try {
      const discordResponse = await fetch(webhookUrl, {
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
      });

      if (!discordResponse.ok) {
        const discordBody = await discordResponse.text();

        return new Response(
          JSON.stringify({
            ok: false,
            error: "Discord request failed",
            discordStatus: discordResponse.status,
            discordResponse: discordBody.slice(0, 500),
          }),
          {
            status: 502,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          ok: true,
          discordStatus: discordResponse.status,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Discord request failed",
          details: String(error).slice(0, 500),
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};
