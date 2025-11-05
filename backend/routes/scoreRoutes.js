const express = require('express');
const ScoreController = require('../controllers/ScoreController');
const { validateRequest, commonSchemas, asyncHandler } = require('../middleware');

const router = express.Router();
const scoreController = new ScoreController();

// GET /api/scores/total - Get total scores for all persons
router.get('/total', asyncHandler((req, res) => scoreController.getTotalScores(req, res)));

// GET /api/scores/weekly?weekStart=2024-01-01 - Get weekly scores for all persons
router.get('/weekly', asyncHandler((req, res) => scoreController.getWeeklyScores(req, res)));

// GET /api/scores/statistics - Get score statistics
router.get('/statistics', asyncHandler((req, res) => scoreController.getScoreStatistics(req, res)));

// GET /api/scores/current-week - Get current week info
router.get('/current-week', asyncHandler((req, res) => scoreController.getCurrentWeekInfo(req, res)));

// GET /api/scores/person/:personId - Get score for specific person
router.get('/person/:personId',
    validateRequest({ params: commonSchemas.idParam }),
    asyncHandler((req, res) => scoreController.getPersonScore(req, res))
);

// GET /api/scores/person/:personId/weekly?weekStart=2024-01-01 - Get weekly score for specific person
router.get('/person/:personId/weekly',
    validateRequest({ params: commonSchemas.idParam }),
    asyncHandler((req, res) => scoreController.getPersonWeeklyScore(req, res))
);

// GET /api/scores/person/:personId/trends?weeks=4 - Get score trends for person
router.get('/person/:personId/trends',
    validateRequest({ params: commonSchemas.idParam }),
    asyncHandler((req, res) => scoreController.getPersonScoreTrends(req, res))
);

// GET /api/scores/compare/:personId1/:personId2 - Compare scores between two persons
router.get('/compare/:personId1/:personId2', asyncHandler((req, res) => scoreController.comparePersonScores(req, res)));

module.exports = router;