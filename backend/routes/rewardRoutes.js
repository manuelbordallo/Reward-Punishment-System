const express = require('express');
const RewardController = require('../controllers/RewardController');
const { validateRequest, rewardSchemas, commonSchemas, asyncHandler } = require('../middleware');

const router = express.Router();
const rewardController = new RewardController();

// GET /api/rewards/statistics - Must be before /:id route
router.get('/statistics', asyncHandler((req, res) => rewardController.getRewardStatistics(req, res)));

// GET /api/rewards/most-used?limit=10
router.get('/most-used', 
  validateRequest({ query: commonSchemas.pagination }),
  asyncHandler((req, res) => rewardController.getMostUsedRewards(req, res))
);

// GET /api/rewards/by-value-range?minValue=1&maxValue=100
router.get('/by-value-range', asyncHandler((req, res) => rewardController.getRewardsByValueRange(req, res)));

// GET /api/rewards/search?name=searchTerm
router.get('/search', 
  validateRequest({ query: commonSchemas.search }),
  asyncHandler((req, res) => rewardController.searchRewardsByName(req, res))
);

// GET /api/rewards/recommended-value
router.get('/recommended-value', asyncHandler((req, res) => rewardController.getRecommendedValue(req, res)));

// GET /api/rewards - Get all rewards
router.get('/', asyncHandler((req, res) => rewardController.getAllRewards(req, res)));

// GET /api/rewards/:id - Get reward by ID
router.get('/:id', 
  validateRequest(rewardSchemas.getById),
  asyncHandler((req, res) => rewardController.getRewardById(req, res))
);

// POST /api/rewards - Create new reward
router.post('/', 
  validateRequest(rewardSchemas.create),
  asyncHandler((req, res) => rewardController.createReward(req, res))
);

// PUT /api/rewards/:id - Update reward
router.put('/:id', 
  validateRequest(rewardSchemas.update),
  asyncHandler((req, res) => rewardController.updateReward(req, res))
);

// DELETE /api/rewards/:id - Delete reward
router.delete('/:id', 
  validateRequest(rewardSchemas.delete),
  asyncHandler((req, res) => rewardController.deleteReward(req, res))
);

module.exports = router;