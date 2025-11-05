const RewardRepository = require('../repositories/RewardRepository');
const { createRewardSchema, updateRewardSchema } = require('../models/Reward');

/**
 * Service class for Reward business logic operations
 */
class RewardService {
  constructor() {
    this.rewardRepository = new RewardRepository();
  }

  /**
   * Get all rewards
   * @returns {Promise<Array>} Array of reward objects
   */
  async getAllRewards() {
    return await this.rewardRepository.findAll();
  }

  /**
   * Get reward by ID
   * @param {number} id - Reward ID
   * @returns {Promise<Object>} Reward object
   * @throws {Error} If reward not found
   */
  async getRewardById(id) {
    const reward = await this.rewardRepository.findById(id);
    if (!reward) {
      throw new Error(`Premio con ID ${id} no encontrado`);
    }
    return reward;
  }

  /**
   * Create a new reward with business validations
   * @param {Object} rewardData - Reward data
   * @param {string} rewardData.name - Reward name
   * @param {number} rewardData.value - Reward value (must be positive)
   * @returns {Promise<Object>} Created reward object
   * @throws {Error} If validation fails
   */
  async createReward(rewardData) {
    // Validate input data
    const { error, value } = createRewardSchema.validate(rewardData);
    if (error) {
      throw new Error(`Datos inválidos: ${error.details[0].message}`);
    }

    const { name, value: rewardValue } = value;

    // Business rule: Ensure value is positive (additional validation beyond Joi)
    if (rewardValue <= 0) {
      throw new Error('El valor del premio debe ser mayor que cero');
    }

    // Create the reward
    return await this.rewardRepository.create({ name, value: rewardValue });
  }

  /**
   * Update an existing reward with business validations
   * @param {number} id - Reward ID
   * @param {Object} rewardData - Updated reward data
   * @param {string} rewardData.name - Updated reward name
   * @param {number} rewardData.value - Updated reward value (must be positive)
   * @returns {Promise<Object>} Updated reward object
   * @throws {Error} If validation fails or reward not found
   */
  async updateReward(id, rewardData) {
    // Validate input data
    const { error, value } = updateRewardSchema.validate(rewardData);
    if (error) {
      throw new Error(`Datos inválidos: ${error.details[0].message}`);
    }

    const { name, value: rewardValue } = value;

    // Check if reward exists
    const existingReward = await this.rewardRepository.findById(id);
    if (!existingReward) {
      throw new Error(`Premio con ID ${id} no encontrado`);
    }

    // Business rule: Ensure value is positive (additional validation beyond Joi)
    if (rewardValue <= 0) {
      throw new Error('El valor del premio debe ser mayor que cero');
    }

    // Update the reward
    const updatedReward = await this.rewardRepository.update(id, { name, value: rewardValue });
    if (!updatedReward) {
      throw new Error(`Error al actualizar el premio con ID ${id}`);
    }

    return updatedReward;
  }

  /**
   * Delete a reward with business validations
   * @param {number} id - Reward ID
   * @returns {Promise<boolean>} True if reward was deleted
   * @throws {Error} If reward not found or is used in assignments
   */
  async deleteReward(id) {
    // Check if reward exists
    const existingReward = await this.rewardRepository.findById(id);
    if (!existingReward) {
      throw new Error(`Premio con ID ${id} no encontrado`);
    }

    // Business rule: Cannot delete reward that is used in assignments
    const isUsed = await this.rewardRepository.isUsedInAssignments(id);
    if (isUsed) {
      throw new Error(`No se puede eliminar el premio "${existingReward.name}" porque está siendo usado en asignaciones`);
    }

    // Delete the reward
    const deleted = await this.rewardRepository.delete(id);
    if (!deleted) {
      throw new Error(`Error al eliminar el premio con ID ${id}`);
    }

    return true;
  }

  /**
   * Get reward statistics
   * @returns {Promise<Object>} Reward statistics
   */
  async getRewardStatistics() {
    const totalCount = await this.rewardRepository.count();
    const allRewards = await this.rewardRepository.findAll();
    
    const totalValue = allRewards.reduce((sum, reward) => sum + reward.value, 0);
    const averageValue = allRewards.length > 0 ? totalValue / allRewards.length : 0;
    const maxValue = allRewards.length > 0 ? Math.max(...allRewards.map(r => r.value)) : 0;
    const minValue = allRewards.length > 0 ? Math.min(...allRewards.map(r => r.value)) : 0;

    return {
      totalRewards: totalCount,
      totalValue,
      averageValue: Math.round(averageValue * 100) / 100, // Round to 2 decimal places
      maxValue,
      minValue
    };
  }

  /**
   * Get most used rewards
   * @param {number} [limit=10] - Maximum number of rewards to return
   * @returns {Promise<Array>} Array of reward objects with usage count
   */
  async getMostUsedRewards(limit = 10) {
    return await this.rewardRepository.findMostUsed(limit);
  }

  /**
   * Get rewards within a value range
   * @param {number} minValue - Minimum value (inclusive)
   * @param {number} maxValue - Maximum value (inclusive)
   * @returns {Promise<Array>} Array of reward objects within the range
   * @throws {Error} If value range is invalid
   */
  async getRewardsByValueRange(minValue, maxValue) {
    // Validate range
    if (typeof minValue !== 'number' || typeof maxValue !== 'number') {
      throw new Error('Los valores mínimo y máximo deben ser números');
    }

    if (minValue <= 0 || maxValue <= 0) {
      throw new Error('Los valores mínimo y máximo deben ser positivos');
    }

    if (minValue > maxValue) {
      throw new Error('El valor mínimo no puede ser mayor que el valor máximo');
    }

    return await this.rewardRepository.findByValueRange(minValue, maxValue);
  }

  /**
   * Search rewards by name (partial match)
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching reward objects
   */
  async searchRewardsByName(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
      return [];
    }

    return await this.rewardRepository.findByName(searchTerm.trim());
  }

  /**
   * Validate reward value (business rule)
   * @param {number} value - Value to validate
   * @returns {boolean} True if value is valid for a reward
   */
  validateRewardValue(value) {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
  }

  /**
   * Get recommended reward value based on existing rewards
   * @returns {Promise<number>} Recommended value for new reward
   */
  async getRecommendedValue() {
    const stats = await this.getRewardStatistics();
    
    // If no rewards exist, suggest a default value
    if (stats.totalRewards === 0) {
      return 10;
    }

    // Suggest average value rounded to nearest 5
    const avgValue = stats.averageValue;
    return Math.max(5, Math.round(avgValue / 5) * 5);
  }
}

module.exports = RewardService;