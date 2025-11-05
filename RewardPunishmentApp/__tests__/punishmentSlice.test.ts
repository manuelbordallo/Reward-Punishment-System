/**
 * @format
 */

import punishmentReducer, {
  setLoading,
  setError,
  setPunishments,
  addPunishment,
  updatePunishment,
  removePunishment,
  clearError,
} from '../src/store/slices/punishmentSlice';

describe('punishmentSlice', () => {
  const initialState = {
    punishments: [],
    loading: false,
    error: null,
  };

  const mockPunishment = {
    id: 1,
    name: 'Test Punishment',
    value: -10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should return the initial state', () => {
    expect(punishmentReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setLoading', () => {
    const actual = punishmentReducer(initialState, setLoading(true));
    expect(actual.loading).toBe(true);
  });

  it('should handle setError', () => {
    const errorMessage = 'Test error';
    const actual = punishmentReducer(initialState, setError(errorMessage));
    expect(actual.error).toBe(errorMessage);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const actual = punishmentReducer(stateWithError, clearError());
    expect(actual.error).toBe(null);
  });

  it('should handle setPunishments', () => {
    const punishments = [mockPunishment];
    const actual = punishmentReducer(initialState, setPunishments(punishments));
    expect(actual.punishments).toEqual(punishments);
  });

  it('should handle addPunishment', () => {
    const actual = punishmentReducer(initialState, addPunishment(mockPunishment));
    expect(actual.punishments).toHaveLength(1);
    expect(actual.punishments[0]).toEqual(mockPunishment);
  });

  it('should handle updatePunishment', () => {
    const stateWithPunishment = { ...initialState, punishments: [mockPunishment] };
    const updatedPunishment = { ...mockPunishment, name: 'Updated Punishment', value: -15 };
    
    const actual = punishmentReducer(stateWithPunishment, updatePunishment(updatedPunishment));
    expect(actual.punishments[0].name).toBe('Updated Punishment');
    expect(actual.punishments[0].value).toBe(-15);
  });

  it('should not update punishment if id does not exist', () => {
    const stateWithPunishment = { ...initialState, punishments: [mockPunishment] };
    const nonExistentPunishment = { ...mockPunishment, id: 999, name: 'Non-existent' };
    
    const actual = punishmentReducer(stateWithPunishment, updatePunishment(nonExistentPunishment));
    expect(actual.punishments[0].name).toBe('Test Punishment'); // Should remain unchanged
  });

  it('should handle removePunishment', () => {
    const stateWithPunishment = { ...initialState, punishments: [mockPunishment] };
    const actual = punishmentReducer(stateWithPunishment, removePunishment(mockPunishment.id));
    expect(actual.punishments).toHaveLength(0);
  });

  it('should handle multiple punishments operations', () => {
    const punishment1 = { ...mockPunishment, id: 1, name: 'Punishment 1', value: -5 };
    const punishment2 = { ...mockPunishment, id: 2, name: 'Punishment 2', value: -10 };
    
    let state = punishmentReducer(initialState, addPunishment(punishment1));
    state = punishmentReducer(state, addPunishment(punishment2));
    expect(state.punishments).toHaveLength(2);
    
    state = punishmentReducer(state, removePunishment(1));
    expect(state.punishments).toHaveLength(1);
    expect(state.punishments[0].name).toBe('Punishment 2');
    expect(state.punishments[0].value).toBe(-10);
  });

  it('should maintain negative values for punishments', () => {
    const negativePunishment = { ...mockPunishment, value: -25 };
    const actual = punishmentReducer(initialState, addPunishment(negativePunishment));
    expect(actual.punishments[0].value).toBe(-25);
    expect(actual.punishments[0].value).toBeLessThan(0);
  });
});