import { Icon, type IconName } from './Icon';

export type TabIconName = 'home' | 'shop' | 'orders' | 'plans' | 'account';

type Props = { name: TabIconName; color: string; active: boolean };

const ICONS: Record<TabIconName, IconName> = {
  home: 'home',
  shop: 'bag',
  orders: 'receipt',
  plans: 'calendar',
  account: 'user',
};

// Same artwork as the mockup tab bar; active tab is drawn a touch heavier.
export const TabBarIcon = ({ name, color, active }: Props) => (
  <Icon
    name={ICONS[name]}
    color={color}
    size={23}
    strokeWidth={active ? 2 : 1.7}
  />
);
