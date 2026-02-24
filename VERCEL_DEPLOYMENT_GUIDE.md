# Vercel Deployment Guide - Global Authentic Recipes

## 🚀 Complete Step-by-Step Deployment Guide

### Prerequisites
- ✅ GitHub repository created and code pushed
- ✅ Vercel account (free tier works fine)
- ✅ MySQL database (we'll use PlanetScale or Railway)

---

## Part 1: Database Setup (Choose One)

### Option A: PlanetScale (Recommended - Free Tier Available)

#### Step 1: Create PlanetScale Account
1. Go to: https://planetscale.com/
2. Sign up with GitHub account
3. Click "Create database"

#### Step 2: Configure Database
```
Database name: global-recipes
Region: Choose closest to your users (e.g., AWS ap-south-1 for India)
Plan: Hobby (Free)
```

#### Step 3: Get Connection String
1. Click on your database
2. Go to "Connect" tab
3. Select "Node.js" framework
4. Copy the connection string
5. It will look like:
```
mysql://username:password@host.psdb.cloud/global-recipes?ssl={"rejectUnauthorized":true}
```

#### Step 4: Run Database Schema
1. Click "Console" tab in PlanetScale
2. Copy content from `database/schema.sql`
3. Paste and execute in console
4. Then run `database/seed.sql` for initial data

### Option B: Railway (Alternative - Free Tier Available)

#### Step 1: Create Railway Account
1. Go to: https://railway.app/
2. Sign up with GitHub
3. Click "New Project"
4. Select "Provision MySQL"

#### Step 2: Get Connection Details
1. Click on MySQL service
2. Go to "Connect" tab
3. Copy these values:
   - MYSQL_HOST
   - MYSQL_PORT
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE

#### Step 3: Connect and Setup
Use MySQL client or Railway's built-in console:
```bash
# Connect to database
mysql -h MYSQL_HOST -P MYSQL_PORT -u MYSQL_USER -p

# Run schema
source database/schema.sql

# Run seed data
source database/seed.sql
```

### Option C: Aiven (Another Alternative)

1. Go to: https://aiven.io/
2. Create free MySQL database
3. Follow similar steps as above

---

## Part 2: Vercel Deployment

### Step 1: Login to Vercel
1. Go to: https://vercel.com/
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Find your repository: `global-authentic-recipes`
3. Click "Import"

### Step 3: Configure Project

#### Framework Preset
- Vercel will auto-detect: **Next.js**
- Keep default settings

#### Root Directory
- Leave as: `.` (root)

#### Build Settings (Auto-detected)
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 4: Environment Variables

Click "Environment Variables" and add these:

#### Database Configuration
```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=global_recipes
DB_PORT=3306
```

#### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
```

#### Node Environment
```env
NODE_ENV=production
```

#### Optional: OAuth (if implementing)
```env
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Vercel will show deployment progress

---

## Part 3: Post-Deployment Setup

### Step 1: Verify Deployment
1. Click on deployment URL (e.g., `your-app.vercel.app`)
2. Check homepage loads
3. Test navigation

### Step 2: Test Database Connection
Visit: `https://your-app.vercel.app/api/cuisines`

Should return JSON with cuisines data:
```json
{
  "success": true,
  "data": [...],
  "message": "Cuisines retrieved successfully"
}
```

### Step 3: Test Authentication

#### Test Registration
1. Go to: `https://your-app.vercel.app/signup`
2. Create a test account
3. Check if account is created

#### Test Login
1. Go to: `https://your-app.vercel.app/login`
2. Login with test account
3. Verify JWT token is generated

### Step 4: Run Database Migrations (if needed)

If you need to run migrations on production:

1. Use PlanetScale Console or Railway Console
2. Run migration files in order:
   ```sql
   -- Run these in order
   source database/migration-add-cuisines.sql
   source database/migration-add-super-admin.sql
   source database/migration-add-username-fields.sql
   ```

---

## Part 4: Custom Domain (Optional)

### Step 1: Add Domain
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Click "Add"
5. Enter your domain (e.g., `globalrecipes.com`)

### Step 2: Configure DNS
Add these records to your domain provider:

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Verify
- Wait 24-48 hours for DNS propagation
- Vercel will auto-issue SSL certificate
- Your site will be live at your custom domain

---

## Part 5: Continuous Deployment

### Automatic Deployments
Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel will automatically:
# 1. Detect the push
# 2. Build the project
# 3. Deploy to production
# 4. Update your live site
```

### Preview Deployments
- Every branch gets a preview URL
- Pull requests get automatic preview deployments
- Test changes before merging to main

---

## Part 6: Monitoring & Logs

### View Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click on a deployment
4. View "Build Logs" and "Function Logs"

### Monitor Performance
1. Go to "Analytics" tab
2. View:
   - Page views
   - Response times
   - Error rates
   - Geographic distribution

---

## Troubleshooting

### Issue 1: Build Fails

**Error**: "Module not found"
```bash
# Solution: Check package.json dependencies
# Make sure all imports are correct
```

**Error**: "Environment variable not found"
```bash
# Solution: Add missing environment variables in Vercel dashboard
```

### Issue 2: Database Connection Fails

**Error**: "ECONNREFUSED" or "Connection timeout"
```bash
# Solution 1: Check database host and port
# Solution 2: Verify database is running
# Solution 3: Check firewall rules (allow Vercel IPs)
# Solution 4: Use connection pooling
```

**Error**: "Too many connections"
```bash
# Solution: Reduce connection pool size in lib/database.js
# Change: connectionLimit: 5 (instead of 10)
```

### Issue 3: API Routes Not Working

**Error**: 404 on API routes
```bash
# Solution: Check file structure
# API routes must be in: app/api/[route]/route.js
```

**Error**: CORS issues
```bash
# Solution: Add CORS headers in API responses
# Already implemented in lib/api-response.js
```

### Issue 4: Authentication Issues

**Error**: "JWT verification failed"
```bash
# Solution: Make sure JWT_SECRET is same in Vercel environment variables
```

**Error**: "User not found" after deployment
```bash
# Solution: Run database seed script on production database
```

---

## Performance Optimization

### 1. Enable Edge Functions (Optional)
```javascript
// Add to API routes for faster response
export const runtime = 'edge';
```

### 2. Enable Caching
```javascript
// Add to API routes
export const revalidate = 60; // Cache for 60 seconds
```

### 3. Optimize Images
- Use Next.js Image component
- Already implemented in components

### 4. Database Connection Pooling
- Already implemented in `lib/database.js`
- Adjust pool size based on traffic

---

## Security Checklist

### Before Going Live
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set secure environment variables
- [ ] Enable rate limiting on auth endpoints
- [ ] Review CORS settings
- [ ] Test all authentication flows
- [ ] Verify database backups are enabled
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Review and update .gitignore

### After Deployment
- [ ] Test all features on production
- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors
- [ ] Test from different devices/browsers
- [ ] Verify SSL certificate
- [ ] Test OAuth flows (if implemented)
- [ ] Check database performance

---

## Scaling Considerations

### Free Tier Limits (Vercel)
- 100 GB bandwidth/month
- 100 hours serverless function execution
- Unlimited deployments
- Automatic SSL

### When to Upgrade
- High traffic (>100k visitors/month)
- Need more bandwidth
- Need team collaboration features
- Need advanced analytics

### Database Scaling
- PlanetScale: Upgrade to Scaler plan for more connections
- Railway: Upgrade for more resources
- Consider read replicas for high traffic

---

## Backup Strategy

### Database Backups
1. **PlanetScale**: Automatic daily backups
2. **Railway**: Manual backups via dashboard
3. **Custom**: Set up cron job for backups

### Code Backups
- GitHub is your backup
- Vercel keeps deployment history
- Can rollback to any previous deployment

---

## Useful Commands

### Vercel CLI (Optional)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from terminal
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

---

## Quick Reference

### Important URLs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **PlanetScale Dashboard**: https://app.planetscale.com/
- **Railway Dashboard**: https://railway.app/dashboard
- **GitHub Repository**: https://github.com/Dhruvin-create/global-authentic-recipes

### Support Resources
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- PlanetScale Docs: https://planetscale.com/docs
- Railway Docs: https://docs.railway.app/

---

## Estimated Timeline

1. **Database Setup**: 10-15 minutes
2. **Vercel Configuration**: 5-10 minutes
3. **First Deployment**: 3-5 minutes
4. **Testing**: 10-15 minutes
5. **Custom Domain** (optional): 24-48 hours for DNS

**Total**: ~30-45 minutes (excluding domain setup)

---

## Cost Breakdown

### Free Tier (Recommended for Start)
- **Vercel**: Free (100 GB bandwidth)
- **PlanetScale**: Free (5 GB storage, 1 billion row reads)
- **Total**: $0/month

### Paid Tier (For Production)
- **Vercel Pro**: $20/month
- **PlanetScale Scaler**: $29/month
- **Total**: ~$49/month

---

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Implement OAuth (follow OAUTH_INTEGRATION_GUIDE.md)
5. ✅ Set up email service for verification
6. ✅ Add analytics (Google Analytics, Vercel Analytics)
7. ✅ Create user documentation
8. ✅ Set up feedback system
9. ✅ Plan marketing strategy
10. ✅ Monitor and optimize performance

---

## Success Checklist

After deployment, verify:
- [ ] Homepage loads correctly
- [ ] All pages are accessible
- [ ] Registration works
- [ ] Login works
- [ ] JWT tokens are generated
- [ ] Database queries work
- [ ] API endpoints respond
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] No console errors
- [ ] Admin dashboard accessible
- [ ] Super admin dashboard accessible

---

## 🎉 Congratulations!

Your Global Authentic Recipes application is now live on Vercel!

**Share your live URL**: `https://your-app.vercel.app`

Need help? Check the troubleshooting section or reach out to Vercel support.

Happy deploying! 🚀
