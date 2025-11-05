#!/bin/bash

# Quick GitHub deployment preparation script
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

print_header "🚀 Preparing for Public Deployment"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    print_status "Git repository initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
*/node_modules/

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Database
*.sqlite
*.db
data/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary folders
tmp/
temp/

# Docker
.dockerignore
EOF
    print_status "Created .gitignore file"
fi

# Add all files
echo "Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    # Commit changes
    echo "Committing changes..."
    git commit -m "🚀 Ready for public deployment

- Added Docker configuration for production
- Added deployment scripts for multiple platforms
- Configured environment variables
- Added health monitoring and logging
- Ready for Railway, Render, Vercel, or VPS deployment"
    print_status "Changes committed"
fi

# Check if remote origin exists
if git remote get-url origin &> /dev/null; then
    echo "Pushing to existing GitHub repository..."
    git push origin main || git push origin master
    print_status "Code pushed to GitHub"
else
    print_warning "No GitHub remote configured"
    echo ""
    echo "To deploy publicly, you need to:"
    echo "1. Create a new repository on GitHub"
    echo "2. Add it as remote: git remote add origin https://github.com/username/repo-name.git"
    echo "3. Push your code: git push -u origin main"
    echo ""
fi

print_header "🌐 Ready for Public Deployment!"

echo "Your code is ready! Choose a deployment platform:"
echo ""
echo "🥇 EASIEST: Railway (Recommended)"
echo "   1. Go to https://railway.app"
echo "   2. Sign up with GitHub"
echo "   3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "   4. Select your repository"
echo "   5. Your app will be live in 2 minutes!"
echo ""
echo "🥈 FREE: Render"
echo "   1. Go to https://render.com"
echo "   2. Sign up with GitHub"
echo "   3. Create new Web Service from your repo"
echo ""
echo "🥉 SERVERLESS: Vercel"
echo "   1. Install: npm i -g vercel"
echo "   2. Run: vercel login"
echo "   3. Run: vercel --prod"
echo ""
echo "🛠️ FULL CONTROL: VPS"
echo "   1. Get a VPS (DigitalOcean, Linode, etc.)"
echo "   2. Run: ./deploy-cloud.sh"
echo "   3. Choose option 7 (Manual VPS Setup)"
echo ""

print_status "🎉 Your Reward & Punishment System is ready to go public!"
echo ""
echo "For detailed instructions, see: PUBLIC-DEPLOYMENT-GUIDE.md"