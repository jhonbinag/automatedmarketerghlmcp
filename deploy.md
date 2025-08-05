# Deployment Guide

## Vercel Deployment

### Prerequisites
1. Vercel account
2. GitHub repository (optional but recommended)
3. GoHighLevel Private Integration Token (PIT)

### Step 1: Prepare for Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

### Step 2: Deploy

1. **Deploy from local directory**:
   ```bash
   vercel
   ```

2. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N** (for first deployment)
   - What's your project's name? `ghl-mcp-directory-server`
   - In which directory is your code located? `./`

### Step 3: Configure Environment Variables

In the Vercel dashboard, go to your project settings and add:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.vercel.app,https://n8n.your-domain.com
```

### Step 4: Test Deployment

1. **Health Check**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **API Requirements**:
   ```bash
   curl https://your-app.vercel.app/api/auth/requirements
   ```

### Step 5: Validate with GoHighLevel

```bash
curl -X POST https://your-app.vercel.app/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "pit-your-api-key",
    "locationId": "your-location-id"
  }'
```

## GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GHL MCP Directory Server"
   git branch -M main
   git remote add origin https://github.com/yourusername/ghl-mcp-server.git
   git push -u origin main
   ```

2. **Connect Vercel to GitHub**:
   - Go to Vercel dashboard
   - Import project from GitHub
   - Select your repository
   - Configure environment variables
   - Deploy

## Post-Deployment

### 1. Update n8n Configuration

Use your new Vercel URL in n8n:
- Base URL: `https://your-app.vercel.app/api/mcp`
- Headers: `x-api-key: pit-your-key`

### 2. Monitor Health

Set up monitoring for:
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/health/mcp`

### 3. Security Checklist

- [ ] JWT_SECRET is set to a strong, unique value
- [ ] ALLOWED_ORIGINS is configured properly
- [ ] API keys are not exposed in logs
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced (automatic with Vercel)

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check Vercel function logs
   - Verify environment variables
   - Check API key format

2. **CORS Errors**
   - Update ALLOWED_ORIGINS
   - Check request headers

3. **Authentication Failures**
   - Verify PIT token is valid
   - Check required scopes
   - Test with health/mcp endpoint

### Vercel Function Logs

```bash
vercel logs
```

### Local Testing

```bash
# Test locally before deployment
npm start
curl http://localhost:3000/api/health
```

## Scaling Considerations

- Vercel functions have a 10-second timeout
- Consider implementing caching for frequently accessed data
- Monitor function execution time
- Use Vercel Analytics for performance insights

## Support

For deployment issues:
1. Check Vercel documentation
2. Review function logs
3. Test endpoints individually
4. Verify GoHighLevel API connectivity