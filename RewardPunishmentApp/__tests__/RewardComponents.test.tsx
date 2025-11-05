/**
 * @format
 */

describe('Reward Components', () => {
    it('can import RewardForm component', () => {
        expect(() => {
            require('../src/components/RewardForm');
        }).not.toThrow();
    });

    it('can import RewardList component', () => {
        expect(() => {
            require('../src/components/RewardList');
        }).not.toThrow();
    });

    it('can import RewardManagement screen', () => {
        expect(() => {
            require('../src/screens/RewardManagement');
        }).not.toThrow();
    });
});