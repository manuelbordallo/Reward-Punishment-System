/**
 * @format
 */

import rewardReducer, {
  setLoading,
  setError,
  setRewards,
  addReward,
  updateReward,
  removeReward,
  clearError,
} from '../src/store/slices/rewardSlice';

describe('rewardSlice', () => {
  const initialState = {
    rewards: [],
    loading: false,
    error: null,
  };

  const mockReward = {
    id: 1,
    name: 'Test Reward',
    value: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should return the initial state', () => {
    expect(rewardReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setLoading', () => {
    const actual = rewardReducer(initialState, setLoading(true));
    expect(actual.loading).toBe(true);
  });

  it('should handle setError', () => {
    const errorMessage = 'Test error';
    const actual = rewardReducer(initialState, setError(errorMessage));
    expect(actual.error).toBe(errorMessage);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const actual = rewardReducer(stateWithError, clearError());
    expect(actual.error).toBe(null);
  });

  it('should handle setRewards', () => {
    const rewards = [mockReward];
    const actual = rewardReducer(initialState, setRewards(rewards));
    expect(actual.rewards).toEqual(rewards);
  });

  it('should handle addReward', () => {
    const actual = rewardReducer(initialState, addReward(mockReward));
    expect(actual.rewards).toHaveLength(1);
    expect(actual.rewards[0]).toEqual(mockReward);
  });

  it('should handle updateReward', () => {
    const stateWithReward = { ...initialState, rewards: [mockReward] };
    const updatedReward = { ...mockReward, name: 'Updated Reward', value: 15 };
    
    const actual = rewardReducer(stateWithReward, updateReward(updatedReward));
    expect(actual.rewards[0].name).toBe('Updated Reward');
    expect(actual.rewards[0].value).toBe(15);
  });

  it('should not update reward if id does not exist', () => {
    const stateWithReward = { ...initialState, rewards: [mockReward] };
    const nonExistentReward = { ...mockReward, id: 999, name: 'Non-existent' };
    
    const actual = rewardReducer(stateWithReward, updateReward(nonExistentReward));
    expect(actual.rewards[0].name).toBe('Test Reward'); // Should remain unchanged
  });

  it('should handle removeReward', () => {
    const stateWithReward = { ...initialState, rewards: [mockReward] };
    const actual = rewardReducer(stateWithReward, removeReward(mockReward.id));
    expect(actual.rewards).toHaveLength(0);
  });

  it('should handle multiple rewards operations', () => {
    const reward1 = { ...mockReward, id: 1, name: 'Reward 1', value: 5 };
    const reward2 = { ...mockReward, id: 2, name: 'Reward 2', value: 10 };
    
    let state = rewardReducer(initialState, addReward(reward1));
    state = rewardReducer(state, addReward(reward2));
    expect(state.rewards).toHaveLength(2);
    
    state = rewardReducer(state, removeReward(1));
    expect(state.rewards).toHaveLength(1);
    expect(state.rewards[0].name).toBe('Reward 2');
    expect(state.rewards[0].value).toBe(10);
  });

  it('should maintain positive values for rewards', () => {
    const positiveReward = { ...mockReward, value: 25 };
    const actual = rewardReducer(initialState, addReward(positiveReward));
    expect(actual.rewards[0].value).toBe(25);
    expect(actual.rewards[0].value).toBeGreaterThan(0);
  });
});