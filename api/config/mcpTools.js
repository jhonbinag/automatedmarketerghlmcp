// MCP Tools configuration for GoHighLevel integration
// Focus areas: Conversations, Calendars, Blog

const mcpTools = [
  // Conversation Tools
  {
    name: 'view-conversations',
    category: 'conversations',
    endpoint: 'conversations_view-conversations',
    description: 'View all conversations',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 },
      contactId: { type: 'string', required: false },
      status: { type: 'string', required: false, enum: ['open', 'closed', 'unread'] }
    },
    requiredScopes: ['View Conversations']
  },
  {
    name: 'edit-conversations',
    category: 'conversations',
    endpoint: 'conversations_edit-conversations',
    description: 'Edit conversation properties',
    parameters: {
      conversationId: { type: 'string', required: true },
      status: { type: 'string', required: false, enum: ['open', 'closed'] },
      assignedTo: { type: 'string', required: false },
      tags: { type: 'array', required: false }
    },
    requiredScopes: ['Edit Conversations']
  },
  {
    name: 'search-conversation',
    category: 'conversations',
    endpoint: 'conversations_search-conversation',
    description: 'Search/filter/sort conversations',
    parameters: {
      locationId: { type: 'string', required: true },
      query: { type: 'string', required: false },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 },
      sortBy: { type: 'string', required: false, enum: ['dateUpdated', 'dateAdded'] },
      sortOrder: { type: 'string', required: false, enum: ['asc', 'desc'] }
    },
    requiredScopes: ['View Conversations']
  },
  {
    name: 'view-conversation-messages',
    category: 'conversations',
    endpoint: 'conversations_view-conversation-messages',
    description: 'View messages in a conversation',
    parameters: {
      conversationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 },
      lastMessageId: { type: 'string', required: false }
    },
    requiredScopes: ['View Conversation Messages']
  },
  {
    name: 'edit-conversation-messages',
    category: 'conversations',
    endpoint: 'conversations_edit-conversation-messages',
    description: 'Edit conversation messages',
    parameters: {
      messageId: { type: 'string', required: true },
      message: { type: 'string', required: false },
      status: { type: 'string', required: false, enum: ['read', 'unread', 'deleted'] }
    },
    requiredScopes: ['Edit Conversation Messages']
  },
  {
    name: 'get-messages',
    category: 'conversations',
    endpoint: 'conversations_get-messages',
    description: 'Get messages by conversation ID',
    parameters: {
      conversationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      lastMessageId: { type: 'string', required: false }
    },
    requiredScopes: ['View Conversation Messages']
  },
  {
    name: 'send-message',
    category: 'conversations',
    endpoint: 'conversations_send-a-new-message',
    description: 'Send a message into a conversation thread',
    parameters: {
      conversationId: { type: 'string', required: true },
      message: { type: 'string', required: true },
      type: { type: 'string', required: false, enum: ['SMS', 'Email', 'WhatsApp', 'GMB', 'IG', 'FB'] },
      attachments: { type: 'array', required: false }
    },
    requiredScopes: ['Edit Conversation Messages']
  },

  // Calendar Tools
  {
    name: 'view-calendars',
    category: 'calendars',
    endpoint: 'calendars_view-calendars',
    description: 'View all calendars',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 }
    },
    requiredScopes: ['View Calendars']
  },
  {
    name: 'edit-calendars',
    category: 'calendars',
    endpoint: 'calendars_edit-calendars',
    description: 'Edit calendar settings',
    parameters: {
      calendarId: { type: 'string', required: true },
      name: { type: 'string', required: false },
      description: { type: 'string', required: false },
      timezone: { type: 'string', required: false },
      isActive: { type: 'boolean', required: false }
    },
    requiredScopes: ['Edit Calendars']
  },
  {
    name: 'get-calendar-events',
    category: 'calendars',
    endpoint: 'calendars_get-calendar-events',
    description: 'Get calendar events (requires userId, groupId, or calendarId)',
    parameters: {
      locationId: { type: 'string', required: true },
      userId: { type: 'string', required: false },
      groupId: { type: 'string', required: false },
      calendarId: { type: 'string', required: false },
      startDate: { type: 'string', required: false, format: 'date' },
      endDate: { type: 'string', required: false, format: 'date' },
      limit: { type: 'number', required: false, default: 20 }
    },
    requiredScopes: ['View Calendar Events']
  },
  {
    name: 'edit-calendar-events',
    category: 'calendars',
    endpoint: 'calendars_edit-calendar-events',
    description: 'Edit calendar events',
    parameters: {
      eventId: { type: 'string', required: true },
      title: { type: 'string', required: false },
      startTime: { type: 'string', required: false, format: 'datetime' },
      endTime: { type: 'string', required: false, format: 'datetime' },
      description: { type: 'string', required: false },
      appointmentStatus: { type: 'string', required: false, enum: ['confirmed', 'showed', 'noshow', 'cancelled'] }
    },
    requiredScopes: ['Edit Calendar Events']
  },
  {
    name: 'get-appointment-notes',
    category: 'calendars',
    endpoint: 'calendars_get-appointment-notes',
    description: 'Retrieve appointment notes',
    parameters: {
      appointmentId: { type: 'string', required: true }
    },
    requiredScopes: ['View Calendar Events']
  },
  {
    name: 'view-calendar-groups',
    category: 'calendars',
    endpoint: 'calendars_view-calendar-groups',
    description: 'View calendar groups',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 }
    },
    requiredScopes: ['View Calendar Groups']
  },
  {
    name: 'edit-calendar-groups',
    category: 'calendars',
    endpoint: 'calendars_edit-calendar-groups',
    description: 'Edit calendar groups',
    parameters: {
      groupId: { type: 'string', required: true },
      name: { type: 'string', required: false },
      description: { type: 'string', required: false },
      isActive: { type: 'boolean', required: false }
    },
    requiredScopes: ['Edit Calendar Groups']
  },
  {
    name: 'view-calendar-resources',
    category: 'calendars',
    endpoint: 'calendars_view-calendar-resources',
    description: 'View calendar resources',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 }
    },
    requiredScopes: ['View Calendar Resources']
  },
  {
    name: 'edit-calendar-resources',
    category: 'calendars',
    endpoint: 'calendars_edit-calendar-resources',
    description: 'Edit calendar resources',
    parameters: {
      resourceId: { type: 'string', required: true },
      name: { type: 'string', required: false },
      description: { type: 'string', required: false },
      capacity: { type: 'number', required: false },
      isActive: { type: 'boolean', required: false }
    },
    requiredScopes: ['Edit Calendar Resources']
  },

  // Blog Tools
  {
    name: 'create-blog-post',
    category: 'blog',
    endpoint: 'blogs_create-blog-post',
    description: 'Create a new blog post',
    parameters: {
      title: { type: 'string', required: true },
      content: { type: 'string', required: true },
      excerpt: { type: 'string', required: false },
      status: { type: 'string', required: false, enum: ['published', 'draft'], default: 'draft' },
      tags: { type: 'array', required: false },
      featuredImage: { type: 'string', required: false },
      categoryId: { type: 'string', required: false },
      authorId: { type: 'string', required: false }
    },
    requiredScopes: ['Create Blog Post']
  },
  {
    name: 'update-blog-post',
    category: 'blog',
    endpoint: 'blogs_update-blog-post',
    description: 'Update an existing blog post',
    parameters: {
      postId: { type: 'string', required: true },
      title: { type: 'string', required: false },
      content: { type: 'string', required: false },
      excerpt: { type: 'string', required: false },
      status: { type: 'string', required: false, enum: ['published', 'draft', 'archived'] },
      tags: { type: 'array', required: false },
      featuredImage: { type: 'string', required: false },
      categoryId: { type: 'string', required: false }
    },
    requiredScopes: ['Update Blog Post']
  },
  {
    name: 'check-blog-post-slug',
    category: 'blog',
    endpoint: 'blogs_check-blog-post-slug',
    description: 'Check if a blog post slug is available',
    parameters: {
      slug: { type: 'string', required: true },
      excludePostId: { type: 'string', required: false }
    },
    requiredScopes: ['Check Blog Post Slug']
  },
  {
    name: 'view-blog-categories',
    category: 'blog',
    endpoint: 'blogs_view-blog-categories',
    description: 'View all blog categories',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 50 },
      offset: { type: 'number', required: false, default: 0 }
    },
    requiredScopes: ['View Blog Categories']
  },
  {
    name: 'view-blog-authors',
    category: 'blog',
    endpoint: 'blogs_view-blog-authors',
    description: 'View all blog authors',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 50 },
      offset: { type: 'number', required: false, default: 0 }
    },
    requiredScopes: ['View Blog Authors']
  },
  {
    name: 'blogs-posts-readonly',
    category: 'blog',
    endpoint: 'blogs_posts-readonly',
    description: 'View blog posts (read-only)',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 },
      status: { type: 'string', required: false, enum: ['published', 'draft', 'archived'] },
      categoryId: { type: 'string', required: false },
      authorId: { type: 'string', required: false }
    },
    requiredScopes: ['blogspostsreadonly']
  },
  {
    name: 'blogs-list-readonly',
    category: 'blog',
    endpoint: 'blogs_list-readonly',
    description: 'View blog list (read-only)',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 }
    },
    requiredScopes: ['blogslistreadonly']
  },

  // Contact Tools
  {
    name: 'view-contacts',
    category: 'contacts',
    endpoint: 'contacts_view-contacts',
    description: 'View contacts',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 },
      query: { type: 'string', required: false }
    },
    requiredScopes: ['View Contacts']
  },

  // Campaign Tools
  {
    name: 'view-campaigns',
    category: 'campaigns',
    endpoint: 'campaigns_view-campaigns',
    description: 'View campaigns',
    parameters: {
      locationId: { type: 'string', required: true },
      limit: { type: 'number', required: false, default: 20 },
      offset: { type: 'number', required: false, default: 0 },
      status: { type: 'string', required: false, enum: ['active', 'paused', 'completed'] }
    },
    requiredScopes: ['View Campaigns']
  }
];

