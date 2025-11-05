const PersonRepository = require('../../repositories/PersonRepository');
const { query } = require('../../utils/database');

// Mock the database utility
jest.mock('../../utils/database');

describe('PersonRepository', () => {
  let personRepository;
  let mockQuery;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance of PersonRepository
    personRepository = new PersonRepository();

    // Get the mocked query function
    mockQuery = query;
  });

  describe('findAll', () => {
    it('should return all persons ordered by name', async () => {
      // Arrange
      const mockPersons = [
        { id: 1, name: 'Ana', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Juan', created_at: new Date(), updated_at: new Date() }
      ];
      mockQuery.mockResolvedValue({ rows: mockPersons });

      // Act
      const result = await personRepository.findAll();

      // Assert
      expect(result).toEqual(mockPersons);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, created_at, updated_at')
      );
    });

    it('should return empty array when no persons exist', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [] });

      // Act
      const result = await personRepository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return person when found', async () => {
      // Arrange
      const mockPerson = { id: 1, name: 'Juan', created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValue({ rows: [mockPerson] });

      // Act
      const result = await personRepository.findById(1);

      // Assert
      expect(result).toEqual(mockPerson);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        [1]
      );
    });

    it('should return null when person not found', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [] });

      // Act
      const result = await personRepository.findById(999);

      // Assert
      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        [999]
      );
    });
  });

  describe('findByName', () => {
    it('should return person when found by name', async () => {
      // Arrange
      const mockPerson = { id: 1, name: 'Juan', created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValue({ rows: [mockPerson] });

      // Act
      const result = await personRepository.findByName('Juan');

      // Assert
      expect(result).toEqual(mockPerson);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE name = $1'),
        ['Juan']
      );
    });

    it('should return null when person not found by name', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [] });

      // Act
      const result = await personRepository.findByName('NonExistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return new person', async () => {
      // Arrange
      const personData = { name: 'Juan' };
      const mockCreatedPerson = { id: 1, name: 'Juan', created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValue({ rows: [mockCreatedPerson] });

      // Act
      const result = await personRepository.create(personData);

      // Assert
      expect(result).toEqual(mockCreatedPerson);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO persons (name)'),
        ['Juan']
      );
    });
  });

  describe('update', () => {
    it('should update and return person when found', async () => {
      // Arrange
      const personData = { name: 'Juan Updated' };
      const mockUpdatedPerson = { id: 1, name: 'Juan Updated', created_at: new Date(), updated_at: new Date() };
      mockQuery.mockResolvedValue({ rows: [mockUpdatedPerson] });

      // Act
      const result = await personRepository.update(1, personData);

      // Assert
      expect(result).toEqual(mockUpdatedPerson);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE persons'),
        ['Juan Updated', 1]
      );
    });

    it('should return null when person not found for update', async () => {
      // Arrange
      const personData = { name: 'Juan Updated' };
      mockQuery.mockResolvedValue({ rows: [] });

      // Act
      const result = await personRepository.update(999, personData);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when person is deleted', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await personRepository.delete(1);

      // Assert
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM persons'),
        [1]
      );
    });

    it('should return false when person not found for deletion', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rowCount: 0 });

      // Act
      const result = await personRepository.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('nameExists', () => {
    it('should return true when name exists', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      // Act
      const result = await personRepository.nameExists('Juan');

      // Assert
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT 1 FROM persons WHERE name = $1',
        ['Juan']
      );
    });

    it('should return false when name does not exist', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [] });

      // Act
      const result = await personRepository.nameExists('NonExistent');

      // Assert
      expect(result).toBe(false);
    });

    it('should exclude specific ID when checking name existence', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [] });

      // Act
      const result = await personRepository.nameExists('Juan', 1);

      // Assert
      expect(result).toBe(false);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT 1 FROM persons WHERE name = $1 AND id != $2',
        ['Juan', 1]
      );
    });
  });

  describe('count', () => {
    it('should return total count of persons', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [{ count: '5' }] });

      // Act
      const result = await personRepository.count();

      // Assert
      expect(result).toBe(5);
      expect(mockQuery).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM persons');
    });

    it('should return zero when no persons exist', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [{ count: '0' }] });

      // Act
      const result = await personRepository.count();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('hasAssignments', () => {
    it('should return true when person has assignments', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      // Act
      const result = await personRepository.hasAssignments(1);

      // Assert
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT 1 FROM assignments'),
        [1]
      );
    });

    it('should return false when person has no assignments', async () => {
      // Arrange
      mockQuery.mockResolvedValue({ rows: [] });

      // Act
      const result = await personRepository.hasAssignments(1);

      // Assert
      expect(result).toBe(false);
    });
  });
});