const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();

// Validate API Key endpoint
router.post('/validate', async (req, res) => {
  try {
    const { apiKey, locationId } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required',
        valid: false
      });
    }

    if (!locationId) {
      return res.status(400).json({
        error: 'Location ID is required',
        valid: false
      });
    }

    // Validate API key format (should start with 'pit-')
    if (!apiKey.startsWith('pit-')) {
      return res.status(400).json({
        error: 'Invalid API key format. Must be a Private Integration Token (PIT)',
        valid: false
      });
    }

    // Test the API key by making a request to GHL API
    try {
      const testResponse = await axios.get('https://services.leadconnectorhq.com/locations/' + locationId, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      // Generate a session token for subsequent requests
      const sessionToken = jwt.sign(
        { 
          locationId: locationId,
          apiKeyHash: crypto.createHash('sha256').update(apiKey).digest('hex').substring(0, 16),
          timestamp: Date.now()
        },
        process.env.JWT_SECRET || 'default-secret-change-in-production',
        { expiresIn: '24h' }
      );

      res.json({
        valid: true,
        locationId: locationId,
        sessionToken: sessionToken,
        expiresIn: '24h',
        message: 'API key validated successfully'
      });

    } catch (apiError) {
      console.error('API key validation failed:', apiError.response?.data || apiError.message);
      
      if (apiError.response?.status === 401) {
        return res.status(401).json({
          error: 'Invalid API key or insufficient permissions',
          valid: false
        });
      }
      
      if (apiError.response?.status === 403) {
        return res.status(403).json({
          error: 'API key does not have required scopes',
          valid: false,
          requiredScopes: [
            'View Contacts', 'Edit Contacts',
            'View Conversations', 'Edit Conversations',
            'View Conversation Messages', 'Edit Conversation Messages',
            'View Calendars', 'Edit Calendars',
            'View Calendar Events', 'Edit Calendar Events'
          ]
        });
      }

      return res.status(400).json({
        error: 'Failed to validate API key',
        valid: false,
        details: apiError.response?.data || apiError.message
      });
    }

  } catch (error) {
    console.error('Auth validation error:', error);
    res.status(500).json({
      error: 'Internal server error during validation',
      valid: false
    });
  }
});

// Refresh session token
router.post('/refresh', (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        error: 'Session token is required'
      });
    }

    // Verify current token
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET || 'default-secret-change-in-production');
    
    // Generate new token
    const newSessionToken = jwt.sign(
      {
        locationId: decoded.locationId,
        apiKeyHash: decoded.apiKeyHash,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: '24h' }
    );

    res.json({
      sessionToken: newSessionToken,
      expiresIn: '24h',
      locationId: decoded.locationId
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Session token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid session token'
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh token'
    });
  }
});

// Get API key requirements
router.get('/requirements', (req, res) => {
  res.json({
    apiKeyFormat: 'Private Integration Token (PIT) starting with "pit-"',
    requiredScopes: [
      'View Contacts',
      'Edit Contacts',
      'View Conversations',
      'Edit Conversations', 
      'View Conversation Messages',
      'Edit Conversation Messages',
      'View Calendars',
      'Edit Calendars',
      'View Calendar Events',
      'Edit Calendar Events',
      'View Custom Fields',
      'View Locations'
    ],
    optionalScopes: [
      'View Opportunities',
      'Edit Opportunities',
      'View Payment Orders',
      'View Payment Transactions'
    ],
    instructions: {
      step1: 'Go to Settings > Private Integrations in your GoHighLevel location',
      step2: 'Click "Create New Integration"',
      step3: 'Select the required scopes listed above',
      step4: 'Copy the generated PIT token',
      step5: 'Use the token with this API for authentication'
    }
  });
});

module.exports = router;