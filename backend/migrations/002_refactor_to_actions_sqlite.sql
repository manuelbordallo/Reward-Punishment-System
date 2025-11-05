-- SQLite Migration: Refactor rewards and punishments to actions

-- Create new actions table
CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value INTEGER NOT NULL, -- Can be positive or negative
    type TEXT NOT NULL CHECK (type IN ('positive', 'negative')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing rewards to actions (positive values)
INSERT INTO actions (name, value, type, created_at, updated_at)
SELECT name, value, 'positive', created_at, updated_at 
FROM rewards 
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='rewards');

-- Migrate existing punishments to actions (negative values)
INSERT INTO actions (name, value, type, created_at, updated_at)
SELECT name, value, 'negative', created_at, updated_at 
FROM punishments 
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='punishments');

-- Update assignments table to reference actions instead of rewards/punishments
-- First, add new columns
ALTER TABLE assignments ADD COLUMN action_id INTEGER;
ALTER TABLE assignments ADD COLUMN action_name TEXT;
ALTER TABLE assignments ADD COLUMN action_value INTEGER;

-- Update assignments with reward data
UPDATE assignments 
SET action_id = (
    SELECT a.id FROM actions a 
    JOIN rewards r ON r.name = a.name AND r.value = a.value 
    WHERE assignments.item_type = 'reward' AND assignments.item_id = r.id
    LIMIT 1
),
action_name = item_name,
action_value = item_value
WHERE item_type = 'reward' 
AND EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='rewards');

-- Update assignments with punishment data
UPDATE assignments 
SET action_id = (
    SELECT a.id FROM actions a 
    JOIN punishments p ON p.name = a.name AND p.value = a.value 
    WHERE assignments.item_type = 'punishment' AND assignments.item_id = p.id
    LIMIT 1
),
action_name = item_name,
action_value = item_value
WHERE item_type = 'punishment' 
AND EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='punishments');

-- Create new assignments table with proper structure
CREATE TABLE IF NOT EXISTS assignments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    action_id INTEGER NOT NULL,
    action_name TEXT NOT NULL,
    action_value INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE
);

-- Copy data to new assignments table
INSERT INTO assignments_new (id, person_id, action_id, action_name, action_value, assigned_at)
SELECT id, person_id, action_id, action_name, action_value, assigned_at
FROM assignments
WHERE action_id IS NOT NULL;

-- Drop old tables and rename new one
DROP TABLE IF EXISTS assignments;
ALTER TABLE assignments_new RENAME TO assignments;

-- Drop old rewards and punishments tables
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS punishments;

-- Create indexes for optimization
CREATE INDEX IF NOT EXISTS idx_actions_type ON actions(type);
CREATE INDEX IF NOT EXISTS idx_actions_value ON actions(value);
CREATE INDEX IF NOT EXISTS idx_assignments_person_id ON assignments(person_id);
CREATE INDEX IF NOT EXISTS idx_assignments_action_id ON assignments(action_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_at ON assignments(assigned_at);
CREATE INDEX IF NOT EXISTS idx_assignments_person_date ON assignments(person_id, assigned_at);