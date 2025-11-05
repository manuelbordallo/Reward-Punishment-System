const { query } = require('../utils/database');

/**
 * Repository class for managing Punishment data access operations
 */
class PunishmentRepository {
  /**
   * Get all punishments from the database
   * @returns {Promise<Array>} Array of punishment objects
   */
  async findAll() {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE type = 'negative'
      ORDER BY name ASC
    `);
    return result.rows;
  }

  /**
   * Find a punishment by ID
   * @param {number} id - Punishment ID
   * @returns {Promise<Object|null>} Punishment object or null if not found
   */
  async findById(id) {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE id = ? AND type = 'negative'
    `, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find punishments by name (partial match)
   * @param {string} name - Punishment name to search for
   * @returns {Promise<Array>} Array of matching punishment objects
   */
  async findByName(name) {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE name LIKE ? AND type = 'negative'
      ORDER BY name ASC
    `, [`%${name}%`]);
    return result.rows;
  }

  /**
   * Create a new punishment
   * @param {Object} punishmentData - Punishment data
   * @param {string} punishmentData.name - Punishment name
   * @param {number} punishmentData.value - Punishment value (must be negative)
   * @returns {Promise<Object>} Created punishment object
   */
  async create(punishmentData) {
    const { name, value } = punishmentData;
    const result = await query(`
      INSERT INTO actions (name, value, type) 
      VALUES (?, ?, 'negative')
    `, [name, value]);

    // Get the created record
    const selectResult = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE id = ?
    `, [result.insertId]);

    return selectResult.rows[0];
  }

  /**
   * Update an existing punishment
   * @param {number} id - Punishment ID
   * @param {Object} punishmentData - Updated punishment data
   * @param {string} punishmentData.name - Updated punishment name
   * @param {number} punishmentData.value - Updated punishment value (must be negative)
   * @returns {Promise<Object|null>} Updated punishment object or null if not found
   */
  async update(id, punishmentData) {
    const { name, value } = punishmentData;
    const result = await query(`
      UPDATE actions 
      SET name = ?, value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND type = 'negative'
    `, [name, value, id]);

    if (result.rowCount === 0) {
      return null;
    }

    // Get the updated record
    const selectResult = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE id = ?
    `, [id]);

    return selectResult.rows[0] || null;
  }

  /**
   * Delete a punishment by ID
   * @param {number} id - Punishment ID
   * @returns {Promise<boolean>} True if punishment was deleted, false if not found
   */
  async delete(id) {
    const result = await query(`
      DELETE FROM actions 
      WHERE id = ? AND type = 'negative'
    `, [id]);
    return result.rowCount > 0;
  }

  /**
   * Get count of total punishments
   * @returns {Promise<number>} Total count of punishments
   */
  async count() {
    const result = await query('SELECT COUNT(*) as count FROM actions WHERE type = \'negative\'');
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if punishment is used in any assignments
   * @param {number} id - Punishment ID
   * @returns {Promise<boolean>} True if punishment is used in assignments, false otherwise
   */
  async isUsedInAssignments(id) {
    const result = await query(`
      SELECT 1 FROM assignments a
      JOIN actions ac ON a.action_id = ac.id
      WHERE ac.type = 'negative' AND ac.id = $1 
      LIMIT 1
    `, [id]);
    return result.rows.length > 0;
  }

  /**
   * Get punishments ordered by usage frequency
   * @param {number} [limit=10] - Maximum number of punishments to return
   * @returns {Promise<Array>} Array of punishment objects with usage count
   */
  async findMostUsed(limit = 10) {
    const result = await query(`
      SELECT 
        ac.id, 
        ac.name, 
        ac.value, 
        ac.created_at, 
        ac.updated_at,
        COUNT(a.id) as usage_count
      FROM actions ac
      LEFT JOIN assignments a ON ac.id = a.action_id AND a.action_value < 0
      WHERE ac.type = 'negative'
      GROUP BY ac.id, ac.name, ac.value, ac.created_at, ac.updated_at
      ORDER BY usage_count DESC, ac.name ASC
      LIMIT ?
    `, [limit]);
    return result.rows;
  }

  /**
   * Get punishments within a value range (remember values are negative)
   * @param {number} minValue - Minimum value (most negative, e.g., -100)
   * @param {number} maxValue - Maximum value (least negative, e.g., -1)
   * @returns {Promise<Array>} Array of punishment objects within the range
   */
  async findByValueRange(minValue, maxValue) {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE value >= ? AND value <= ? AND type = 'negative'
      ORDER BY value DESC, name ASC
    `, [minValue, maxValue]);
    return result.rows;
  }

  /**
   * Get punishments ordered by severity (most negative first)
   * @returns {Promise<Array>} Array of punishment objects ordered by severity
   */
  async findBySeverity() {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE type = 'negative'
      ORDER BY value ASC, name ASC
    `);
    return result.rows;
  }
}

module.exports = PunishmentRepository;