const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const mcpRoutes = require('./routes/mcp');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');

// Use routes
app.use('/api/mcp', mcpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GoHighLevel MCP Directory Server',
    version: '1.0.0',
    description: 'MCP Directory endpoint for GoHighLevel integration with n8n',
    endpoints: {
      mcp: '/api/mcp',
      auth: '/api/auth',
      health: '/api/health'
    },
    documentation: 'https://marketplace.gohighlevel.com/docs/other/mcp'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      status: 404
    }
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;