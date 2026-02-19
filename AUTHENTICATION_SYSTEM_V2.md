# Authentication System V2 - Complete Documentation

## 🎯 Overview
Complete redesign of the authentication system with username support, flexible contact methods, and OAuth integration framework.

## ✅ What's New

### 1. Username-Based Authentication
- Every user now has a unique username
- Login with username, email, OR phone number
- Username format: 3-50 characters, alphanumeric + underscore
- Auto-converted to lowercase for consistency

### 2. Flexible Contact Information
- Email is now optional
- Phone is now optional
- At least one of email or phone must be provided
- Users can have both email and phone
- No more forced choice between email OR phone

### 3. Enhanced Name Fields
- Separate first name and last name fields
- Better for personalization and display
- Full name automatically generated from first + last

### 4. OAuth Integration Ready
- Database schema supports OAuth providers
- UI components ready with OAuth buttons
- Google, Facebook, Instagram integration framework
- Complete implementation guide provided

### 5. Improved User Experience
- Professional gradient UI design
- Real-time validation feedback
- Clear error messages
- Password visibility toggle
- Responsive design for all devices

## 📊 Database Changes

### New Fields in `users` Table
```sql
username VARCHAR(50) UNIQUE NOT NULL
first_name VARCHAR(100)
last_name VARCHAR(100)
oauth_provider VARCHAR(50)
oauth_id VARCHAR(255)
oauth_access_token TEXT
oauth_refresh_token TEXT
```

### Updated Constraints
- Email and phone are now nullable
- At least one of email or phone must be provided
- Username must be unique
- OAuth provider + ID combination must be unique

### Indexes Added
- `idx_username` - Fast username lookups
- `idx_first_name` - Name-based searches
- `idx_last_name` - Name-based searches
- `idx_oauth_provider` - OAuth filtering
- `idx_oauth_provider_id` - Unique OAuth accounts

## 🔐 Authentication Methods

### Method 1: Username + Password
```javascript
POST /api/auth/login
{
  "identifier": "johndoe",
  "password": "password123"
}
```

### Method 2: Email + Password
```javascript
POST /api/auth/login
{
  "identifier": "john@example.com",
  "password": "password123"
}
```

### Method 3: Phone + Password
```javascript
POST /api/auth/login
{
  "identifier": "+919876543210",
  "password": "password123"
}
```

### Method 4: OAuth (Coming Soon)
- Google OAuth
- Facebook OAuth
- Instagram OAuth

## 📝 Registration Flow

### Step 1: User Visits Signup Page
- URL: `/signup`
- Professional UI with OAuth buttons
- Clear form with validation

### Step 2: Choose Registration Method

#### Option A: OAuth (UI Ready)
- Click Google/Facebook/Instagram button
- Redirect to provider
- Automatic account creation
- Instant login

#### Option B: Manual Registration
- Fill out form:
  - Username (required)
  - First name (required)
  - Last name (required)
  - Email (optional)
  - Phone (optional)
  - Password (required)
  - Confirm password (required)

### Step 3: Validation
- Username: 3-50 chars, alphanumeric + underscore
- First/Last name: 2-100 chars each
- Email: Valid email format (if provided)
- Phone: +91XXXXXXXXXX format (if provided)
- Password: Minimum 8 characters
- At least one of email or phone must be provided

### Step 4: Account Creation
- User record created in database
- Verification token generated
- Success message displayed
- Redirect to login page

### Step 5: Verification (Future)
- Email verification link sent
- Phone OTP sent
- User verifies account
- Account activated

## 🔑 Login Flow

### Step 1: User Visits Login Page
- URL: `/login`
- OAuth buttons displayed
- Manual login form available

### Step 2: Enter Credentials
- Single identifier field accepts:
  - Username
  - Email
  - Phone number
- Password field

### Step 3: Authentication
- System checks username first
- Then checks email
- Then checks phone
- Password verified with bcrypt
- Account verification checked

### Step 4: Token Generation
- JWT token created with:
  - User ID
  - Username
  - Email
  - Phone
  - Name
  - Role
- Token stored in localStorage
- Token expires in 7 days

### Step 5: Role-Based Redirect
- SUPER_ADMIN → `/super-admin/dashboard`
- ADMIN → `/admin/dashboard`
- USER → `/` (homepage)

## 🎨 UI Components

### Signup Page (`/signup`)
```
┌─────────────────────────────────────┐
│     Global Recipes Logo             │
│     Create your account             │
├─────────────────────────────────────┤
│  [Continue with Google]             │
│  [Facebook] [Instagram]             │
│  ─────── Or sign up with ───────    │
│                                     │
│  Username: [johndoe]                │
│  First Name: [John]  Last: [Doe]    │
│  Email: [john@example.com]          │
│  Phone: [+919876543210]             │
│  Password: [••••••••]               │
│  Confirm: [••••••••]                │
│                                     │
│  [Create Account]                   │
│                                     │
│  Already have an account? Sign in   │
└─────────────────────────────────────┘
```

### Login Page (`/login`)
```
┌─────────────────────────────────────┐
│     Global Recipes Logo             │
│     Sign in to your account         │
├─────────────────────────────────────┤
│  [Continue with Google]             │
│  [Facebook] [Instagram]             │
│  ─────── Or continue with ──────    │
│                                     │
│  Username, Email or Phone:          │
│  [johndoe]                          │
│                                     │
│  Password: [••••••••]               │
│  Forgot password?                   │
│                                     │
│  [Sign In]                          │
│                                     │
│  Don't have an account? Sign up     │
└─────────────────────────────────────┘
```

