const { query: dbQuery, db, USE_SQLITE } = require('../config/database');

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await dbQuery(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount || res.rows?.length });
    return res;
  } catch (error) {
    console.error('Database query error:', { text, params, error: error.message });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  if (USE_SQLITE) {
    // For SQLite, return the db instance
    return db;
  } else {
    return await db.connect();
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Function that receives client and executes queries
 * @returns {Promise<any>} Result of the callback
 */
async function transaction(callback) {
  if (USE_SQLITE) {
    // SQLite doesn't support the same transaction pattern, execute directly
    return await callback({ query: dbQuery });
  } else {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

/**
 * Check if database is healthy
 * @returns {Promise<boolean>} True if database is accessible
 */
async function healthCheck() {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
async function getStats() {
  try {
    if (USE_SQLITE) {
      // SQLite doesn't have the same stats tables
      const result = await query(`
        SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
      `);
      
      return {
        tables: result.rows,
        database: 'SQLite',
        totalConnections: 1,
        idleConnections: 0,
        waitingConnections: 0
      };
    } else {
      const result = await query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables
        ORDER BY tablename
      `);
      
      return {
        tables: result.rows,
        totalConnections: db.totalCount,
        idleConnections: db.idleCount,
        waitingConnections: db.waitingCount
      };
    }
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
}

module.exports = {
  query,
  getClient,
  transaction,
  healthCheck,
  getStats
};