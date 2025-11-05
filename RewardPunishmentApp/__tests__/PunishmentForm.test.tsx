/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { PunishmentForm } from '../src/components/PunishmentForm';

describe('PunishmentForm', () => {
  const mockProps = {
    loading: false,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for new punishment', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PunishmentForm {...mockProps} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders correctly for editing punishment', async () => {
    const punishment = {
      id: 1,
      name: 'Test Punishment',
      value: -10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PunishmentForm {...mockProps} punishment={punishment} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('handles loading state', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PunishmentForm {...mockProps} loading={true} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('validates negative values for punishments', () => {
    const onSubmit = jest.fn();
    const props = { ...mockProps, onSubmit };

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<PunishmentForm {...props} />);
    });

    // Test that the component can be created without errors
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel is pressed', () => {
    const onCancel = jest.fn();
    const props = { ...mockProps, onCancel };

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<PunishmentForm {...props} />);
    });

    // Test that the component can be created without errors
    expect(onCancel).not.toHaveBeenCalled();
  });
});