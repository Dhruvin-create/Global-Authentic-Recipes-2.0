# Cloudflare Pages Deployment Guide - Global Authentic Recipes

## ☁️ Cloudflare Pages Deployment with Railway Database

Cloudflare Pages ek fast, secure, aur free hosting platform hai jo Next.js ko support karta hai. Yeh guide aapko complete deployment process sikhayega.

---

## 📋 STEP 1: Cloudflare Account Setup

### 1.1 Create Cloudflare Account
1. Visit: https://dash.cloudflare.com/sign-up
2. Enter email and create password
3. Verify email address
4. Login to Cloudflare dashboard

### 1.2 Free Tier Benefits
- **Unlimited bandwidth** - No limits!
- **Unlimited requests** - No restrictions
- **500 builds/month** - More than enough
- **100 custom domains** - Free SSL included
- **Global CDN** - Super fast worldwide
- **DDoS protection** - Built-in security

---

## 📋 STEP 2: Prepare Project for Cloudflare

### 2.1 Install Cloudflare Adapter

Cloudflare Pages Next.js ko support karta hai but kuch configuration chahiye:

```bash
# Install required packages
npm install @cloudflare/next-on-pages --save-dev
```

### 2.2 Update package.json

Add Cloudflare build script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static",
    "pages:watch": "npx @cloudflare/next-on-pages --watch",
    "pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat"
  }
}
```

### 2.3 Create wrangler.toml

Project root mein `wrangler.toml` file create karein:

```toml
name = "global-recipes"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

[env.production]
compatibility_flags = ["nodejs_compat"]

[env.production.vars]
NODE_ENV = "production"
```

### 2.4 Update next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility
  output: 'export', // Static export for Cloudflare
  images: {
    unoptimized: true, // Cloudflare handles image optimization
  },
  // Existing config
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
```

**IMPORTANT**: Cloudflare Pages static export use karta hai, so API routes ko Cloudflare Workers mein convert karna padega.

---

## 📋 STEP 3: Alternative - Use Cloudflare Workers

Kyunki aapke paas API routes hain, better option hai Cloudflare Workers use karna:

### 3.1 Keep Standard Next.js Build

`next.config.js` ko original rakhein:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // No output: 'export' - keep dynamic
};

module.exports = nextConfig;
```

### 3.2 Use Cloudflare Pages with Functions

Cloudflare Pages ab Next.js ko directly support karta hai with Functions (Beta).

---

## 📋 STEP 4: Deploy to Cloudflare Pages

### Method 1: GitHub Integration (Recommended)

#### 4.1 Push Code to GitHub

```bash
# Already done in previous steps
git add .
git commit -m "Cloudflare deployment ready"
git push origin main
```

#### 4.2 Connect to Cloudflare Pages

1. **Cloudflare Dashboard** pe jaayein
2. **Pages** section select karein
3. Click **"Create a project"**
4. Click **"Connect to Git"**
5. **GitHub** select karein
6. Authorize Cloudflare
7. Select repository: **"Global-Authentic-Recipes-2.0"**
8. Click **"Begin setup"**

#### 4.3 Configure Build Settings

```
Project name: global-recipes
Production branch: main
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: /
Node version: 18
```

#### 4.4 Add Environment Variables

Click **"Environment variables"** and add:

```env
# Railway Database
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway
DATABASE_URL=mysql://root:password@containers-us-west-xxx.railway.app:3306/railway

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://global-recipes.pages.dev

# Authentication
JWT_SECRET=your-production-secret-32-characters-minimum
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-production-session-secret-32-chars

# File Upload
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

**Generate Secrets**:
```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4.5 Deploy

1. Click **"Save and Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your site will be live at: `https://global-recipes.pages.dev`

---

## 📋 STEP 5: Custom Domain Setup (Optional)

### 5.1 Add Custom Domain

1. Cloudflare Pages dashboard mein project select karein
2. **"Custom domains"** tab pe jaayein
3. Click **"Set up a custom domain"**
4. Enter your domain: `globalrecipes.com`
5. Click **"Continue"**

### 5.2 DNS Configuration

Agar domain Cloudflare pe hai:
- Automatic DNS records add ho jayenge
- SSL certificate automatic activate hoga

Agar domain elsewhere hai:
- CNAME record add karein:
  ```
  Type: CNAME
  Name: www (or @)
  Value: global-recipes.pages.dev
  ```

### 5.3 SSL Certificate

- Cloudflare automatic SSL certificate provide karta hai
- HTTPS automatically enable hota hai
- No configuration needed!

---

## 📋 STEP 6: Cloudflare Workers for API Routes

Kyunki Next.js API routes Cloudflare Pages pe directly nahi chalte, aapko Cloudflare Workers use karne padenge.

### Option A: Use Vercel for API, Cloudflare for Frontend

**Best Approach for Your Project**:

1. **Cloudflare Pages**: Frontend (React components, pages)
2. **Vercel**: API routes (already deployed)
3. **Railway**: Database (already setup)

Update `NEXT_PUBLIC_API_URL`:
```env
NEXT_PUBLIC_API_URL=https://globalrecipes2-0.vercel.app
```

### Option B: Migrate API to Cloudflare Workers

Create Cloudflare Workers for each API route. Example:

**File**: `functions/api/recipes.js`
```javascript
export async function onRequest(context) {
  const { request, env } = context;
  
  // Your API logic here
  const recipes = await fetchRecipesFromDatabase(env);
  
  return new Response(JSON.stringify(recipes), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
```

**Note**: This requires significant refactoring. Recommended to use Option A.

---

## 📋 STEP 7: Hybrid Deployment Architecture

### 7.1 Recommended Setup

