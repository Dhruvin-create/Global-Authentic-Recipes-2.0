# Vercel Environment Variables - Quick Reference

## Copy-Paste Ready Template

### REQUIRED (11 Variables)

```env
# Database Configuration
DB_HOST=your-database-host.psdb.cloud
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=global_recipes
DATABASE_URL=mysql://username:password@host.psdb.cloud/global_recipes?ssl={"rejectUnauthorized":true}

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app

# Authentication (Generate random 32+ character strings)
JWT_SECRET=paste-generated-secret-here
JWT_EXPIRES_IN=7d
SESSION_SECRET=paste-another-generated-secret-here
```

### RECOMMENDED (3 Variables)

```env
# File Upload
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

---

## Generate Secrets

### Method 1: Node.js (Run in terminal)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 2: OpenSSL (Run in terminal)
```bash
openssl rand -hex 32
```

### Method 3: Online
Visit: https://randomkeygen.com/ (Use "CodeIgniter Encryption Keys")

---

## Database Setup Options

### Option 1: PlanetScale (Recommended)
1. Visit: https://planetscale.com/
2. Create account
3. Create database: `global-recipes`
4. Get connection string from "Connect" button
5. Copy to Vercel environment variables

### Option 2: Railway
1. Visit: https://railway.app/
2. Create account
3. New Project → Add MySQL
4. Copy connection details

### Option 3: Aiven
1. Visit: https://aiven.io/
2. Create account
3. Create MySQL service
4. Copy connection details

---

## Vercel Deployment Steps

1. **Push to GitHub** ✅ (Already done)

2. **Go to Vercel**
   - Visit: https://vercel.com/
   - Login with GitHub

3. **Import Project**
   - Click "Add New Project"
   - Select: `Global-Authentic-Recipes-2.0`

4. **Add Environment Variables**
   - Go to: Settings → Environment Variables
   - Add all variables from above
   - Apply to: Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build
   - Visit your URL

---

## After Deployment

### 1. Update API URL
After first deployment, update this variable:
```env
NEXT_PUBLIC_API_URL=https://your-actual-vercel-url.vercel.app
```

### 2. Redeploy
Click "Redeploy" in Vercel dashboard

### 3. Test
- Create account
- Login
- Test all features

---

## Common Issues & Quick Fixes

### Database Connection Error
```
❌ Error: connect ETIMEDOUT
✅ Fix: Check DB_HOST and DATABASE_URL are correct
```

### JWT Error
```
❌ Error: jwt malformed
✅ Fix: Ensure JWT_SECRET is set and 32+ characters
```

### Build Error
```
❌ Error: Module not found
✅ Fix: Run 'npm install' and push package-lock.json
```

### Images Not Loading
```
❌ Error: 404 on images
✅ Fix: Use Vercel Blob or external CDN for production
```

---

## Environment Variables Checklist

- [ ] DB_HOST
- [ ] DB_PORT
- [ ] DB_USER
- [ ] DB_PASSWORD
- [ ] DB_NAME
- [ ] DATABASE_URL
- [ ] NODE_ENV
- [ ] NEXT_PUBLIC_API_URL
- [ ] JWT_SECRET (32+ chars)
- [ ] JWT_EXPIRES_IN
- [ ] SESSION_SECRET (32+ chars)
- [ ] UPLOAD_DIR (optional)
- [ ] MAX_FILE_SIZE (optional)
- [ ] ALLOWED_FILE_TYPES (optional)

---

## Need Help?

1. Check Vercel build logs
2. Check browser console
3. Check database connection
4. Verify all environment variables are set
5. Try redeploying

---

## Quick Commands

```bash
# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Install Vercel CLI
npm i -g vercel

# Deploy from terminal
vercel --prod

# Check logs
vercel logs
```

---

## Summary

**Minimum Setup:**
- 11 environment variables
- 1 production database
- 2 generated secrets

**Time Required:**
- Database setup: 5-10 minutes
- Vercel deployment: 5 minutes
- Total: ~15 minutes

**Cost:**
- Vercel: Free (Hobby plan)
- PlanetScale: Free (5GB)
- Total: $0/month

🚀 Ready to deploy!
