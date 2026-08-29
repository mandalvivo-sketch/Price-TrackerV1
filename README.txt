Mobile Price Tracker - HTML/CSS/Vanilla JS + Supabase

Run with VS Code Live Server. Do not open the HTML directly with file://.

Files:
index.html
style.css
app.js
supabase.js

Supabase URL/key are configured in supabase.js.


PWA setup
---------
This version is PWA-ready.

Run it through HTTPS (or localhost) and open index.html through your web server.
On Android Chrome: browser menu -> Install app / Add to Home screen.
On iPhone Safari: Share -> Add to Home Screen.

The service worker caches the app files for faster loading and offline app-shell access.
Supabase API requests are intentionally NOT cached so live database data is not made stale.

Important: file:// will not install a PWA. Use VS Code Live Server, GitHub Pages, Netlify,
Cloudflare Pages, or another HTTPS web server.
