import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/LoginScreen';
import { GameSelectScreen } from '../screens/GameSelectScreen';
import { MemoryMatchScreen } from '../screens/MemoryMatchScreen';
import { DailySequencingScreen } from '../screens/DailySequencingScreen';
import { CaregiverDashboardScreen } from '../screens/CaregiverDashboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 350,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="GameSelect" component={GameSelectScreen} />
        <Stack.Screen name="MemoryMatch" component={MemoryMatchScreen} />
        <Stack.Screen name="DailySequencing" component={DailySequencingScreen} />
        <Stack.Screen name="CaregiverDashboard" component={CaregiverDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
