# 🎌 Kiroku Web — Official Website, Landing Page & Legal Hub

Official website, App Store compliance pages, and legal documentation for **Kiroku (記録)** — Modern Anime & Manga Social Discovery Platform.

## 📁 Included Pages
* `/` (`index.html`) — High-conversion showcase landing page (Taste Match™, Anime Reels, MAL Sync, App Store badges).
* `/privacy` (`privacy.html`) — App Store Guideline 5.1.1, GDPR & KVKK compliant Privacy Policy.
* `/terms` (`terms.html`) — App Store Guideline 1.2 User-Generated Content (UGC) & EULA with zero-tolerance policy.
* `/support` (`support.html`) — App Store Connect required customer support & FAQ portal.
* `vercel.json` — Edge security headers and clean URL routing (serves `.html` files without file extensions).

## 🚀 Deployment to Vercel
1. Import repository `kirokuapp/web-kiroku` into [Vercel](https://vercel.com).
2. Framework Preset: **Other / Static HTML**.
3. Output Directory: `./`.
4. Click **Deploy**.

## 🌐 Custom Domain Setup (`kirokuapp.com`)
1. Go to Vercel Project **Settings &rarr; Domains**.
2. Add `kirokuapp.com` and `www.kirokuapp.com`.
3. In your Spaceship DNS panel, add:
   * **A Record:** `@` &rarr; `76.76.21.21`
   * **CNAME:** `www` &rarr; `cname.vercel-dns.com`
   * **CNAME:** `api` &rarr; `backend-kiroku-production.up.railway.app`
