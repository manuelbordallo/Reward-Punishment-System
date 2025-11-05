const { query, transaction } = require('../utils/database');

/**
 * Repository class for managing Assignment data access operations and score calculations
 */
class AssignmentRepository {
  /**
   * Get all assignments from the database
   * @param {Object} [options] - Query options
   * @param {number} [options.limit] - Maximum number of assignments to return
   * @param {number} [options.offset] - Number of assignments to skip
   * @param {string} [options.orderBy='assigned_at'] - Field to order by
   * @param {string} [options.orderDirection='DESC'] - Order direction (ASC or DESC)
   * @returns {Promise<Array>} Array of assignment objects
   */
  async findAll(options = {}) {
    const { 
      limit, 
      offset = 0, 
      orderBy = 'assigned_at', 
      orderDirection = 'DESC' 
    } = options;
    
    let queryText = `
      SELECT 
        a.id, 
        a.person_id, 
        a.item_type, 
        a.item_id, 
        a.item_name, 
        a.item_value, 
        a.assigned_at,
        p.name as person_name
      FROM assignments a
      JOIN persons p ON a.person_id = p.id
      ORDER BY ${orderBy} ${orderDirection}
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (limit) {
      queryText += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }
    
    if (offset > 0) {
      queryText += ` OFFSET $${paramIndex++}`;
      params.push(offset);
    }
    
    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Find an assignment by ID
   * @param {number} id - Assignment ID
   * @returns {Promise<Object|null>} Assignment object or null if not found
   */
  async findById(id) {
    const result = await query(`
      SELECT 
        a.id, 
        a.person_id, 
        a.item_type, 
        a.item_id, 
        a.item_name, 
        a.item_value, 
        a.assigned_at,
        p.name as person_name
      FROM assignments a
      JOIN persons p ON a.person_id = p.id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find assignments by person ID
   * @param {number} personId - Person ID
   * @param {Object} [options] - Query options
   * @param {number} [options.limit] - Maximum number of assignments to return
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @returns {Promise<Array>} Array of assignment objects
   */
  async findByPersonId(personId, options = {}) {
    const { limit, startDate, endDate } = options;
    
    let queryText = `
      SELECT 
        a.id, 
        a.person_id, 
        a.item_type, 
        a.item_id, 
        a.item_name, 
        a.item_value, 
        a.assigned_at,
        p.name as person_name
      FROM assignments a
      JOIN persons p ON a.person_id = p.id
      WHERE a.person_id = $1
    `;
    
    const params = [personId];
    let paramIndex = 2;
    
    if (startDate) {
      queryText += ` AND a.assigned_at >= $${paramIndex++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      queryText += ` AND a.assigned_at <= $${paramIndex++}`;
      params.push(endDate);
    }
    
    queryText += ' ORDER BY a.assigned_at DESC';
    
    if (limit) {
      queryText += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }
    
    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Create multiple assignments (one item assigned to multiple persons)
   * @param {Object} assignmentData - Assignment data
   * @param {number[]} assignmentData.personIds - Array of person IDs
   * @param {string} assignmentData.itemType - Type of item ('reward' or 'punishment')
   * @param {number} assignmentData.itemId - ID of the item
   * @param {string} assignmentData.itemName - Name of the item (cached)
   * @param {number} assignmentData.itemValue - Value of the item (cached)
   * @returns {Promise<Array>} Array of created assignment objects
   */
  async createMultiple(assignmentData) {
    const { personIds, itemType, itemId, itemName, itemValue } = assignmentData;
    
    return await transaction(async (client) => {
      const assignments = [];
      
      for (const personId of personIds) {
        const result = await client.query(`
          INSERT INTO assignments (person_id, item_type, item_id, item_name, item_value) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING id, person_id, item_type, item_id, item_name, item_value, assigned_at
        `, [personId, itemType, itemId, itemName, itemValue]);
        
        assignments.push(result.rows[0]);
      }
      
      return assignments;
    });
  }

  /**
   * Delete an assignment by ID
   * @param {number} id - Assignment ID
   * @returns {Promise<boolean>} True if assignment was deleted, false if not found
   */
  async delete(id) {
    const result = await query(`
      DELETE FROM assignments 
      WHERE id = $1
    `, [id]);
    return result.rowCount > 0;
  }

  /**
   * Get total scores for all persons
   * @returns {Promise<Array>} Array of person score objects
   */
  async getTotalScores() {
    const result = await query(`
      SELECT 
        p.id as person_id,
        p.name as person_name,
        COALESCE(SUM(a.item_value), 0) as total_score,
        COUNT(a.id) as assignment_count
      FROM persons p
      LEFT JOIN assignments a ON p.id = a.person_id
      GROUP BY p.id, p.name
      ORDER BY total_score DESC, p.name ASC
    `);
    return result.rows;
  }

  /**
   * Get weekly scores for all persons (current week)
   * @param {Date} [weekStart] - Start of the week (defaults to current week Monday)
   * @returns {Promise<Array>} Array of person weekly score objects
   */
  async getWeeklyScores(weekStart = null) {
    // If no weekStart provided, calculate current week's Monday
    if (!weekStart) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
    }
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const result = await query(`
      SELECT 
        p.id as person_id,
        p.name as person_name,
        COALESCE(SUM(a.item_value), 0) as weekly_score,
        COUNT(a.id) as weekly_assignment_count,
        $1::timestamp as week_start,
        $2::timestamp as week_end
      FROM persons p
      LEFT JOIN assignments a ON p.id = a.person_id 
        AND a.assigned_at >= $1 
        AND a.assigned_at < $2
      GROUP BY p.id, p.name
      ORDER BY weekly_score DESC, p.name ASC
    `, [weekStart, weekEnd]);
    
    return result.rows;
  }

  /**
   * Get score for a specific person
   * @param {number} personId - Person ID
   * @returns {Promise<Object|null>} Person score object or null if person not found
   */
  async getPersonScore(personId) {
    const result = await query(`
      SELECT 
        p.id as person_id,
        p.name as person_name,
        COALESCE(SUM(a.item_value), 0) as total_score,
        COUNT(a.id) as assignment_count
      FROM persons p
      LEFT JOIN assignments a ON p.id = a.person_id
      WHERE p.id = $1
      GROUP BY p.id, p.name
    `, [personId]);
    
    return result.rows[0] || null;
  }

  /**
   * Get weekly score for a specific person
   * @param {number} personId - Person ID
   * @param {Date} [weekStart] - Start of the week (defaults to current week Monday)
   * @returns {Promise<Object|null>} Person weekly score object or null if person not found
   */
  async getPersonWeeklyScore(personId, weekStart = null) {
    // If no weekStart provided, calculate current week's Monday
    if (!weekStart) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
    }
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const result = await query(`
      SELECT 
        p.id as person_id,
        p.name as person_name,
        COALESCE(SUM(a.item_value), 0) as weekly_score,
        COUNT(a.id) as weekly_assignment_count,
        $2::timestamp as week_start,
        $3::timestamp as week_end
      FROM persons p
      LEFT JOIN assignments a ON p.id = a.person_id 
        AND a.assigned_at >= $2 
        AND a.assigned_at < $3
      WHERE p.id = $1
      GROUP BY p.id, p.name
    `, [personId, weekStart, weekEnd]);
    
    return result.rows[0] || null;
  }

  /**
   * Get assignment statistics
   * @returns {Promise<Object>} Assignment statistics
   */
  async getStatistics() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_assignments,
        COUNT(CASE WHEN item_type = 'reward' THEN 1 END) as reward_assignments,
        COUNT(CASE WHEN item_type = 'punishment' THEN 1 END) as punishment_assignments,
        AVG(item_value) as average_value,
        SUM(CASE WHEN item_value > 0 THEN item_value ELSE 0 END) as total_rewards,
        SUM(CASE WHEN item_value < 0 THEN ABS(item_value) ELSE 0 END) as total_punishments
      FROM assignments
    `);
    
    return result.rows[0];
  }

  /**
   * Get assignments within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} [options] - Query options
   * @param {number} [options.limit] - Maximum number of assignments to return
   * @returns {Promise<Array>} Array of assignment objects
   */
  async findByDateRange(startDate, endDate, options = {}) {
    const { limit } = options;
    
    let queryText = `
      SELECT 
        a.id, 
        a.person_id, 
        a.item_type, 
        a.item_id, 
        a.item_name, 
        a.item_value, 
        a.assigned_at,
        p.name as person_name
      FROM assignments a
      JOIN persons p ON a.person_id = p.id
      WHERE a.assigned_at >= $1 AND a.assigned_at <= $2
      ORDER BY a.assigned_at DESC
    `;
    
    const params = [startDate, endDate];
    
    if (limit) {
      queryText += ' LIMIT $3';
      params.push(limit);
    }
    
    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get count of total assignments
   * @returns {Promise<number>} Total count of assignments
   */
  async count() {
    const result = await query('SELECT COUNT(*) as count FROM assignments');
    return parseInt(result.rows[0].count);
  }
}

module.exports = AssignmentRepository;