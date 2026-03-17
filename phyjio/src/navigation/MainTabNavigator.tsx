import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from './types';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PatientListScreen from '../screens/patients/PatientListScreen';
import VisitLogScreen from '../screens/visits/VisitLogScreen';
import QuickCommScreen from '../screens/communications/QuickCommScreen';
import BillingScreen from '../screens/billing/BillingScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inactive,
        tabBarStyle: {
          height: Spacing.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: 'view-dashboard-outline',
            Patients: 'account-group-outline',
            Visits: 'clipboard-clock-outline',
            Messages: 'whatsapp',
            Billing: 'receipt',
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name] ?? 'circle'}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Patients" component={PatientListScreen} />
      <Tab.Screen name="Visits" component={VisitLogScreen} />
      <Tab.Screen name="Messages" component={QuickCommScreen} />
      <Tab.Screen name="Billing" component={BillingScreen} />
    </Tab.Navigator>
  );
}
