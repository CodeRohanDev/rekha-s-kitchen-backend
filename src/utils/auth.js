const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthUtils {
  // Hash password
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT tokens (never expire)
  static generateTokens(payload) {
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

    // Remove expiresIn to make tokens never expire
    const accessToken = jwt.sign(payload, accessTokenSecret, {
      issuer: 'rekhas-kitchen',
      audience: 'rekhas-kitchen-users'
    });

    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      issuer: 'rekhas-kitchen',
      audience: 'rekhas-kitchen-users'
    });

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  static verifyToken(token, isRefreshToken = false) {
    const secret = isRefreshToken 
      ? (process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key')
      : (process.env.JWT_ACCESS_SECRET || 'your-access-secret-key');

    return jwt.verify(token, secret, {
      issuer: 'rekhas-kitchen',
      audience: 'rekhas-kitchen-users'
    });
  }

  // Generate random password for staff
  static generateRandomPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // Extract user ID from token
  static getUserIdFromToken(token) {
    try {
      const decoded = this.verifyToken(token);
      return decoded.userId;
    } catch (error) {
      return null;
    }
  }

  // Generate random string for IDs
  static generateRandomString(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

module.exports = AuthUtils;