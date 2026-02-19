# Quick Reference - Authentication System V2

## 🚀 What Changed?

### Before (Old System)
- ❌ No username support
- ❌ Must choose email OR phone (not both)
- ❌ Single name field
- ❌ No OAuth support
- ❌ Login only with email or phone

### After (New System)
- ✅ Username required (unique identifier)
- ✅ Email and phone both optional (but need at least one)
- ✅ First name + last name fields
- ✅ OAuth framework ready (Google, Facebook, Instagram)
- ✅ Login with username, email, OR phone

## 📝 Registration Form Fields

### Required Fields
- Username (3-50 chars, alphanumeric + underscore)
- First Name (2-100 chars)
- Last Name (2-100 chars)
- Password (8+ chars)

### Optional Fields (Need at least one)
- Email
- Phone (+91XXXXXXXXXX format)

## 🔐 Login Options

Users can login with ANY of these:
1. Username + password
2. Email + password
3. Phone + password

## 🗄️ Database Migration

### Run Migration
```bash
node run-username-migration.js
```

### Rollback (if needed)
```bash
# Execute: database/rollback-username-fields.sql
```

## 🧪 Test Credentials

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

## 📡 API Endpoints

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "johndoe",  # or email or phone
  "password": "password123"
}
```

## 🎨 UI Pages

### Signup Page
- URL: `/signup`
- Features: OAuth buttons, username field, name fields, optional email/phone

### Login Page
- URL: `/login`
- Features: OAuth buttons, single identifier field (username/email/phone)

## 📚 Documentation Files

1. **AUTHENTICATION_SYSTEM_V2.md** - Complete system documentation
2. **REGISTRATION_REDESIGN_COMPLETE.md** - Implementation details
3. **OAUTH_INTEGRATION_GUIDE.md** - OAuth setup guide
4. **QUICK_REFERENCE.md** - This file

## ⚡ Quick Commands

### Start Development Server
```bash
npm run dev
```

### Test Registration
```bash
node test-new-registration.js
```

### Check Database
```bash
node list-users.js
```

## 🔧 Files Modified

### Backend
- `lib/auth.js` - Added username support
- `app/api/auth/register/route.js` - New validation rules

### Frontend
- `app/signup/page.js` - Complete redesign
- `app/login/page.js` - Added OAuth buttons

### Database
- `database/migration-add-username-fields.sql` - New fields
- `run-username-migration.js` - Migration script

## ✅ Migration Status

- ✅ Database schema updated
- ✅ All existing users migrated
- ✅ Usernames generated for existing users
- ✅ Registration form redesigned
- ✅ Login form updated
- ✅ API endpoints updated
- ✅ Authentication library updated
- ✅ OAuth framework ready

## 🎯 Next Steps

### To Use OAuth
1. Read `OAUTH_INTEGRATION_GUIDE.md`
2. Install NextAuth.js
3. Get OAuth credentials
4. Configure providers
5. Test OAuth flow

### To Test
1. Start dev server: `npm run dev`
2. Visit `/signup`
3. Create test account
4. Try logging in with username
5. Try logging in with email

## 💡 Key Points

1. **Username is now required** - Every user must have a unique username
2. **Email/Phone flexible** - Users can have both, or just one
3. **Login is flexible** - Accept username, email, or phone
4. **OAuth ready** - UI and database ready, just need to configure providers
5. **Backward compatible** - All existing users work with new system

## 🆘 Common Issues

### "Username already exists"
- Choose a different username

### "At least one of email or phone is required"
- Provide email or phone (or both)

### "User not found"
- Check spelling of username/email/phone

### OAuth shows "coming soon"
- OAuth not yet configured, follow integration guide

## 📞 Need Help?

Check these files in order:
1. This file (QUICK_REFERENCE.md)
2. AUTHENTICATION_SYSTEM_V2.md
3. REGISTRATION_REDESIGN_COMPLETE.md
4. OAUTH_INTEGRATION_GUIDE.md

---

**Last Updated**: February 20, 2026
**Version**: 2.0
**Status**: ✅ Complete and Ready
