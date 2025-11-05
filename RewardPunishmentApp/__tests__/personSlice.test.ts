/**
 * @format
 */

import personReducer, {
  setLoading,
  setError,
  setPersons,
  addPerson,
  updatePerson,
  removePerson,
  clearError,
} from '../src/store/slices/personSlice';

describe('personSlice', () => {
  const initialState = {
    persons: [],
    loading: false,
    error: null,
  };

  const mockPerson = {
    id: 1,
    name: 'Test Person',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should return the initial state', () => {
    expect(personReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setLoading', () => {
    const actual = personReducer(initialState, setLoading(true));
    expect(actual.loading).toBe(true);
  });

  it('should handle setError', () => {
    const errorMessage = 'Test error';
    const actual = personReducer(initialState, setError(errorMessage));
    expect(actual.error).toBe(errorMessage);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const actual = personReducer(stateWithError, clearError());
    expect(actual.error).toBe(null);
  });

  it('should handle setPersons', () => {
    const persons = [mockPerson];
    const actual = personReducer(initialState, setPersons(persons));
    expect(actual.persons).toEqual(persons);
  });

  it('should handle addPerson', () => {
    const actual = personReducer(initialState, addPerson(mockPerson));
    expect(actual.persons).toHaveLength(1);
    expect(actual.persons[0]).toEqual(mockPerson);
  });

  it('should handle updatePerson', () => {
    const stateWithPerson = { ...initialState, persons: [mockPerson] };
    const updatedPerson = { ...mockPerson, name: 'Updated Name' };
    
    const actual = personReducer(stateWithPerson, updatePerson(updatedPerson));
    expect(actual.persons[0].name).toBe('Updated Name');
  });

  it('should not update person if id does not exist', () => {
    const stateWithPerson = { ...initialState, persons: [mockPerson] };
    const nonExistentPerson = { ...mockPerson, id: 999, name: 'Non-existent' };
    
    const actual = personReducer(stateWithPerson, updatePerson(nonExistentPerson));
    expect(actual.persons[0].name).toBe('Test Person'); // Should remain unchanged
  });

  it('should handle removePerson', () => {
    const stateWithPerson = { ...initialState, persons: [mockPerson] };
    const actual = personReducer(stateWithPerson, removePerson(mockPerson.id));
    expect(actual.persons).toHaveLength(0);
  });

  it('should handle multiple persons operations', () => {
    const person1 = { ...mockPerson, id: 1, name: 'Person 1' };
    const person2 = { ...mockPerson, id: 2, name: 'Person 2' };
    
    let state = personReducer(initialState, addPerson(person1));
    state = personReducer(state, addPerson(person2));
    expect(state.persons).toHaveLength(2);
    
    state = personReducer(state, removePerson(1));
    expect(state.persons).toHaveLength(1);
    expect(state.persons[0].name).toBe('Person 2');
  });
});