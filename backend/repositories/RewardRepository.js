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
      FROM rewards 
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
      FROM rewards 
      WHERE id = $1
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
      FROM rewards 
      WHERE name ILIKE $1 
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
      INSERT INTO rewards (name, value) 
      VALUES ($1, $2) 
      RETURNING id, name, value, created_at, updated_at
    `, [name, value]);
    return result.rows[0];
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
      UPDATE rewards 
      SET name = $1, value = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING id, name, value, created_at, updated_at
    `, [name, value, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete a reward by ID
   * @param {number} id - Reward ID
   * @returns {Promise<boolean>} True if reward was deleted, false if not found
   */
  async delete(id) {
    const result = await query(`
      DELETE FROM rewards 
      WHERE id = $1
    `, [id]);
    return result.rowCount > 0;
  }

  /**
   * Get count of total rewards
   * @returns {Promise<number>} Total count of rewards
   */
  async count() {
    const result = await query('SELECT COUNT(*) as count FROM rewards');
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if reward is used in any assignments
   * @param {number} id - Reward ID
   * @returns {Promise<boolean>} True if reward is used in assignments, false otherwise
   */
  async isUsedInAssignments(id) {
    const result = await query(`
      SELECT 1 FROM assignments 
      WHERE item_type = 'reward' AND item_id = $1 
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
        r.id, 
        r.name, 
        r.value, 
        r.created_at, 
        r.updated_at,
        COUNT(a.id) as usage_count
      FROM rewards r
      LEFT JOIN assignments a ON r.id = a.item_id AND a.item_type = 'reward'
      GROUP BY r.id, r.name, r.value, r.created_at, r.updated_at
      ORDER BY usage_count DESC, r.name ASC
      LIMIT $1
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
      FROM rewards 
      WHERE value >= $1 AND value <= $2 
      ORDER BY value ASC, name ASC
    `, [minValue, maxValue]);
    return result.rows;
  }
}

module.exports = RewardRepository;