import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import PositionScreen from "./src/pages/Position";
import { HistoryScreen } from "./src/pages/History";
import { SettingScreen } from "./src/pages/Setting";
const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={"Position"}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Position" component={PositionScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Setting" component={SettingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
