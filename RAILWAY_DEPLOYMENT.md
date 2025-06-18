# Railway Deployment Guide

## Current Issues and Solutions

### 1. Database Connection Failures
**Problem**: Railway backend returns HTTP 500 errors with "Failed to fetch tools"

**Root Cause**: Database tables may not exist or DATABASE_URL is incorrectly configured

**Solutions**:
1. **Check Environment Variables**: Ensure Railway has DATABASE_URL configured
2. **Initialize Database Schema**: Run database migration to create tables
3. **Test Connection**: Use the built-in database diagnostics

### 2. Frontend API Configuration
**Status**: ✅ FIXED - Frontend now defaults to Railway backend URL

### 3. Deployment Steps for Railway

#### Required Environment Variables:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-session-secret
ALGOLIA_API_KEY=your-algolia-key
BREVO_API_KEY=your-brevo-key
```

#### Database Initialization:
```bash
# Create database tables
npm run db:push

# Seed with sample data (optional)
psql $DATABASE_URL < seed_data.sql
```

#### Testing Deployment:
```bash
# Test API endpoints
curl https://probeai-platform-production.up.railway.app/api/tools
curl https://probeai-platform-production.up.railway.app/api/categories
```

### 4. Troubleshooting

#### Check Railway Logs:
Look for these diagnostic messages:
- `🔍 Checking database connection...`
- `📊 Found X tables in database`
- `❌ Database initialization failed`

#### Common Issues:
1. **Missing DATABASE_URL**: Railway needs PostgreSQL addon
2. **No Tables**: Run `npm run db:push` after deployment
3. **Connection Timeout**: Database may be sleeping (first request)
4. **Version Conflicts**: Ensure drizzle-orm@0.33.0 compatibility

### 5. Current Status
- ✅ Build successful (71.5kb bundle)
- ✅ Frontend API connection fixed
- ❌ Railway database connectivity pending
- ⚠️  Awaiting database initialization