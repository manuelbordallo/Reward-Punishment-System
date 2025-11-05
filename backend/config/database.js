const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Use SQLite for development/testing, PostgreSQL for production
const USE_SQLITE = process.env.NODE_ENV !== 'production' || process.env.USE_SQLITE === 'true';

let db;
let pool;

if (USE_SQLITE) {
    // SQLite configuration
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('SQLite connection error:', err);
        } else {
            console.log('Connected to SQLite database');
        }
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
} else {
    // PostgreSQL configuration (original)
    const { Pool } = require('pg');

    const dbConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'reward_punishment_db',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };

    pool = new Pool(dbConfig);

    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });
}

// Unified query interface
const query = async (text, params = []) => {
    if (USE_SQLITE) {
        return new Promise((resolve, reject) => {
            if (text.toLowerCase().trim().startsWith('select')) {
                db.all(text, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({ rows });
                });
            } else {
                db.run(text, params, function (err) {
                    if (err) reject(err);
                    else resolve({
                        rows: [],
                        rowCount: this.changes,
                        insertId: this.lastID
                    });
                });
            }
        });
    } else {
        const client = await pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }
};

// Test database connection
const testConnection = async () => {
    try {
        if (USE_SQLITE) {
            await query('SELECT 1');
            console.log('SQLite database connected successfully');
        } else {
            const client = await pool.connect();
            console.log('PostgreSQL database connected successfully');
            client.release();
        }
        return true;
    } catch (err) {
        console.error('Database connection error:', err);
        return false;
    }
};

module.exports = {
    query,
    testConnection,
    db: USE_SQLITE ? db : pool,
    USE_SQLITE
};