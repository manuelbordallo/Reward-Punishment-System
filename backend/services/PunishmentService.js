const PunishmentRepository = require('../repositories/PunishmentRepository');
const { createPunishmentSchema, updatePunishmentSchema } = require('../models/Punishment');

/**
 * Service class for Punishment business logic operations
 */
class PunishmentService {
    constructor() {
        this.punishmentRepository = new PunishmentRepository();
    }

    /**
     * Get all punishments
     * @returns {Promise<Array>} Array of punishment objects
     */
    async getAllPunishments() {
        return await this.punishmentRepository.findAll();
    }

    /**
     * Get punishment by ID
     * @param {number} id - Punishment ID
     * @returns {Promise<Object>} Punishment object
     * @throws {Error} If punishment not found
     */
    async getPunishmentById(id) {
        const punishment = await this.punishmentRepository.findById(id);
        if (!punishment) {
            throw new Error(`Castigo con ID ${id} no encontrado`);
        }
        return punishment;
    }

    /**
     * Create a new punishment with business validations
     * @param {Object} punishmentData - Punishment data
     * @param {string} punishmentData.name - Punishment name
     * @param {number} punishmentData.value - Punishment value (must be negative)
     * @returns {Promise<Object>} Created punishment object
     * @throws {Error} If validation fails
     */
    async createPunishment(punishmentData) {
        // Validate input data
        const { error, value } = createPunishmentSchema.validate(punishmentData);
        if (error) {
            throw new Error(`Datos inválidos: ${error.details[0].message}`);
        }

        const { name, value: punishmentValue } = value;

        // Business rule: Ensure value is negative (additional validation beyond Joi)
        if (punishmentValue >= 0) {
            throw new Error('El valor del castigo debe ser menor que cero');
        }

        // Create the punishment
        return await this.punishmentRepository.create({ name, value: punishmentValue });
    }

    /**
     * Update an existing punishment with business validations
     * @param {number} id - Punishment ID
     * @param {Object} punishmentData - Updated punishment data
     * @param {string} punishmentData.name - Updated punishment name
     * @param {number} punishmentData.value - Updated punishment value (must be negative)
     * @returns {Promise<Object>} Updated punishment object
     * @throws {Error} If validation fails or punishment not found
     */
    async updatePunishment(id, punishmentData) {
        // Validate input data
        const { error, value } = updatePunishmentSchema.validate(punishmentData);
        if (error) {
            throw new Error(`Datos inválidos: ${error.details[0].message}`);
        }

        const { name, value: punishmentValue } = value;

        // Check if punishment exists
        const existingPunishment = await this.punishmentRepository.findById(id);
        if (!existingPunishment) {
            throw new Error(`Castigo con ID ${id} no encontrado`);
        }

        // Business rule: Ensure value is negative (additional validation beyond Joi)
        if (punishmentValue >= 0) {
            throw new Error('El valor del castigo debe ser menor que cero');
        }

        // Update the punishment
        const updatedPunishment = await this.punishmentRepository.update(id, { name, value: punishmentValue });
        if (!updatedPunishment) {
            throw new Error(`Error al actualizar el castigo con ID ${id}`);
        }

        return updatedPunishment;
    }

    /**
     * Delete a punishment with business validations
     * @param {number} id - Punishment ID
     * @returns {Promise<boolean>} True if punishment was deleted
     * @throws {Error} If punishment not found or is used in assignments
     */
    async deletePunishment(id) {
        // Check if punishment exists
        const existingPunishment = await this.punishmentRepository.findById(id);
        if (!existingPunishment) {
            throw new Error(`Castigo con ID ${id} no encontrado`);
        }

        // Business rule: Cannot delete punishment that is used in assignments
        const isUsed = await this.punishmentRepository.isUsedInAssignments(id);
        if (isUsed) {
            throw new Error(`No se puede eliminar el castigo "${existingPunishment.name}" porque está siendo usado en asignaciones`);
        }

        // Delete the punishment
        const deleted = await this.punishmentRepository.delete(id);
        if (!deleted) {
            throw new Error(`Error al eliminar el castigo con ID ${id}`);
        }

        return true;
    }

