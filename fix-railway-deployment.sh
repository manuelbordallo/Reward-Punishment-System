#!/bin/bash

# Fix Railway deployment script
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

print_header "🚂 Railway Deployment Fix"

echo "This script will fix the database initialization issue and redeploy to Railway."
echo ""

# Check if git is clean
if ! git diff --quiet; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "🔧 Fix Railway database initialization

- Added robust startup script with automatic database migration
- Updated package.json to use new startup process
- Added automatic database reset on migration failure
- Simplified nixpacks configuration for Railway

Fixes: SQLITE_ERROR: no such table: persons"
    print_status "Changes committed"
else
    print_status "Git repository is clean"
fi

# Push to trigger Railway redeploy
echo "Pushing to GitHub to trigger Railway redeploy..."
git push origin main || git push origin master

print_status "Code pushed to GitHub"

echo ""
print_header "🎯 Next Steps"
echo ""
echo "1. 🔍 Monitor Railway deployment:"
echo "   - Go to your Railway dashboard"
echo "   - Check the deployment logs"
echo "   - Look for successful database initialization"
echo ""
echo "2. ✅ Expected log output:"
echo "   🏆 Reward-Punishment System - Production Startup"
echo "   🔧 Initializing database..."
echo "   ✅ Database initialized successfully"
echo "   🚀 Starting server..."
echo ""
echo "3. 🌐 Test your application:"
echo "   - Visit your Railway app URL"
echo "   - Try creating a person to test database functionality"
echo ""
echo "4. 🆘 If issues persist:"
echo "   - Check Railway logs for detailed error messages"
echo "   - Verify environment variables (USE_SQLITE=true)"
echo "   - The startup script will automatically retry with database reset"
echo ""

print_status "🎉 Railway deployment fix applied!"
echo "Your app should be working shortly at your Railway URL."