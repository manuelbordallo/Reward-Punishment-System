/**
 * Action model - represents both rewards (positive) and punishments (negative)
 */
class Action {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.value = data.value || 0;
    this.type = data.type || (data.value >= 0 ? 'positive' : 'negative');
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Validate action data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    // Name validation
    if (!this.name || typeof this.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else if (this.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (this.name.length > 255) {
      errors.push('Name must be less than 255 characters');
    }

    // Value validation
    if (typeof this.value !== 'number') {
      errors.push('Value must be a number');
    } else if (this.value === 0) {
      errors.push('Value cannot be zero');
    }

    // Type validation
    if (!['positive', 'negative'].includes(this.type)) {
      errors.push('Type must be either "positive" or "negative"');
    }

    // Consistency validation between type and value
    if (this.type === 'positive' && this.value < 0) {
      errors.push('Positive actions must have positive values');
    } else if (this.type === 'negative' && this.value > 0) {
      errors.push('Negative actions must have negative values');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize action data
   * @returns {Action} Sanitized action
   */
  sanitize() {
    return new Action({
      ...this,
      name: this.name ? this.name.trim() : '',
      value: parseInt(this.value) || 0,
      type: this.value >= 0 ? 'positive' : 'negative'
    });
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDatabase() {
    const sanitized = this.sanitize();
    const validation = sanitized.validate();
    
    if (!validation.isValid) {
      throw new Error(`Invalid action data: ${validation.errors.join(', ')}`);
    }

    return {
      name: sanitized.name,
      value: sanitized.value,
      type: sanitized.type
    };
  }

  /**
   * Convert to API response format
   * @returns {Object} API-ready object
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      value: this.value,
      type: this.type,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Check if action is positive (reward)
   * @returns {boolean}
   */
  isPositive() {
    return this.type === 'positive' && this.value > 0;
  }

  /**
   * Check if action is negative (punishment)
   * @returns {boolean}
   */
  isNegative() {
    return this.type === 'negative' && this.value < 0;
  }

  /**
   * Get display name with value
   * @returns {string}
   */
  getDisplayName() {
    const sign = this.value > 0 ? '+' : '';
    return `${this.name} (${sign}${this.value} points)`;
  }

  /**
   * Create action from legacy reward data
   * @param {Object} rewardData - Legacy reward data
   * @returns {Action}
   */
  static fromReward(rewardData) {
    return new Action({
      id: rewardData.id,
      name: rewardData.name,
      value: Math.abs(rewardData.value), // Ensure positive
      type: 'positive',
      created_at: rewardData.created_at,
      updated_at: rewardData.updated_at
    });
  }

  /**
   * Create action from legacy punishment data
   * @param {Object} punishmentData - Legacy punishment data
   * @returns {Action}
   */
  static fromPunishment(punishmentData) {
    return new Action({
      id: punishmentData.id,
      name: punishmentData.name,
      value: -Math.abs(punishmentData.value), // Ensure negative
      type: 'negative',
      created_at: punishmentData.created_at,
      updated_at: punishmentData.updated_at
    });
  }
}

module.exports = Action;