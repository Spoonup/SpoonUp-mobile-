import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { MobileLogin } from '../src/features/auth/components/MobileLogin';

const setup = () => {
  const onUseEmail = jest.fn();
  const onSignup = jest.fn();
  let r!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    r = ReactTestRenderer.create(
      <MobileLogin
        offline={false}
        onSignedIn={jest.fn()}
        onUseEmail={onUseEmail}
        onSignup={onSignup}
        onSkip={jest.fn()}
      />,
    );
  });
  return { r, onUseEmail, onSignup };
};
const loginBtn = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root.find(
    n =>
      n.props.accessibilityRole === 'button' &&
      n.props.accessibilityLabel === 'Login',
  );

test('Login is disabled until 10 valid digits; mode links fire', () => {
  const { r, onUseEmail, onSignup } = setup();
  expect(loginBtn(r).props.accessibilityState.disabled).toBe(true);
  const input = r.root.findByProps({ accessibilityLabel: 'Mobile number' });
  act(() => input.props.onChangeText('98450 12345'));
  expect(loginBtn(r).props.accessibilityState.disabled).toBe(false);
  r.root
    .findAll(
      n =>
        n.props.accessibilityRole === 'button' &&
        n.props.onPress === onUseEmail,
    )[0]
    .props.onPress();
  expect(onUseEmail).toHaveBeenCalled();
  r.root.findByProps({ accessibilityRole: 'link' }).props.onPress();
  expect(onSignup).toHaveBeenCalled();
});
