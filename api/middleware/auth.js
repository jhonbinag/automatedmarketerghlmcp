const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

// Validate API Key format and basic structure
const validateApiKey = (apiKey) => {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  if (typeof apiKey !== 'string') {
    return { valid: false, error: 'API key must be a string' };
  }

  if (!apiKey.startsWith('pit-')) {
    return { valid: false, error: 'Invalid API key format. Must be a Private Integration Token (PIT)' };
  }

  if (apiKey.length < 10) {
    return { valid: false, error: 'API key appears to be too short' };
  }

  return { valid: true };
};

// Authenticate request middleware
const authenticateRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = req.headers['x-session-token'];
    const apiKey = req.headers['x-api-key'];

    // Method 1: Session token authentication (preferred)
    if (sessionToken) {
      try {
        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET || 'default-secret-change-in-production');
        req.locationId = decoded.locationId;
        req.apiKeyHash = decoded.apiKeyHash;
        req.authenticated = true;
        return next();
      } catch (tokenError) {
        // Token invalid, fall through to other methods
        console.log('Session token invalid:', tokenError.message);
      }
    }

    // Method 2: Direct API key in header
    if (apiKey) {
      const validation = validateApiKey(apiKey);
      if (!validation.valid) {
        return res.status(400).json({
          error: validation.error
        });
      }

      req.apiKey = apiKey;
      req.authenticated = true;
      return next();
    }

    // Method 3: Bearer token (API key)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const validation = validateApiKey(token);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: validation.error
        });
      }

      req.apiKey = token;
      req.authenticated = true;
      return next();
    }

    // No valid authentication found
    return res.status(401).json({
      error: 'Authentication required',
      methods: [
        'Session token in x-session-token header',
        'API key in x-api-key header',
        'API key in Authorization: Bearer header'
      ]
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
};

// Validate API key against GoHighLevel API
const validateApiKeyWithGHL = async (apiKey, locationId) => {
  try {
    const response = await axios.get(`https://services.leadconnectorhq.com/locations/${locationId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return {
      valid: true,
      locationData: response.data
    };
  } catch (error) {
    console.error('GHL API validation error:', error.response?.data || error.message);
    
    return {
      valid: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map();

const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, timestamps] of rateLimitMap.entries()) {
      rateLimitMap.set(key, timestamps.filter(time => time > windowStart));
      if (rateLimitMap.get(key).length === 0) {
        rateLimitMap.delete(key);
      }
    }

    // Check current requests
    const requests = rateLimitMap.get(identifier) || [];
    const recentRequests = requests.filter(time => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        maxRequests,
        windowMs,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    rateLimitMap.set(identifier, recentRequests);

    next();
  };
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

module.exports = {
  validateApiKey,
  authenticateRequest,
  validateApiKeyWithGHL,
  rateLimit,
  securityHeaders
};