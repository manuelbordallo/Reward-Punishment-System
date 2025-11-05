const AssignmentRepository = require('../repositories/AssignmentRepository');
const PersonRepository = require('../repositories/PersonRepository');
const RewardRepository = require('../repositories/RewardRepository');
const PunishmentRepository = require('../repositories/PunishmentRepository');
const { createAssignmentSchema } = require('../models/Assignment');

/**
 * Service class for Assignment business logic operations
 */
class AssignmentService {
  constructor() {
    this.assignmentRepository = new AssignmentRepository();
    this.personRepository = new PersonRepository();
    this.rewardRepository = new RewardRepository();
    this.punishmentRepository = new PunishmentRepository();
  }

  /**
   * Get all assignments with optional filtering
   * @param {Object} [options] - Query options
   * @param {number} [options.limit] - Maximum number of assignments to return
   * @param {number} [options.offset] - Number of assignments to skip
   * @param {string} [options.orderBy] - Field to order by
   * @param {string} [options.orderDirection] - Order direction (ASC or DESC)
   * @returns {Promise<Array>} Array of assignment objects
   */
  async getAllAssignments(options = {}) {
    return await this.assignmentRepository.findAll(options);
  }

  /**
   * Get assignment by ID
   * @param {number} id - Assignment ID
   * @returns {Promise<Object>} Assignment object
   * @throws {Error} If assignment not found
   */
  async getAssignmentById(id) {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new Error(`Asignación con ID ${id} no encontrada`);
    }
    return assignment;
  }

  /**
   * Get assignments by person ID
   * @param {number} personId - Person ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Array>} Array of assignment objects
   * @throws {Error} If person not found
   */
  async getAssignmentsByPersonId(personId, options = {}) {
    // Verify person exists
    const person = await this.personRepository.findById(personId);
    if (!person) {
      throw new Error(`Persona con ID ${personId} no encontrada`);
    }

    return await this.assignmentRepository.findByPersonId(personId, options);
  }

  /**
   * Create multiple assignments (assign one item to multiple persons)
   * @param {Object} assignmentData - Assignment data
   * @param {number[]} assignmentData.personIds - Array of person IDs
   * @param {string} assignmentData.itemType - Type of item ('reward' or 'punishment')
   * @param {number} assignmentData.itemId - ID of the item
   * @returns {Promise<Array>} Array of created assignment objects
   * @throws {Error} If validation fails or referenced entities don't exist
   */
  async createAssignments(assignmentData) {
    // Validate input data
    const { error, value } = createAssignmentSchema.validate(assignmentData);
    if (error) {
      throw new Error(`Datos inválidos: ${error.details[0].message}`);
    }

    const { personIds, itemType, itemId } = value;

    // Verify all persons exist
    const persons = [];
    for (const personId of personIds) {
      const person = await this.personRepository.findById(personId);
      if (!person) {
        throw new Error(`Persona con ID ${personId} no encontrada`);
      }
      persons.push(person);
    }

    // Verify item exists and get its details
    let item;
    if (itemType === 'reward') {
      item = await this.rewardRepository.findById(itemId);
      if (!item) {
        throw new Error(`Premio con ID ${itemId} no encontrado`);
      }
      // Business rule: Verify reward value is positive
      if (item.value <= 0) {
        throw new Error(`El premio "${item.name}" tiene un valor inválido (${item.value}). Los premios deben tener valores positivos.`);
      }
    } else if (itemType === 'punishment') {
      item = await this.punishmentRepository.findById(itemId);
      if (!item) {
        throw new Error(`Castigo con ID ${itemId} no encontrado`);
      }
      // Business rule: Verify punishment value is negative
      if (item.value >= 0) {
        throw new Error(`El castigo "${item.name}" tiene un valor inválido (${item.value}). Los castigos deben tener valores negativos.`);
      }
    } else {
      throw new Error(`Tipo de elemento inválido: ${itemType}`);
    }

    // Create assignments
    const assignmentCreateData = {
      personIds,
      itemType,
      itemId,
      itemName: item.name,
      itemValue: item.value
    };

    return await this.assignmentRepository.createMultiple(assignmentCreateData);
  }

  /**
   * Delete an assignment
   * @param {number} id - Assignment ID
   * @returns {Promise<boolean>} True if assignment was deleted
   * @throws {Error} If assignment not found
   */
  async deleteAssignment(id) {
    // Check if assignment exists
    const existingAssignment = await this.assignmentRepository.findById(id);
    if (!existingAssignment) {
      throw new Error(`Asignación con ID ${id} no encontrada`);
    }

    // Delete the assignment
    const deleted = await this.assignmentRepository.delete(id);
    if (!deleted) {
      throw new Error(`Error al eliminar la asignación con ID ${id}`);
    }

    return true;
  }

  /**
   * Get assignments within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} [options] - Query options
   * @returns {Promise<Array>} Array of assignment objects
   * @throws {Error} If date range is invalid
   */
  async getAssignmentsByDateRange(startDate, endDate, options = {}) {
    // Validate date range
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error('Las fechas de inicio y fin deben ser objetos Date válidos');
    }

    if (startDate > endDate) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    return await this.assignmentRepository.findByDateRange(startDate, endDate, options);
  }

  /**
   * Get assignment statistics
   * @returns {Promise<Object>} Assignment statistics
   */
  async getAssignmentStatistics() {
    const stats = await this.assignmentRepository.getStatistics();
    const totalCount = await this.assignmentRepository.count();

    return {
      totalAssignments: totalCount,
      rewardAssignments: parseInt(stats.reward_assignments) || 0,
      punishmentAssignments: parseInt(stats.punishment_assignments) || 0,
      averageValue: parseFloat(stats.average_value) || 0,
      totalRewardValue: parseInt(stats.total_rewards) || 0,
      totalPunishmentValue: parseInt(stats.total_punishments) || 0
    };
  }

  /**
   * Get recent assignments
   * @param {number} [limit=10] - Maximum number of assignments to return
   * @returns {Promise<Array>} Array of recent assignment objects
   */
  async getRecentAssignments(limit = 10) {
    return await this.assignmentRepository.findAll({
      limit,
      orderBy: 'assigned_at',
      orderDirection: 'DESC'
    });
  }

  /**
   * Validate assignment data before creation
   * @param {Object} assignmentData - Assignment data to validate
   * @returns {Promise<Object>} Validation result with details
   */
  async validateAssignmentData(assignmentData) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Basic schema validation
      const { error } = createAssignmentSchema.validate(assignmentData);
      if (error) {
        result.isValid = false;
        result.errors.push(`Datos inválidos: ${error.details[0].message}`);
        return result;
      }

      const { personIds, itemType, itemId } = assignmentData;

      // Check if persons exist
      for (const personId of personIds) {
        const person = await this.personRepository.findById(personId);
        if (!person) {
          result.isValid = false;
          result.errors.push(`Persona con ID ${personId} no encontrada`);
        }
      }

      // Check if item exists
      let item;
      if (itemType === 'reward') {
        item = await this.rewardRepository.findById(itemId);
        if (!item) {
          result.isValid = false;
          result.errors.push(`Premio con ID ${itemId} no encontrado`);
        } else if (item.value <= 0) {
          result.isValid = false;
          result.errors.push(`El premio "${item.name}" tiene un valor inválido`);
        }
      } else if (itemType === 'punishment') {
        item = await this.punishmentRepository.findById(itemId);
        if (!item) {
          result.isValid = false;
          result.errors.push(`Castigo con ID ${itemId} no encontrado`);
        } else if (item.value >= 0) {
          result.isValid = false;
          result.errors.push(`El castigo "${item.name}" tiene un valor inválido`);
        }
      }

      // Add warnings for multiple assignments
      if (personIds.length > 5) {
        result.warnings.push(`Se asignará a ${personIds.length} personas. Confirme que esto es correcto.`);
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Error de validación: ${error.message}`);
    }

    return result;
  }

  /**
   * Get assignment summary for a specific item
   * @param {string} itemType - Type of item ('reward' or 'punishment')
   * @param {number} itemId - ID of the item
   * @returns {Promise<Object>} Assignment summary
   */
  async getItemAssignmentSummary(itemType, itemId) {
    if (!['reward', 'punishment'].includes(itemType)) {
      throw new Error(`Tipo de elemento inválido: ${itemType}`);
    }

    // Get item details
    let item;
    if (itemType === 'reward') {
      item = await this.rewardRepository.findById(itemId);
    } else {
      item = await this.punishmentRepository.findById(itemId);
    }

    if (!item) {
      throw new Error(`${itemType === 'reward' ? 'Premio' : 'Castigo'} con ID ${itemId} no encontrado`);
    }

    // Get all assignments for this item
    const allAssignments = await this.assignmentRepository.findAll();
    const itemAssignments = allAssignments.filter(a => 
      a.item_type === itemType && a.item_id === itemId
    );

    // Calculate summary
    const totalAssignments = itemAssignments.length;
    const uniquePersons = new Set(itemAssignments.map(a => a.person_id)).size;
    const totalValue = totalAssignments * item.value;

    return {
      item,
      totalAssignments,
      uniquePersonsAssigned: uniquePersons,
      totalValue,
      assignments: itemAssignments
    };
  }
}

module.exports = AssignmentService;