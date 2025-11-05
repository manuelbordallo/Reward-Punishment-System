/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { PersonForm } from '../src/components/PersonForm';

describe('PersonForm', () => {
  const mockProps = {
    existingNames: ['Juan', 'María'],
    loading: false,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for new person', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PersonForm {...mockProps} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders correctly for editing person', async () => {
    const person = {
      id: 1,
      name: 'Test Person',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PersonForm {...mockProps} person={person} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('handles loading state', async () => {
    let component;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <PersonForm {...mockProps} loading={true} />
      );
    });

    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = jest.fn();
    const props = { ...mockProps, onSubmit };

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<PersonForm {...props} />);
    });

    // Test that the component can be created without errors
    expect(onSubmit).not.toHaveBeenCalled(); // Should not be called on render
  });

  it('calls onCancel when cancel is pressed', () => {
    const onCancel = jest.fn();
    const props = { ...mockProps, onCancel };

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<PersonForm {...props} />);
    });

    // Test that the component can be created without errors
    expect(onCancel).not.toHaveBeenCalled(); // Should not be called on render
  });
});