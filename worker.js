export default {
  async fetch(request, env) {

    const cors = {
      "Access-Control-Allow-Origin": "https://lucassde87.github.io",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: cors
      });
    }

    if (request.method !== "POST") {
      return new Response("Not found", {
        status: 404,
        headers: cors
      });
    }

    let data;

    try {
      data = await request.json();
    } catch {
      return new Response("Bad JSON", {
        status: 400,
        headers: cors
      });
    }

    if (
      !data?.email ||
      !data?.method ||
      !Array.isArray(data.items)
    ) {
      return new Response("Missing fields", {
        status: 400,
        headers: cors
      });
    }

    if (
      ![
        "PayPal",
        "Paysafecard",
        "Amazon Card"
      ].includes(data.method)
    ) {
      return new Response(
        "Unsupported method",
        {
          status: 400,
          headers: cors
        }
      );
    }

    const content = [
      "🛒 **Neue Bestellung – manuelle Prüfung**",

      `**Zahlungsart:** ${data.method}`,

      `**E-Mail:** ${String(
        data.email
      ).slice(0, 160)}`,

      `**Produkte:** ${
        data.items
          .map(
            x =>
              `${x.name} (${Number(
                x.price
              ).toFixed(2)} €)`
          )
          .join(", ")
      }`,

      `**Gesamt:** ${Number(
        data.total || 0
      ).toFixed(2)} €`,

      "**Status:** Zahlung zur Prüfung eingereicht",

      "ℹ️ Der vollständige Gutschein-Code wird aus Sicherheitsgründen nicht an Discord übertragen."
    ].join("\n");

    const r = await fetch(
      env.DISCORD_WEBHOOK_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          content,

          allowed_mentions: {
            parse: []
          }
        })
      }
    );

    if (!r.ok) {
      return new Response(
        "Discord notification failed",
        {
          status: 502,
          headers: cors
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true
      }),
      {
        status: 200,

        headers: {
          ...cors,
          "Content-Type":
            "application/json"
        }
      }
    );
  }
};