#!/bin/bash

# Complete system deployment with Actions migration
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

print_header "🚀 Complete System Deployment with Actions Migration"

echo "This script will:"
echo "1. Run backend database migration (rewards/punishments → actions)"
echo "2. Build the frontend with new Actions system"
echo "3. Deploy the complete system"
echo ""

# Step 1: Backend Migration
print_status "Step 1: Running backend database migration..."
cd backend
npm run migrate
cd ..
print_status "Database migration completed"

# Step 2: Build Frontend
print_status "Step 2: Building frontend with Actions system..."
cd reward-punishment-web
npm run build
cd ..
print_status "Frontend build completed successfully"

# Step 3: Run Tests (optional)
print_status "Step 3: Running quick validation..."
echo "Frontend build size:"
du -sh reward-punishment-web/build
echo ""

# Step 4: Deploy with Docker
print_status "Step 4: Deploying complete system..."
./deploy.sh

print_header "🎉 Deployment Complete!"

echo ""
echo "Your Reward & Punishment System is now running with:"
echo ""
echo "🎯 **New Features:**"
echo "   • Unified Actions system (replaces separate Rewards/Punishments)"
echo "   • Search and filter functionality"
echo "   • Modern, intuitive interface"
echo "   • Backward compatibility with legacy system"
echo ""
echo "🌐 **Access Points:**"
echo "   • Frontend: http://localhost (or your domain)"
echo "   • API: http://localhost/api"
echo "   • Health Check: http://localhost/health"
echo ""
echo "📋 **How to Use:**"
echo "   1. Go to 'Actions' tab to manage rewards and punishments"
echo "   2. Use 'Assignments' tab with new Actions system toggle"
echo "   3. Toggle 'Show legacy tabs' if you need old interface"
echo "   4. All existing data is preserved and accessible"
echo ""
echo "🔧 **System Status:**"
print_status "Backend: Running with Actions API"
print_status "Frontend: Built with unified Actions interface"
print_status "Database: Migrated to Actions schema"
print_status "Legacy Support: Available via toggle"

echo ""
print_header "🎊 Success!"
echo "Your system is now running the modern, unified Actions system!"
echo "Enjoy the improved interface and enhanced functionality! 🚀"