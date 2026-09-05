# Discord-Bestellmeldungen

Die Website sendet bei Paysafecard/Amazon nur Bestell-Metadaten an dein Backend. Der vollständige Gutschein-Code wird **nicht** an Discord übertragen.

## Cloudflare Worker
1. Erstelle einen Cloudflare Worker und kopiere `worker.js` hinein.
2. Setze das Secret `DISCORD_WEBHOOK_URL` auf deinen Discord-Webhook.
3. Setze die Variable `ALLOWED_ORIGIN` auf deine GitHub-Pages-Adresse, z. B. `https://lucassde87.github.io`.
4. Kopiere die öffentliche Worker-URL in `script.js` bei `ORDER_API_URL`.
5. Lade `index.html`, `script.js` und `style.css` auf GitHub Pages hoch.

**Wichtig:** Den Discord-Webhook niemals direkt in `script.js` eintragen.
