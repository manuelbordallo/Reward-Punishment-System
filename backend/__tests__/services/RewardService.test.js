const RewardService = require('../../services/RewardService');
const RewardRepository = require('../../repositories/RewardRepository');

// Mock the RewardRepository
jest.mock('../../repositories/RewardRepository');

describe('RewardService', () => {
  let rewardService;
  let mockRewardRepository;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of RewardService
    rewardService = new RewardService();
    
    // Get the mocked repository instance
    mockRewardRepository = RewardRepository.mock.instances[0];
  });

  describe('getAllRewards', () => {
    it('should return all rewards from repository', async () => {
      // Arrange
      const mockRewards = [
        { id: 1, name: 'Good Behavior', value: 10, created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Homework Done', value: 5, created_at: new Date(), updated_at: new Date() }
      ];
      mockRewardRepository.findAll.mockResolvedValue(mockRewards);

      // Act
      const result = await rewardService.getAllRewards();

      // Assert
      expect(result).toEqual(mockRewards);
      expect(mockRewardRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRewardById', () => {
    it('should return reward when found', async () => {
      // Arrange
      const mockReward = { id: 1, name: 'Good Behavior', value: 10, created_at: new Date(), updated_at: new Date() };
      mockRewardRepository.findById.mockResolvedValue(mockReward);

      // Act
      const result = await rewardService.getRewardById(1);

      // Assert
      expect(result).toEqual(mockReward);
      expect(mockRewardRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when reward not found', async () => {
      // Arrange
      mockRewardRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(rewardService.getRewardById(999)).rejects.toThrow('Premio con ID 999 no encontrado');
      expect(mockRewardRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('createReward', () => {
    it('should create reward with valid positive value', async () => {
      // Arrange
      const rewardData = { name: 'Good Behavior', value: 10 };
      const mockCreatedReward = { id: 1, name: 'Good Behavior', value: 10, created_at: new Date(), updated_at: new Date() };
      
      mockRewardRepository.create.mockResolvedValue(mockCreatedReward);

      // Act
      const result = await rewardService.createReward(rewardData);

      // Assert
      expect(result).toEqual(mockCreatedReward);
      expect(mockRewardRepository.create).toHaveBeenCalledWith({ name: 'Good Behavior', value: 10 });
    });

    it('should throw error when value is zero', async () => {
      // Arrange
      const rewardData = { name: 'Good Behavior', value: 0 };

      // Act & Assert
      await expect(rewardService.createReward(rewardData)).rejects.toThrow('El valor del premio debe ser mayor que cero');
      expect(mockRewardRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when value is negative', async () => {
      // Arrange
      const rewardData = { name: 'Good Behavior', value: -5 };

      // Act & Assert
      await expect(rewardService.createReward(rewardData)).rejects.toThrow('Datos inválidos');
    });

    it('should throw error when name is empty', async () => {
      // Arrange
      const rewardData = { name: '', value: 10 };

      // Act & Assert
      await expect(rewardService.createReward(rewardData)).rejects.toThrow('Datos inválidos');
    });
  });

  describe('updateReward', () => {
    it('should update reward with valid data', async () => {
      // Arrange
      const rewardData = { name: 'Updated Reward', value: 15 };
      const existingReward = { id: 1, name: 'Good Behavior', value: 10 };
      const updatedReward = { id: 1, name: 'Updated Reward', value: 15, created_at: new Date(), updated_at: new Date() };
      
      mockRewardRepository.findById.mockResolvedValue(existingReward);
      mockRewardRepository.update.mockResolvedValue(updatedReward);

      // Act
      const result = await rewardService.updateReward(1, rewardData);

      // Assert
      expect(result).toEqual(updatedReward);
      expect(mockRewardRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRewardRepository.update).toHaveBeenCalledWith(1, { name: 'Updated Reward', value: 15 });
    });

    it('should throw error when reward not found', async () => {
      // Arrange
      const rewardData = { name: 'Updated Reward', value: 15 };
      mockRewardRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(rewardService.updateReward(999, rewardData)).rejects.toThrow('Premio con ID 999 no encontrado');
      expect(mockRewardRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw error when new value is not positive', async () => {
      // Arrange
      const rewardData = { name: 'Updated Reward', value: 0 };
      const existingReward = { id: 1, name: 'Good Behavior', value: 10 };
      
      mockRewardRepository.findById.mockResolvedValue(existingReward);

      // Act & Assert
      await expect(rewardService.updateReward(1, rewardData)).rejects.toThrow('El valor del premio debe ser mayor que cero');
      expect(mockRewardRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteReward', () => {
    it('should delete reward when not used in assignments', async () => {
      // Arrange
      const existingReward = { id: 1, name: 'Good Behavior', value: 10 };
      
      mockRewardRepository.findById.mockResolvedValue(existingReward);
      mockRewardRepository.isUsedInAssignments.mockResolvedValue(false);
      mockRewardRepository.delete.mockResolvedValue(true);

      // Act
      const result = await rewardService.deleteReward(1);

      // Assert
      expect(result).toBe(true);
      expect(mockRewardRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRewardRepository.isUsedInAssignments).toHaveBeenCalledWith(1);
      expect(mockRewardRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error when reward not found', async () => {
      // Arrange
      mockRewardRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(rewardService.deleteReward(999)).rejects.toThrow('Premio con ID 999 no encontrado');
      expect(mockRewardRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw error when reward is used in assignments', async () => {
      // Arrange
      const existingReward = { id: 1, name: 'Good Behavior', value: 10 };
      
      mockRewardRepository.findById.mockResolvedValue(existingReward);
      mockRewardRepository.isUsedInAssignments.mockResolvedValue(true);

      // Act & Assert
      await expect(rewardService.deleteReward(1)).rejects.toThrow('No se puede eliminar el premio "Good Behavior" porque está siendo usado en asignaciones');
      expect(mockRewardRepository.isUsedInAssignments).toHaveBeenCalledWith(1);
      expect(mockRewardRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getRewardStatistics', () => {
    it('should return reward statistics', async () => {
      // Arrange
      const mockRewards = [
        { id: 1, name: 'Reward 1', value: 10 },
        { id: 2, name: 'Reward 2', value: 20 },
        { id: 3, name: 'Reward 3', value: 15 }
      ];
      
      mockRewardRepository.count.mockResolvedValue(3);
      mockRewardRepository.findAll.mockResolvedValue(mockRewards);

      // Act
      const result = await rewardService.getRewardStatistics();

      // Assert
      expect(result).toEqual({
        totalRewards: 3,
        totalValue: 45,
        averageValue: 15,
        maxValue: 20,
        minValue: 10
      });
      expect(mockRewardRepository.count).toHaveBeenCalledTimes(1);
      expect(mockRewardRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle empty rewards list', async () => {
      // Arrange
      mockRewardRepository.count.mockResolvedValue(0);
      mockRewardRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await rewardService.getRewardStatistics();

      // Assert
      expect(result).toEqual({
        totalRewards: 0,
        totalValue: 0,
        averageValue: 0,
        maxValue: 0,
        minValue: 0
      });
    });
  });

  describe('validateRewardValue', () => {
    it('should return true for positive integer values', () => {
      expect(rewardService.validateRewardValue(1)).toBe(true);
      expect(rewardService.validateRewardValue(10)).toBe(true);
      expect(rewardService.validateRewardValue(100)).toBe(true);
    });

    it('should return false for non-positive values', () => {
      expect(rewardService.validateRewardValue(0)).toBe(false);
      expect(rewardService.validateRewardValue(-1)).toBe(false);
      expect(rewardService.validateRewardValue(-10)).toBe(false);
    });

    it('should return false for non-integer values', () => {
      expect(rewardService.validateRewardValue(1.5)).toBe(false);
      expect(rewardService.validateRewardValue(10.99)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(rewardService.validateRewardValue('10')).toBe(false);
      expect(rewardService.validateRewardValue(null)).toBe(false);
      expect(rewardService.validateRewardValue(undefined)).toBe(false);
    });
  });

  describe('getRecommendedValue', () => {
    it('should return default value when no rewards exist', async () => {
      // Arrange
      mockRewardRepository.count.mockResolvedValue(0);
      mockRewardRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await rewardService.getRecommendedValue();

      // Assert
      expect(result).toBe(10);
    });

    it('should return rounded average value when rewards exist', async () => {
      // Arrange
      const mockRewards = [
        { id: 1, name: 'Reward 1', value: 8 },
        { id: 2, name: 'Reward 2', value: 12 }
      ];
      
      mockRewardRepository.count.mockResolvedValue(2);
      mockRewardRepository.findAll.mockResolvedValue(mockRewards);

      // Act
      const result = await rewardService.getRecommendedValue();

      // Assert
      expect(result).toBe(10); // Average of 8 and 12 is 10, rounded to nearest 5 is 10
    });
  });
});