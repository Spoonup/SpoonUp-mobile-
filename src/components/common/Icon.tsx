import Svg, { Path } from 'react-native-svg';

type Props = { color: string; size?: number };

export const BellIcon = ({ color, size = 19 }: Props) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

export const CartIcon = ({ color, size = 20 }: Props) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M5 8h14l-1.2 12H6.2z" />
    <Path d="M9 8V6.5a3 3 0 016 0V8" />
  </Svg>
);
