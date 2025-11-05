const { query } = require('../utils/database');
const Action = require('../models/Action');

/**
 * Repository class for action data access operations
 */
class ActionRepository {
  /**
   * Get all actions
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of actions
   */
  async findAll(filters = {}) {
    try {
      let sql = 'SELECT * FROM actions';
      const params = [];
      const conditions = [];

      // Apply filters
      if (filters.type) {
        conditions.push('type = ?');
        params.push(filters.type);
      }

      if (filters.minValue !== undefined) {
        conditions.push('value >= ?');
        params.push(filters.minValue);
      }

      if (filters.maxValue !== undefined) {
        conditions.push('value <= ?');
        params.push(filters.maxValue);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error('Error getting all actions:', error);
      throw error;
    }
  }

  /**
   * Get positive actions (rewards)
   * @returns {Promise<Array>} Array of positive actions
   */
  async findPositive() {
    return this.findAll({ type: 'positive' });
  }

  /**
   * Get negative actions (punishments)
   * @returns {Promise<Array>} Array of negative actions
   */
  async findNegative() {
    return this.findAll({ type: 'negative' });
  }

  /**
   * Find action by ID
   * @param {number} id - Action ID
   * @returns {Promise<Object|null>} Action object or null
   */
  async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM actions WHERE id = ?',
        [id]
      );
      return result.rows?.[0] || null;
    } catch (error) {
      console.error('Error finding action by ID:', error);
      throw error;
    }
  }

  /**
   * Find action by name
   * @param {string} name - Action name
   * @returns {Promise<Object|null>} Action object or null
   */
  async findByName(name) {
    try {
      const result = await query(
        'SELECT * FROM actions WHERE name = ?',
        [name]
      );
      return result.rows?.[0] || null;
    } catch (error) {
      console.error('Error finding action by name:', error);
      throw error;
    }
  }

  /**
   * Create new action
   * @param {Object} actionData - Action data
   * @returns {Promise<Object>} Created action
   */
  async create(actionData) {
    try {
      const action = new Action(actionData);
      const dbData = action.toDatabase();

      const result = await query(`
        INSERT INTO actions (name, value, type) 
        VALUES (?, ?, ?) 
        RETURNING id, name, value, type, created_at, updated_at
      `, [dbData.name, dbData.value, dbData.type]);

      return result.rows?.[0] || result;
    } catch (error) {
      console.error('Error creating action:', error);
      throw error;
    }
  }

  /**
   * Update action
   * @param {number} id - Action ID
   * @param {Object} actionData - Updated action data
   * @returns {Promise<Object>} Updated action
   */
  async update(id, actionData) {
    try {
      const action = new Action({ ...actionData, id });
      const dbData = action.toDatabase();

      const result = await query(`
        UPDATE actions 
        SET name = ?, value = ?, type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING id, name, value, type, created_at, updated_at
      `, [dbData.name, dbData.value, dbData.type, id]);

      return result.rows?.[0] || result;
    } catch (error) {
      console.error('Error updating action:', error);
      throw error;
    }
  }

  /**
   * Delete action
   * @param {number} id - Action ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const result = await query('DELETE FROM actions WHERE id = ?', [id]);
      return (result.rowCount || result.changes) > 0;
    } catch (error) {
      console.error('Error deleting action:', error);
      throw error;
    }
  }

  /**
   * Check if action exists
   * @param {number} id - Action ID
   * @returns {Promise<boolean>} Existence status
   */
  async exists(id) {
    try {
      const result = await query(
        'SELECT 1 FROM actions WHERE id = ? LIMIT 1',
        [id]
      );
      return (result.rows?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking action existence:', error);
      throw error;
    }
  }

  /**
   * Get action statistics
   * @returns {Promise<Object>} Action statistics
   */
  async getStatistics() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_actions,
          COUNT(CASE WHEN type = 'positive' THEN 1 END) as positive_actions,
          COUNT(CASE WHEN type = 'negative' THEN 1 END) as negative_actions,
          AVG(CASE WHEN type = 'positive' THEN value END) as avg_positive_value,
          AVG(CASE WHEN type = 'negative' THEN value END) as avg_negative_value,
          MAX(value) as max_value,
          MIN(value) as min_value
        FROM actions
      `);

      return result.rows?.[0] || {};
    } catch (error) {
      console.error('Error getting action statistics:', error);
      throw error;
    }
  }

  /**
   * Search actions by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching actions
   */
  async search(searchTerm) {
    try {
      const result = await query(`
        SELECT * FROM actions 
        WHERE name LIKE ? 
        ORDER BY name ASC
      `, [`%${searchTerm}%`]);

      return result.rows || [];
    } catch (error) {
      console.error('Error searching actions:', error);
      throw error;
    }
  }
}

module.exports = ActionRepository;