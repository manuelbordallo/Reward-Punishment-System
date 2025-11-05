-- SQLite Migration: Create tables for Reward-Punishment System

-- Create persons table
CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value INTEGER NOT NULL CHECK (value > 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create punishments table
CREATE TABLE IF NOT EXISTS punishments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value INTEGER NOT NULL CHECK (value < 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('reward', 'punishment')),
    item_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    item_value INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);

-- Create indexes for optimization
CREATE INDEX IF NOT EXISTS idx_assignments_person_id ON assignments(person_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_at ON assignments(assigned_at);
CREATE INDEX IF NOT EXISTS idx_assignments_person_date ON assignments(person_id, assigned_at);