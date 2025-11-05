const AssignmentRepository = require('../../repositories/AssignmentRepository');
const { query, transaction } = require('../../utils/database');

// Mock the database utility
jest.mock('../../utils/database');

describe('AssignmentRepository', () => {
    let assignmentRepository;
    let mockQuery;
    let mockTransaction;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create a new instance of AssignmentRepository
        assignmentRepository = new AssignmentRepository();

        // Get the mocked functions
        mockQuery = query;
        mockTransaction = transaction;
    });

    describe('findAll', () => {
        it('should return all assignments with default options', async () => {
            // Arrange
            const mockAssignments = [
                {
                    id: 1,
                    person_id: 1,
                    item_type: 'reward',
                    item_id: 1,
                    item_name: 'Good Behavior',
                    item_value: 10,
                    assigned_at: new Date(),
                    person_name: 'Juan'
                }
            ];
            mockQuery.mockResolvedValue({ rows: mockAssignments });

            // Act
            const result = await assignmentRepository.findAll();

            // Assert
            expect(result).toEqual(mockAssignments);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('FROM assignments a'),
                []
            );
        });

        it('should apply limit and offset options', async () => {
            // Arrange
            const options = { limit: 10, offset: 5 };
            mockQuery.mockResolvedValue({ rows: [] });

            // Act
            await assignmentRepository.findAll(options);

            // Assert
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('FROM assignments a'),
                [10, 5]
            );
        });

        it('should apply custom ordering', async () => {
            // Arrange
            const options = { orderBy: 'item_name', orderDirection: 'ASC' };
            mockQuery.mockResolvedValue({ rows: [] });

            // Act
            await assignmentRepository.findAll(options);

            // Assert
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('FROM assignments a'),
                []
            );
        });
    });

    describe('findById', () => {
        it('should return assignment when found', async () => {
            // Arrange
            const mockAssignment = {
                id: 1,
                person_id: 1,
                item_type: 'reward',
                item_id: 1,
                item_name: 'Good Behavior',
                item_value: 10,
                assigned_at: new Date(),
                person_name: 'Juan'
            };
            mockQuery.mockResolvedValue({ rows: [mockAssignment] });

            // Act
            const result = await assignmentRepository.findById(1);

            // Assert
            expect(result).toEqual(mockAssignment);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE a.id = $1'),
                [1]
            );
        });

        it('should return null when assignment not found', async () => {
            // Arrange
            mockQuery.mockResolvedValue({ rows: [] });

            // Act
            const result = await assignmentRepository.findById(999);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('findByPersonId', () => {
        it('should return assignments for specific person', async () => {
            // Arrange
            const mockAssignments = [
                {
                    id: 1,
                    person_id: 1,
                    item_type: 'reward',
                    item_id: 1,
                    item_name: 'Good Behavior',
                    item_value: 10,
                    assigned_at: new Date(),
                    person_name: 'Juan'
                }
            ];
            mockQuery.mockResolvedValue({ rows: mockAssignments });

            // Act
            const result = await assignmentRepository.findByPersonId(1);

            // Assert
            expect(result).toEqual(mockAssignments);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE a.person_id = $1'),
                [1]
            );
        });

        it('should apply date filters when provided', async () => {
            // Arrange
            const options = {
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-31')
            };
            mockQuery.mockResolvedValue({ rows: [] });

            // Act
            await assignmentRepository.findByPersonId(1, options);

            // Assert
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('AND a.assigned_at >= $2 AND a.assigned_at <= $3'),
                [1, options.startDate, options.endDate]
            );
        });
    });

    describe('createMultiple', () => {
        it('should create multiple assignments in a transaction', async () => {
            // Arrange
            const assignmentData = {
                personIds: [1, 2],
                itemType: 'reward',
                itemId: 1,
                itemName: 'Good Behavior',
                itemValue: 10
            };
            const mockCreatedAssignments = [
                { id: 1, person_id: 1, item_type: 'reward', item_id: 1, item_name: 'Good Behavior', item_value: 10, assigned_at: new Date() },
                { id: 2, person_id: 2, item_type: 'reward', item_id: 1, item_name: 'Good Behavior', item_value: 10, assigned_at: new Date() }
            ];

            const mockClient = {
                query: jest.fn()
                    .mockResolvedValueOnce({ rows: [mockCreatedAssignments[0]] })
                    .mockResolvedValueOnce({ rows: [mockCreatedAssignments[1]] })
            };

            mockTransaction.mockImplementation(async (callback) => {
                return await callback(mockClient);
            });

            // Act
            const result = await assignmentRepository.createMultiple(assignmentData);

            // Assert
            expect(result).toEqual(mockCreatedAssignments);
            expect(mockTransaction).toHaveBeenCalledTimes(1);
            expect(mockClient.query).toHaveBeenCalledTimes(2);
            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO assignments'),
                [1, 'reward', 1, 'Good Behavior', 10]
            );
        });
    });

    describe('delete', () => {
        it('should return true when assignment is deleted', async () => {
            // Arrange
            mockQuery.mockResolvedValue({ rowCount: 1 });

            // Act
            const result = await assignmentRepository.delete(1);

            // Assert
            expect(result).toBe(true);
            expect(mockQuery).toHaveBeenCalledWith(
                'DELETE FROM assignments WHERE id = $1',
                [1]
            );
        });

        it('should return false when assignment not found for deletion', async () => {
            // Arrange
            mockQuery.mockResolvedValue({ rowCount: 0 });

            // Act
            const result = await assignmentRepository.delete(999);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('getTotalScores', () => {
        it('should return total scores for all persons', async () => {
            // Arrange
            const mockScores = [
                { person_id: 1, person_name: 'Juan', total_score: '25', assignment_count: '5' },
                { person_id: 2, person_name: 'María', total_score: '15', assignment_count: '3' }
            ];
            mockQuery.mockResolvedValue({ rows: mockScores });

            // Act
            const result = await assignmentRepository.getTotalScores();

            // Assert
            expect(result).toEqual(mockScores);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('COALESCE(SUM(a.item_value), 0) as total_score')
            );
        });
    });

    describe('getWeeklyScores', () => {
        it('should return weekly scores with default week calculation', async () => {
            // Arrange
            const mockScores = [
                {
                    person_id: 1,
                    person_name: 'Juan',
                    weekly_score: '20',
                    weekly_assignment_count: '4',
                    week_start: new Date(),
                    week_end: new Date()
                }
            ];
            mockQuery.mockResolvedValue({ rows: mockScores });

            // Act
            const result = await assignmentRepository.getWeeklyScores();

            // Assert
            expect(result).toEqual(mockScores);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('COALESCE(SUM(a.item_value), 0) as weekly_score'),
                expect.any(Array)
            );
        });

        it('should use provided week start date', async () => {
            // Arrange
            const weekStart = new Date('2024-01-01');
            mockQuery.mockResolvedValue({ rows: [] });

            // Act
            await assignmentRepository.getWeeklyScores(weekStart);

            // Assert
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('a.assigned_at >= $1'),
                expect.arrayContaining([weekStart])
            );
        });
    });

    describe('getPersonScore', () => {
        it('should return score for specific person', async () => {
            // Arrange
            const mockScore = { person_id: 1, person_name: 'Juan', total_score: '25', assignment_count: '5' };
            mockQuery.mockResolvedValue({ rows: [mockScore] });

            // Act
            const result = await assignmentRepository.getPersonScore(1);

            // Assert
            expect(result).toEqual(mockScore);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE p.id = $1'),
                [1]
            );
        });

        it('should return null when person not found', async () => {
            // Arrange
            mockQuery.mockResolvedValue({ rows: [] });

            // Act
            const result = await assignmentRepository.getPersonScore(999);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('getPersonWeeklyScore', () => {
        it('should return weekly score for specific person', async () => {
            // Arrange
            const mockScore = {
                person_id: 1,
                person_name: 'Juan',
                weekly_score: '15',
                weekly_assignment_count: '3',
                week_start: new Date(),
                week_end: new Date()
            };
            mockQuery.mockResolvedValue({ rows: [mockScore] });

            // Act
            const result = await assignmentRepository.getPersonWeeklyScore(1);

            // Assert
            expect(result).toEqual(mockScore);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE p.id = $1'),
                expect.any(Array)
            );
        });

        it('should use provided week start date', async () => {
            // Arrange
            const weekStart = new Date('2024-01-01');
            mockQuery.mockResolvedValue({ rows: [] });

            // Act
            await assignmentRepository.getPersonWeeklyScore(1, weekStart);

            // Assert
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('a.assigned_at >= $2'),
                expect.arrayContaining([1, weekStart])
            );
        });
    });

    describe('getStatistics', () => {
        it('should return assignment statistics', async () => {
            // Arrange
            const mockStats = {
                total_assignments: '10',
                reward_assignments: '6',
                punishment_assignments: '4',
                average_value: '5.5',
                total_rewards: '60',
                total_punishments: '40'
            };
            mockQuery.mockResolvedValue({ rows: [mockStats] });

            // Act
            const result = await assignmentRepository.getStatistics();

            // Assert
            expect(result).toEqual(mockStats);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('COUNT(*) as total_assignments')
            );
        });
    });

    describe('findByDateRange', () => {
        it('should return assignments within date range', async () => {
            // Arrange
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-31');
            const mockAssignments = [
                {
                    id: 1,
                    person_id: 1,
                    item_type: 'reward',
                    item_id: 1,
                    item_name: 'Good Behavior',
                    item_value: 10,
                    assigned_at: new Date('2024-01-15'),
                    person_name: 'Juan'
                }
            ];
            mockQuery.mockResolvedValue({ rows: mockAssignments });

            // Act
            const result = await assignmentRepository.findByDateRange(startDate, endDate);

            // Assert
            expect(result).toEqual(mockAssignments);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE a.assigned_at >= $1 AND a.assigned_at <= $2'),
                [startDate, endDate]
            );
        });

        it('should apply limit when provided', async () => {
            // Arrange
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-31');
            const options = { limit: 5 };
            mockQuery.mockResolvedValue({ rows: [] });

            // Act
            await assignmentRepository.findByDateRange(startDate, endDate, options);

            // Assert
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('LIMIT $3'),
                [startDate, endDate, 5]
            );
        });
    });

    describe('count', () => {
        it('should return total count of assignments', async () => {
            // Arrange
            mockQuery.mockResolvedValue({ rows: [{ count: '15' }] });

            // Act
            const result = await assignmentRepository.count();

            // Assert
            expect(result).toBe(15);
            expect(mockQuery).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM assignments');
        });

        it('should return zero when no assignments exist', async () => {
            // Arrange
            mockQuery.mockResolvedValue({ rows: [{ count: '0' }] });

            // Act
            const result = await assignmentRepository.count();

            // Assert
            expect(result).toBe(0);
        });
    });
});