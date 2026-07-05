import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppNavigator } from './AppNavigator'
import { LoginScreen } from '../screens/LoginScreen'

const Stack = createNativeStackNavigator()

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={AppNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  )
}
