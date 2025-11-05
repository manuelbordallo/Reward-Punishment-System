const PunishmentService = require('../../services/PunishmentService');
const PunishmentRepository = require('../../repositories/PunishmentRepository');

// Mock the PunishmentRepository
jest.mock('../../repositories/PunishmentRepository');

describe('PunishmentService', () => {
    let punishmentService;
    let mockPunishmentRepository;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create a new instance of PunishmentService
        punishmentService = new PunishmentService();

        // Get the mocked repository instance
        mockPunishmentRepository = PunishmentRepository.mock.instances[0];
    });

    describe('getAllPunishments', () => {
        it('should return all punishments from repository', async () => {
            // Arrange
            const mockPunishments = [
                { id: 1, name: 'Late Homework', value: -5, created_at: new Date(), updated_at: new Date() },
                { id: 2, name: 'Bad Behavior', value: -10, created_at: new Date(), updated_at: new Date() }
            ];
            mockPunishmentRepository.findAll.mockResolvedValue(mockPunishments);

            // Act
            const result = await punishmentService.getAllPunishments();

            // Assert
            expect(result).toEqual(mockPunishments);
            expect(mockPunishmentRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('getPunishmentById', () => {
        it('should return punishment when found', async () => {
            // Arrange
            const mockPunishment = { id: 1, name: 'Late Homework', value: -5, created_at: new Date(), updated_at: new Date() };
            mockPunishmentRepository.findById.mockResolvedValue(mockPunishment);

            // Act
            const result = await punishmentService.getPunishmentById(1);

            // Assert
            expect(result).toEqual(mockPunishment);
            expect(mockPunishmentRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw error when punishment not found', async () => {
            // Arrange
            mockPunishmentRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(punishmentService.getPunishmentById(999)).rejects.toThrow('Castigo con ID 999 no encontrado');
            expect(mockPunishmentRepository.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('createPunishment', () => {
        it('should create punishment with valid negative value', async () => {
            // Arrange
            const punishmentData = { name: 'Late Homework', value: -5 };
            const mockCreatedPunishment = { id: 1, name: 'Late Homework', value: -5, created_at: new Date(), updated_at: new Date() };

            mockPunishmentRepository.create.mockResolvedValue(mockCreatedPunishment);

            // Act
            const result = await punishmentService.createPunishment(punishmentData);

            // Assert
            expect(result).toEqual(mockCreatedPunishment);
            expect(mockPunishmentRepository.create).toHaveBeenCalledWith({ name: 'Late Homework', value: -5 });
        });

        it('should throw error when value is zero', async () => {
            // Arrange
            const punishmentData = { name: 'Late Homework', value: 0 };

            // Act & Assert
            await expect(punishmentService.createPunishment(punishmentData)).rejects.toThrow('El valor del castigo debe ser menor que cero');
            expect(mockPunishmentRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when value is positive', async () => {
            // Arrange
            const punishmentData = { name: 'Late Homework', value: 5 };

            // Act & Assert
            await expect(punishmentService.createPunishment(punishmentData)).rejects.toThrow('Datos inválidos');
        });

        it('should throw error when name is empty', async () => {
            // Arrange
            const punishmentData = { name: '', value: -5 };

            // Act & Assert
            await expect(punishmentService.createPunishment(punishmentData)).rejects.toThrow('Datos inválidos');
        });
    });

    describe('updatePunishment', () => {
        it('should update punishment with valid data', async () => {
            // Arrange
            const punishmentData = { name: 'Updated Punishment', value: -15 };
            const existingPunishment = { id: 1, name: 'Late Homework', value: -5 };
            const updatedPunishment = { id: 1, name: 'Updated Punishment', value: -15, created_at: new Date(), updated_at: new Date() };

            mockPunishmentRepository.findById.mockResolvedValue(existingPunishment);
            mockPunishmentRepository.update.mockResolvedValue(updatedPunishment);

            // Act
            const result = await punishmentService.updatePunishment(1, punishmentData);

            // Assert
            expect(result).toEqual(updatedPunishment);
            expect(mockPunishmentRepository.findById).toHaveBeenCalledWith(1);
            expect(mockPunishmentRepository.update).toHaveBeenCalledWith(1, { name: 'Updated Punishment', value: -15 });
        });

        it('should throw error when punishment not found', async () => {
            // Arrange
            const punishmentData = { name: 'Updated Punishment', value: -15 };
            mockPunishmentRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(punishmentService.updatePunishment(999, punishmentData)).rejects.toThrow('Castigo con ID 999 no encontrado');
            expect(mockPunishmentRepository.findById).toHaveBeenCalledWith(999);
        });

        it('should throw error when new value is not negative', async () => {
            // Arrange
            const punishmentData = { name: 'Updated Punishment', value: 0 };
            const existingPunishment = { id: 1, name: 'Late Homework', value: -5 };

            mockPunishmentRepository.findById.mockResolvedValue(existingPunishment);

            // Act & Assert
            await expect(punishmentService.updatePunishment(1, punishmentData)).rejects.toThrow('El valor del castigo debe ser menor que cero');
            expect(mockPunishmentRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('deletePunishment', () => {
        it('should delete punishment when not used in assignments', async () => {
            // Arrange
            const existingPunishment = { id: 1, name: 'Late Homework', value: -5 };

            mockPunishmentRepository.findById.mockResolvedValue(existingPunishment);
            mockPunishmentRepository.isUsedInAssignments.mockResolvedValue(false);
            mockPunishmentRepository.delete.mockResolvedValue(true);

            // Act
            const result = await punishmentService.deletePunishment(1);

            // Assert
            expect(result).toBe(true);
            expect(mockPunishmentRepository.findById).toHaveBeenCalledWith(1);
            expect(mockPunishmentRepository.isUsedInAssignments).toHaveBeenCalledWith(1);
            expect(mockPunishmentRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw error when punishment not found', async () => {
            // Arrange
            mockPunishmentRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(punishmentService.deletePunishment(999)).rejects.toThrow('Castigo con ID 999 no encontrado');
            expect(mockPunishmentRepository.findById).toHaveBeenCalledWith(999);
        });

        it('should throw error when punishment is used in assignments', async () => {
            // Arrange
            const existingPunishment = { id: 1, name: 'Late Homework', value: -5 };

            mockPunishmentRepository.findById.mockResolvedValue(existingPunishment);
            mockPunishmentRepository.isUsedInAssignments.mockResolvedValue(true);

            // Act & Assert
            await expect(punishmentService.deletePunishment(1)).rejects.toThrow('No se puede eliminar el castigo "Late Homework" porque está siendo usado en asignaciones');
            expect(mockPunishmentRepository.isUsedInAssignments).toHaveBeenCalledWith(1);
            expect(mockPunishmentRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('getPunishmentStatistics', () => {
        it('should return punishment statistics with absolute values', async () => {
            // Arrange
            const mockPunishments = [
                { id: 1, name: 'Punishment 1', value: -10 },
                { id: 2, name: 'Punishment 2', value: -20 },
                { id: 3, name: 'Punishment 3', value: -15 }
            ];

            mockPunishmentRepository.count.mockResolvedValue(3);
            mockPunishmentRepository.findAll.mockResolvedValue(mockPunishments);

            // Act
            const result = await punishmentService.getPunishmentStatistics();

            // Assert
            expect(result).toEqual({
                totalPunishments: 3,
                totalAbsoluteValue: 45,
                averageAbsoluteValue: 15,
                maxAbsoluteValue: 20,
                minAbsoluteValue: 10
            });
            expect(mockPunishmentRepository.count).toHaveBeenCalledTimes(1);
            expect(mockPunishmentRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should handle empty punishments list', async () => {
            // Arrange
            mockPunishmentRepository.count.mockResolvedValue(0);
            mockPunishmentRepository.findAll.mockResolvedValue([]);

            // Act
            const result = await punishmentService.getPunishmentStatistics();

            // Assert
            expect(result).toEqual({
                totalPunishments: 0,
                totalAbsoluteValue: 0,
                averageAbsoluteValue: 0,
                maxAbsoluteValue: 0,
                minAbsoluteValue: 0
            });
        });
    });

    describe('validatePunishmentValue', () => {
        it('should return true for negative integer values', () => {
            expect(punishmentService.validatePunishmentValue(-1)).toBe(true);
            expect(punishmentService.validatePunishmentValue(-10)).toBe(true);
            expect(punishmentService.validatePunishmentValue(-100)).toBe(true);
        });

        it('should return false for non-negative values', () => {
            expect(punishmentService.validatePunishmentValue(0)).toBe(false);
            expect(punishmentService.validatePunishmentValue(1)).toBe(false);
            expect(punishmentService.validatePunishmentValue(10)).toBe(false);
        });

        it('should return false for non-integer values', () => {
            expect(punishmentService.validatePunishmentValue(-1.5)).toBe(false);
            expect(punishmentService.validatePunishmentValue(-10.99)).toBe(false);
        });

        it('should return false for non-numeric values', () => {
            expect(punishmentService.validatePunishmentValue('-10')).toBe(false);
            expect(punishmentService.validatePunishmentValue(null)).toBe(false);
            expect(punishmentService.validatePunishmentValue(undefined)).toBe(false);
        });
    });

    describe('getSeverityLevel', () => {
        it('should return correct severity levels', () => {
            expect(punishmentService.getSeverityLevel(-1)).toBe('Leve');
            expect(punishmentService.getSeverityLevel(-5)).toBe('Leve');
            expect(punishmentService.getSeverityLevel(-10)).toBe('Moderado');
            expect(punishmentService.getSeverityLevel(-15)).toBe('Moderado');
            expect(punishmentService.getSeverityLevel(-25)).toBe('Severo');
            expect(punishmentService.getSeverityLevel(-30)).toBe('Severo');
            expect(punishmentService.getSeverityLevel(-50)).toBe('Muy Severo');
        });

        it('should return invalid for positive values', () => {
            expect(punishmentService.getSeverityLevel(0)).toBe('Inválido');
            expect(punishmentService.getSeverityLevel(10)).toBe('Inválido');
        });
    });

    describe('getRecommendedValue', () => {
        it('should return default value when no punishments exist', async () => {
            // Arrange
            mockPunishmentRepository.count.mockResolvedValue(0);
            mockPunishmentRepository.findAll.mockResolvedValue([]);

            // Act
            const result = await punishmentService.getRecommendedValue();

            // Assert
            expect(result).toBe(-10);
        });

        it('should return negative rounded average value when punishments exist', async () => {
            // Arrange
            const mockPunishments = [
                { id: 1, name: 'Punishment 1', value: -8 },
                { id: 2, name: 'Punishment 2', value: -12 }
            ];

            mockPunishmentRepository.count.mockResolvedValue(2);
            mockPunishmentRepository.findAll.mockResolvedValue(mockPunishments);

            // Act
            const result = await punishmentService.getRecommendedValue();

            // Assert
            expect(result).toBe(-10); // Average absolute value of 8 and 12 is 10, rounded to nearest 5 is 10, made negative
        });
    });
});