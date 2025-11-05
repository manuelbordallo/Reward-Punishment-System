# Database Setup Guide

## Prerequisites

1. PostgreSQL installed and running
2. Database user with appropriate permissions
3. Node.js dependencies installed (`npm install`)

## Quick Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=reward_punishment_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

3. Initialize database:
   ```bash
   npm run init-db
   ```

## Available Scripts

- `npm run init-db` - Test connection and run all migrations
- `npm run migrate` - Run pending migrations only
- `npm run migrate:reset` - Drop all tables and re-run migrations

## Database Schema

### Tables

1. **persons** - Stores individual persons
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR(100) UNIQUE NOT NULL)
   - `created_at`, `updated_at` (TIMESTAMP)

2. **rewards** - Stores reward definitions
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR(100) NOT NULL)
   - `value` (INTEGER > 0)
   - `created_at`, `updated_at` (TIMESTAMP)

3. **punishments** - Stores punishment definitions
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR(100) NOT NULL)
   - `value` (INTEGER < 0)
   - `created_at`, `updated_at` (TIMESTAMP)

4. **assignments** - Stores reward/punishment assignments
   - `id` (SERIAL PRIMARY KEY)
   - `person_id` (FOREIGN KEY to persons)
   - `item_type` ('reward' or 'punishment')
   - `item_id` (ID of reward or punishment)
   - `item_name` (Name at time of assignment)
   - `item_value` (Value at time of assignment)
   - `assigned_at` (TIMESTAMP)

### Indexes

- `idx_persons_name` - Optimize person name lookups
- `idx_assignments_person_id` - Optimize assignments by person
- `idx_assignments_assigned_at` - Optimize date-based queries
- `idx_assignments_person_date` - Optimize person + date queries
- `idx_assignments_item_type` - Optimize filtering by reward/punishment

### Constraints

- Person names must be unique
- Reward values must be positive (> 0)
- Punishment values must be negative (< 0)
- Assignment item_type must be 'reward' or 'punishment'
- Cascading deletes: removing a person removes their assignments

## Connection Pool Configuration

The application uses a connection pool with the following settings:
- Maximum connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

## Troubleshooting

### Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Test connection manually:
   ```bash
   psql -h localhost -p 5432 -U your_username -d your_database
   ```

3. Check database exists:
   ```sql
   \l
   ```

### Migration Issues

1. Check migration status:
   ```sql
   SELECT * FROM migrations ORDER BY executed_at;
   ```

2. Reset database if needed:
   ```bash
   npm run migrate:reset
   ```

### Performance Issues

1. Check index usage:
   ```sql
   SELECT schemaname, tablename, indexname, idx_scan 
   FROM pg_stat_user_indexes 
   ORDER BY idx_scan DESC;
   ```

2. Monitor connection pool:
   ```javascript
   const { pool } = require('./config/database');
   console.log('Total:', pool.totalCount);
   console.log('Idle:', pool.idleCount);
   console.log('Waiting:', pool.waitingCount);
   ```