// Helper functions
const getToolsByCategory = (category) => {
  return mcpTools.filter(tool => tool.category === category);
};

const getToolByName = (name) => {
  return mcpTools.find(tool => tool.name === name);
};

const getAvailableTools = () => {
  return mcpTools.filter(tool => tool.status !== 'coming_soon');
};

const getRequiredScopes = () => {
  const scopes = new Set();
  mcpTools.forEach(tool => {
    if (tool.requiredScopes) {
      tool.requiredScopes.forEach(scope => scopes.add(scope));
    }
  });
  return Array.from(scopes);
};

const validateToolParameters = (toolName, parameters) => {
  const tool = getToolByName(toolName);
  if (!tool) {
    return { valid: false, error: `Tool '${toolName}' not found` };
  }

  const errors = [];
  const toolParams = tool.parameters || {};

  // Check required parameters
  Object.entries(toolParams).forEach(([paramName, paramConfig]) => {
    if (paramConfig.required && !parameters.hasOwnProperty(paramName)) {
      errors.push(`Missing required parameter: ${paramName}`);
    }
  });

  // Check parameter types and formats
  Object.entries(parameters).forEach(([paramName, paramValue]) => {
    const paramConfig = toolParams[paramName];
    if (paramConfig) {
      // Type validation
      if (paramConfig.type === 'string' && typeof paramValue !== 'string') {
        errors.push(`Parameter '${paramName}' must be a string`);
      }
      if (paramConfig.type === 'number' && typeof paramValue !== 'number') {
        errors.push(`Parameter '${paramName}' must be a number`);
      }
      if (paramConfig.type === 'array' && !Array.isArray(paramValue)) {
        errors.push(`Parameter '${paramName}' must be an array`);
      }

      // Enum validation
      if (paramConfig.enum && !paramConfig.enum.includes(paramValue)) {
        errors.push(`Parameter '${paramName}' must be one of: ${paramConfig.enum.join(', ')}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

module.exports = {
  mcpTools,
  getToolsByCategory,
  getToolByName,
  getAvailableTools,
  getRequiredScopes,
  validateToolParameters
};