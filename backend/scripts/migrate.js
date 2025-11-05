const fs = require('fs');
const path = require('path');
const { query, USE_SQLITE } = require('../config/database');

/**
 * Run database migrations
 */
async function runMigrations() {
  try {
    console.log('Starting database migration...');
    console.log(`Using ${USE_SQLITE ? 'SQLite' : 'PostgreSQL'} database`);

    // Create migrations table if it doesn't exist
    if (USE_SQLITE) {
      await query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL UNIQUE,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      await query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => {
        if (USE_SQLITE) {
          return file.endsWith('_sqlite.sql');
        } else {
          return file.endsWith('.sql') && !file.includes('_sqlite');
        }
      })
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Check which migrations have already been executed
    const executedMigrations = await query(
      'SELECT filename FROM migrations ORDER BY filename'
    );
    const executedFilenames = executedMigrations.rows.map(row => row.filename);

    // Execute pending migrations
    for (const filename of migrationFiles) {
      if (executedFilenames.includes(filename)) {
        console.log(`Skipping already executed migration: ${filename}`);
        continue;
      }

      console.log(`Executing migration: ${filename}`);

      // Read and execute migration file
      const migrationPath = path.join(migrationsDir, filename);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      try {
        // Execute migration (SQLite doesn't support transactions for DDL in the same way)
        if (USE_SQLITE) {
          // Split SQL statements and execute them one by one
          const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

          for (const statement of statements) {
            if (statement.trim()) {
              await query(statement);
            }
          }
        } else {
          await query('BEGIN');
          await query(migrationSQL);
        }

        // Record migration as executed
        if (USE_SQLITE) {
          await query('INSERT INTO migrations (filename) VALUES (?)', [filename]);
        } else {
          await query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
          await query('COMMIT');
        }

        console.log(`Successfully executed migration: ${filename}`);

      } catch (error) {
        if (!USE_SQLITE) {
          await query('ROLLBACK');
        }
        throw error;
      }
    }

    console.log('Database migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Reset database (drop all tables and re-run migrations)
 */
async function resetDatabase() {
  try {
    console.log('Resetting database...');

    // Drop all tables in correct order (due to foreign key constraints)
    await query('DROP TABLE IF EXISTS assignments');
    await query('DROP TABLE IF EXISTS punishments');
    await query('DROP TABLE IF EXISTS rewards');
    await query('DROP TABLE IF EXISTS persons');
    await query('DROP TABLE IF EXISTS migrations');

    if (!USE_SQLITE) {
      // Drop functions (PostgreSQL only)
      await query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
    }

    console.log('Database reset completed');

    // Run migrations
    await runMigrations();

  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'reset') {
    resetDatabase()
      .then(() => {
        console.log('Database reset and migration completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Database reset failed:', error);
        process.exit(1);
      });
  } else {
    runMigrations()
      .then(() => {
        console.log('Migration completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  runMigrations,
  resetDatabase
};