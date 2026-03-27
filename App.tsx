import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ListingsScreen from './src/screens/ListingsScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import MapScreen from './src/screens/MapScreen';
import SavedScreen from './src/screens/SavedScreen';
import AccountScreen from './src/screens/AccountScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ListingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListingsList" component={ListingsScreen} />
      <Stack.Screen name="Listing" component={ListingDetailScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111', borderTopColor: 'rgba(255,255,255,0.08)' },
        tabBarActiveTintColor: '#e85d2f',
        tabBarInactiveTintColor: '#4b5563',
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, any> = {
            Listings: 'home-outline',
            Map: 'map-outline',
            Saved: 'heart-outline',
            Account: 'person-outline'
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Listings" component={ListingsStack} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <NavigationContainer>
      {started ? <MainTabs /> : <WelcomeScreen onContinue={() => setStarted(true)} />}
    </NavigationContainer>
  );
}
