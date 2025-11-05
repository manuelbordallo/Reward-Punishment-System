const ScoreCalculationService = require('../services/ScoreCalculationService');
const { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  HTTP_STATUS,
  ERROR_CODES 
} = require('../models/ApiResponse');

/**
 * Controller for Score-related API endpoints
 */
class ScoreController {
  constructor() {
    this.scoreService = new ScoreCalculationService();
  }

  /**
   * GET /api/scores/total - Get total scores for all persons
   */
  async getTotalScores(req, res) {
    try {
      const scores = await this.scoreService.getTotalScores();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(scores));
    } catch (error) {
      console.error('Error getting total scores:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/scores/weekly?weekStart=2024-01-01 - Get weekly scores for all persons
   */
  async getWeeklyScores(req, res) {
    try {
      let weekStart = null;
      
      if (req.query.weekStart) {
        weekStart = new Date(req.query.weekStart);
        if (isNaN(weekStart.getTime())) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createErrorResponse(ERROR_CODES.INVALID_INPUT, 'La fecha de inicio de semana debe tener un formato válido (YYYY-MM-DD)')
          );
        }
      }

      const scores = await this.scoreService.getWeeklyScores(weekStart);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(scores));
    } catch (error) {
      console.error('Error getting weekly scores:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/scores/person/:personId - Get score for specific person
   */
  async getPersonScore(req, res) {
    try {
      const { personId } = req.params;
      const personIdNum = parseInt(personId);

      if (isNaN(personIdNum)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de persona inválido')
        );
      }

      const score = await this.scoreService.getPersonScore(personIdNum);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(score));
    } catch (error) {
      console.error('Error getting person score:', error);
      
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
   * GET /api/scores/person/:personId/weekly?weekStart=2024-01-01 - Get weekly score for specific person
   */
  async getPersonWeeklyScore(req, res) {
    try {
      const { personId } = req.params;
      const personIdNum = parseInt(personId);

      if (isNaN(personIdNum)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de persona inválido')
        );
      }

      let weekStart = null;
      if (req.query.weekStart) {
        weekStart = new Date(req.query.weekStart);
        if (isNaN(weekStart.getTime())) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createErrorResponse(ERROR_CODES.INVALID_INPUT, 'La fecha de inicio de semana debe tener un formato válido (YYYY-MM-DD)')
          );
        }
      }

      const score = await this.scoreService.getPersonWeeklyScore(personIdNum, weekStart);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(score));
    } catch (error) {
      console.error('Error getting person weekly score:', error);
      
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
   * GET /api/scores/compare/:personId1/:personId2 - Compare scores between two persons
   */
  async comparePersonScores(req, res) {
    try {
      const { personId1, personId2 } = req.params;
      const personId1Num = parseInt(personId1);
      const personId2Num = parseInt(personId2);

      if (isNaN(personId1Num) || isNaN(personId2Num)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Los IDs de persona deben ser números válidos')
        );
      }

      if (personId1Num === personId2Num) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'No se puede comparar una persona consigo misma')
        );
      }

      const comparison = await this.scoreService.comparePersonScores(personId1Num, personId2Num);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(comparison));
    } catch (error) {
      console.error('Error comparing person scores:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createErrorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, error.message)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/scores/statistics - Get score statistics across all persons
   */
  async getScoreStatistics(req, res) {
    try {
      const statistics = await this.scoreService.getScoreStatistics();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(statistics));
    } catch (error) {
      console.error('Error getting score statistics:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/scores/person/:personId/trends?weeks=4 - Get score trends for a person over time
   */
  async getPersonScoreTrends(req, res) {
    try {
      const { personId } = req.params;
      const personIdNum = parseInt(personId);

      if (isNaN(personIdNum)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de persona inválido')
        );
      }

      const weeks = parseInt(req.query.weeks) || 4;
      
      if (weeks < 1 || weeks > 52) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'El número de semanas debe estar entre 1 y 52')
        );
      }

      const trends = await this.scoreService.getPersonScoreTrends(personIdNum, weeks);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(trends));
    } catch (error) {
      console.error('Error getting person score trends:', error);
      
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
   * GET /api/scores/current-week - Get current week start and end dates
   */
  async getCurrentWeekInfo(req, res) {
    try {
      const referenceDate = req.query.date ? new Date(req.query.date) : null;
      
      if (referenceDate && isNaN(referenceDate.getTime())) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'La fecha de referencia debe tener un formato válido (YYYY-MM-DD)')
        );
      }

      const weekStart = this.scoreService.getCurrentWeekStart(referenceDate);
      const weekEnd = this.scoreService.getWeekEnd(weekStart);

      res.status(HTTP_STATUS.OK).json(createSuccessResponse({
        weekStart,
        weekEnd,
        referenceDate: referenceDate || new Date()
      }));
    } catch (error) {
      console.error('Error getting current week info:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }
}

module.exports = ScoreController;