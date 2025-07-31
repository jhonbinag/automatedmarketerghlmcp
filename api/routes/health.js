const express = require('express');
const axios = require('axios');
const { mcpTools, getRequiredScopes } = require('../config/mcpTools');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  
  res.json({
    status: 'healthy',
    timestamp: timestamp,
    uptime: {
      seconds: Math.floor(uptime),
      human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  const checks = {
    server: { status: 'healthy', responseTime: 0 },
    mcpTools: { status: 'unknown', count: 0 },
    ghlConnectivity: { status: 'unknown', responseTime: null }
  };

  try {
    // Check MCP tools configuration
    checks.mcpTools = {
      status: 'healthy',
      count: mcpTools.length,
      categories: ['conversations', 'calendars', 'blog'],
      availableTools: mcpTools.filter(tool => tool.status !== 'coming_soon').length,
      comingSoonTools: mcpTools.filter(tool => tool.status === 'coming_soon').length
    };

    // Test GHL API connectivity (if API key provided)
    const testApiKey = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '');
    const testLocationId = req.headers['x-location-id'] || req.query.locationId;

    if (testApiKey && testLocationId) {
      try {
        const ghlStartTime = Date.now();
        await axios.get(`https://services.leadconnectorhq.com/locations/${testLocationId}`, {
          headers: {
            'Authorization': `Bearer ${testApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        checks.ghlConnectivity = {
          status: 'healthy',
          responseTime: Date.now() - ghlStartTime,
          endpoint: 'https://services.leadconnectorhq.com'
        };
      } catch (ghlError) {
        checks.ghlConnectivity = {
          status: 'unhealthy',
          responseTime: Date.now() - ghlStartTime,
          error: ghlError.response?.status === 401 ? 'Authentication failed' : 'Connection failed',
          endpoint: 'https://services.leadconnectorhq.com'
        };
      }
    } else {
      checks.ghlConnectivity = {
        status: 'skipped',
        reason: 'No API key or location ID provided for testing'
      };
    }

    checks.server.responseTime = Date.now() - startTime;

    const overallStatus = Object.values(checks).every(check => 
      check.status === 'healthy' || check.status === 'skipped'
    ) ? 'healthy' : 'degraded';

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      checks: checks,
      requiredScopes: getRequiredScopes()
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks: checks
    });
  }
});

// MCP server connectivity check
router.get('/mcp', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '');
    const locationId = req.headers['x-location-id'] || req.query.locationId;

    if (!apiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'API key required for MCP connectivity test',
        headers: {
          required: 'x-api-key or Authorization: Bearer',
          optional: 'x-location-id'
        }
      });
    }

    const startTime = Date.now();
    
    // Test MCP server endpoint
    const mcpResponse = await axios.get('https://services.leadconnectorhq.com/mcp/', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'locationId': locationId || '',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const responseTime = Date.now() - startTime;

    res.json({
      status: 'healthy',
      mcpServer: {
        endpoint: 'https://services.leadconnectorhq.com/mcp/',
        responseTime: responseTime,
        status: mcpResponse.status,
        connected: true
      },
      authentication: {
        apiKeyValid: true,
        locationId: locationId || 'not provided'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MCP connectivity error:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      mcpServer: {
        endpoint: 'https://services.leadconnectorhq.com/mcp/',
        connected: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    };

    if (error.response) {
      errorResponse.mcpServer.httpStatus = error.response.status;
      errorResponse.mcpServer.httpStatusText = error.response.statusText;
      
      if (error.response.status === 401) {
        errorResponse.authentication = {
          apiKeyValid: false,
          error: 'Invalid API key or insufficient permissions'
        };
      }
    }

    res.status(error.response?.status || 500).json(errorResponse);
  }
});

// System information
router.get('/system', (req, res) => {
  res.json({
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
    },
    uptime: {
      process: process.uptime(),
      system: require('os').uptime()
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    },
    server: {
      name: 'GoHighLevel MCP Directory Server',
      version: '1.0.0',
      description: 'MCP Directory endpoint for GoHighLevel integration with n8n'
    }
  });
});

module.exports = router;