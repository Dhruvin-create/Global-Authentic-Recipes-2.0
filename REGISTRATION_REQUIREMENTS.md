# 📋 New Registration System Requirements

## Current Status
- ❌ Registration not working properly
- ❌ Simple name field only
- ❌ Email OR Phone required (not optional)
- ❌ No username field
- ❌ No OAuth integration

## Requested Features

### 1. Registration Form Fields
- ✅ **First Name** (Required)
- ✅ **Last Name** (Required)
- ✅ **Username** (Required, Unique)
- ✅ **Email** (Optional but one of Email/Phone required)
- ✅ **Phone** (Optional but one of Email/Phone required)
- ✅ **Password** (Required)
- ✅ **Confirm Password** (Required)

### 2. Login Options
User can login with ANY of these:
- Username + Password
- Email + Password
- Phone + Password

### 3. OAuth Integration
Social login options:
- 🔵 Google Sign In
- 🔵 Facebook Login
- 🟣 Instagram Login

## Implementation Plan

### Phase 1: Database Schema Update
```sql
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER name;
ALTER TABLE users ADD COLUMN first_name VARCHAR(50) AFTER username;
ALTER TABLE users ADD COLUMN last_name VARCHAR(50) AFTER first_name;
ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL;
ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL;
```

### Phase 2: Registration API Update
- Accept first_name, last_name, username
- Make email/phone optional (but at least one required)
- Validate username uniqueness
- Update createUser function

### Phase 3: Login API Update
- Check username first
- If not username, check email
- If not email, check phone
- Authenticate with password

### Phase 4: OAuth Integration
- Install next-auth package
- Configure Google OAuth
- Configure Facebook OAuth
- Configure Instagram OAuth
- Create OAuth callback routes

### Phase 5: UI Updates
- Redesign registration form
- Update login form with username option
- Add social login buttons
- Update validation logic

## Estimated Time
- Phase 1: 30 minutes
- Phase 2: 1 hour
- Phase 3: 45 minutes
- Phase 4: 2-3 hours (OAuth setup)
- Phase 5: 1.5 hours

**Total: 5-6 hours for complete implementation**

## Quick Fix (Current Issue)
For now, let me fix the current registration so it at least works with the existing schema.

## Decision Required
Do you want:
1. **Quick Fix**: Fix current registration (15 minutes)
2. **Full Implementation**: Complete redesign with all features (5-6 hours)

Please confirm which approach you prefer.
