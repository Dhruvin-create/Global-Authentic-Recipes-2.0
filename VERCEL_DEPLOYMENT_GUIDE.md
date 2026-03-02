# Vercel Deployment Guide - Global Authentic Recipes

## Required Environment Variables for Vercel

### 1. Database Configuration (REQUIRED)

Aapko production database ki zarurat hogi. Options:

#### Option A: PlanetScale (Recommended - Free Tier Available)
```env
DB_HOST=your-database.us-east-1.psdb.cloud
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=global_recipes
DATABASE_URL=mysql://username:password@your-database.us-east-1.psdb.cloud/global_recipes?ssl={"rejectUnauthorized":true}
```

#### Option B: Railway (Free Tier Available)
```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=railway
DATABASE_URL=mysql://root:password@containers-us-west-xxx.railway.app:3306/railway
```

#### Option C: Aiven (Free Tier Available)
```env
DB_HOST=mysql-xxx.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb
DATABASE_URL=mysql://avnadmin:password@mysql-xxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
```

### 2. Application Configuration (REQUIRED)

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
```

**Note:** `NEXT_PUBLIC_API_URL` ko apne Vercel deployment URL se replace karein.

### 3. Authentication (REQUIRED)

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-random-string
JWT_EXPIRES_IN=7d
SESSION_SECRET=another-super-secret-session-key-minimum-32-characters
```

**Important:** Production mein strong, random secrets use karein!

**Generate Strong Secrets:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online Generator
# Visit: https://randomkeygen.com/
```

### 4. File Upload (OPTIONAL but Recommended)

```env
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

---

## Complete Environment Variables List for Vercel

Copy these to Vercel Environment Variables section:

### REQUIRED Variables:

```env
# Database
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=global_recipes
DATABASE_URL=mysql://username:password@host/database

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# Authentication
JWT_SECRET=your-generated-secret-key-32-chars-minimum
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-generated-session-secret-32-chars

# File Upload
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

---

## Step-by-Step Vercel Deployment

### Step 1: Setup Production Database

#### Using PlanetScale (Recommended):

1. Go to https://planetscale.com/
2. Sign up / Login
3. Create new database: `global-recipes`
4. Get connection details from "Connect" button
5. Copy connection string

#### Using Railway:

1. Go to https://railway.app/
2. Sign up / Login
3. Create new project → Add MySQL
4. Copy connection details

### Step 2: Import Database Schema

Connect to your production database and run:

```sql
-- Run schema.sql first
-- Then run seed.sql (optional)
```

Files location: `database/schema.sql` and `database/seed.sql`

### Step 3: Deploy to Vercel

1. Go to https://vercel.com/
2. Sign up / Login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository: `Global-Authentic-Recipes-2.0`
5. Configure Project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Step 4: Add Environment Variables

In Vercel Project Settings → Environment Variables, add:

**Database Variables:**
```
DB_HOST = your-database-host
DB_PORT = 3306
DB_USER = your-username
DB_PASSWORD = your-password
DB_NAME = global_recipes
DATABASE_URL = mysql://username:password@host/database
```

**Application Variables:**
```
NODE_ENV = production
NEXT_PUBLIC_API_URL = https://your-app.vercel.app
```

**Authentication Variables:**
```
JWT_SECRET = [Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_EXPIRES_IN = 7d
SESSION_SECRET = [Generate another random string]
```

**File Upload Variables:**
```
UPLOAD_DIR = public/uploads
MAX_FILE_SIZE = 5242880
ALLOWED_FILE_TYPES = image/jpeg,image/png,image/webp
```

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployed URL
4. Test authentication and features

---

## Post-Deployment Checklist

- [ ] Database connected successfully
- [ ] Can create new user account
- [ ] Can login with test credentials
- [ ] Profile page loads correctly
- [ ] Forgot password works
- [ ] Super Admin dashboard accessible
- [ ] Recipes display correctly
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] Dark mode works

---

## Test Accounts (Create These After Deployment)

### Super Admin
```
Username: superadmin
Email: superadmin@globalrecipes.com
Password: [Set your own secure password]
```

### Admin
```
Username: admin
Email: admin@globalrecipes.com
Password: [Set your own secure password]
```

### Regular User
```
Username: testuser
Email: user@example.com
Password: [Set your own secure password]
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Solution:**
1. Check DATABASE_URL format
2. Verify database host is accessible
3. Check username/password
4. Ensure SSL is enabled if required
5. Check database firewall rules

### Issue: JWT Authentication Not Working

**Solution:**
1. Verify JWT_SECRET is set
2. Check JWT_SECRET is at least 32 characters
3. Clear browser localStorage
4. Try in incognito mode

### Issue: Images Not Loading

**Solution:**
1. Check UPLOAD_DIR path
2. Verify file permissions
3. Use Vercel Blob Storage for production images
4. Or use external CDN (Cloudinary, AWS S3)

### Issue: Build Failed

**Solution:**
1. Check build logs in Vercel
2. Verify all dependencies in package.json
3. Run `npm run build` locally first
4. Check for TypeScript errors
5. Verify environment variables are set

---

## Production Optimizations

### 1. Database Optimization
- Enable connection pooling
- Add database indexes
- Use prepared statements
- Monitor query performance

### 2. Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Use WebP format
- Consider CDN for images

### 3. Caching
- Enable Vercel Edge Caching
- Implement Redis for sessions
- Cache API responses
- Use SWR for client-side caching

### 4. Security
- Enable HTTPS only
- Set secure headers
- Implement rate limiting
- Add CORS configuration
- Enable CSP headers

### 5. Monitoring
- Setup Vercel Analytics
- Add error tracking (Sentry)
- Monitor database performance
- Track user analytics

---

## Optional Enhancements

### Email Service (for verification emails)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@globalrecipes.com
```

### SMS Service (for phone verification)
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### OAuth (Google/Facebook/Instagram)
```env
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### Analytics
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-analytics-id
```

---

## Database Providers Comparison

| Provider | Free Tier | Storage | Connections | SSL | Best For |
|----------|-----------|---------|-------------|-----|----------|
| PlanetScale | Yes | 5GB | 1000 | Yes | Production |
| Railway | Yes | 1GB | 100 | Yes | Small Apps |
| Aiven | Yes | 1GB | 25 | Yes | Testing |
| Supabase | Yes | 500MB | 100 | Yes | Postgres |

**Recommendation:** PlanetScale for production deployment

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **PlanetScale Docs:** https://planetscale.com/docs
- **Railway Docs:** https://docs.railway.app/

---

## Quick Deploy Command

After setting up environment variables:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

## Summary

**Minimum Required Environment Variables:**
1. Database credentials (6 variables)
2. Application URL (2 variables)
3. JWT secrets (3 variables)

**Total:** 11 environment variables minimum

**Recommended:** Add file upload settings (3 more variables)

**Optional:** OAuth, Email, SMS, Analytics (as needed)

Good luck with your deployment! 🚀
