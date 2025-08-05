const express = require('express');
const { authenticateRequest } = require('../middleware/auth');
const { mcpTools, getToolsByCategory, getAvailableTools, getRequiredScopes } = require('../config/mcpTools');

const router = express.Router();

// Get complete directory of all endpoints categorized by trigger/category
router.get('/', authenticateRequest, async (req, res) => {
  try {
    const { category, includeScopes = false } = req.query;
    
    // Get all available categories
    const categories = [...new Set(mcpTools.map(tool => tool.category))];
    
    // If specific category requested, return only that category
    if (category) {
      if (!categories.includes(category)) {
        return res.status(400).json({
          error: `Invalid category '${category}'`,
          availableCategories: categories
        });
      }
      
      const categoryTools = getToolsByCategory(category);
      return res.json({
        category: category,
        description: getCategoryDescription(category),
        totalTools: categoryTools.length,
        tools: categoryTools.map(tool => formatToolForDirectory(tool, includeScopes === 'true'))
      });
    }
    
    // Return complete directory organized by categories
    const directory = {
      serverInfo: {
        name: 'GoHighLevel MCP Directory Server',
        version: '1.0.0',
        description: 'Comprehensive directory of MCP endpoints organized by trigger categories',
        totalCategories: categories.length,
        totalTools: mcpTools.length
      },
      categories: {}
    };
    
    // Organize tools by category
    categories.forEach(cat => {
      const categoryTools = getToolsByCategory(cat);
      directory.categories[cat] = {
        name: cat,
        description: getCategoryDescription(cat),
        totalTools: categoryTools.length,
        tools: categoryTools.map(tool => formatToolForDirectory(tool, includeScopes === 'true'))
      };
    });
    
    // Add summary statistics
    directory.summary = {
      totalEndpoints: mcpTools.length,
      categoriesBreakdown: categories.map(cat => ({
        category: cat,
        count: getToolsByCategory(cat).length
      })),
      requiredScopes: includeScopes === 'true' ? getRequiredScopes() : undefined
    };
    
    res.json(directory);
    
  } catch (error) {
    console.error('Error fetching directory:', error);
    res.status(500).json({
      error: 'Failed to fetch directory',
      details: error.message
    });
  }
});

// Get tools by specific trigger/category
router.get('/category/:categoryName', authenticateRequest, async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { includeScopes = false, format = 'detailed' } = req.query;
    
    const categoryTools = getToolsByCategory(categoryName);
    
    if (categoryTools.length === 0) {
      const availableCategories = [...new Set(mcpTools.map(tool => tool.category))];
      return res.status(404).json({
        error: `Category '${categoryName}' not found`,
        availableCategories: availableCategories
      });
    }
    
    const response = {
      category: categoryName,
      description: getCategoryDescription(categoryName),
      totalTools: categoryTools.length,
      tools: categoryTools.map(tool => {
        if (format === 'simple') {
          return {
            name: tool.name,
            description: tool.description,
            endpoint: `/api/mcp/proxy/${tool.name}`
          };
        }
        return formatToolForDirectory(tool, includeScopes === 'true');
      })
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching category tools:', error);
    res.status(500).json({
      error: 'Failed to fetch category tools',
      details: error.message
    });
  }
});

// Get specific tool details
router.get('/tool/:toolName', authenticateRequest, async (req, res) => {
  try {
    const { toolName } = req.params;
    const { includeScopes = false } = req.query;
    
    const tool = mcpTools.find(t => t.name === toolName);
    
    if (!tool) {
      return res.status(404).json({
        error: `Tool '${toolName}' not found`,
        availableTools: mcpTools.map(t => t.name)
      });
    }
    
    const response = {
      ...formatToolForDirectory(tool, includeScopes === 'true'),
      usage: {
        endpoint: `/api/mcp/proxy/${tool.name}`,
        method: 'POST',
        headers: {
          'x-api-key': 'your-pit-token',
          'x-location-id': 'your-location-id',
          'Content-Type': 'application/json'
        },
        exampleRequest: generateExampleRequest(tool)
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching tool details:', error);
    res.status(500).json({
      error: 'Failed to fetch tool details',
      details: error.message
    });
  }
});

// Search tools across all categories
router.get('/search', authenticateRequest, async (req, res) => {
  try {
    const { q: query, category, scope } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Search query parameter "q" is required'
      });
    }
    
    let filteredTools = mcpTools;
    
    // Filter by category if specified
    if (category) {
      filteredTools = filteredTools.filter(tool => tool.category === category);
    }
    
    // Filter by scope if specified
    if (scope) {
      filteredTools = filteredTools.filter(tool => 
        tool.requiredScopes && tool.requiredScopes.includes(scope)
      );
    }
    
    // Search in name, description, and category
    const searchResults = filteredTools.filter(tool => 
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase()) ||
      tool.category.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      query: query,
      filters: { category, scope },
      totalResults: searchResults.length,
      results: searchResults.map(tool => formatToolForDirectory(tool, false))
    });
    
  } catch (error) {
    console.error('Error searching tools:', error);
    res.status(500).json({
      error: 'Failed to search tools',
      details: error.message
    });
  }
});

// Helper functions
function getCategoryDescription(category) {
  const descriptions = {
    conversations: 'Tools for managing conversations, messages, and communication workflows',
    calendars: 'Tools for calendar management, events, appointments, and scheduling',
    blog: 'Tools for blog post creation, management, and content operations',
    contacts: 'Tools for contact management and customer data operations',
    campaigns: 'Tools for marketing campaign management and automation'
  };
  return descriptions[category] || `Tools in the ${category} category`;
}

function formatToolForDirectory(tool, includeScopes = false) {
  const formatted = {
    name: tool.name,
    category: tool.category,
    description: tool.description,
    endpoint: `/api/mcp/proxy/${tool.name}`,
    parameters: tool.parameters || {},
    triggerType: determineTriggerType(tool)
  };
  
  if (includeScopes) {
    formatted.requiredScopes = tool.requiredScopes || [];
  }
  
  return formatted;
}

function determineTriggerType(tool) {
  // Determine trigger type based on tool name and category
  if (tool.name.includes('view') || tool.name.includes('get')) {
    return 'read';
  }
  if (tool.name.includes('edit') || tool.name.includes('update')) {
    return 'update';
  }
  if (tool.name.includes('create') || tool.name.includes('send')) {
    return 'create';
  }
  if (tool.name.includes('delete')) {
    return 'delete';
  }
  if (tool.name.includes('search')) {
    return 'search';
  }
  return 'action';
}

function generateExampleRequest(tool) {
  const example = {
    locationId: 'your-location-id'
  };
  
  // Add example values for required parameters
  if (tool.parameters) {
    Object.entries(tool.parameters).forEach(([paramName, paramConfig]) => {
      if (paramConfig.required && paramName !== 'locationId') {
        switch (paramConfig.type) {
          case 'string':
            example[paramName] = paramConfig.enum ? paramConfig.enum[0] : `example-${paramName}`;
            break;
          case 'number':
            example[paramName] = paramConfig.default || 20;
            break;
          case 'boolean':
            example[paramName] = true;
            break;
          case 'array':
            example[paramName] = ['example-item'];
            break;
          default:
            example[paramName] = `example-${paramName}`;
        }
      }
    });
  }
  
  return example;
}

module.exports = router;