const ScoreCalculationService = require('../../services/ScoreCalculationService');
const AssignmentRepository = require('../../repositories/AssignmentRepository');
const PersonRepository = require('../../repositories/PersonRepository');

// Mock the repositories
jest.mock('../../repositories/AssignmentRepository');
jest.mock('../../repositories/PersonRepository');

describe('ScoreCalculationService', () => {
  let scoreService;
  let mockAssignmentRepository;
  let mockPersonRepository;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of ScoreCalculationService
    scoreService = new ScoreCalculationService();
    
    // Get the mocked repository instances
    mockAssignmentRepository = AssignmentRepository.mock.instances[0];
    mockPersonRepository = PersonRepository.mock.instances[0];
  });

  describe('getTotalScores', () => {
    it('should return enhanced total scores with ranking', async () => {
      // Arrange
      const mockScores = [
        { person_id: 1, person_name: 'Juan', total_score: '25', assignment_count: '5' },
        { person_id: 2, person_name: 'María', total_score: '15', assignment_count: '3' },
        { person_id: 3, person_name: 'Pedro', total_score: '25', assignment_count: '4' }
      ];
      mockAssignmentRepository.getTotalScores.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.getTotalScores();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        personId: 1,
        personName: 'Juan',
        totalScore: 25,
        assignmentCount: 5,
        averageScore: 5,
        rank: 1
      });
      expect(result[1]).toEqual({
        personId: 3,
        personName: 'Pedro',
        totalScore: 25,
        assignmentCount: 4,
        averageScore: 6.25,
        rank: 2
      });
      expect(result[2]).toEqual({
        personId: 2,
        personName: 'María',
        totalScore: 15,
        assignmentCount: 3,
        averageScore: 5,
        rank: 3
      });
    });

    it('should handle null scores correctly', async () => {
      // Arrange
      const mockScores = [
        { person_id: 1, person_name: 'Juan', total_score: null, assignment_count: '0' }
      ];
      mockAssignmentRepository.getTotalScores.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.getTotalScores();

      // Assert
      expect(result[0]).toEqual({
        personId: 1,
        personName: 'Juan',
        totalScore: 0,
        assignmentCount: 0,
        averageScore: 0,
        rank: 1
      });
    });
  });

  describe('getWeeklyScores', () => {
    it('should return enhanced weekly scores with ranking', async () => {
      // Arrange
      const mockScores = [
        { 
          person_id: 1, 
          person_name: 'Juan', 
          weekly_score: '20', 
          weekly_assignment_count: '4',
          week_start: new Date('2024-01-01'),
          week_end: new Date('2024-01-07')
        },
        { 
          person_id: 2, 
          person_name: 'María', 
          weekly_score: '10', 
          weekly_assignment_count: '2',
          week_start: new Date('2024-01-01'),
          week_end: new Date('2024-01-07')
        }
      ];
      mockAssignmentRepository.getWeeklyScores.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.getWeeklyScores();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        personId: 1,
        personName: 'Juan',
        weeklyScore: 20,
        weeklyAssignmentCount: 4,
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        averageWeeklyScore: 5,
        rank: 1
      });
      expect(result[1]).toEqual({
        personId: 2,
        personName: 'María',
        weeklyScore: 10,
        weeklyAssignmentCount: 2,
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        averageWeeklyScore: 5,
        rank: 2
      });
    });

    it('should pass custom week start to repository', async () => {
      // Arrange
      const customWeekStart = new Date('2024-01-08');
      mockAssignmentRepository.getWeeklyScores.mockResolvedValue([]);

      // Act
      await scoreService.getWeeklyScores(customWeekStart);

      // Assert
      expect(mockAssignmentRepository.getWeeklyScores).toHaveBeenCalledWith(customWeekStart);
    });
  });

  describe('getPersonScore', () => {
    it('should return comprehensive person score with rankings', async () => {
      // Arrange
      const mockPerson = { id: 1, name: 'Juan' };
      const mockTotalScore = { total_score: '25', assignment_count: '5' };
      const mockWeeklyScore = { 
        weekly_score: '15', 
        weekly_assignment_count: '3',
        week_start: new Date('2024-01-01'),
        week_end: new Date('2024-01-07')
      };
      const mockAllTotalScores = [
        { personId: 2, personName: 'María', totalScore: 30 },
        { personId: 1, personName: 'Juan', totalScore: 25 },
        { personId: 3, personName: 'Pedro', totalScore: 20 }
      ];
      const mockAllWeeklyScores = [
        { personId: 1, personName: 'Juan', weeklyScore: 15 },
        { personId: 2, personName: 'María', weeklyScore: 10 }
      ];

      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      mockAssignmentRepository.getPersonScore.mockResolvedValue(mockTotalScore);
      mockAssignmentRepository.getPersonWeeklyScore.mockResolvedValue(mockWeeklyScore);
      
      // Mock the getTotalScores and getWeeklyScores methods
      scoreService.getTotalScores = jest.fn().mockResolvedValue(mockAllTotalScores);
      scoreService.getWeeklyScores = jest.fn().mockResolvedValue(mockAllWeeklyScores);

      // Act
      const result = await scoreService.getPersonScore(1);

      // Assert
      expect(result).toEqual({
        personId: 1,
        personName: 'Juan',
        totalScore: 25,
        totalAssignmentCount: 5,
        totalRank: 2,
        weeklyScore: 15,
        weeklyAssignmentCount: 3,
        weeklyRank: 1,
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        averageTotalScore: 5,
        averageWeeklyScore: 5
      });
    });

    it('should throw error when person not found', async () => {
      // Arrange
      mockPersonRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(scoreService.getPersonScore(999)).rejects.toThrow('Persona con ID 999 no encontrada');
      expect(mockPersonRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should handle null scores correctly', async () => {
      // Arrange
      const mockPerson = { id: 1, name: 'Juan' };
      
      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      mockAssignmentRepository.getPersonScore.mockResolvedValue(null);
      mockAssignmentRepository.getPersonWeeklyScore.mockResolvedValue(null);
      
      scoreService.getTotalScores = jest.fn().mockResolvedValue([]);
      scoreService.getWeeklyScores = jest.fn().mockResolvedValue([]);

      // Act
      const result = await scoreService.getPersonScore(1);

      // Assert
      expect(result.totalScore).toBe(0);
      expect(result.weeklyScore).toBe(0);
      expect(result.averageTotalScore).toBe(0);
      expect(result.averageWeeklyScore).toBe(0);
    });
  });

  describe('getCurrentWeekStart', () => {
    it('should calculate Monday for current week', () => {
      // Arrange - Wednesday, January 3, 2024
      const referenceDate = new Date('2024-01-03T15:30:00');

      // Act
      const result = scoreService.getCurrentWeekStart(referenceDate);

      // Assert
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getDate()).toBe(1); // January 1, 2024 was a Monday
    });

    it('should handle Sunday correctly (should return previous Monday)', () => {
      // Arrange - Sunday, January 7, 2024
      const referenceDate = new Date('2024-01-07T15:30:00');

      // Act
      const result = scoreService.getCurrentWeekStart(referenceDate);

      // Assert
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(1); // January 1, 2024 was a Monday
    });

    it('should handle Monday correctly (should return same day)', () => {
      // Arrange - Monday, January 1, 2024
      const referenceDate = new Date('2024-01-01T15:30:00');

      // Act
      const result = scoreService.getCurrentWeekStart(referenceDate);

      // Assert
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(1); // Same day
    });
  });

  describe('getWeekEnd', () => {
    it('should calculate Sunday from Monday', () => {
      // Arrange
      const weekStart = new Date('2024-01-01T00:00:00'); // Monday

      // Act
      const result = scoreService.getWeekEnd(weekStart);

      // Assert
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getDate()).toBe(7); // January 7, 2024
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('comparePersonScores', () => {
    it('should compare two persons scores correctly', async () => {
      // Arrange
      const person1Score = {
        personId: 1,
        personName: 'Juan',
        totalScore: 25,
        weeklyScore: 15
      };
      const person2Score = {
        personId: 2,
        personName: 'María',
        totalScore: 20,
        weeklyScore: 10
      };

      scoreService.getPersonScore = jest.fn()
        .mockResolvedValueOnce(person1Score)
        .mockResolvedValueOnce(person2Score);

      // Act
      const result = await scoreService.comparePersonScores(1, 2);

      // Assert
      expect(result).toEqual({
        person1: person1Score,
        person2: person2Score,
        comparison: {
          totalScoreDifference: 5,
          weeklyScoreDifference: 5,
          totalScoreLeader: 'Juan',
          weeklyScoreLeader: 'Juan'
        }
      });
    });

    it('should handle tied scores correctly', async () => {
      // Arrange
      const person1Score = {
        personId: 1,
        personName: 'Juan',
        totalScore: 25,
        weeklyScore: 15
      };
      const person2Score = {
        personId: 2,
        personName: 'María',
        totalScore: 25,
        weeklyScore: 15
      };

      scoreService.getPersonScore = jest.fn()
        .mockResolvedValueOnce(person1Score)
        .mockResolvedValueOnce(person2Score);

      // Act
      const result = await scoreService.comparePersonScores(1, 2);

      // Assert
      expect(result.comparison.totalScoreLeader).toBe('Empate');
      expect(result.comparison.weeklyScoreLeader).toBe('Empate');
    });
  });

  describe('getScoreStatistics', () => {
    it('should calculate comprehensive statistics', async () => {
      // Arrange
      const mockTotalScores = [
        { personId: 1, personName: 'Juan', totalScore: 30 },
        { personId: 2, personName: 'María', totalScore: 20 },
        { personId: 3, personName: 'Pedro', totalScore: 10 }
      ];
      const mockWeeklyScores = [
        { personId: 1, personName: 'Juan', weeklyScore: 15 },
        { personId: 2, personName: 'María', weeklyScore: 10 },
        { personId: 3, personName: 'Pedro', weeklyScore: 5 }
      ];

      scoreService.getTotalScores = jest.fn().mockResolvedValue(mockTotalScores);
      scoreService.getWeeklyScores = jest.fn().mockResolvedValue(mockWeeklyScores);

      // Act
      const result = await scoreService.getScoreStatistics();

      // Assert
      expect(result).toEqual({
        totalPersons: 3,
        totalScoreStats: {
          min: 10,
          max: 30,
          average: 20,
          median: 20
        },
        weeklyScoreStats: {
          min: 5,
          max: 15,
          average: 10,
          median: 10
        },
        topPerformer: mockTotalScores[0],
        bottomPerformer: mockTotalScores[2],
        weeklyTopPerformer: mockWeeklyScores[0]
      });
    });

    it('should handle empty scores list', async () => {
      // Arrange
      scoreService.getTotalScores = jest.fn().mockResolvedValue([]);
      scoreService.getWeeklyScores = jest.fn().mockResolvedValue([]);

      // Act
      const result = await scoreService.getScoreStatistics();

      // Assert
      expect(result).toEqual({
        totalPersons: 0,
        totalScoreStats: { min: 0, max: 0, average: 0, median: 0 },
        weeklyScoreStats: { min: 0, max: 0, average: 0, median: 0 },
        topPerformer: null,
        bottomPerformer: null,
        weeklyTopPerformer: null
      });
    });

    it('should calculate median correctly for even number of scores', async () => {
      // Arrange
      const mockTotalScores = [
        { personId: 1, personName: 'Juan', totalScore: 30 },
        { personId: 2, personName: 'María', totalScore: 25 },
        { personId: 3, personName: 'Pedro', totalScore: 15 },
        { personId: 4, personName: 'Ana', totalScore: 10 }
      ];

      scoreService.getTotalScores = jest.fn().mockResolvedValue(mockTotalScores);
      scoreService.getWeeklyScores = jest.fn().mockResolvedValue([]);

      // Act
      const result = await scoreService.getScoreStatistics();

      // Assert
      expect(result.totalScoreStats.median).toBe(20); // (25 + 15) / 2
    });
  });

  describe('getPersonScoreTrends', () => {
    it('should return weekly trends for specified number of weeks', async () => {
      // Arrange
      const mockPerson = { id: 1, name: 'Juan' };
      const mockWeeklyScore1 = { personId: 1, personName: 'Juan', weeklyScore: 15 };
      const mockWeeklyScore2 = { personId: 1, personName: 'Juan', weeklyScore: 10 };
      
      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      scoreService.getPersonWeeklyScore = jest.fn()
        .mockResolvedValueOnce(mockWeeklyScore2) // First call (older week)
        .mockResolvedValueOnce(mockWeeklyScore1); // Second call (newer week)

      // Act
      const result = await scoreService.getPersonScoreTrends(1, 2);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockWeeklyScore2); // Older week comes first in chronological order
      expect(result[1]).toEqual(mockWeeklyScore1); // Newer week comes second
      expect(scoreService.getPersonWeeklyScore).toHaveBeenCalledTimes(2);
    });

    it('should throw error when person not found', async () => {
      // Arrange
      mockPersonRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(scoreService.getPersonScoreTrends(999)).rejects.toThrow('Persona con ID 999 no encontrada');
    });
  });
});