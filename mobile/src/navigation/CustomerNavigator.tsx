import React from 'react'
import { View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, PackageCheck, MapPinned, Bell, UserCircle2 } from 'lucide-react-native'
import { CustomerSplashScreen } from '../screens/customer/CustomerSplashScreen'
import { LoginCustomerScreen } from '../screens/customer/LoginCustomerScreen'
import { RegisterCustomerScreen } from '../screens/customer/RegisterCustomerScreen'
import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen'
import { MyShipmentsScreen } from '../screens/customer/MyShipmentsScreen'
import { ShipmentDetailsCustomerScreen } from '../screens/customer/ShipmentDetailsCustomerScreen'
import { LiveTrackingScreen } from '../screens/customer/LiveTrackingScreen'
import { CustomerNotificationsScreen } from '../screens/customer/CustomerNotificationsScreen'
import { PickupRequestScreen } from '../screens/customer/PickupRequestScreen'
import { ProfileScreen } from '../screens/customer/ProfileScreen'
import { useAuthStore } from '../store/auth'
import { LoadingState } from '../components/LoadingState'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#081120', borderTopColor: 'rgba(255,255,255,0.08)' }, tabBarActiveTintColor: '#38bdf8', tabBarInactiveTintColor: '#94a3b8' }}>
      <Tab.Screen name="Home" component={CustomerHomeScreen} options={{ tabBarIcon: ({ color }) => <Home size={20} color={color} /> }} />
      <Tab.Screen name="My Shipments" component={MyShipmentsScreen} options={{ tabBarIcon: ({ color }) => <PackageCheck size={20} color={color} /> }} />
      <Tab.Screen name="Tracking" component={LiveTrackingScreen} options={{ tabBarIcon: ({ color }) => <MapPinned size={20} color={color} /> }} />
      <Tab.Screen name="Alerts" component={CustomerNotificationsScreen} options={{ tabBarIcon: ({ color }) => <Bell size={20} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <UserCircle2 size={20} color={color} /> }} />
    </Tab.Navigator>
  )
}

export function CustomerNavigator() {
  const token = useAuthStore((state) => state.token)
  const loading = useAuthStore((state) => state.loading)
  const [showSplash, setShowSplash] = React.useState(true)

  if (showSplash) {
    return <CustomerSplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (loading) {
    return <LoadingState message="Loading your customer portal…" />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="MainTabs" component={CustomerTabs} />
          <Stack.Screen name="ShipmentDetails" component={ShipmentDetailsCustomerScreen} />
          <Stack.Screen name="PickupRequest" component={PickupRequestScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginCustomerScreen} />
          <Stack.Screen name="Register" component={RegisterCustomerScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
