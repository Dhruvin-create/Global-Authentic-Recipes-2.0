# 🚀 Deployment Checklist - Quick Guide

## Pre-Deployment (Do This First)

### 1. GitHub Setup ✅
```bash
# Create repository on GitHub
# Then run:
git remote add origin https://github.com/Dhruvin-create/YOUR-REPO-NAME.git
git push -u origin main
```

### 2. Database Setup (Choose One)

#### Option A: PlanetScale (Recommended)
- [ ] Create account: https://planetscale.com/
- [ ] Create database: `global-recipes`
- [ ] Get connection string
- [ ] Run `database/schema.sql` in console
- [ ] Run `database/seed.sql` in console

#### Option B: Railway
- [ ] Create account: https://railway.app/
- [ ] Provision MySQL
- [ ] Get connection details
- [ ] Run schema and seed files

---

## Vercel Deployment

### Step 1: Import Project
1. Go to: https://vercel.com/
2. Login with GitHub
3. Click "Add New..." → "Project"
4. Import `global-authentic-recipes`

### Step 2: Environment Variables

Copy-paste these in Vercel dashboard:

```env
# Database (Replace with your values)
DB_HOST=your-database-host.psdb.cloud
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=global_recipes
DB_PORT=3306

# JWT (Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-random-string
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production
```

### Step 3: Deploy
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] Get your URL: `https://your-app.vercel.app`

---

## Post-Deployment Testing

### Test 1: Homepage
- [ ] Visit: `https://your-app.vercel.app`
- [ ] Check homepage loads
- [ ] Check navigation works

### Test 2: API
- [ ] Visit: `https://your-app.vercel.app/api/cuisines`
- [ ] Should return JSON with cuisines

### Test 3: Registration
- [ ] Go to: `/signup`
- [ ] Create test account
- [ ] Check success message

### Test 4: Login
- [ ] Go to: `/login`
- [ ] Login with test account
- [ ] Verify redirect works

### Test 5: Admin Access
- [ ] Login as admin: `admin@recipes.com` / `password123`
- [ ] Check admin dashboard loads
- [ ] Verify admin features work

---

## Quick Environment Variables Generator

### Generate JWT Secret
```bash
# Run in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use as `JWT_SECRET`

---

## Common Issues & Quick Fixes

### ❌ Build Failed
**Check**: package.json dependencies
**Fix**: Make sure all imports are correct

### ❌ Database Connection Failed
**Check**: Environment variables
**Fix**: Verify DB_HOST, DB_USER, DB_PASSWORD are correct

### ❌ API Returns 500 Error
**Check**: Function logs in Vercel
**Fix**: Check database connection and queries

### ❌ Login Not Working
**Check**: JWT_SECRET is set
**Fix**: Add JWT_SECRET in environment variables

---

## Database Connection Strings

### PlanetScale Format
```
mysql://username:password@host.psdb.cloud/global-recipes?ssl={"rejectUnauthorized":true}
```

Extract values:
- DB_HOST: `host.psdb.cloud`
- DB_USER: `username`
- DB_PASSWORD: `password`
- DB_NAME: `global-recipes`
- DB_PORT: `3306`

### Railway Format
Railway gives you direct values:
- MYSQL_HOST → DB_HOST
- MYSQL_USER → DB_USER
- MYSQL_PASSWORD → DB_PASSWORD
- MYSQL_DATABASE → DB_NAME
- MYSQL_PORT → DB_PORT

---

## Test Accounts (After Seed Data)

### Super Admin
```
Username: superadmin
Email: superadmin@globalrecipes.com
Password: password123
```

### Admin
```
Username: admin
Email: admin@recipes.com
Password: password123
```

### Regular User
```
Username: user
Email: user@example.com
Password: password123
```

---

## Deployment Timeline

- ⏱️ Database Setup: 10 minutes
- ⏱️ Vercel Setup: 5 minutes
- ⏱️ First Deploy: 3 minutes
- ⏱️ Testing: 10 minutes
- **Total: ~30 minutes**

---

## Success Indicators

✅ Homepage loads without errors
✅ API endpoints return data
✅ Registration creates new users
✅ Login generates JWT tokens
✅ Admin dashboard accessible
✅ Database queries work
✅ No console errors
✅ Mobile responsive

---

## After Successful Deployment

1. **Share Your URL**: `https://your-app.vercel.app`
2. **Test All Features**: Registration, login, recipes, etc.
3. **Monitor Logs**: Check Vercel dashboard for errors
4. **Set Up Domain** (Optional): Add custom domain
5. **Enable Analytics**: Add Vercel Analytics
6. **Implement OAuth** (Optional): Follow OAUTH_INTEGRATION_GUIDE.md

---

## Need More Help?

📖 **Full Guide**: Read `VERCEL_DEPLOYMENT_GUIDE.md`
🔧 **Troubleshooting**: Check logs in Vercel dashboard
💬 **Support**: Vercel Discord or GitHub Issues

---

## Quick Commands Reference

```bash
# Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# Vercel will auto-deploy after push

# View logs (if Vercel CLI installed)
vercel logs

# Rollback deployment
# Go to Vercel dashboard → Deployments → Click previous → Promote to Production
```

---

## 🎯 Your Deployment URL

After deployment, your app will be live at:
```
https://your-app-name.vercel.app
```

You can also add a custom domain later!

---

**Last Updated**: February 20, 2026
**Status**: Ready for Deployment 🚀
