const { query, USE_SQLITE } = require('../config/database');

/**
 * Convert PostgreSQL-style parameters ($1, $2) to SQLite-style (?, ?)
 */
const convertQuery = (sqlQuery, params) => {
  if (USE_SQLITE) {
    let paramIndex = 1;
    const convertedQuery = sqlQuery.replace(/\$\d+/g, () => '?');
    return { query: convertedQuery, params };
  }
  return { query: sqlQuery, params };
};

/**
 * Repository class for managing Person data access operations
 */
class PersonRepository {
  /**
   * Get all persons from the database
   * @returns {Promise<Array>} Array of person objects
   */
  async findAll() {
    const result = await query(`
      SELECT id, name, created_at, updated_at 
      FROM persons 
      ORDER BY name ASC
    `);
    return result.rows;
  }

  /**
   * Find a person by ID
   * @param {number} id - Person ID
   * @returns {Promise<Object|null>} Person object or null if not found
   */
  async findById(id) {
    const { query: sql, params } = convertQuery(`
      SELECT id, name, created_at, updated_at 
      FROM persons 
      WHERE id = $1
    `, [id]);
    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Find a person by name
   * @param {string} name - Person name
   * @returns {Promise<Object|null>} Person object or null if not found
   */
  async findByName(name) {
    const { query: sql, params } = convertQuery(`
      SELECT id, name, created_at, updated_at 
      FROM persons 
      WHERE name = $1
    `, [name]);
    console.log('findByName - SQL:', sql); // Debug log
    console.log('findByName - Params:', params); // Debug log
    const result = await query(sql, params);
    console.log('findByName - Result:', result); // Debug log
    return result.rows[0] || null;
  }

  /**
   * Create a new person
   * @param {Object} personData - Person data
   * @param {string} personData.name - Person name
   * @returns {Promise<Object>} Created person object
   */
  async create(personData) {
    const { name } = personData;

    if (USE_SQLITE) {
      // SQLite doesn't support RETURNING, so we need to insert and then select
      const insertResult = await query(`INSERT INTO persons (name) VALUES (?)`, [name]);
      console.log('Insert result:', insertResult); // Debug log
      
      if (!insertResult.insertId) {
        throw new Error('Failed to get insert ID from SQLite');
      }
      
      const selectResult = await query(`
        SELECT id, name, created_at, updated_at 
        FROM persons 
        WHERE id = ?
      `, [insertResult.insertId]);
      return selectResult.rows[0];
    } else {
      const { query: sql, params } = convertQuery(`
        INSERT INTO persons (name) 
        VALUES ($1) 
        RETURNING id, name, created_at, updated_at
      `, [name]);
      const result = await query(sql, params);
      return result.rows[0];
    }
  }

  /**
   * Update an existing person
   * @param {number} id - Person ID
   * @param {Object} personData - Updated person data
   * @param {string} personData.name - Updated person name
   * @returns {Promise<Object|null>} Updated person object or null if not found
   */
  async update(id, personData) {
    const { name } = personData;

    if (USE_SQLITE) {
      const updateResult = await query(`
        UPDATE persons 
        SET name = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [name, id]);

      if (updateResult.rowCount && updateResult.rowCount > 0) {
        const selectResult = await query(`
          SELECT id, name, created_at, updated_at 
          FROM persons 
          WHERE id = ?
        `, [id]);
        return selectResult.rows[0] || null;
      }
      return null;
    } else {
      const { query: sql, params } = convertQuery(`
        UPDATE persons 
        SET name = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING id, name, created_at, updated_at
      `, [name, id]);
      const result = await query(sql, params);
      return result.rows[0] || null;
    }
  }

  /**
   * Delete a person by ID
   * @param {number} id - Person ID
   * @returns {Promise<boolean>} True if person was deleted, false if not found
   */
  async delete(id) {
    const { query: sql, params } = convertQuery(`
      DELETE FROM persons 
      WHERE id = $1
    `, [id]);
    const result = await query(sql, params);
    return result.rowCount && result.rowCount > 0;
  }

  /**
   * Check if a person name already exists (excluding a specific ID)
   * @param {string} name - Person name to check
   * @param {number} [excludeId] - ID to exclude from the check (for updates)
   * @returns {Promise<boolean>} True if name exists, false otherwise
   */
  async nameExists(name, excludeId = null) {
    let queryText = 'SELECT 1 FROM persons WHERE name = $1';
    let params = [name];

    if (excludeId) {
      queryText += ' AND id != $2';
      params.push(excludeId);
    }

    const { query: sql, params: convertedParams } = convertQuery(queryText, params);
    const result = await query(sql, convertedParams);
    return result.rows.length > 0;
  }

  /**
   * Get count of total persons
   * @returns {Promise<number>} Total count of persons
   */
  async count() {
    const result = await query('SELECT COUNT(*) as count FROM persons');
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if person has any assignments
   * @param {number} id - Person ID
   * @returns {Promise<boolean>} True if person has assignments, false otherwise
   */
  async hasAssignments(id) {
    const { query: sql, params } = convertQuery(`
      SELECT 1 FROM assignments 
      WHERE person_id = $1 
      LIMIT 1
    `, [id]);
    const result = await query(sql, params);
    return result.rows.length > 0;
  }
}

module.exports = PersonRepository;