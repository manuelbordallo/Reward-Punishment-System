const express = require('express');
const PersonController = require('../controllers/PersonController');
const { validateRequest, personSchemas, asyncHandler } = require('../middleware');

const router = express.Router();
const personController = new PersonController();

// GET /api/persons/statistics - Must be before /:id route
router.get('/statistics', asyncHandler((req, res) => personController.getPersonStatistics(req, res)));

// GET /api/persons/search?name=searchTerm
router.get('/search', 
  validateRequest(personSchemas.search),
  asyncHandler((req, res) => personController.searchPersonsByName(req, res))
);

// GET /api/persons/check-name?name=personName&excludeId=id
router.get('/check-name', 
  validateRequest(personSchemas.checkName),
  asyncHandler((req, res) => personController.checkNameAvailability(req, res))
);

// GET /api/persons - Get all persons
router.get('/', asyncHandler((req, res) => personController.getAllPersons(req, res)));

// GET /api/persons/:id - Get person by ID
router.get('/:id', 
  validateRequest(personSchemas.getById),
  asyncHandler((req, res) => personController.getPersonById(req, res))
);

// POST /api/persons - Create new person
router.post('/', 
  validateRequest(personSchemas.create),
  asyncHandler((req, res) => personController.createPerson(req, res))
);

// PUT /api/persons/:id - Update person
router.put('/:id', 
  validateRequest(personSchemas.update),
  asyncHandler((req, res) => personController.updatePerson(req, res))
);

// DELETE /api/persons/:id - Delete person
router.delete('/:id', 
  validateRequest(personSchemas.delete),
  asyncHandler((req, res) => personController.deletePerson(req, res))
);

module.exports = router;