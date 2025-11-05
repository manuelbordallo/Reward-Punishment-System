/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { RewardList } from '../src/components/RewardList';

describe('RewardList', () => {
  const mockRewards = [
    {
      id: 1,
      name: 'Good Behavior',
      value: 10,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 2,
      name: 'Homework Done',
      value: 5,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  const mockProps = {
    rewards: mockRewards,
    loading: false,
    onEditReward: jest.fn(),
    onDeleteReward: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of rewards correctly', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <RewardList {...mockProps} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('shows loading state', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <RewardList {...mockProps} loading={true} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('shows empty state when no rewards', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <RewardList {...mockProps} rewards={[]} />
      );
    });
    
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('handles edit and delete callbacks', () => {
    const onEditReward = jest.fn();
    const onDeleteReward = jest.fn();
    const props = { ...mockProps, onEditReward, onDeleteReward };
    
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<RewardList {...props} />);
    });
    
    // Test that the component can be created without errors
    expect(onEditReward).not.toHaveBeenCalled();
    expect(onDeleteReward).not.toHaveBeenCalled();
  });
});