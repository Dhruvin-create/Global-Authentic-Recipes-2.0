# 🚀 Complete API Documentation - Global Authentic Recipes

## 📋 Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔑 Authentication Endpoints

### POST /api/auth/register
Create new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "authType": "email", // or "phone"
  "email": "john@example.com", // required if authType is "email"
  "phone": "+919876543210", // required if authType is "phone"
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "uuid",
    "verificationToken": "token-here", // Remove in production
    "message": "Account created successfully. Please verify your account to login."
  }
}
```

### POST /api/auth/verify
Verify user account with verification token

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account verified successfully. You can now login.",
  "data": {
    "userId": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### POST /api/auth/login
Authenticate user

**Request Body:**
```json
{
  "identifier": "john@example.com", // email or phone
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "avatar": null,
      "is_verified": true
    },
    "token": "jwt-token-here"
  }
}
```

### GET /api/auth/me
Get current user information (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "avatar": null,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### GET /api/auth/profile
Get detailed user profile with statistics (Protected)

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "profile": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "avatar": null,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T12:00:00.000Z",
      "statistics": {
        "recipesCreated": 0,
        "reviewsWritten": 5,
        "likesGiven": 25,
        "favoritesCount": 12,
        "playlistsCount": 3
      }
    }
  }
}
```

### PUT /api/auth/profile
Update user profile (Protected)

**Request Body:**
```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Updated Name",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

### POST /api/auth/change-password
Change password for authenticated user (Protected)

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### POST /api/auth/forgot-password
Send password reset token

**Request Body:**
```json
{
  "identifier": "john@example.com" // email or phone
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent successfully",
  "data": {
    "resetToken": "token-here", // Remove in production
    "message": "Password reset instructions sent to your email/phone"
  }
}
```

### POST /api/auth/reset-password
Reset password with reset token

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password.",
  "data": {
    "userId": "uuid",
    "name": "John Doe"
  }
}
```

### POST /api/auth/logout
Logout user

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully. Please remove the token from client storage."
}
```

---

## 👑 Admin Endpoints

### GET /api/admin/users
Get all users with pagination and filters (Admin only)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `role` (string): Filter by role (USER, ADMIN)
- `verified` (boolean): Filter by verification status
- `search` (string): Search in name, email, phone

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": null,
      "avatar": null,
      "role": "USER",
      "auth_provider": "EMAIL",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_login_at": "2024-01-01T12:00:00.000Z",
      "recipes_created": 0,
      "reviews_written": 5,
      "likes_given": 25,
      "favorites_count": 12,
      "playlists_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### PUT /api/admin/users
Update user role or verification status (Admin only)

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "ADMIN", // optional: USER or ADMIN
  "isVerified": true // optional: true or false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN",
      "is_verified": true
    }
  }
}
```

---

## 🍽️ Recipes Endpoints

### GET /api/recipes
Get all published recipes with pagination and filters

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `category` (string): Filter by category (BREAKFAST, LUNCH, etc.)
- `cuisine` (string): Filter by cuisine ID
- `difficulty` (string): Filter by difficulty (EASY, MEDIUM, HARD)
- `search` (string): Search in title and description
- `featured` (boolean): Show only featured recipes

**Example:**
```
GET /api/recipes?page=1&limit=10&category=DINNER&search=chicken
```

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "title": "Butter Chicken",
      "slug": "butter-chicken",
      "description": "Creamy and delicious...",
      "image": "https://example.com/image.jpg",
      "category": "MAIN_COURSE",
      "difficulty": "MEDIUM",
      "prep_time": 30,
      "cook_time": 45,
      "servings": 4,
      "calories": 450,
      "is_featured": true,
      "view_count": 1250,
      "created_at": "2024-01-01T00:00:00.000Z",
      "cuisine_name": "Indian",
      "cuisine_slug": "indian",
      "author_name": "Chef Admin",
      "like_count": 25,
      "favorite_count": 12,
      "review_count": 8,
      "avg_rating": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/recipes
Create new recipe (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Delicious Pasta",
  "description": "A wonderful pasta recipe...",
  "image": "https://example.com/pasta.jpg",
  "category": "MAIN_COURSE",
  "cuisineId": "cuisine-uuid",
  "difficulty": "EASY",
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "calories": 350,
  "isPublished": true,
  "isFeatured": false,
  "ingredients": [
    {
      "name": "Pasta",
      "quantity": "500g"
    },
    {
      "name": "Tomato Sauce",
      "quantity": "2 cups"
    }
  ],
  "instructions": [
    {
      "description": "Boil water in a large pot",
      "image": null
    },
    {
      "description": "Add pasta and cook for 10 minutes",
      "image": null
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "recipeId": "uuid",
    "slug": "delicious-pasta"
  }
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* validation errors if any */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success",
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚨 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 409 | Conflict (Duplicate) |
| 500 | Internal Server Error |

---

## 🔒 User Roles

### USER Role
- View published recipes
- Like recipes
- Add to favorites
- Write reviews
- Create playlists

### ADMIN Role
- All USER permissions
- Create/Edit/Delete recipes
- Reply to reviews
- Manage user favorites
- Publish/unpublish recipes

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "authType": "email",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "TestPass123"
  }'
```

### Get Recipes
```bash
curl -X GET "http://localhost:3000/api/recipes?page=1&limit=5"
```

### Get Current User (with token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Validation Rules

### User Registration
- **name**: 2-50 characters
- **email**: Valid email format
- **phone**: +91XXXXXXXXXX format
- **password**: Min 8 chars, uppercase, lowercase, number

### Recipe Creation
- **title**: Required, 1-255 characters
- **description**: Required
- **ingredients**: Array with at least 1 item
- **instructions**: Array with at least 1 item
- **prepTime/cookTime**: Positive integers
- **servings**: Positive integer

---

## 🔧 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=global_recipes

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

**API is ready for frontend integration! 🎉**