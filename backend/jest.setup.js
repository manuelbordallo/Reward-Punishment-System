// Jest setup file for backend tests

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';

// Global test utilities
global.testUtils = {
  // Helper to create mock dates
  createMockDate: (dateString) => new Date(dateString),
  
  // Helper to create mock person
  createMockPerson: (id = 1, name = 'Test Person') => ({
    id,
    name,
    created_at: new Date(),
    updated_at: new Date()
  }),
  
  // Helper to create mock reward
  createMockReward: (id = 1, name = 'Test Reward', value = 10) => ({
    id,
    name,
    value,
    created_at: new Date(),
    updated_at: new Date()
  }),
  
  // Helper to create mock punishment
  createMockPunishment: (id = 1, name = 'Test Punishment', value = -5) => ({
    id,
    name,
    value,
    created_at: new Date(),
    updated_at: new Date()
  }),
  
  // Helper to create mock assignment
  createMockAssignment: (id = 1, personId = 1, itemType = 'reward', itemId = 1, itemName = 'Test Item', itemValue = 10) => ({
    id,
    person_id: personId,
    item_type: itemType,
    item_id: itemId,
    item_name: itemName,
    item_value: itemValue,
    assigned_at: new Date(),
    person_name: 'Test Person'
  })
};

// Increase timeout for async operations
jest.setTimeout(10000);