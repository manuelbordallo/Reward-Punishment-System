const AssignmentService = require('../services/AssignmentService');
const { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  HTTP_STATUS,
  ERROR_CODES 
} = require('../models/ApiResponse');

/**
 * Controller for Assignment-related API endpoints
 */
class AssignmentController {
  constructor() {
    this.assignmentService = new AssignmentService();
  }

  /**
   * GET /api/assignments - Get all assignments with optional filtering
   */
  async getAllAssignments(req, res) {
    try {
      const { limit, offset, orderBy, orderDirection } = req.query;
      
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (orderBy) options.orderBy = orderBy;
      if (orderDirection) options.orderDirection = orderDirection.toUpperCase();

      const assignments = await this.assignmentService.getAllAssignments(options);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(assignments));
    } catch (error) {
      console.error('Error getting all assignments:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/assignments/:id - Get assignment by ID
   */
  async getAssignmentById(req, res) {
    try {
      const { id } = req.params;
      const assignmentId = parseInt(id);

      if (isNaN(assignmentId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de asignación inválido')
        );
      }

      const assignment = await this.assignmentService.getAssignmentById(assignmentId);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(assignment));
    } catch (error) {
      console.error('Error getting assignment by ID:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Asignación', req.params.id)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/assignments/person/:personId - Get assignments by person ID
   */
  async getAssignmentsByPersonId(req, res) {
    try {
      const { personId } = req.params;
      const personIdNum = parseInt(personId);

      if (isNaN(personIdNum)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de persona inválido')
        );
      }

      const { limit, offset, orderBy, orderDirection } = req.query;
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (orderBy) options.orderBy = orderBy;
      if (orderDirection) options.orderDirection = orderDirection.toUpperCase();

      const assignments = await this.assignmentService.getAssignmentsByPersonId(personIdNum, options);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(assignments));
    } catch (error) {
      console.error('Error getting assignments by person ID:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Persona', req.params.personId)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * POST /api/assignments - Create multiple assignments (assign one item to multiple persons)
   */
  async createAssignments(req, res) {
    try {
      const assignments = await this.assignmentService.createAssignments(req.body);
      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse(assignments, `${assignments.length} asignación(es) creada(s) exitosamente`)
      );
    } catch (error) {
      console.error('Error creating assignments:', error);

      if (error.message.includes('Datos inválidos')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message)
        );
      }

      if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createErrorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, error.message)
        );
      }

      if (error.message.includes('valor inválido') || error.message.includes('deben tener valores')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.BUSINESS_RULE_VIOLATION, error.message)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * DELETE /api/assignments/:id - Delete assignment
   */
  async deleteAssignment(req, res) {
    try {
      const { id } = req.params;
      const assignmentId = parseInt(id);

      if (isNaN(assignmentId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de asignación inválido')
        );
      }

      await this.assignmentService.deleteAssignment(assignmentId);
      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(null, 'Asignación eliminada exitosamente')
      );
    } catch (error) {
      console.error('Error deleting assignment:', error);

      if (error.message.includes('no encontrada')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Asignación', req.params.id)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/assignments/date-range?startDate=2024-01-01&endDate=2024-01-31 - Get assignments by date range
   */
  async getAssignmentsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Los parámetros startDate y endDate son requeridos')
        );
      }

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Las fechas deben tener un formato válido (YYYY-MM-DD)')
        );
      }

      const { limit, offset, orderBy, orderDirection } = req.query;
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (orderBy) options.orderBy = orderBy;
      if (orderDirection) options.orderDirection = orderDirection.toUpperCase();

      const assignments = await this.assignmentService.getAssignmentsByDateRange(startDateObj, endDateObj, options);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(assignments));
    } catch (error) {
      console.error('Error getting assignments by date range:', error);

      if (error.message.includes('fecha de inicio no puede ser posterior')) {
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
   * GET /api/assignments/statistics - Get assignment statistics
   */
  async getAssignmentStatistics(req, res) {
    try {
      const statistics = await this.assignmentService.getAssignmentStatistics();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(statistics));
    } catch (error) {
      console.error('Error getting assignment statistics:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/assignments/recent?limit=10 - Get recent assignments
   */
  async getRecentAssignments(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      if (limit < 1 || limit > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'El límite debe estar entre 1 y 100')
        );
      }

      const assignments = await this.assignmentService.getRecentAssignments(limit);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(assignments));
    } catch (error) {
      console.error('Error getting recent assignments:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * POST /api/assignments/validate - Validate assignment data before creation
   */
  async validateAssignmentData(req, res) {
    try {
      const validationResult = await this.assignmentService.validateAssignmentData(req.body);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(validationResult));
    } catch (error) {
      console.error('Error validating assignment data:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/assignments/item-summary/:itemType/:itemId - Get assignment summary for specific item
   */
  async getItemAssignmentSummary(req, res) {
    try {
      const { itemType, itemId } = req.params;
      const itemIdNum = parseInt(itemId);

      if (!['reward', 'punishment'].includes(itemType)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'El tipo de elemento debe ser "reward" o "punishment"')
        );
      }

      if (isNaN(itemIdNum)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de elemento inválido')
        );
      }

      const summary = await this.assignmentService.getItemAssignmentSummary(itemType, itemIdNum);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(summary));
    } catch (error) {
      console.error('Error getting item assignment summary:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createErrorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, error.message)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }
}

module.exports = AssignmentController;