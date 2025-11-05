const PersonService = require('../services/PersonService');
const { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  HTTP_STATUS,
  ERROR_CODES 
} = require('../models/ApiResponse');

/**
 * Controller for Person-related API endpoints
 */
class PersonController {
  constructor() {
    this.personService = new PersonService();
  }

  /**
   * GET /api/persons - Get all persons
   */
  async getAllPersons(req, res) {
    try {
      const persons = await this.personService.getAllPersons();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(persons));
    } catch (error) {
      console.error('Error getting all persons:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/persons/:id - Get person by ID
   */
  async getPersonById(req, res) {
    try {
      const { id } = req.params;
      const personId = parseInt(id);

      if (isNaN(personId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de persona inválido')
        );
      }

      const person = await this.personService.getPersonById(personId);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(person));
    } catch (error) {
      console.error('Error getting person by ID:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Persona', req.params.id)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * POST /api/persons - Create new person
   */
  async createPerson(req, res) {
    try {
      const person = await this.personService.createPerson(req.body);
      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse(person, 'Persona creada exitosamente')
      );
    } catch (error) {
      console.error('Error creating person:', error);

      if (error.message.includes('Datos inválidos')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message)
        );
      }

      if (error.message.includes('Ya existe una persona')) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createErrorResponse(ERROR_CODES.RESOURCE_ALREADY_EXISTS, error.message)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * PUT /api/persons/:id - Update person
   */
  async updatePerson(req, res) {
    try {
      const { id } = req.params;
      const personId = parseInt(id);

      if (isNaN(personId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de persona inválido')
        );
      }

      const person = await this.personService.updatePerson(personId, req.body);
      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(person, 'Persona actualizada exitosamente')
      );
    } catch (error) {
      console.error('Error updating person:', error);

      if (error.message.includes('Datos inválidos')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message)
        );
      }

      if (error.message.includes('no encontrada')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Persona', req.params.id)
        );
      }

      if (error.message.includes('Ya existe otra persona')) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createErrorResponse(ERROR_CODES.RESOURCE_ALREADY_EXISTS, error.message)
        );
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * DELETE /api/persons/:id - Delete person
   */
  async deletePerson(req, res) {
    try {
      const { id } = req.params;
      const personId = parseInt(id);

      if (isNaN(personId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'ID de persona inválido')
        );
      }

      await this.personService.deletePerson(personId);
      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(null, 'Persona eliminada exitosamente')
      );
    } catch (error) {
      console.error('Error deleting person:', error);

      if (error.message.includes('no encontrada')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createNotFoundErrorResponse('Persona', req.params.id)
        );
      }

      if (error.message.includes('tiene asignaciones registradas')) {
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
   * GET /api/persons/statistics - Get person statistics
   */
  async getPersonStatistics(req, res) {
    try {
      const statistics = await this.personService.getPersonStatistics();
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(statistics));
    } catch (error) {
      console.error('Error getting person statistics:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/persons/search?name=searchTerm - Search persons by name
   */
  async searchPersonsByName(req, res) {
    try {
      const { name } = req.query;
      
      if (!name) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Parámetro de búsqueda "name" es requerido')
        );
      }

      const persons = await this.personService.searchPersonsByName(name);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(persons));
    } catch (error) {
      console.error('Error searching persons by name:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }

  /**
   * GET /api/persons/check-name?name=personName&excludeId=id - Check if name is available
   */
  async checkNameAvailability(req, res) {
    try {
      const { name, excludeId } = req.query;
      
      if (!name) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(ERROR_CODES.INVALID_INPUT, 'Parámetro "name" es requerido')
        );
      }

      const excludeIdNum = excludeId ? parseInt(excludeId) : null;
      const isAvailable = await this.personService.isNameAvailable(name, excludeIdNum);
      
      res.status(HTTP_STATUS.OK).json(createSuccessResponse({
        name,
        available: isAvailable
      }));
    } catch (error) {
      console.error('Error checking name availability:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error interno del servidor')
      );
    }
  }
}

module.exports = PersonController;