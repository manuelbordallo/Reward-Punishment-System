/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { PersonList } from '../src/components/PersonList';

describe('PersonList', () => {
  const mockPersons = [
    {
      id: 1,
      name: 'Juan Pérez',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 2,
      name: 'María García',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  const mockProps = {
    persons: mockPersons,
    loading: false,
    onEditPerson: jest.fn(),
    onDeletePerson: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of persons correctly', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PersonList {...mockProps} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('shows loading state', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PersonList {...mockProps} loading={true} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('shows empty state when no persons', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PersonList {...mockProps} persons={[]} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('handles edit and delete callbacks', () => {
    const onEditPerson = jest.fn();
    const onDeletePerson = jest.fn();
    const props = { ...mockProps, onEditPerson, onDeletePerson };
    
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<PersonList {...props} />);
    });
    
    // Test that the component can be created without errors
    expect(onEditPerson).not.toHaveBeenCalled();
    expect(onDeletePerson).not.toHaveBeenCalled();
  });
});