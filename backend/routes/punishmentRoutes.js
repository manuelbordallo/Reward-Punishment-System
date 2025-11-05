const express = require('express');
const PunishmentController = require('../controllers/PunishmentController');
const { validateRequest, punishmentSchemas, commonSchemas, asyncHandler } = require('../middleware');

const router = express.Router();
const punishmentController = new PunishmentController();

// GET /api/punishments/statistics - Must be before /:id route
router.get('/statistics', asyncHandler((req, res) => punishmentController.getPunishmentStatistics(req, res)));

// GET /api/punishments/most-used?limit=10
router.get('/most-used', 
  validateRequest({ query: commonSchemas.pagination }),
  asyncHandler((req, res) => punishmentController.getMostUsedPunishments(req, res))
);

// GET /api/punishments/by-value-range?minValue=-100&maxValue=-1
router.get('/by-value-range', asyncHandler((req, res) => punishmentController.getPunishmentsByValueRange(req, res)));

// GET /api/punishments/by-severity
router.get('/by-severity', asyncHandler((req, res) => punishmentController.getPunishmentsBySeverity(req, res)));

// GET /api/punishments/search?name=searchTerm
router.get('/search', 
  validateRequest({ query: commonSchemas.search }),
  asyncHandler((req, res) => punishmentController.searchPunishmentsByName(req, res))
);

// GET /api/punishments/recommended-value
router.get('/recommended-value', asyncHandler((req, res) => punishmentController.getRecommendedValue(req, res)));

// GET /api/punishments - Get all punishments
router.get('/', asyncHandler((req, res) => punishmentController.getAllPunishments(req, res)));

// GET /api/punishments/:id - Get punishment by ID
router.get('/:id', 
  validateRequest(punishmentSchemas.getById),
  asyncHandler((req, res) => punishmentController.getPunishmentById(req, res))
);

// GET /api/punishments/:id/severity - Get severity level for punishment
router.get('/:id/severity', 
  validateRequest(punishmentSchemas.getById),
  asyncHandler((req, res) => punishmentController.getPunishmentSeverity(req, res))
);

// POST /api/punishments - Create new punishment
router.post('/', 
  validateRequest(punishmentSchemas.create),
  asyncHandler((req, res) => punishmentController.createPunishment(req, res))
);

// PUT /api/punishments/:id - Update punishment
router.put('/:id', 
  validateRequest(punishmentSchemas.update),
  asyncHandler((req, res) => punishmentController.updatePunishment(req, res))
);

// DELETE /api/punishments/:id - Delete punishment
router.delete('/:id', 
  validateRequest(punishmentSchemas.delete),
  asyncHandler((req, res) => punishmentController.deletePunishment(req, res))
);

module.exports = router;