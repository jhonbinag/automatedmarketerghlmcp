const express = require('express');
const axios = require('axios');
const { validateApiKey, authenticateRequest } = require('../middleware/auth');
const { mcpTools } = require('../config/mcpTools');

const router = express.Router();

// MCP Server base URL
const MCP_BASE_URL = 'https://services.leadconnectorhq.com/mcp/';

// Get MCP tools directory
router.get('/tools', authenticateRequest, async (req, res) => {
  try {
    const { locationId } = req.query;
    
    if (!locationId) {
      return res.status(400).json({
        error: 'locationId is required'
      });
    }

    // Filter tools based on our focus areas: blog, conversation, calendars
    const focusedTools = mcpTools.filter(tool => 
      tool.category === 'conversations' || 
      tool.category === 'calendars' || 
      tool.category === 'blog'
    );

    res.json({
      tools: focusedTools,
      mcpEndpoint: MCP_BASE_URL,
      locationId: locationId,
      supportedCategories: ['conversations', 'calendars', 'blog']
    });
  } catch (error) {
    console.error('Error fetching MCP tools:', error);
    res.status(500).json({
      error: 'Failed to fetch MCP tools',
      details: error.message
    });
  }
});

// Proxy MCP requests with authentication
router.post('/proxy/:toolName', authenticateRequest, async (req, res) => {
  try {
    const { toolName } = req.params;
    const { locationId, ...requestData } = req.body;
    const apiKey = req.apiKey;

    if (!locationId) {
      return res.status(400).json({
        error: 'locationId is required in request body'
      });
    }

    // Validate tool exists in our focused categories
    const tool = mcpTools.find(t => t.name === toolName);
    if (!tool) {
      return res.status(404).json({
        error: `Tool '${toolName}' not found or not supported`
      });
    }

    if (!['conversations', 'calendars', 'blog'].includes(tool.category)) {
      return res.status(403).json({
        error: `Tool '${toolName}' is not in supported categories (conversations, calendars, blog)`
      });
    }

    // Make request to GHL MCP server
    const mcpResponse = await axios.post(`${MCP_BASE_URL}${tool.endpoint}`, requestData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'locationId': locationId,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    res.json({
      success: true,
      data: mcpResponse.data,
      tool: tool.name,
      category: tool.category
    });

  } catch (error) {
    console.error('Error proxying MCP request:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'MCP request failed',
        details: error.response.data,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Failed to proxy MCP request',
        details: error.message
      });
    }
  }
});

// Get conversation tools
router.get('/conversations/tools', authenticateRequest, (req, res) => {
  const conversationTools = mcpTools.filter(tool => tool.category === 'conversations');
  res.json({
    category: 'conversations',
    tools: conversationTools
  });
});

// Get calendar tools
router.get('/calendars/tools', authenticateRequest, (req, res) => {
  const calendarTools = mcpTools.filter(tool => tool.category === 'calendars');
  res.json({
    category: 'calendars',
    tools: calendarTools
  });
});

// Get blog tools (placeholder for future blog functionality)
router.get('/blog/tools', authenticateRequest, (req, res) => {
  const blogTools = mcpTools.filter(tool => tool.category === 'blog');
  res.json({
    category: 'blog',
    tools: blogTools,
    note: 'Blog tools will be available in future updates'
  });
});

// Health check for MCP connectivity
router.get('/health', authenticateRequest, async (req, res) => {
  try {
    const { locationId } = req.query;
    const apiKey = req.apiKey;

    if (!locationId) {
      return res.status(400).json({
        error: 'locationId is required for health check'
      });
    }

    // Test connectivity to GHL MCP server
    const testResponse = await axios.get(`${MCP_BASE_URL}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'locationId': locationId
      },
      timeout: 10000
    });

    res.json({
      status: 'healthy',
      mcpServer: 'connected',
      locationId: locationId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      mcpServer: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;