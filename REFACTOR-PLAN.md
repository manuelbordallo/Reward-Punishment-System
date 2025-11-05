# 🔄 Refactor Plan: Rewards & Punishments → Actions

## Overview
Combine rewards and punishments into a single "actions" entity with positive/negative values.

## Database Changes

### New Schema
```sql
-- Replace rewards and punishments tables with actions table
CREATE TABLE actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value INTEGER NOT NULL, -- Can be positive or negative
    type TEXT NOT NULL CHECK (type IN ('positive', 'negative')), -- Optional categorization
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Strategy
1. Create new actions table
2. Migrate existing rewards (positive values) to actions
3. Migrate existing punishments (negative values) to actions
4. Update assignments table references
5. Drop old rewards and punishments tables

## Backend Changes

### Files to Update
- `models/Action.js` (new, replaces Reward.js & Punishment.js)
- `repositories/ActionRepository.js` (new, replaces RewardRepository.js & PunishmentRepository.js)
- `services/ActionService.js` (new, replaces RewardService.js & PunishmentService.js)
- `controllers/ActionController.js` (new, replaces RewardController.js & PunishmentController.js)
- `routes/actionRoutes.js` (new, replaces rewardRoutes.js & punishmentRoutes.js)
- Update `assignments` table and related code

## Frontend Changes

### Files to Update
- `types/index.ts` - Add Action type, remove Reward/Punishment types
- `services/api.ts` - Replace reward/punishment APIs with action API
- `components/ActionManagement.tsx` (new, replaces RewardManagement.tsx & PunishmentManagement.tsx)
- `components/AssignmentManagement.tsx` - Update to use actions
- Update Redux store and slices

## API Changes

### New Endpoints
```
GET    /api/actions           # Get all actions
GET    /api/actions/positive  # Get positive actions (rewards)
GET    /api/actions/negative  # Get negative actions (punishments)
POST   /api/actions           # Create action
PUT    /api/actions/:id       # Update action
DELETE /api/actions/:id       # Delete action
```

## Benefits
- ✅ Simplified codebase (less duplication)
- ✅ Easier to maintain and extend
- ✅ More flexible value system
- ✅ Consistent API structure
- ✅ Better data model