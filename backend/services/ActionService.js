const ActionRepository = require('../repositories/ActionRepository');
const Action = require('../models/Action');

/**
 * Service class for action business logic operations
 */
class ActionService {
  constructor() {
    this.actionRepository = new ActionRepository();
  }

  /**
   * Get all actions with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of actions
   */
  async getAllActions(filters = {}) {
    try {
      const actions = await this.actionRepository.findAll(filters);
      return actions.map(action => new Action(action).toResponse());
    } catch (error) {
      console.error('Error in getAllActions:', error);
      throw new Error('Error al obtener acciones');
    }
  }

  /**
   * Get positive actions (rewards)
   * @returns {Promise<Array>} Array of positive actions
   */
  async getPositiveActions() {
    try {
      const actions = await this.actionRepository.findPositive();
      return actions.map(action => new Action(action).toResponse());
    } catch (error) {
      console.error('Error in getPositiveActions:', error);
      throw new Error('Error al obtener acciones positivas');
    }
  }

  /**
   * Get negative actions (punishments)
   * @returns {Promise<Array>} Array of negative actions
   */
  async getNegativeActions() {
    try {
      const actions = await this.actionRepository.findNegative();
      return actions.map(action => new Action(action).toResponse());
    } catch (error) {
      console.error('Error in getNegativeActions:', error);
      throw new Error('Error al obtener acciones negativas');
    }
  }

  /**
   * Get action by ID
   * @param {number} id - Action ID
   * @returns {Promise<Object>} Action object
   * @throws {Error} If action not found
   */
  async getActionById(id) {
    try {
      const action = await this.actionRepository.findById(id);
      if (!action) {
        throw new Error(`Acción con ID ${id} no encontrada`);
      }
      return new Action(action).toResponse();
    } catch (error) {
      console.error('Error in getActionById:', error);
      throw error;
    }
  }

  /**
   * Create new action
   * @param {Object} actionData - Action data
   * @returns {Promise<Object>} Created action
   * @throws {Error} If validation fails or action already exists
   */
  async createAction(actionData) {
    try {
      // Create and validate action
      const action = new Action(actionData);
      const validation = action.validate();
      
      if (!validation.isValid) {
        throw new Error(`Datos de acción inválidos: ${validation.errors.join(', ')}`);
      }

      // Check if action with same name already exists
      const existingAction = await this.actionRepository.findByName(action.name);
      if (existingAction) {
        throw new Error(`Ya existe una acción con el nombre "${action.name}"`);
      }

      // Create action
      const createdAction = await this.actionRepository.create(actionData);
      return new Action(createdAction).toResponse();
    } catch (error) {
      console.error('Error in createAction:', error);
      throw error;
    }
  }

  /**
   * Update action
   * @param {number} id - Action ID
   * @param {Object} actionData - Updated action data
   * @returns {Promise<Object>} Updated action
   * @throws {Error} If action not found or validation fails
   */
  async updateAction(id, actionData) {
    try {
      // Check if action exists
      const existingAction = await this.actionRepository.findById(id);
      if (!existingAction) {
        throw new Error(`Acción con ID ${id} no encontrada`);
      }

      // Create and validate updated action
      const action = new Action({ ...existingAction, ...actionData, id });
      const validation = action.validate();
      
      if (!validation.isValid) {
        throw new Error(`Datos de acción inválidos: ${validation.errors.join(', ')}`);
      }

      // Check if another action with same name exists (excluding current action)
      if (actionData.name && actionData.name !== existingAction.name) {
        const duplicateAction = await this.actionRepository.findByName(actionData.name);
        if (duplicateAction && duplicateAction.id !== id) {
          throw new Error(`Ya existe otra acción con el nombre "${actionData.name}"`);
        }
      }

      // Update action
      const updatedAction = await this.actionRepository.update(id, actionData);
      return new Action(updatedAction).toResponse();
    } catch (error) {
      console.error('Error in updateAction:', error);
      throw error;
    }
  }

  /**
   * Delete action
   * @param {number} id - Action ID
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If action not found or has dependencies
   */
  async deleteAction(id) {
    try {
      // Check if action exists
      const existingAction = await this.actionRepository.findById(id);
      if (!existingAction) {
        throw new Error(`Acción con ID ${id} no encontrada`);
      }

      // TODO: Check for dependencies (assignments using this action)
      // This would require checking the assignments table

      // Delete action
      const deleted = await this.actionRepository.delete(id);
      if (!deleted) {
        throw new Error('Error al eliminar la acción');
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAction:', error);
      throw error;
    }
  }

  /**
   * Search actions
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching actions
   */
  async searchActions(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return this.getAllActions();
      }

      const actions = await this.actionRepository.search(searchTerm.trim());
      return actions.map(action => new Action(action).toResponse());
    } catch (error) {
      console.error('Error in searchActions:', error);
      throw new Error('Error al buscar acciones');
    }
  }

  /**
   * Get action statistics
   * @returns {Promise<Object>} Action statistics
   */
  async getActionStatistics() {
    try {
      const stats = await this.actionRepository.getStatistics();
      return {
        totalActions: parseInt(stats.total_actions) || 0,
        positiveActions: parseInt(stats.positive_actions) || 0,
        negativeActions: parseInt(stats.negative_actions) || 0,
        averagePositiveValue: parseFloat(stats.avg_positive_value) || 0,
        averageNegativeValue: parseFloat(stats.avg_negative_value) || 0,
        maxValue: parseInt(stats.max_value) || 0,
        minValue: parseInt(stats.min_value) || 0
      };
    } catch (error) {
      console.error('Error in getActionStatistics:', error);
      throw new Error('Error al obtener estadísticas de acciones');
    }
  }

  /**
   * Validate action value based on type
   * @param {string} type - Action type ('positive' or 'negative')
   * @param {number} value - Action value
   * @returns {boolean} Validation result
   */
  validateActionValue(type, value) {
    if (type === 'positive' && value <= 0) {
      return false;
    }
    if (type === 'negative' && value >= 0) {
      return false;
    }
    return true;
  }

  /**
   * Convert legacy reward to action
   * @param {Object} rewardData - Legacy reward data
   * @returns {Promise<Object>} Created action
   */
  async convertRewardToAction(rewardData) {
    try {
      const actionData = {
        name: rewardData.name,
        value: Math.abs(rewardData.value), // Ensure positive
        type: 'positive'
      };
      return this.createAction(actionData);
    } catch (error) {
      console.error('Error converting reward to action:', error);
      throw error;
    }
  }

  /**
   * Convert legacy punishment to action
   * @param {Object} punishmentData - Legacy punishment data
   * @returns {Promise<Object>} Created action
   */
  async convertPunishmentToAction(punishmentData) {
    try {
      const actionData = {
        name: punishmentData.name,
        value: -Math.abs(punishmentData.value), // Ensure negative
        type: 'negative'
      };
      return this.createAction(actionData);
    } catch (error) {
      console.error('Error converting punishment to action:', error);
      throw error;
    }
  }
}

module.exports = ActionService;