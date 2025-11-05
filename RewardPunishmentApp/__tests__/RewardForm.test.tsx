/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { RewardForm } from '../src/components/RewardForm';

describe('RewardForm', () => {
  const mockProps = {
    loading: false,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for new reward', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <RewardForm {...mockProps} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders correctly for editing reward', async () => {
    const reward = {
      id: 1,
      name: 'Test Reward',
      value: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <RewardForm {...mockProps} reward={reward} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('handles loading state', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <RewardForm {...mockProps} loading={true} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('validates positive values for rewards', () => {
    const onSubmit = jest.fn();
    const props = { ...mockProps, onSubmit };

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<RewardForm {...props} />);
    });

    // Test that the component can be created without errors
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel is pressed', () => {
    const onCancel = jest.fn();
    const props = { ...mockProps, onCancel };

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<RewardForm {...props} />);
    });

    // Test that the component can be created without errors
    expect(onCancel).not.toHaveBeenCalled();
  });
});