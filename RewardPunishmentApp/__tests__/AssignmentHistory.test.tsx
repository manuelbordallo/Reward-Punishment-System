/**
 * @format
 */

describe('Assignment History Components', () => {
    it('can import AssignmentHistory component', () => {
        expect(() => {
            require('../src/components/AssignmentHistory');
        }).not.toThrow();
    });

    it('can import AssignmentHistoryScreen', () => {
        expect(() => {
            require('../src/screens/AssignmentHistoryScreen');
        }).not.toThrow();
    });
});