```
┌─────────────────────────────────────────┐
│         USER'S BROWSER                  │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    CLOUDFLARE PAGES (Frontend)          │
│    - React Components                   │
│    - Static Pages                       │
│    - Images & Assets                    │
│    URL: global-recipes.pages.dev        │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    VERCEL (API Routes)                  │
│    - /api/recipes                       │
│    - /api/auth                          │
│    - /api/cuisines                      │
│    URL: globalrecipes2-0.vercel.app     │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    RAILWAY (MySQL Database)             │
│    - Users, Recipes, Cuisines           │
│    - All application data               │
└─────────────────────────────────────────┘
```

### 7.2 Update Frontend Configuration

**File**: `.env.production`
```env
NEXT_PUBLIC_API_URL=https://globalrecipes2-0.vercel.app
```

This way:
- ✅ Cloudflare serves frontend (super fast)
- ✅ Vercel handles API (already working)
- ✅ Railway stores data (already setup)
- ✅ No code changes needed!

---

## 📋 STEP 8: Deploy Frontend to Cloudflare

### 8.1 Create Frontend-Only Build

Update `next.config.js` for static export:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export
  images: {
    unoptimized: true,
  },
  // API calls will go to Vercel
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
```

### 8.2 Build and Test Locally

```bash
# Build static export
npm run build

# Test the build
npx serve out
```

### 8.3 Deploy to Cloudflare

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy out --project-name=global-recipes
```

Or use GitHub integration (automatic deployment on push).

---

## 📋 STEP 9: Configure CORS for API

Kyunki frontend Cloudflare pe hai aur API Vercel pe, CORS configure karna padega.

### 9.1 Update API Response Headers

**File**: `lib/api-response.js`

Add CORS headers:

```javascript
export function successResponse(data, message = 'Success', statusCode = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://global-recipes.pages.dev',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      }
    }
  );
}
```

### 9.2 Add OPTIONS Handler

**File**: `middleware.js` (create in root)

```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://global-recipes.pages.dev',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 📋 STEP 10: Test Deployment

### 10.1 Test Frontend

Visit: `https://global-recipes.pages.dev`

Check:
- ✅ Home page loads
- ✅ Images display correctly
- ✅ Navigation works
- ✅ Responsive design

### 10.2 Test API Connection

Open browser console and check:
```javascript
fetch('https://globalrecipes2-0.vercel.app/api/recipes?featured=true&limit=4')
  .then(r => r.json())
  .then(console.log);
```

### 10.3 Test Authentication

1. Try to login
2. Check if JWT token is stored
3. Verify API calls include token
4. Test protected routes

---

## 📋 STEP 11: Performance Optimization

### 11.1 Cloudflare Caching

Cloudflare automatically caches static assets. Configure:

**File**: `public/_headers`
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/images/*
  Cache-Control: public, max-age=31536000, immutable

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

### 11.2 Image Optimization

Use Cloudflare Images (optional, paid):
```javascript
// In your image components
<img 
  src="https://imagedelivery.net/your-account/image-id/public"
  alt="Recipe"
/>
```

Or use Cloudinary (free tier):
```javascript
<img 
  src="https://res.cloudinary.com/your-cloud/image/upload/recipes/image.jpg"
  alt="Recipe"
/>
```

---

## 📋 STEP 12: Monitoring & Analytics

### 12.1 Cloudflare Analytics

1. Cloudflare dashboard → Pages → Your project
2. **Analytics** tab pe jaayein
3. Dekh sakte hain:
   - Page views
   - Unique visitors
   - Bandwidth usage
   - Geographic distribution

### 12.2 Add Google Analytics (Optional)

**File**: `app/layout.js`
```javascript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔒 STEP 13: Security Configuration

### 13.1 Security Headers

**File**: `public/_headers`
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 13.2 Content Security Policy

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://globalrecipes2-0.vercel.app
```

---

## ✅ Cloudflare Deployment Checklist

- [ ] Cloudflare account created
- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Railway database connected
- [ ] CORS configured for Vercel API
- [ ] First deployment successful
- [ ] Custom domain added (optional)
- [ ] SSL certificate active
- [ ] Frontend loads correctly
- [ ] API calls working
- [ ] Authentication functional
- [ ] Images displaying
- [ ] Mobile responsive
- [ ] Performance optimized

---

## 🎯 Final Architecture

```
USER REQUEST
     ↓
CLOUDFLARE CDN (Global Edge Network)
     ↓
CLOUDFLARE PAGES (Frontend - Static)
     ↓
VERCEL (API Routes - Serverless)
     ↓
RAILWAY (MySQL Database)
```

**Benefits**:
- ⚡ Lightning fast (Cloudflare CDN)
- 🔒 Secure (DDoS protection, SSL)
- 💰 Cost effective (All free tiers)
- 🌍 Global reach (Edge locations)
- 📈 Scalable (Auto-scaling)

---

## 🔧 Troubleshooting

### Issue 1: Build Fails on Cloudflare

**Solution**: Check build logs, ensure all dependencies in package.json

### Issue 2: API Calls Fail (CORS)

**Solution**: Add CORS headers in Vercel API routes

### Issue 3: Environment Variables Not Working

**Solution**: Redeploy after adding variables

### Issue 4: Images Not Loading

**Solution**: Use absolute URLs or Cloudflare Images

---

## 📞 Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Cloudflare Discord**: https://discord.gg/cloudflaredev
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/

---

**Deployment complete! Your app is now live on Cloudflare Pages with Railway database!** 🚀

**Live URLs**:
- Frontend: `https://global-recipes.pages.dev`
- API: `https://globalrecipes2-0.vercel.app/api`
- Database: Railway MySQL

---

**Last Updated**: March 2, 2026  
**Status**: Ready for production deployment