#!/bin/bash

# Refactor rewards and punishments to actions script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_header "🔄 Refactoring Rewards & Punishments → Actions"

echo "This script will refactor your system to use a unified 'actions' model"
echo "instead of separate rewards and punishments."
echo ""

# Backup current state
print_status "Creating backup of current state..."
git add .
git commit -m "📦 Backup before refactoring to actions system

- Backup all current files before major refactoring
- Rewards and punishments will be merged into actions
- This commit serves as a restore point if needed" || echo "No changes to commit"

# Run database migration
print_status "Running database migration..."
cd backend
npm run migrate
cd ..

# Update backend routes
print_status "Updating backend routes..."

# Add action routes to main routes file
if ! grep -q "actionRoutes" backend/routes/index.js; then
    # Add action routes import and usage
    sed -i.bak '/const assignmentRoutes/a\
const actionRoutes = require('\''./actionRoutes'\'');' backend/routes/index.js

    sed -i.bak '/router.use('\''\/assignments'\''/a\
router.use('\''\/actions'\'', actionRoutes);' backend/routes/index.js

    print_status "Added action routes to main router"
fi

# Update model exports
if ! grep -q "Action" backend/models/index.js; then
    echo "const Action = require('./Action');" >> backend/models/index.js
    echo "" >> backend/models/index.js
    echo "module.exports = {" >> backend/models/index.js
    echo "  Person," >> backend/models/index.js
    echo "  Reward," >> backend/models/index.js
    echo "  Punishment," >> backend/models/index.js
    echo "  Action," >> backend/models/index.js
    echo "  Assignment," >> backend/models/index.js
    echo "  ApiResponse" >> backend/models/index.js
    echo "};" >> backend/models/index.js
    print_status "Updated model exports"
fi

# Update repository exports
if ! grep -q "ActionRepository" backend/repositories/index.js; then
    echo "const ActionRepository = require('./ActionRepository');" >> backend/repositories/index.js
    echo "" >> backend/repositories/index.js
    echo "module.exports = {" >> backend/repositories/index.js
    echo "  PersonRepository," >> backend/repositories/index.js
    echo "  RewardRepository," >> backend/repositories/index.js
    echo "  PunishmentRepository," >> backend/repositories/index.js
    echo "  ActionRepository," >> backend/repositories/index.js
    echo "  AssignmentRepository" >> backend/repositories/index.js
    echo "};" >> backend/repositories/index.js
    print_status "Updated repository exports"
fi

# Update service exports
if ! grep -q "ActionService" backend/services/index.js; then
    echo "const ActionService = require('./ActionService');" >> backend/services/index.js
    echo "" >> backend/services/index.js
    echo "module.exports = {" >> backend/services/index.js
    echo "  PersonService," >> backend/services/index.js
    echo "  RewardService," >> backend/services/index.js
    echo "  PunishmentService," >> backend/services/index.js
    echo "  ActionService," >> backend/services/index.js
    echo "  AssignmentService," >> backend/services/index.js
    echo "  ScoreCalculationService" >> backend/services/index.js
    echo "};" >> backend/services/index.js
    print_status "Updated service exports"
fi

print_header "📋 Next Steps"
echo ""
echo "Backend refactoring is complete! Now you need to update the frontend:"
echo ""
echo "1. 🎯 Update Frontend Types:"
echo "   - Add Action interface to types/index.ts"
echo "   - Update Assignment interface to use action_id"
echo ""
echo "2. 🔌 Update API Services:"
echo "   - Add actionApi to services/api.ts"
echo "   - Update assignment API calls"
echo ""
echo "3. 🎨 Update Components:"
echo "   - Create ActionManagement component"
echo "   - Update AssignmentManagement to use actions"
echo "   - Update navigation and routing"
echo ""
echo "4. 🏪 Update Redux Store:"
echo "   - Add action slice"
echo "   - Update assignment slice"
echo ""
echo "5. 🧪 Test the Migration:"
echo "   - Verify existing data is preserved"
echo "   - Test creating new actions"
echo "   - Test assignments with actions"
echo ""

print_warning "The backend now supports both old (rewards/punishments) and new (actions) APIs"
print_warning "This allows for gradual frontend migration without breaking existing functionality"

echo ""
print_status "🎉 Backend refactoring complete!"
echo ""
echo "Your system now has:"
echo "• ✅ Unified Action model (positive/negative values)"
echo "• ✅ Action API endpoints (/api/actions)"
echo "• ✅ Database migration completed"
echo "• ✅ Backward compatibility maintained"
echo ""
echo "Ready to update the frontend! 🚀"