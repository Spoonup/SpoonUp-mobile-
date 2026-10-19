import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon, type TabIconName } from '../components/common/TabBarIcon';
import { colors } from '../theme';
import { PlansScreen } from '../features/plan/screens/PlansScreen';
import { AccountScreen } from '../features/account/screens/AccountScreen';
import { OrdersScreen } from '../features/orders/screens/OrdersScreen';
import { ShopScreen } from '../features/shop/screens/ShopScreen';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconProps = { name: TabIconName; focused: boolean };

const TabIcon = ({ name, focused }: TabIconProps) => (
  <View style={styles.iconWrap}>
    <TabBarIcon
      name={name}
      color={focused ? colors.ink : colors.textDisabled}
      active={focused}
    />
    <View style={focused ? styles.dotActive : styles.dotInactive} />
  </View>
);

const renderTabIcon =
  (name: TabIconName) =>
  ({ focused }: { focused: boolean }) =>
    <TabIcon name={name} focused={focused} />;

const TAB_RENDERERS: Record<
  keyof MainTabParamList,
  ReturnType<typeof renderTabIcon>
> = {
  Home: renderTabIcon('home'),
  Shop: renderTabIcon('shop'),
  Orders: renderTabIcon('orders'),
  Plans: renderTabIcon('plans'),
  Account: renderTabIcon('account'),
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Home: 'Home',
  Shop: 'Shop',
  Orders: 'Orders',
  Plans: '30-day plan',
  Account: 'Account',
};

export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarAccessibilityLabel:
        TAB_LABELS[route.name as keyof MainTabParamList],
      tabBarStyle: styles.tabBar,
      tabBarIcon: TAB_RENDERERS[route.name as keyof MainTabParamList],
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Shop" component={ShopScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Plans" component={PlansScreen} />
    <Tab.Screen name="Account" component={AccountScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: 'rgba(27, 42, 24, 0.08)',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  iconWrap: {
    width: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dotActive: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.olive,
  },
  dotInactive: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
});
