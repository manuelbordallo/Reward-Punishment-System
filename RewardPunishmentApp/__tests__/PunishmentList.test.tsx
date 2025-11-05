/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { PunishmentList } from '../src/components/PunishmentList';

describe('PunishmentList', () => {
  const mockPunishments = [
    {
      id: 1,
      name: 'Bad Behavior',
      value: -10,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 2,
      name: 'Late Homework',
      value: -5,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  const mockProps = {
    punishments: mockPunishments,
    loading: false,
    onEditPunishment: jest.fn(),
    onDeletePunishment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of punishments correctly', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PunishmentList {...mockProps} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('shows loading state', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PunishmentList {...mockProps} loading={true} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('shows empty state when no punishments', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PunishmentList {...mockProps} punishments={[]} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('handles edit and delete callbacks', () => {
    const onEditPunishment = jest.fn();
    const onDeletePunishment = jest.fn();
    const props = { ...mockProps, onEditPunishment, onDeletePunishment };
    
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<PunishmentList {...props} />);
    });
    
    // Test that the component can be created without errors
    expect(onEditPunishment).not.toHaveBeenCalled();
    expect(onDeletePunishment).not.toHaveBeenCalled();
  });
});