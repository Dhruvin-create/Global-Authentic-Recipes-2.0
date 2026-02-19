import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { executeQuery } from './database.js';


// JWT configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Password hashing
async function hashPassword(password) {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

// Password verification
async function verifyPassword(password, hashedPassword) {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

// Generate JWT token
async function generateToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

// Verify JWT token
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// Get user by email
async function getUserByEmail(email) {
  try {
    const users = await executeQuery(
      'SELECT id, username, email, phone, password, name, first_name, last_name, avatar, role, is_verified FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  } catch (error) {
    throw new Error(`Failed to get user by email: ${error.message}`);
  }
}

// Get user by phone
async function getUserByPhone(phone) {
  try {
    const users = await executeQuery(
      'SELECT id, username, email, phone, password, name, first_name, last_name, avatar, role, is_verified FROM users WHERE phone = ?',
      [phone]
    );
    return users[0] || null;
  } catch (error) {
    throw new Error(`Failed to get user by phone: ${error.message}`);
  }
}

// Get user by username
async function getUserByUsername(username) {
  try {
    const users = await executeQuery(
      'SELECT id, username, email, phone, password, name, first_name, last_name, avatar, role, is_verified FROM users WHERE username = ?',
      [username]
    );
    return users[0] || null;
  } catch (error) {
    throw new Error(`Failed to get user by username: ${error.message}`);
  }
}

// Get user by ID
async function getUserById(userId) {
  try {
    const users = await executeQuery(
      'SELECT id, username, email, phone, name, first_name, last_name, avatar, role, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );
    return users[0] || null;
  } catch (error) {
    throw new Error(`Failed to get user by ID: ${error.message}`);
  }
}

// Create new user
async function createUser({ username, email, phone, password, firstName, lastName, authProvider = null }) {
  try {
    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();
    const verificationToken = generateVerificationToken();
    const name = `${firstName} ${lastName}`;

    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await getUserByEmail(email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await getUserByPhone(phone);
      if (existingPhone) {
        throw new Error('Phone number already exists');
      }
    }

    await executeQuery(
      `INSERT INTO users (id, username, email, phone, password, name, first_name, last_name, role, auth_provider, is_verified, verification_token, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USER', ?, FALSE, ?, NOW())`,
      [userId, username, email, phone, hashedPassword, name, firstName, lastName, authProvider, verificationToken]
    );

    return { userId, verificationToken };
  } catch (error) {
    if (error.message.includes('Duplicate entry')) {
      throw new Error('User already exists with this username, email or phone');
    }
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

// Update user login timestamp
async function updateLastLogin(userId) {
  try {
    await executeQuery(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [userId]
    );
  } catch (error) {
    console.error('Failed to update last login:', error.message);
    // Don't throw error as this is not critical
  }
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (Indian format)
function isValidPhone(phone) {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// Validate password strength
function isValidPassword(password) {
  // At least 8 characters
  return password && password.length >= 8;
}

// Validate username format
function isValidUsername(username) {
  // 3-50 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
}

// Generate verification token
function generateVerificationToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

// Authenticate user (login)
async function authenticateUser(identifier, password) {
  try {
    let user;

    // Try to find user by username, email, or phone
    if (isValidEmail(identifier)) {
      user = await getUserByEmail(identifier);
    } else if (isValidPhone(identifier)) {
      user = await getUserByPhone(identifier);
    } else {
      // Try username
      user = await getUserByUsername(identifier);
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Check if user is verified
    if (!user.is_verified) {
      throw new Error('Please verify your account first');
    }

    // Update last login
    await updateLastLogin(user.id);

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role
    });

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };

  } catch (error) {
    console.error(`Authentication error for ${identifier}: ${error.message}`);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}


// Middleware to verify authentication
async function requireAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization header');
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    // Get fresh user data
    const user = await getUserById(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(`Authentication required: ${error.message}`);
  }
}

// Middleware to require admin role (ADMIN or SUPER_ADMIN)
async function requireAdmin(request) {
  try {
    const user = await requireAuth(request);

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Admin access required');
    }

    return user;
  } catch (error) {
    throw new Error(`Admin access required: ${error.message}`);
  }
}

// Middleware to require super admin role (SUPER_ADMIN only)
async function requireSuperAdmin(request) {
  try {
    const user = await requireAuth(request);

    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Super Admin access required');
    }

    return user;
  } catch (error) {
    throw new Error(`Super Admin access required: ${error.message}`);
  }
}

export {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  getUserByEmail,
  getUserByPhone,
  getUserByUsername,
  getUserById,
  createUser,
  authenticateUser,
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidUsername,
  generateVerificationToken
};

