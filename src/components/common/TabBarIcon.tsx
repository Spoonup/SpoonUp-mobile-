import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabIconName = 'home' | 'shop' | 'orders' | 'plans' | 'account';

type Props = {
  name: TabIconName;
  color: string;
  active: boolean;
};

const SIZE = 23;

export const TabBarIcon = ({ name, color, active }: Props) => {
  const strokeWidth = active ? 2 : 1.7;
  const common = {
    width: SIZE,
    height: SIZE,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <Svg {...common}>
          <Path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />
        </Svg>
      );
    case 'shop':
      return (
        <Svg {...common}>
          <Path d="M5 8h14l-1.2 12H6.2z" />
          <Path d="M9 8V6.5a3 3 0 016 0V8" />
        </Svg>
      );
    case 'orders':
      return (
        <Svg {...common}>
          <Path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
          <Path d="M9 8h6M9 12h6" />
        </Svg>
      );
    case 'plans':
      return (
        <Svg {...common}>
          <Rect x={3.5} y={5} width={17} height={15.5} rx={2} />
          <Path d="M3.5 10h17M8 3v4M16 3v4" />
        </Svg>
      );
    case 'account':
      return (
        <Svg {...common}>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4.5 20.5c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
        </Svg>
      );
  }
};
