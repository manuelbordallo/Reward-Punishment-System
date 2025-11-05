const { query } = require('../utils/database');

/**
 * Repository class for managing Reward data access operations
 */
class RewardRepository {
  /**
   * Get all rewards from the database
   * @returns {Promise<Array>} Array of reward objects
   */
  async findAll() {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE type = 'positive'
      ORDER BY name ASC
    `);
    return result.rows;
  }

  /**
   * Find a reward by ID
   * @param {number} id - Reward ID
   * @returns {Promise<Object|null>} Reward object or null if not found
   */
  async findById(id) {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE id = ? AND type = 'positive'
    `, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find rewards by name (partial match)
   * @param {string} name - Reward name to search for
   * @returns {Promise<Array>} Array of matching reward objects
   */
  async findByName(name) {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE name LIKE ? AND type = 'positive'
      ORDER BY name ASC
    `, [`%${name}%`]);
    return result.rows;
  }

  /**
   * Create a new reward
   * @param {Object} rewardData - Reward data
   * @param {string} rewardData.name - Reward name
   * @param {number} rewardData.value - Reward value (must be positive)
   * @returns {Promise<Object>} Created reward object
   */
  async create(rewardData) {
    const { name, value } = rewardData;
    const result = await query(`
      INSERT INTO actions (name, value, type) 
      VALUES (?, ?, 'positive')
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
   * Update an existing reward
   * @param {number} id - Reward ID
   * @param {Object} rewardData - Updated reward data
   * @param {string} rewardData.name - Updated reward name
   * @param {number} rewardData.value - Updated reward value (must be positive)
   * @returns {Promise<Object|null>} Updated reward object or null if not found
   */
  async update(id, rewardData) {
    const { name, value } = rewardData;
    const result = await query(`
      UPDATE actions 
      SET name = ?, value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND type = 'positive'
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
   * Delete a reward by ID
   * @param {number} id - Reward ID
   * @returns {Promise<boolean>} True if reward was deleted, false if not found
   */
  async delete(id) {
    const result = await query(`
      DELETE FROM actions 
      WHERE id = ? AND type = 'positive'
    `, [id]);
    return result.rowCount > 0;
  }

  /**
   * Get count of total rewards
   * @returns {Promise<number>} Total count of rewards
   */
  async count() {
    const result = await query('SELECT COUNT(*) as count FROM actions WHERE type = \'positive\'');
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if reward is used in any assignments
   * @param {number} id - Reward ID
   * @returns {Promise<boolean>} True if reward is used in assignments, false otherwise
   */
  async isUsedInAssignments(id) {
    const result = await query(`
      SELECT 1 FROM assignments a
      JOIN actions ac ON a.action_id = ac.id
      WHERE ac.type = 'positive' AND ac.id = $1 
      LIMIT 1
    `, [id]);
    return result.rows.length > 0;
  }

  /**
   * Get rewards ordered by usage frequency
   * @param {number} [limit=10] - Maximum number of rewards to return
   * @returns {Promise<Array>} Array of reward objects with usage count
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
      LEFT JOIN assignments a ON ac.id = a.action_id AND a.action_value > 0
      WHERE ac.type = 'positive'
      GROUP BY ac.id, ac.name, ac.value, ac.created_at, ac.updated_at
      ORDER BY usage_count DESC, ac.name ASC
      LIMIT ?
    `, [limit]);
    return result.rows;
  }

  /**
   * Get rewards within a value range
   * @param {number} minValue - Minimum value (inclusive)
   * @param {number} maxValue - Maximum value (inclusive)
   * @returns {Promise<Array>} Array of reward objects within the range
   */
  async findByValueRange(minValue, maxValue) {
    const result = await query(`
      SELECT id, name, value, created_at, updated_at 
      FROM actions 
      WHERE value >= ? AND value <= ? AND type = 'positive'
      ORDER BY value ASC, name ASC
    `, [minValue, maxValue]);
    return result.rows;
  }
}

module.exports = RewardRepository;