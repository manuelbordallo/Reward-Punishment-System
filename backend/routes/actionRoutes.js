const express = require('express');
const ActionController = require('../controllers/ActionController');
const { validateAction } = require('../middleware/validation');

const router = express.Router();
const actionController = new ActionController();

/**
 * @route GET /api/actions
 * @desc Get all actions with optional filtering
 * @query {string} type - Filter by type ('positive' or 'negative')
 * @query {number} minValue - Minimum value filter
 * @query {number} maxValue - Maximum value filter
 */
router.get('/', (req, res) => actionController.getAllActions(req, res));

/**
 * @route GET /api/actions/positive
 * @desc Get all positive actions (rewards)
 */
router.get('/positive', (req, res) => actionController.getPositiveActions(req, res));

/**
 * @route GET /api/actions/negative
 * @desc Get all negative actions (punishments)
 */
router.get('/negative', (req, res) => actionController.getNegativeActions(req, res));

/**
 * @route GET /api/actions/search
 * @desc Search actions by name
 * @query {string} q - Search term
 */
router.get('/search', (req, res) => actionController.searchActions(req, res));

/**
 * @route GET /api/actions/statistics
 * @desc Get action statistics
 */
router.get('/statistics', (req, res) => actionController.getActionStatistics(req, res));

/**
 * @route GET /api/actions/:id
 * @desc Get action by ID
 * @param {number} id - Action ID
 */
router.get('/:id', (req, res) => actionController.getActionById(req, res));

/**
 * @route POST /api/actions
 * @desc Create new action
 * @body {string} name - Action name
 * @body {number} value - Action value (positive or negative)
 * @body {string} type - Action type ('positive' or 'negative')
 */
router.post('/', validateAction, (req, res) => actionController.createAction(req, res));

/**
 * @route PUT /api/actions/:id
 * @desc Update action
 * @param {number} id - Action ID
 * @body {string} name - Action name (optional)
 * @body {number} value - Action value (optional)
 * @body {string} type - Action type (optional)
 */
router.put('/:id', validateAction, (req, res) => actionController.updateAction(req, res));

/**
 * @route DELETE /api/actions/:id
 * @desc Delete action
 * @param {number} id - Action ID
 */
router.delete('/:id', (req, res) => actionController.deleteAction(req, res));

module.exports = router;