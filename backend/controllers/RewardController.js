const RewardService = require('../services/RewardService');
const { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  HTTP_STATUS,
  ERROR_CODES 
} = require('../models/ApiResponse');

/**
 * Controller for Reward-related API endpoints
 */
class RewardController {
  constructor() {
    this.rewardService = new RewardService();
  }

  /**
   * GET /api/rewards - Get all rewards
   */
  async getAllRewards(req, res) {
    try {
      const rewards = await this.rewardService.getAllRewards();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(rewards));
    } catch (error) {
      console.error('Error getting all rewards:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/rewards/:id - Get reward by ID
   */
  async getRewardById(req, res) {
    try {
      const { id } = req.params;
      const rewardId = parseInt(id);

      if (isNaN(rewardId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de premio inválido')
        );
      }

      const reward = await this.rewardService.getRewardById(rewardId);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(reward));
    } catch (error) {
      console.error('Error getting reward by ID:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Premio', req.params.id)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * POST /api/rewards - Create new reward
   */
  async createReward(req, res) {
    try {
      const reward = await this.rewardService.createReward(req.body);
      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse(reward, 'Premio creado exitosamente')
      );
    } catch (error) {
      console.error('Error creating reward:', error);

      if (error.message.includes('Datos inválidos') || error.message.includes('debe ser mayor que cero')) {
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
   * PUT /api/rewards/:id - Update reward
   */
  async updateReward(req, res) {
    try {
      const { id } = req.params;
      const rewardId = parseInt(id);

      if (isNaN(rewardId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de premio inválido')
        );
      }

      const reward = await this.rewardService.updateReward(rewardId, req.body);
      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(reward, 'Premio actualizado exitosamente')
      );
    } catch (error) {
      console.error('Error updating reward:', error);

      if (error.message.includes('Datos inválidos') || error.message.includes('debe ser mayor que cero')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message)
        );
      }

      if (error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Premio', req.params.id)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * DELETE /api/rewards/:id - Delete reward
   */
  async deleteReward(req, res) {
    try {
      const { id } = req.params;
      const rewardId = parseInt(id);

      if (isNaN(rewardId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de premio inválido')
        );
      }

      await this.rewardService.deleteReward(rewardId);
      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(null, 'Premio eliminado exitosamente')
      );
    } catch (error) {
      console.error('Error deleting reward:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Premio', req.params.id)
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
   * GET /api/rewards/statistics - Get reward statistics
   */
  async getRewardStatistics(req, res) {
    try {
      const statistics = await this.rewardService.getRewardStatistics();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(statistics));
    } catch (error) {
      console.error('Error getting reward statistics:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/rewards/most-used?limit=10 - Get most used rewards
   */
  async getMostUsedRewards(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      if (limit < 1 || limit > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'El límite debe estar entre 1 y 100')
        );
      }

      const rewards = await this.rewardService.getMostUsedRewards(limit);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(rewards));
    } catch (error) {
      console.error('Error getting most used rewards:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/rewards/by-value-range?minValue=1&maxValue=100 - Get rewards by value range
   */
  async getRewardsByValueRange(req, res) {
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

      const rewards = await this.rewardService.getRewardsByValueRange(minVal, maxVal);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(rewards));
    } catch (error) {
      console.error('Error getting rewards by value range:', error);

      if (error.message.includes('deben ser números') || 
          error.message.includes('deben ser positivos') || 
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
   * GET /api/rewards/search?name=searchTerm - Search rewards by name
   */
  async searchRewardsByName(req, res) {
    try {
      const { name } = req.query;
      
      if (!name) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Parámetro de búsqueda "name" es requerido')
        );
      }

      const rewards = await this.rewardService.searchRewardsByName(name);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(rewards));
    } catch (error) {
      console.error('Error searching rewards by name:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/rewards/recommended-value - Get recommended value for new reward
   */
  async getRecommendedValue(req, res) {
    try {
      const recommendedValue = await this.rewardService.getRecommendedValue();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse({
        recommendedValue,
        message: 'Valor recomendado basado en premios existentes'
      }));
    } catch (error) {
      console.error('Error getting recommended value:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }
}

module.exports = RewardController;