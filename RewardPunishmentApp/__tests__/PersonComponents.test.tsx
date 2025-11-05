/**
 * @format
 */

describe('Person Components', () => {
    it('can import PersonForm component', () => {
        expect(() => {
            require('../src/components/PersonForm');
        }).not.toThrow();
    });

    it('can import PersonList component', () => {
        expect(() => {
            require('../src/components/PersonList');
        }).not.toThrow();
    });

    it('can import PersonManagement screen', () => {
        expect(() => {
            require('../src/screens/PersonManagement');
        }).not.toThrow();
    });
});