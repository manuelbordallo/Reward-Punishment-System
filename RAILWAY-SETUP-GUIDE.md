# 🚂 Railway Deployment - Complete Setup Guide

## Issue: Frontend and Backend Deployed Separately

Railway has deployed your frontend and backend as separate services, but they need to communicate with each other.

## ✅ Solution: Proper Service Configuration

### Current URLs:
- **Frontend**: `https://reward-punishment-frontend-production.up.railway.app`
- **Backend**: `https://reward-punishment-backend-production.up.railway.app`

### Problem:
The frontend is trying to call `/api/persons` on the frontend service instead of the backend service.

## 🔧 Fix Applied

I've updated the configuration so the frontend correctly calls the backend API.

### 1. Updated Frontend API Configuration
- Frontend now points to the correct backend URL in production
- Uses environment variables for flexible configuration

### 2. Environment Variables Setup
The frontend now uses: `https://reward-punishment-backend-production.up.railway.app/api`

## 🚀 How to Fix Your Railway Deployment

### Option 1: Update Environment Variables (Recommended)

1. **Go to Railway Dashboard**
2. **Click on your Frontend service**
3. **Go to Variables tab**
4. **Add this environment variable:**
   ```
   REACT_APP_API_URL=https://reward-punishment-backend-production.up.railway.app/api
   ```
5. **Redeploy the frontend service**

### Option 2: Redeploy with Updated Code

```bash
# Commit the API URL fix
git add .
git commit -m "Fix Railway frontend-backend communication"
git push origin main
```

### Option 3: Deploy as Single Service (Alternative)

If you prefer a single service deployment:

1. **Delete current services** in Railway
2. **Create new service** from GitHub repo
3. **Use the monorepo configuration** (I'll create this below)

## 🏗️ Single Service Deployment (Alternative)

If you want to deploy as a single service, I can create a configuration that serves both frontend and backend from one Railway service.

### Create Monorepo Configuration:

```bash
# Use the single-service deployment script
./deploy-railway-single.sh
```

## 🔍 Testing the Fix

After applying the fix:

1. **Visit your frontend URL:**
   `https://reward-punishment-frontend-production.up.railway.app`

2. **Test API calls:**
   - Try creating a person
   - Check if data loads properly
   - Verify scoreboard works

3. **Check Network Tab:**
   - Open browser dev tools
   - Go to Network tab
   - Verify API calls go to: `https://reward-punishment-backend-production.up.railway.app/api/*`

## 🛠️ Environment Variables Needed

### Frontend Service:
```
NODE_ENV=production
REACT_APP_API_URL=https://reward-punishment-backend-production.up.railway.app/api
```

### Backend Service:
```
NODE_ENV=production
USE_SQLITE=true
PORT=3000
```

## 🆘 Troubleshooting

### If API calls still fail:

1. **Check CORS settings** - Backend should allow frontend domain
2. **Verify backend is running** - Visit backend URL directly
3. **Check environment variables** - Ensure REACT_APP_API_URL is set correctly

### CORS Fix (if needed):

The backend should automatically allow your frontend domain, but if you get CORS errors, you can update the backend CORS configuration.

## ✅ Expected Result

After the fix:
- ✅ Frontend loads at: `https://reward-punishment-frontend-production.up.railway.app`
- ✅ API calls go to: `https://reward-punishment-backend-production.up.railway.app/api/*`
- ✅ All functionality works (create persons, rewards, assignments, scoreboard)
- ✅ No more 404 errors on API calls

## 🎯 Quick Fix Commands

```bash
# Apply the fix and redeploy
git add .
git commit -m "🔧 Fix Railway frontend-backend communication

- Updated frontend API URL to point to backend service
- Added production environment configuration
- Fixed CORS and service communication"

git push origin main
```

Your Railway services will automatically redeploy with the correct configuration! 🎉