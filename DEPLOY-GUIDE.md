# Drip & Scents — Deploy guide

Ayos ng online: **GitHub** (code) → **Vercel** (website) → **Render** (Strapi) → **Supabase** (database + images)

---

## PART A — Gawin muna sa LOCALHOST (para gumana ang bagong security)

### A1. I-copy ang mga file
- Laman ng `frontend` → `websystem\frontend` (Replace)
- Laman ng `backend\config` → `websystem\backend\config` (Replace)
- `backend\.env.production.example` → `websystem\backend`
- `.gitignore` → `websystem` (katabi ng backend at frontend)

### A2. I-install ang upload provider (sa `backend` terminal)
Tingnan muna ang version ng Strapi sa `backend\package.json` (`"@strapi/strapi": "5.xx.x"`), tapos gamitin ang PAREHONG version:
```
npm install @strapi/provider-upload-aws-s3@5.xx.x
```
Siguraduhing **5.33.2 pataas** ang Strapi (may security fix). Kung mas mababa, i-run muna: `npx @strapi/upgrade minor`

### A3. Gumawa ng API token sa local Strapi
`localhost:1337/admin` → **Settings → API Tokens → Create new API Token**
- Name: `nuxt-server` · Duration: **Unlimited** · Type: **Custom**
- Product: ✅ find ✅ findOne ✅ create ✅ update ✅ delete
- Upload / Media Library: ✅ upload
- **Save** → **kopyahin ang token** (isang beses lang ito ipapakita)

### A4. Ayusin ang Public role
**Settings → Users & Permissions → Roles → Public**
- Product: ✅ find ✅ findOne lang (alisin ang create, update, delete)
- Media Library: alisin ang upload
- **Save**

### A5. I-update ang `frontend\.env`
```
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
NUXT_STRAPI_TOKEN=<token mula sa A3>
NUXT_ADMIN_PASSWORD=<password na gusto mo>
NUXT_SESSION_SECRET=<kahit anong random na text, 32+ characters>
```
I-restart ang `npm run dev`. I-test: Manage products → may login na; Add/Edit/Delete at checkout gumagana pa rin.

---

## PART B — GitHub
1. Gumawa ng account sa github.com → **New repository** → `drip-and-scents` → Create.
2. Sa terminal, sa `websystem` folder:
```
git init
git add .
git commit -m "Drip & Scents e-commerce"
git branch -M main
git remote add origin https://github.com/<username>/drip-and-scents.git
git push -u origin main
```
3. I-check sa GitHub: may `backend` at `frontend`, **walang** `node_modules` at **walang** `.env`.

---

## PART C — Supabase (database + images)
1. supabase.com → **New project** → Region: **Southeast Asia (Singapore)** → tandaan ang database password.
2. **Connect** → **Session pooler** → kopyahin: host, port (5432), user (`postgres.<ref>`), database (`postgres`).
3. **Storage → New bucket** → name `product-images` → ✅ **Public bucket**.
4. **Storage → Settings / S3 Configuration** → i-enable ang S3 → **New access key** → kopyahin ang Access key ID, Secret, Region, at Endpoint.

---

## PART D — Render (Strapi)
1. render.com → sign in with GitHub → **New → Web Service** → piliin ang repo.
2. Settings:
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Instance: Free
3. **Environment** → ilagay lahat ng nasa `backend\.env.production.example` (gamit ang values mula sa Supabase at sa local `backend\.env`).
4. **Deploy**. Kapag "Live", buksan `https://<name>.onrender.com/admin` → gumawa ng admin account.
5. Sa ONLINE na Strapi, ulitin ang **A3** (API token) at **A4** (Public: find at findOne lang).
6. Ilagay ulit ang mga products (may images).

---

## PART E — Vercel (website)
1. vercel.com → sign in with GitHub → **Add New → Project** → piliin ang repo.
2. Root Directory: `frontend` (Nuxt auto-detected).
3. Environment Variables:
```
NUXT_PUBLIC_STRAPI_URL=https://<name>.onrender.com
NUXT_STRAPI_TOKEN=<token mula sa ONLINE na Strapi>
NUXT_ADMIN_PASSWORD=<password>
NUXT_SESSION_SECRET=<32+ random characters>
```
4. **Deploy** → makukuha mo ang `https://<project>.vercel.app`.
5. Balik sa Render → Environment → `CORS_ORIGINS=https://<project>.vercel.app,http://localhost:3000` → Save (magre-redeploy).

---

## Bago ang demo
- Buksan muna ang `https://<name>.onrender.com/admin` 2–3 minuto bago (natutulog ang free Render).
- Kung naka-pause ang Supabase project, i-click ang **Restore** sa dashboard.
