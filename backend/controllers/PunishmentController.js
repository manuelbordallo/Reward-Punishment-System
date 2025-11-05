const PunishmentService = require('../services/PunishmentService');
const { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  HTTP_STATUS,
  ERROR_CODES 
} = require('../models/ApiResponse');

/**
 * Controller for Punishment-related API endpoints
 */
class PunishmentController {
  constructor() {
    this.punishmentService = new PunishmentService();
  }

  /**
   * GET /api/punishments - Get all punishments
   */
  async getAllPunishments(req, res) {
    try {
      const punishments = await this.punishmentService.getAllPunishments();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(punishments));
    } catch (error) {
      console.error('Error getting all punishments:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/punishments/:id - Get punishment by ID
   */
  async getPunishmentById(req, res) {
    try {
      const { id } = req.params;
      const punishmentId = parseInt(id);

      if (isNaN(punishmentId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de castigo inválido')
        );
      }

      const punishment = await this.punishmentService.getPunishmentById(punishmentId);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(punishment));
    } catch (error) {
      console.error('Error getting punishment by ID:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Castigo', req.params.id)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * POST /api/punishments - Create new punishment
   */
  async createPunishment(req, res) {
    try {
      const punishment = await this.punishmentService.createPunishment(req.body);
      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse(punishment, 'Castigo creado exitosamente')
      );
    } catch (error) {
      console.error('Error creating punishment:', error);

      if (error.message.includes('Datos inválidos') || error.message.includes('debe ser menor que cero')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * PUT /api/punishments/:id - Update punishment
   */
  async updatePunishment(req, res) {
    try {
      const { id } = req.params;
      const punishmentId = parseInt(id);

      if (isNaN(punishmentId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de castigo inválido')
        );
      }

      const punishment = await this.punishmentService.updatePunishment(punishmentId, req.body);
      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(punishment, 'Castigo actualizado exitosamente')
      );
    } catch (error) {
      console.error('Error updating punishment:', error);

      if (error.message.includes('Datos inválidos') || error.message.includes('debe ser menor que cero')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message)
        );
      }

      if (error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Castigo', req.params.id)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * DELETE /api/punishments/:id - Delete punishment
   */
  async deletePunishment(req, res) {
    try {
      const { id } = req.params;
      const punishmentId = parseInt(id);

      if (isNaN(punishmentId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de castigo inválido')
        );
      }

      await this.punishmentService.deletePunishment(punishmentId);
      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(null, 'Castigo eliminado exitosamente')
      );
    } catch (error) {
      console.error('Error deleting punishment:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Castigo', req.params.id)
        );
      }

      if (error.message.includes('está siendo usado en asignaciones')) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createErrorResponse(ERROR_CODES.BUSINESS_RULE_VIOLATION, error.message)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/punishments/statistics - Get punishment statistics
   */
  async getPunishmentStatistics(req, res) {
    try {
      const statistics = await this.punishmentService.getPunishmentStatistics();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(statistics));
    } catch (error) {
      console.error('Error getting punishment statistics:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/punishments/most-used?limit=10 - Get most used punishments
   */
  async getMostUsedPunishments(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      if (limit < 1 || limit > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'El límite debe estar entre 1 y 100')
        );
      }

      const punishments = await this.punishmentService.getMostUsedPunishments(limit);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(punishments));
    } catch (error) {
      console.error('Error getting most used punishments:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/punishments/by-value-range?minValue=-100&maxValue=-1 - Get punishments by value range
   */
  async getPunishmentsByValueRange(req, res) {
    try {
      const { minValue, maxValue } = req.query;
      
      if (!minValue || !maxValue) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Los parámetros minValue y maxValue son requeridos')
        );
      }

      const minVal = parseInt(minValue);
      const maxVal = parseInt(maxValue);

      if (isNaN(minVal) || isNaN(maxVal)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Los valores mínimo y máximo deben ser números válidos')
        );
      }

      const punishments = await this.punishmentService.getPunishmentsByValueRange(minVal, maxVal);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(punishments));
    } catch (error) {
      console.error('Error getting punishments by value range:', error);

      if (error.message.includes('deben ser números') || 
          error.message.includes('deben ser negativos') || 
          error.message.includes('no puede ser mayor')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/punishments/by-severity - Get punishments ordered by severity
   */
  async getPunishmentsBySeverity(req, res) {
    try {
      const punishments = await this.punishmentService.getPunishmentsBySeverity();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(punishments));
    } catch (error) {
      console.error('Error getting punishments by severity:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/punishments/search?name=searchTerm - Search punishments by name
   */
  async searchPunishmentsByName(req, res) {
    try {
      const { name } = req.query;
      
      if (!name) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Parámetro de búsqueda "name" es requerido')
        );
      }

      const punishments = await this.punishmentService.searchPunishmentsByName(name);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(punishments));
    } catch (error) {
      console.error('Error searching punishments by name:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/punishments/recommended-value - Get recommended value for new punishment
   */
  async getRecommendedValue(req, res) {
    try {
      const recommendedValue = await this.punishmentService.getRecommendedValue();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse({
        recommendedValue,
        message: 'Valor recomendado basado en castigos existentes'
      }));
    } catch (error) {
      console.error('Error getting recommended value:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/punishments/:id/severity - Get severity level for punishment
   */
  async getPunishmentSeverity(req, res) {
    try {
      const { id } = req.params;
      const punishmentId = parseInt(id);

      if (isNaN(punishmentId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de castigo inválido')
        );
      }

      const punishment = await this.punishmentService.getPunishmentById(punishmentId);
      const severityLevel = this.punishmentService.getSeverityLevel(punishment.value);
      
      res.status(HTTP_STATUS.OK).json(createSuccessResponse({
        punishmentId: punishment.id,
        punishmentName: punishment.name,
        value: punishment.value,
        severityLevel
      }));
    } catch (error) {
      console.error('Error getting punishment severity:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Castigo', req.params.id)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }
}

module.exports = PunishmentController;