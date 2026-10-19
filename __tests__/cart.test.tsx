import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Stepper } from '../src/components/common/Stepper';
import {
  CartProvider,
  useCart,
} from '../src/features/cart/context/CartContext';

type Cart = ReturnType<typeof useCart>;

const setup = () => {
  const ref: { current: Cart | null } = { current: null };
  const Probe = () => {
    ref.current = useCart();
    return null;
  };
  act(() => {
    ReactTestRenderer.create(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
  });
  return () => ref.current as Cart;
};

describe('CartContext', () => {
  test('add increments, remove decrements and drops at zero', () => {
    const cart = setup();
    act(() => cart().add('pudding'));
    act(() => cart().add('pudding'));
    expect(cart().quantityOf('pudding')).toBe(2);
    expect(cart().count).toBe(2);
    act(() => cart().remove('pudding'));
    act(() => cart().remove('pudding'));
    expect(cart().quantityOf('pudding')).toBe(0);
    expect(cart().lines).toHaveLength(0);
  });

  test('removeAll and clear empty lines', () => {
    const cart = setup();
    act(() => cart().add('pudding'));
    act(() => cart().add('chia'));
    act(() => cart().removeAll('pudding'));
    expect(cart().count).toBe(1);
    act(() => cart().clear());
    expect(cart().count).toBe(0);
  });

  test('ignores unknown product ids in lines', () => {
    const cart = setup();
    act(() => cart().add('nope'));
    expect(cart().count).toBe(0);
  });
});

describe('Stepper', () => {
  test('buttons fire increment and decrement', () => {
    const inc = jest.fn();
    const dec = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <Stepper
          quantity={2}
          itemName="Chia"
          onIncrement={inc}
          onDecrement={dec}
        />,
      );
    });
    const press = (label: string) =>
      tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === label &&
            typeof node.props.onPress === 'function',
        )[0]
        .props.onPress();
    act(() => press('Remove one Chia'));
    act(() => press('Add one Chia'));
    expect(dec).toHaveBeenCalledTimes(1);
    expect(inc).toHaveBeenCalledTimes(1);
  });
});
