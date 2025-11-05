const PersonService = require('../../services/PersonService');
const PersonRepository = require('../../repositories/PersonRepository');

// Mock the PersonRepository
jest.mock('../../repositories/PersonRepository');

describe('PersonService', () => {
  let personService;
  let mockPersonRepository;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of PersonService
    personService = new PersonService();
    
    // Get the mocked repository instance
    mockPersonRepository = PersonRepository.mock.instances[0];
  });

  describe('getAllPersons', () => {
    it('should return all persons from repository', async () => {
      // Arrange
      const mockPersons = [
        { id: 1, name: 'Juan', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'María', created_at: new Date(), updated_at: new Date() }
      ];
      mockPersonRepository.findAll.mockResolvedValue(mockPersons);

      // Act
      const result = await personService.getAllPersons();

      // Assert
      expect(result).toEqual(mockPersons);
      expect(mockPersonRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPersonById', () => {
    it('should return person when found', async () => {
      // Arrange
      const mockPerson = { id: 1, name: 'Juan', created_at: new Date(), updated_at: new Date() };
      mockPersonRepository.findById.mockResolvedValue(mockPerson);

      // Act
      const result = await personService.getPersonById(1);

      // Assert
      expect(result).toEqual(mockPerson);
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when person not found', async () => {
      // Arrange
      mockPersonRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(personService.getPersonById(999)).rejects.toThrow('Persona con ID 999 no encontrada');
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('createPerson', () => {
    it('should create person with valid data', async () => {
      // Arrange
      const personData = { name: 'Juan' };
      const mockCreatedPerson = { id: 1, name: 'Juan', created_at: new Date(), updated_at: new Date() };
      
      mockPersonRepository.findByName.mockResolvedValue(null);
      mockPersonRepository.create.mockResolvedValue(mockCreatedPerson);

      // Act
      const result = await personService.createPerson(personData);

      // Assert
      expect(result).toEqual(mockCreatedPerson);
      expect(mockPersonRepository.findByName).toHaveBeenCalledWith('Juan');
      expect(mockPersonRepository.create).toHaveBeenCalledWith({ name: 'Juan' });
    });

    it('should throw error when name is empty', async () => {
      // Arrange
      const personData = { name: '' };

      // Act & Assert
      await expect(personService.createPerson(personData)).rejects.toThrow('Datos inválidos');
    });

    it('should throw error when name already exists', async () => {
      // Arrange
      const personData = { name: 'Juan' };
      const existingPerson = { id: 1, name: 'Juan' };
      
      mockPersonRepository.findByName.mockResolvedValue(existingPerson);

      // Act & Assert
      await expect(personService.createPerson(personData)).rejects.toThrow('Ya existe una persona con el nombre "Juan"');
      expect(mockPersonRepository.findByName).toHaveBeenCalledWith('Juan');
      expect(mockPersonRepository.create).not.toHaveBeenCalled();
    });

    it('should trim whitespace from name', async () => {
      // Arrange
      const personData = { name: '  Juan  ' };
      const mockCreatedPerson = { id: 1, name: 'Juan', created_at: new Date(), updated_at: new Date() };
      
      mockPersonRepository.findByName.mockResolvedValue(null);
      mockPersonRepository.create.mockResolvedValue(mockCreatedPerson);

      // Act
      const result = await personService.createPerson(personData);

      // Assert
      expect(result).toEqual(mockCreatedPerson);
      expect(mockPersonRepository.findByName).toHaveBeenCalledWith('Juan');
      expect(mockPersonRepository.create).toHaveBeenCalledWith({ name: 'Juan' });
    });
  });

  describe('updatePerson', () => {
    it('should update person with valid data', async () => {
      // Arrange
      const personData = { name: 'Juan Updated' };
      const existingPerson = { id: 1, name: 'Juan', created_at: new Date(), updated_at: new Date() };
      const updatedPerson = { id: 1, name: 'Juan Updated', created_at: new Date(), updated_at: new Date() };
      
      mockPersonRepository.findById.mockResolvedValue(existingPerson);
      mockPersonRepository.nameExists.mockResolvedValue(false);
      mockPersonRepository.update.mockResolvedValue(updatedPerson);

      // Act
      const result = await personService.updatePerson(1, personData);

      // Assert
      expect(result).toEqual(updatedPerson);
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPersonRepository.nameExists).toHaveBeenCalledWith('Juan Updated', 1);
      expect(mockPersonRepository.update).toHaveBeenCalledWith(1, { name: 'Juan Updated' });
    });

    it('should throw error when person not found', async () => {
      // Arrange
      const personData = { name: 'Juan Updated' };
      mockPersonRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(personService.updatePerson(999, personData)).rejects.toThrow('Persona con ID 999 no encontrada');
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw error when new name already exists', async () => {
      // Arrange
      const personData = { name: 'María' };
      const existingPerson = { id: 1, name: 'Juan' };
      
      mockPersonRepository.findById.mockResolvedValue(existingPerson);
      mockPersonRepository.nameExists.mockResolvedValue(true);

      // Act & Assert
      await expect(personService.updatePerson(1, personData)).rejects.toThrow('Ya existe otra persona con el nombre "María"');
      expect(mockPersonRepository.nameExists).toHaveBeenCalledWith('María', 1);
      expect(mockPersonRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePerson', () => {
    it('should delete person when no assignments exist', async () => {
      // Arrange
      const existingPerson = { id: 1, name: 'Juan' };
      
      mockPersonRepository.findById.mockResolvedValue(existingPerson);
      mockPersonRepository.hasAssignments.mockResolvedValue(false);
      mockPersonRepository.delete.mockResolvedValue(true);

      // Act
      const result = await personService.deletePerson(1);

      // Assert
      expect(result).toBe(true);
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPersonRepository.hasAssignments).toHaveBeenCalledWith(1);
      expect(mockPersonRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error when person not found', async () => {
      // Arrange
      mockPersonRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(personService.deletePerson(999)).rejects.toThrow('Persona con ID 999 no encontrada');
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw error when person has assignments', async () => {
      // Arrange
      const existingPerson = { id: 1, name: 'Juan' };
      
      mockPersonRepository.findById.mockResolvedValue(existingPerson);
      mockPersonRepository.hasAssignments.mockResolvedValue(true);

      // Act & Assert
      await expect(personService.deletePerson(1)).rejects.toThrow('No se puede eliminar la persona "Juan" porque tiene asignaciones registradas');
      expect(mockPersonRepository.hasAssignments).toHaveBeenCalledWith(1);
      expect(mockPersonRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('isNameAvailable', () => {
    it('should return true when name is available', async () => {
      // Arrange
      mockPersonRepository.nameExists.mockResolvedValue(false);

      // Act
      const result = await personService.isNameAvailable('Juan');

      // Assert
      expect(result).toBe(true);
      expect(mockPersonRepository.nameExists).toHaveBeenCalledWith('Juan', null);
    });

    it('should return false when name is taken', async () => {
      // Arrange
      mockPersonRepository.nameExists.mockResolvedValue(true);

      // Act
      const result = await personService.isNameAvailable('Juan');

      // Assert
      expect(result).toBe(false);
      expect(mockPersonRepository.nameExists).toHaveBeenCalledWith('Juan', null);
    });

    it('should return false for empty name', async () => {
      // Act
      const result = await personService.isNameAvailable('');

      // Assert
      expect(result).toBe(false);
      expect(mockPersonRepository.nameExists).not.toHaveBeenCalled();
    });

    it('should exclude specific ID when checking availability', async () => {
      // Arrange
      mockPersonRepository.nameExists.mockResolvedValue(false);

      // Act
      const result = await personService.isNameAvailable('Juan', 1);

      // Assert
      expect(result).toBe(true);
      expect(mockPersonRepository.nameExists).toHaveBeenCalledWith('Juan', 1);
    });
  });

  describe('getPersonStatistics', () => {
    it('should return person statistics', async () => {
      // Arrange
      mockPersonRepository.count.mockResolvedValue(5);

      // Act
      const result = await personService.getPersonStatistics();

      // Assert
      expect(result).toEqual({ totalPersons: 5 });
      expect(mockPersonRepository.count).toHaveBeenCalledTimes(1);
    });
  });
});