## 🧪 Testing

### Test Existing Users
All existing users have been migrated with generated usernames:

1. **Super Admin**
   ```
   Username: superadmin
   Email: superadmin@globalrecipes.com
   Password: password123
   ```

2. **Admin**
   ```
   Username: admin
   Email: admin@recipes.com
   Password: password123
   ```

3. **Regular User**
   ```
   Username: user
   Email: user@example.com
   Password: password123
   ```

### Test New Registration
Run the test script:
```bash
node test-new-registration.js
```

Or manually test:
1. Visit `http://localhost:3000/signup`
2. Fill out the form
3. Submit
4. Check database for new user
5. Try logging in with username

### Test Login Methods
Try logging in with:
- Username: `superadmin`
- Email: `superadmin@globalrecipes.com`
- Phone: `+919876543210` (for phone users)

All should work with the same password.

## 📚 API Documentation

### Register User
```
POST /api/auth/register

Request Body:
{
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",     // Optional
  "phone": "+919876543210",        // Optional
  "password": "password123"
}

Success Response (201):
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "uuid",
    "username": "johndoe",
    "verificationToken": "token",
    "message": "Account created successfully..."
  }
}

Error Response (400):
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "username": "Username already exists"
  }
}
```

### Login User
```
POST /api/auth/login

Request Body:
{
  "identifier": "johndoe",  // username, email, or phone
  "password": "password123"
}

Success Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "jwt-token-here"
  }
}

Error Response (401):
{
  "success": false,
  "message": "Invalid credentials"
}
```

## 🔒 Security Features

### Password Security
- Bcrypt hashing with 12 rounds
- Minimum 8 characters required
- No maximum length limit
- Passwords never stored in plain text

### Token Security
- JWT tokens signed with HS256
- 7-day expiration
- Includes user ID, username, email, role
- Stored in localStorage (client-side)
- Verified on every protected route

### Input Validation
- All inputs sanitized before database insertion
- SQL injection protection via parameterized queries
- XSS protection via input sanitization
- CSRF protection via token validation

### Database Security
- Unique constraints on username, email, phone
- Indexes for fast lookups
- Connection pooling for performance
- Prepared statements for all queries

## 🚀 Deployment Checklist

### Before Deployment
- [ ] Update environment variables
- [ ] Set strong JWT secret
- [ ] Configure OAuth credentials (if using)
- [ ] Test all authentication flows
- [ ] Verify database migrations
- [ ] Check SSL/HTTPS configuration
- [ ] Test password reset flow
- [ ] Verify email/SMS services

### Production Environment Variables
```env
# Database
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-strong-db-password
DB_NAME=global_recipes

# JWT
JWT_SECRET=your-very-strong-jwt-secret-key
JWT_EXPIRES_IN=7d

# OAuth (if using)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
```

## 📖 Additional Documentation

- `REGISTRATION_REDESIGN_COMPLETE.md` - Complete implementation details
- `OAUTH_INTEGRATION_GUIDE.md` - OAuth setup guide
- `REGISTRATION_REQUIREMENTS.md` - Original requirements
- `API_DOCUMENTATION.md` - Full API reference
- `DATABASE_STRUCTURE.md` - Database schema details

## 🎯 Future Enhancements

### Phase 1 (Immediate)
- [ ] Email verification system
- [ ] Phone OTP verification
- [ ] Password reset flow
- [ ] Account activation emails

### Phase 2 (Short-term)
- [ ] OAuth integration (Google, Facebook, Instagram)
- [ ] Profile picture upload
- [ ] Account settings page
- [ ] Password strength meter

### Phase 3 (Long-term)
- [ ] Two-factor authentication
- [ ] Social profile sync
- [ ] Account linking (multiple OAuth providers)
- [ ] Login history tracking
- [ ] Security alerts
- [ ] Session management

## 💡 Tips & Best Practices

### For Users
1. Choose a unique, memorable username
2. Use a strong password (8+ characters)
3. Provide both email and phone for account recovery
4. Verify your account after registration
5. Keep your password secure

### For Developers
1. Always validate input on both client and server
2. Use parameterized queries to prevent SQL injection
3. Hash passwords with bcrypt (never store plain text)
4. Implement rate limiting on auth endpoints
5. Log authentication attempts for security monitoring
6. Use HTTPS in production
7. Rotate JWT secrets periodically
8. Implement proper error handling
9. Test all authentication flows thoroughly
10. Keep dependencies updated

## 🆘 Troubleshooting

### Registration Issues
**Problem**: "Username already exists"
- Solution: Choose a different username

**Problem**: "At least one of email or phone is required"
- Solution: Provide either email or phone number

**Problem**: "Password must be at least 8 characters"
- Solution: Use a longer password

### Login Issues
**Problem**: "User not found"
- Solution: Check username/email/phone spelling

**Problem**: "Invalid password"
- Solution: Verify password is correct

**Problem**: "Please verify your account first"
- Solution: Check email/phone for verification link

### OAuth Issues
**Problem**: OAuth buttons show "coming soon"
- Solution: OAuth integration not yet implemented, follow `OAUTH_INTEGRATION_GUIDE.md`

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error messages carefully
3. Check browser console for errors
4. Verify database connection
5. Check server logs
6. Review API responses

## ✨ Conclusion

The authentication system has been completely redesigned with modern features, better security, and improved user experience. All existing users have been migrated successfully, and new users can register with the enhanced system.

The OAuth integration framework is ready and can be implemented by following the guide in `OAUTH_INTEGRATION_GUIDE.md`.

Happy coding! 🚀
