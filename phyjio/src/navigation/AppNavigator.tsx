import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store';
import { Colors } from '../theme/colors';
import { RootStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';
import LockScreen from '../screens/auth/LockScreen';
import AddEditPatientScreen from '../screens/patients/AddEditPatientScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import ActiveVisitScreen from '../screens/visits/ActiveVisitScreen';
import BillPreviewScreen from '../screens/billing/BillPreviewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <LockScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.surface,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddEditPatient"
        component={AddEditPatientScreen}
        options={({ route }) =>
          ({ title: route.params?.patientId ? 'Edit Patient' : 'Add Patient' })
        }
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: 'Patient Profile' }}
      />
      <Stack.Screen
        name="ActiveVisit"
        component={ActiveVisitScreen}
        options={{ title: 'Active Visit', headerBackVisible: false }}
      />
      <Stack.Screen
        name="BillPreview"
        component={BillPreviewScreen}
        options={{ title: 'Bill Preview' }}
      />
    </Stack.Navigator>
  );
}
