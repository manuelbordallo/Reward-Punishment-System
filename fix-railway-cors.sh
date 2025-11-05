#!/bin/bash

# Fix Railway CORS issue script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_header "🔧 Railway CORS Fix"

echo "Fixing CORS policy to allow Railway frontend to access backend..."
echo ""

print_status "Updated CORS configuration to allow:"
echo "   - https://reward-punishment-frontend-production.up.railway.app"
echo "   - All *.up.railway.app subdomains"
echo "   - Development localhost URLs"

# Commit the CORS fix
git add backend/middleware/cors.js
git commit -m "🔧 Fix CORS policy for Railway deployment

- Added Railway frontend URL to allowed origins
- Allow all *.up.railway.app subdomains for flexibility
- Updated production CORS configuration
- Added logging for blocked origins

Fixes: Access-Control-Allow-Origin header missing error"

print_status "CORS fix committed"

# Push to trigger Railway redeploy
echo "Pushing to GitHub to trigger Railway backend redeploy..."
git push origin main

print_status "Code pushed - Railway will redeploy backend with CORS fix"

echo ""
print_header "🎯 What This Fixes"
echo ""
echo "Before: ❌ CORS policy blocked frontend requests to backend"
echo "After:  ✅ Frontend can successfully call backend API"
echo ""
echo "The backend now allows requests from:"
echo "• https://reward-punishment-frontend-production.up.railway.app"
echo "• Any Railway subdomain (*.up.railway.app)"
echo "• Development localhost URLs"
echo ""

print_header "🔍 Testing the Fix"
echo ""
echo "1. Wait for Railway backend to redeploy (1-2 minutes)"
echo "2. Visit your frontend: https://reward-punishment-frontend-production.up.railway.app"
echo "3. Try creating a person or loading data"
echo "4. Check browser console - no more CORS errors!"
echo ""

print_status "🎉 CORS fix applied! Your Railway app should work in 1-2 minutes."