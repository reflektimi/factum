# Factum Deployment Guide - Decoupled SPA Architecture

This guide covers deploying **Factum** using a modern decoupled architecture:
- **Frontend**: React SPA on Vercel
- **Backend**: Laravel API on Render  
- **Database**: PostgreSQL on Neon

---

## 📋 Prerequisites

1. **GitHub Account** - Your code is already pushed
2. **Neon Account** - [neon.tech](https://neon.tech) (Free tier available)
3. **Render Account** - [render.com](https://render.com) (Free tier available)
4. **Vercel Account** - [vercel.com](https://vercel.com) (Free tier available)

---

## 🗄️ STEP 1: Set Up Database (Neon)

### 1.1 Create Neon Project
1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **"New Project"**
3. Configure:
   - **Name**: `factum-production`
   - **Region**: Choose closest to you (e.g., US East, EU West)
   - **PostgreSQL Version**: 16
4. Click **"Create Project"**

### 1.2 Save Database Credentials
After creation, you'll see:
```
Host: ep-xxx-xxx.us-east-2.aws.neon.tech
Database: neondb
User: neondb_owner
Password: [generated-password]
Port: 5432
```

**⚠️ SAVE THESE** - You'll need them for Render!

---

## 🔧 STEP 2: Deploy Backend API (Render)

### 2.1 Connect GitHub
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: `L0t1/finances-saas`

### 2.2 Configure Web Service
**Basic Settings:**
- **Name**: `factum-api`
- **Region**: Same as Neon database
- **Branch**: `main`
- **Runtime**: `Docker`

**Instance Type:**
- Select **"Free"** (or **"Starter"** for better performance)

### 2.3 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```env
APP_NAME=Factum
APP_ENV=production
APP_DEBUG=false
APP_URL=https://factum-api.onrender.com
FRONTEND_URL=https://factum.vercel.app

# Database (from Neon - Step 1.2)
DB_CONNECTION=pgsql
DB_HOST=ep-xxx-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=[your-neon-password]

# Session & Auth
SESSION_DRIVER=file
SESSION_SECURE_COOKIE=false
SESSION_DOMAIN=
SANCTUM_STATEFUL_DOMAINS=localhost:5173,factum.vercel.app

# Caching
CACHE_DRIVER=file
QUEUE_CONNECTION=database

# Logging
LOG_CHANNEL=stderr
LOG_LEVEL=error
```

**Note:** Leave `APP_KEY` empty - Render will auto-generate it.

### 2.4 First Deploy (with Seeder)
For the **FIRST deployment only**, add this variable:
```env
RUN_SEEDER=true
```

This will create the admin user and sample data.

**⚠️ REMOVE THIS** after first deploy!

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your API will be at: `https://factum-api.onrender.com`

### 2.6 Test API
Visit: `https://factum-api.onrender.com/api/user`

You should see: `{"message":"Unauthenticated."}`

This means the API is working! ✅

---

## 🌐 STEP 3: Deploy Frontend (Vercel)

### 3.1 Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `L0t1/finances-saas`

### 3.2 Configure Project
**Framework Preset:** Vite
**Root Directory:** `frontend` (click "Edit" and set this!)
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 3.3 Add Environment Variable
Click **"Environment Variables"**

Add:
```
VITE_API_URL = https://factum-api.onrender.com
```

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your app will be at: `https://factum.vercel.app` (or similar)

### 3.5 Update Backend with Frontend URL
1. Go back to Render dashboard
2. Find your `factum-api` service
3. Go to **"Environment"**
4. Update these variables with your actual Vercel URL:
   ```env
   FRONTEND_URL=https://factum-xxx.vercel.app
   SANCTUM_STATEFUL_DOMAINS=localhost:5173,factum-xxx.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will auto-redeploy

---

## 🧪 STEP 4: Test Your Deployment

### 4.1 Login
1. Visit your Vercel URL: `https://factum-xxx.vercel.app`
2. Click **"Login"**
3. Use credentials:
   - **Email**: `admin@finances.com`
   - **Password**: `password`

### 4.2 Verify Features
✅ Dashboard loads with data
✅ Can create/edit/delete invoices
✅ Can create/edit/delete accounts
✅ Refresh Data button works
✅ All CRUD operations work

---

## 🔐 STEP 5: Update CORS (If Needed)

If you get CORS errors, update `config/cors.php`:

```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:5173'),
],
```

Then commit and push:
```bash
git add config/cors.php
git commit -m "fix: Update CORS for production"
git push
```

Render will auto-redeploy.

---

## 🎨 STEP 6: Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to Vercel project → **"Settings"** → **"Domains"**
2. Add: `app.yourdomain.com`
3. Add CNAME record in your DNS:
   ```
   CNAME  app  cname.vercel-dns.com
   ```

### For Render (Backend)
1. Go to Render service → **"Settings"** → **"Custom Domain"**
2. Add: `api.yourdomain.com`
3. Add CNAME record in your DNS:
   ```
   CNAME  api  factum-api.onrender.com
   ```

### Update Environment Variables
After adding custom domains, update:

**Render:**
```env
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
```

**Vercel:**
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 🐛 Troubleshooting

### Issue: "CORS Error"
**Solution:** 
1. Check `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Check `SANCTUM_STATEFUL_DOMAINS` includes your Vercel domain
3. Verify `config/cors.php` has correct origins

### Issue: "Unauthenticated" after login
**Solution:**
1. Check `SESSION_DOMAIN` is empty or matches your domain
2. Verify `SANCTUM_STATEFUL_DOMAINS` is correct
3. Clear browser cookies and try again

### Issue: "500 Server Error"
**Solution:**
1. Check Render logs: Dashboard → Logs
2. Common fixes:
   ```bash
   # In Render Shell
   php artisan config:clear
   php artisan cache:clear
   ```

### Issue: Database connection failed
**Solution:**
1. Verify Neon credentials in Render environment variables
2. Check Neon database is active (not paused)

---

## 📊 Monitoring

### View Backend Logs
Render Dashboard → Your Service → **"Logs"**

### View Frontend Logs  
Vercel Dashboard → Your Project → **"Deployments"** → Click deployment → **"Function Logs"**

### Database Monitoring
Neon Console → Your Project → **"Monitoring"**

---

## 🚀 Deployment Checklist

- [ ] Neon database created and credentials saved
- [ ] Render backend deployed with correct env vars
- [ ] Vercel frontend deployed with API URL
- [ ] Backend updated with frontend URL
- [ ] Login works
- [ ] All CRUD operations work
- [ ] No CORS errors
- [ ] Custom domains configured (optional)

---

## 🎉 Success!

Your Factum application is now live with:
- ⚡ **Fast frontend** on Vercel's edge network
- 🔒 **Secure API** on Render
- 💾 **Reliable database** on Neon

**Frontend:** https://factum.vercel.app
**Backend API:** https://factum-api.onrender.com
