const ActionService = require('../services/ActionService');
const { validateAction } = require('../middleware/validation');

/**
 * Controller class for action HTTP operations
 */
class ActionController {
    constructor() {
        this.actionService = new ActionService();
    }

    /**
     * Get all actions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllActions(req, res) {
        try {
            const { type, minValue, maxValue } = req.query;

            const filters = {};
            if (type && ['positive', 'negative'].includes(type)) {
                filters.type = type;
            }
            if (minValue !== undefined) {
                filters.minValue = parseInt(minValue);
            }
            if (maxValue !== undefined) {
                filters.maxValue = parseInt(maxValue);
            }

            const actions = await this.actionService.getAllActions(filters);

            res.json({
                success: true,
                data: actions,
                message: 'Acciones obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error in getAllActions:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    /**
     * Get positive actions (rewards)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPositiveActions(req, res) {
        try {
            const actions = await this.actionService.getPositiveActions();

            res.json({
                success: true,
                data: actions,
                message: 'Acciones positivas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error in getPositiveActions:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    /**
     * Get negative actions (punishments)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getNegativeActions(req, res) {
        try {
            const actions = await this.actionService.getNegativeActions();

            res.json({
                success: true,
                data: actions,
                message: 'Acciones negativas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error in getNegativeActions:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    /**
     * Get action by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getActionById(req, res) {
        try {
            const { id } = req.params;
            const actionId = parseInt(id);

            if (isNaN(actionId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de acción inválido'
                });
            }

            const action = await this.actionService.getActionById(actionId);

            res.json({
                success: true,
                data: action,
                message: 'Acción obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error in getActionById:', error);
            const statusCode = error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    /**
     * Create new action
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createAction(req, res) {
        try {
            const { name, value, type } = req.body;

            // Basic validation
            if (!name || !value || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, valor y tipo son requeridos'
                });
            }

            const actionData = {
                name: name.trim(),
                value: parseInt(value),
                type: type
            };

            const action = await this.actionService.createAction(actionData);

            res.status(201).json({
                success: true,
                data: action,
                message: 'Acción creada exitosamente'
            });
        } catch (error) {
            console.error('Error in createAction:', error);
            const statusCode = error.message.includes('ya existe') ? 409 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al crear acción'
            });
        }
    }

    /**
     * Update action
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateAction(req, res) {
        try {
            const { id } = req.params;
            const actionId = parseInt(id);

            if (isNaN(actionId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de acción inválido'
                });
            }

            const { name, value, type } = req.body;
            const updateData = {};

            if (name !== undefined) updateData.name = name.trim();
            if (value !== undefined) updateData.value = parseInt(value);
            if (type !== undefined) updateData.type = type;

            const action = await this.actionService.updateAction(actionId, updateData);

            res.json({
                success: true,
                data: action,
                message: 'Acción actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error in updateAction:', error);
            const statusCode = error.message.includes('no encontrada') ? 404 :
                error.message.includes('ya existe') ? 409 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al actualizar acción'
            });
        }
    }

    /**
     * Delete action
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteAction(req, res) {
        try {
            const { id } = req.params;
            const actionId = parseInt(id);

            if (isNaN(actionId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de acción inválido'
                });
            }

            await this.actionService.deleteAction(actionId);

            res.json({
                success: true,
                message: 'Acción eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error in deleteAction:', error);
            const statusCode = error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al eliminar acción'
            });
        }
    }

    /**
     * Search actions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async searchActions(req, res) {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Parámetro de búsqueda requerido'
                });
            }

            const actions = await this.actionService.searchActions(q);

            res.json({
                success: true,
                data: actions,
                message: 'Búsqueda completada exitosamente'
            });
        } catch (error) {
            console.error('Error in searchActions:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error en la búsqueda'
            });
        }
    }

    /**
     * Get action statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getActionStatistics(req, res) {
        try {
            const stats = await this.actionService.getActionStatistics();

            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error in getActionStatistics:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener estadísticas'
            });
        }
    }
}

module.exports = ActionController;