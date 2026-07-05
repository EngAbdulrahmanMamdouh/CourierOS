import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, PackageCheck, ScanLine, MapPinned, UserCircle2 } from 'lucide-react-native'
import { LoginScreen } from '../screens/LoginScreen'
import { SplashScreen } from '../screens/SplashScreen'
import { HomeDashboardScreen } from '../screens/HomeDashboardScreen'
import { TodayShipmentsScreen } from '../screens/TodayShipmentsScreen'
import { ShipmentDetailsScreen } from '../screens/ShipmentDetailsScreen'
import { ProofOfDeliveryScreen } from '../screens/ProofOfDeliveryScreen'
import { CodCollectionScreen } from '../screens/CodCollectionScreen'
import { NotificationsScreen } from '../screens/NotificationsScreen'
import { DeliveryHistoryScreen } from '../screens/DeliveryHistoryScreen'
import { MapScreen } from '../screens/MapScreen'
import { SettingsScreen } from '../screens/SettingsScreen'
import { ScannerScreen } from '../screens/ScannerScreen'
import { useAuthStore } from '../store/auth'
import { LoadingState } from '../components/LoadingState'
import { View } from 'react-native'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#081120', borderTopColor: 'rgba(255,255,255,0.08)' }, tabBarActiveTintColor: '#38bdf8', tabBarInactiveTintColor: '#94a3b8' }}>
      <Tab.Screen name="Home" component={HomeDashboardScreen} options={{ tabBarIcon: ({ color }) => <Home size={20} color={color} /> }} />
      <Tab.Screen name="Today's Shipments" component={TodayShipmentsScreen} options={{ tabBarIcon: ({ color }) => <PackageCheck size={20} color={color} /> }} />
      <Tab.Screen name="Scanner" component={ScannerScreen} options={{ tabBarIcon: ({ color }) => <ScanLine size={20} color={color} /> }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarIcon: ({ color }) => <MapPinned size={20} color={color} /> }} />
      <Tab.Screen name="Profile" component={SettingsScreen} options={{ tabBarIcon: ({ color }) => <UserCircle2 size={20} color={color} /> }} />
    </Tab.Navigator>
  )
}

export function AppNavigator() {
  const token = useAuthStore((state) => state.token)
  const loading = useAuthStore((state) => state.loading)
  const [showSplash, setShowSplash] = React.useState(true)

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (loading) {
    return <LoadingState message="Checking your secure session…" />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="MainTabs" component={HomeTabs} />
          <Stack.Screen name="ShipmentDetails" component={ShipmentDetailsScreen} />
          <Stack.Screen name="BarcodeScanner" component={ScannerScreen} />
          <Stack.Screen name="QRScanner" component={ScannerScreen} />
          <Stack.Screen name="ProofOfDelivery" component={ProofOfDeliveryScreen} />
          <Stack.Screen name="CODCollection" component={CodCollectionScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="History" component={DeliveryHistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}