    /**
     * Get punishment statistics
     * @returns {Promise<Object>} Punishment statistics
     */
    async getPunishmentStatistics() {
        const totalCount = await this.punishmentRepository.count();
        const allPunishments = await this.punishmentRepository.findAll();

        const totalValue = allPunishments.reduce((sum, punishment) => sum + Math.abs(punishment.value), 0);
        const averageValue = allPunishments.length > 0 ? totalValue / allPunishments.length : 0;
        const maxValue = allPunishments.length > 0 ? Math.max(...allPunishments.map(p => Math.abs(p.value))) : 0;
        const minValue = allPunishments.length > 0 ? Math.min(...allPunishments.map(p => Math.abs(p.value))) : 0;

        return {
            totalPunishments: totalCount,
            totalAbsoluteValue: totalValue,
            averageAbsoluteValue: Math.round(averageValue * 100) / 100, // Round to 2 decimal places
            maxAbsoluteValue: maxValue,
            minAbsoluteValue: minValue
        };
    }

    /**
     * Get most used punishments
     * @param {number} [limit=10] - Maximum number of punishments to return
     * @returns {Promise<Array>} Array of punishment objects with usage count
     */
    async getMostUsedPunishments(limit = 10) {
        return await this.punishmentRepository.findMostUsed(limit);
    }

    /**
     * Get punishments within a value range (remember values are negative)
     * @param {number} minValue - Minimum value (most negative, e.g., -100)
     * @param {number} maxValue - Maximum value (least negative, e.g., -1)
     * @returns {Promise<Array>} Array of punishment objects within the range
     * @throws {Error} If value range is invalid
     */
    async getPunishmentsByValueRange(minValue, maxValue) {
        // Validate range
        if (typeof minValue !== 'number' || typeof maxValue !== 'number') {
            throw new Error('Los valores mínimo y máximo deben ser números');
        }

        if (minValue >= 0 || maxValue >= 0) {
            throw new Error('Los valores mínimo y máximo deben ser negativos');
        }

        if (minValue > maxValue) {
            throw new Error('El valor mínimo no puede ser mayor que el valor máximo');
        }

        return await this.punishmentRepository.findByValueRange(minValue, maxValue);
    }

    /**
     * Get punishments ordered by severity (most negative first)
     * @returns {Promise<Array>} Array of punishment objects ordered by severity
     */
    async getPunishmentsBySeverity() {
        return await this.punishmentRepository.findBySeverity();
    }

    /**
     * Search punishments by name (partial match)
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Array of matching punishment objects
     */
    async searchPunishmentsByName(searchTerm) {
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
            return [];
        }

        return await this.punishmentRepository.findByName(searchTerm.trim());
    }

    /**
     * Validate punishment value (business rule)
     * @param {number} value - Value to validate
     * @returns {boolean} True if value is valid for a punishment
     */
    validatePunishmentValue(value) {
        return typeof value === 'number' && Number.isInteger(value) && value < 0;
    }

    /**
     * Get recommended punishment value based on existing punishments
     * @returns {Promise<number>} Recommended value for new punishment (negative)
     */
    async getRecommendedValue() {
        const stats = await this.getPunishmentStatistics();

        // If no punishments exist, suggest a default value
        if (stats.totalPunishments === 0) {
            return -10;
        }

        // Suggest average absolute value rounded to nearest 5, but make it negative
        const avgAbsValue = stats.averageAbsoluteValue;
        const recommendedAbs = Math.max(5, Math.round(avgAbsValue / 5) * 5);
        return -recommendedAbs;
    }

    /**
     * Convert punishment value to severity level
     * @param {number} value - Punishment value (negative)
     * @returns {string} Severity level description
     */
    getSeverityLevel(value) {
        if (value >= 0) {
            return 'Inválido';
        }

        const absValue = Math.abs(value);

        if (absValue <= 5) {
            return 'Leve';
        } else if (absValue <= 15) {
            return 'Moderado';
        } else if (absValue <= 30) {
            return 'Severo';
        } else {
            return 'Muy Severo';
        }
    }
}

module.exports = PunishmentService;