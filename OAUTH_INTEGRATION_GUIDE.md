# OAuth Integration Guide

## Overview
This guide explains how to integrate OAuth authentication (Google, Facebook, Instagram) into the Global Authentic Recipes application.

## Current Status
✅ Database schema updated with OAuth fields
✅ UI components ready with OAuth buttons
⏳ OAuth provider integration (NextAuth.js) - TO BE IMPLEMENTED

## Database Schema
The `users` table now includes:
- `oauth_provider` - VARCHAR(50): Provider name (google, facebook, instagram)
- `oauth_id` - VARCHAR(255): Unique ID from OAuth provider
- `oauth_access_token` - TEXT: Access token from provider
- `oauth_refresh_token` - TEXT: Refresh token for token renewal

## Implementation Steps

### 1. Install NextAuth.js
```bash
npm install next-auth
```

### 2. Create OAuth Provider Configurations

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret

#### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook` (development)
   - `https://yourdomain.com/api/auth/callback/facebook` (production)
5. Copy App ID and App Secret

#### Instagram OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/) (Instagram uses Facebook OAuth)
2. Create a new app or use existing
3. Add Instagram Basic Display product
4. Configure OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/instagram` (development)
   - `https://yourdomain.com/api/auth/callback/instagram` (production)
5. Copy Client ID and Client Secret

### 3. Environment Variables
Add to `.env.local`:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
```

### 4. Create NextAuth API Route
Create `app/api/auth/[...nextauth]/route.js`:

```javascript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import InstagramProvider from 'next-auth/providers/instagram';
import { executeQuery } from '@/lib/database';
import { generateToken } from '@/lib/auth';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists with this OAuth provider
        const existingUsers = await executeQuery(
          'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
          [account.provider, account.providerAccountId]
        );

        if (existingUsers.length > 0) {
          // Update tokens
          await executeQuery(
            'UPDATE users SET oauth_access_token = ?, oauth_refresh_token = ?, last_login_at = NOW() WHERE id = ?',
            [account.access_token, account.refresh_token, existingUsers[0].id]
          );
          return true;
        }

        // Create new user
        const userId = crypto.randomUUID();
        const username = profile.email?.split('@')[0] || `user_${Date.now()}`;
        const firstName = profile.given_name || profile.name?.split(' ')[0] || 'User';
        const lastName = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '';
        const name = `${firstName} ${lastName}`;

        await executeQuery(
          `INSERT INTO users (
            id, username, email, name, first_name, last_name, 
            avatar, role, oauth_provider, oauth_id, 
            oauth_access_token, oauth_refresh_token, 
            is_verified, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'USER', ?, ?, ?, ?, TRUE, NOW())`,
          [
            userId,
            username,
            profile.email,
            name,
            firstName,
            lastName,
            profile.picture || profile.image,
            account.provider,
            account.providerAccountId,
            account.access_token,
            account.refresh_token
          ]
        );

        return true;
      } catch (error) {
        console.error('OAuth sign in error:', error);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        // Get user from database
        const dbUsers = await executeQuery(
          'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
          [account.provider, account.providerAccountId]
        );

        if (dbUsers.length > 0) {
          const dbUser = dbUsers[0];
          token.userId = dbUser.id;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.customToken = await generateToken({
            userId: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.username = token.username;
      session.user.role = token.role;
      session.customToken = token.customToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});

export { handler as GET, handler as POST };
```

### 5. Update Login/Signup Pages
Replace the placeholder OAuth handlers:

```javascript
import { signIn } from 'next-auth/react';

const handleOAuthLogin = (provider) => {
  signIn(provider.toLowerCase(), { callbackUrl: '/' });
};
```

### 6. Update Auth Context
Add OAuth session handling to `lib/auth-context.js`:

```javascript
import { useSession } from 'next-auth/react';

// In AuthProvider component
const { data: session } = useSession();

useEffect(() => {
  if (session?.customToken) {
    // Store custom JWT token
    localStorage.setItem('token', session.customToken);
    setUser(session.user);
    setIsAuthenticated(true);
  }
}, [session]);
```

## Testing OAuth Integration

### Development Testing
1. Start the development server: `npm run dev`
2. Navigate to `/signup` or `/login`
3. Click on OAuth provider button
4. Complete OAuth flow
5. Verify user is created in database
6. Check that JWT token is stored in localStorage

### Production Checklist
- [ ] Update OAuth redirect URIs to production domain
- [ ] Set production environment variables
- [ ] Test OAuth flow on production
- [ ] Verify SSL/HTTPS is enabled
- [ ] Test token refresh mechanism
- [ ] Implement OAuth token revocation on logout

## Security Considerations

1. **Token Storage**: OAuth tokens are stored in database, not exposed to client
2. **HTTPS Required**: OAuth requires HTTPS in production
3. **Token Refresh**: Implement token refresh mechanism for long-lived sessions
4. **Scope Permissions**: Request only necessary permissions from OAuth providers
5. **Error Handling**: Implement proper error handling for OAuth failures

## Additional Features to Implement

1. **Account Linking**: Allow users to link multiple OAuth providers to one account
2. **Profile Sync**: Sync profile picture and name from OAuth provider
3. **Token Refresh**: Implement automatic token refresh
4. **Revoke Access**: Allow users to revoke OAuth access
5. **Privacy Settings**: Let users control what data is synced from OAuth providers

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)

## Support

For issues or questions about OAuth integration, refer to:
- NextAuth.js GitHub Issues
- Provider-specific documentation
- Project documentation in `REGISTRATION_REQUIREMENTS.md`
