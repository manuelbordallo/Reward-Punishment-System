const express = require('express');
const AssignmentController = require('../controllers/AssignmentController');
const { validateRequest, assignmentSchemas, commonSchemas, asyncHandler } = require('../middleware');

const router = express.Router();
const assignmentController = new AssignmentController();

// GET /api/assignments/statistics - Must be before /:id route
router.get('/statistics', asyncHandler((req, res) => assignmentController.getAssignmentStatistics(req, res)));

// GET /api/assignments/recent?limit=10
router.get('/recent',
    validateRequest({ query: commonSchemas.pagination }),
    asyncHandler((req, res) => assignmentController.getRecentAssignments(req, res))
);

// GET /api/assignments/date-range?startDate=2024-01-01&endDate=2024-01-31
router.get('/date-range', asyncHandler((req, res) => assignmentController.getAssignmentsByDateRange(req, res)));

// GET /api/assignments/person/:personId
router.get('/person/:personId',
    validateRequest(assignmentSchemas.getByPerson),
    asyncHandler((req, res) => assignmentController.getAssignmentsByPersonId(req, res))
);

// GET /api/assignments/item-summary/:itemType/:itemId
router.get('/item-summary/:itemType/:itemId', asyncHandler((req, res) => assignmentController.getItemAssignmentSummary(req, res)));

// POST /api/assignments/validate - Validate assignment data
router.post('/validate',
    validateRequest(assignmentSchemas.create),
    asyncHandler((req, res) => assignmentController.validateAssignmentData(req, res))
);

// GET /api/assignments - Get all assignments
router.get('/',
    validateRequest({ query: commonSchemas.pagination }),
    asyncHandler((req, res) => assignmentController.getAllAssignments(req, res))
);

// GET /api/assignments/:id - Get assignment by ID
router.get('/:id',
    validateRequest(assignmentSchemas.delete), // Uses same schema as delete (just ID param)
    asyncHandler((req, res) => assignmentController.getAssignmentById(req, res))
);

// POST /api/assignments - Create assignments
router.post('/',
    validateRequest(assignmentSchemas.create),
    asyncHandler((req, res) => assignmentController.createAssignments(req, res))
);

// DELETE /api/assignments/:id - Delete assignment
router.delete('/:id',
    validateRequest(assignmentSchemas.delete),
    asyncHandler((req, res) => assignmentController.deleteAssignment(req, res))
);

module.exports = router;