import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Weather from "./pages/Weather.js";
import Recents from "./pages/Recents.js";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={"Weather"}>
        <Stack.Screen
          name="Weather"
          component={Weather}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Recents"
          component={Recents}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
