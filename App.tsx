import React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import PositionScreen from './src/pages/Position';
import DataScreen from './src/pages/Data';
const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={'Position'}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="Position"
          component={PositionScreen} />
        <Stack.Screen
          name="Data"
          component={DataScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}