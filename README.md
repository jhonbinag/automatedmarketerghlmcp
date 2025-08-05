# Automated Marketer GoHighLevel MCP Server

A Node.js server designed for Vercel deployment that provides a directory endpoint for the GoHighLevel MCP (Model Context Protocol) server. This server facilitates integration with n8n and other automation platforms, focusing on blog, conversation, and calendar functionalities.

> **Last Updated:** December 2024 - New Repository

## Features

- 🔐 **Secure Authentication** - Private Integration Token (PIT) validation
- 🔄 **MCP Proxy** - Direct integration with GoHighLevel MCP server
- 📅 **Calendar Management** - Full calendar event CRUD operations
- 💬 **Conversation Handling** - Message search, retrieval, and sending
- 📝 **Blog Support** - Future-ready blog post management (coming soon)
- 🛡️ **Security** - Rate limiting, CORS, security headers
- 📊 **Health Monitoring** - Comprehensive health checks and system monitoring
- 🚀 **Vercel Ready** - Optimized for serverless deployment

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd amghlserver
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
```

### 3. Get GoHighLevel API Key

1. Go to **Settings > Private Integrations** in your GoHighLevel location
2. Click **"Create New Integration"**
3. Select required scopes:
   - View Contacts, Edit Contacts
   - View Conversations, Edit Conversations
   - View Conversation Messages, Edit Conversation Messages
   - View Calendars, Edit Calendars
   - View Calendar Events, Edit Calendar Events
   - View Custom Fields, View Locations
4. Copy the generated PIT token (starts with `pit-`)

### 4. Run Locally

```bash
npm run dev
```

Server will be available at `http://localhost:3000`

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `JWT_SECRET`
- `NODE_ENV=production`
- `ALLOWED_ORIGINS`

## API Documentation

### Base URL
- Local: `http://localhost:3000`
- Production: `https://your-app.vercel.app`

### Authentication

All API endpoints (except health checks) require authentication. Use one of these methods:

#### Method 1: API Key Header
```http
GET /api/mcp/tools
x-api-key: pit-your-api-key-here
x-location-id: your-location-id
```

#### Method 2: Bearer Token
```http
GET /api/mcp/tools
Authorization: Bearer pit-your-api-key-here
x-location-id: your-location-id
```

#### Method 3: Session Token (after validation)
```http
GET /api/mcp/tools
x-session-token: your-jwt-session-token
```

### Core Endpoints

#### 1. Authentication

**Validate API Key**
```http
POST /api/auth/validate
Content-Type: application/json

{
  "apiKey": "pit-your-api-key",
  "locationId": "your-location-id"
}
```

**Response:**
```json
{
  "valid": true,
  "locationId": "your-location-id",
  "sessionToken": "jwt-token-here",
  "expiresIn": "24h"
}
```

**Get Requirements**
```http
GET /api/auth/requirements
```

#### 2. MCP Tools

**Get Available Tools**
```http
GET /api/mcp/tools?locationId=your-location-id
x-api-key: pit-your-api-key
```

**Response:**
```json
{
  "tools": [
    {
      "name": "search-conversation",
      "category": "conversations",
      "description": "Search/filter/sort conversations",
      "parameters": {...}
    }
  ],
  "supportedCategories": ["conversations", "calendars", "blog"]
}
```

**Proxy MCP Request**
```http
POST /api/mcp/proxy/search-conversation
Content-Type: application/json
x-api-key: pit-your-api-key

{
  "locationId": "your-location-id",
  "query": "search term",
  "limit": 20
}
```

#### 3. Category-Specific Tools

**Conversation Tools**
```http
GET /api/mcp/conversations/tools
```

**Calendar Tools**
```http
GET /api/mcp/calendars/tools
```

**Blog Tools**
```http
GET /api/mcp/blog/tools
```

#### 4. Health Checks

**Basic Health**
```http
GET /api/health
```

**Detailed Health**
```http
GET /api/health/detailed
```

**MCP Connectivity**
```http
GET /api/health/mcp
x-api-key: pit-your-api-key
x-location-id: your-location-id
```

## Available MCP Tools

### Conversations
- `search-conversation` - Search and filter conversations
- `get-messages` - Retrieve messages from a conversation
- `send-message` - Send new messages to conversations

### Calendars
- `get-calendar-events` - Retrieve calendar events
- `get-appointment-notes` - Get appointment notes
- `create-calendar-event` - Create new calendar events
- `update-calendar-event` - Update existing events
- `delete-calendar-event` - Delete calendar events

### Blog (Coming Soon)
- `get-blog-posts` - Retrieve blog posts
- `create-blog-post` - Create new blog posts
- `update-blog-post` - Update existing posts

## n8n Integration

### Setup in n8n

1. **Add HTTP Request Node**
2. **Configure Authentication:**
   - Method: Header Auth
   - Name: `x-api-key`
   - Value: `pit-your-api-key`
3. **Add Location Header:**
   - Name: `x-location-id`
   - Value: `your-location-id`
4. **Set Base URL:** `https://your-app.vercel.app/api/mcp`

### Example n8n Workflow

```json
{
  "method": "POST",
  "url": "https://your-app.vercel.app/api/mcp/proxy/search-conversation",
  "headers": {
    "x-api-key": "pit-your-api-key",
    "Content-Type": "application/json"
  },
  "body": {
    "locationId": "your-location-id",
    "query": "urgent",
    "limit": 10
  }
}
```

## Security Features

- **API Key Validation** - Validates PIT tokens against GoHighLevel API
- **Rate Limiting** - Prevents abuse with configurable limits
- **CORS Protection** - Configurable origin restrictions
- **Security Headers** - XSS, clickjacking, and content-type protection
- **Input Validation** - Parameter validation for all MCP tools
- **Session Management** - JWT-based session tokens

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "status": 400,
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (tool/endpoint not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Development

### Project Structure
```
amghlserver/
├── api/
│   ├── index.js              # Main server entry point
│   ├── routes/
│   │   ├── mcp.js           # MCP proxy routes
│   │   ├── auth.js          # Authentication routes
│   │   └── health.js        # Health check routes
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   └── config/
│       └── mcpTools.js      # MCP tools configuration
├── package.json
├── vercel.json              # Vercel deployment config
├── .env.example             # Environment variables template
└── README.md
```

### Adding New Tools

1. Add tool definition to `api/config/mcpTools.js`
2. Update required scopes if needed
3. Test with the proxy endpoint

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

## Deployment

### Vercel Deployment

1. **Connect Repository** to Vercel
2. **Set Environment Variables:**
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS`
3. **Deploy** - Automatic on git push

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|----------|
| `JWT_SECRET` | Secret for JWT tokens | Yes | - |
| `NODE_ENV` | Environment | No | development |
| `PORT` | Server port | No | 3000 |
| `ALLOWED_ORIGINS` | CORS origins | No | * |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit | No | 100 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 60000 |

## Support

For issues and questions:
1. Check the [GoHighLevel MCP Documentation](https://marketplace.gohighlevel.com/docs/other/mcp)
2. Review API responses and error messages
3. Test connectivity with health endpoints
4. Verify API key permissions and scopes

## License

MIT License - see LICENSE file for details.#   a m g h l m c p 
 
 
