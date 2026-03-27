import React, { createContext, useContext, useMemo, useState } from 'react';
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
import AuthEmailScreen from './src/screens/AuthEmailScreen';

type Member = { email: string; tier: 'free' | 'premium' } | null;

type AuthContextValue = {
  member: Member;
  setMember: (member: Member) => void;
};

const AuthContext = createContext<AuthContextValue>({ member: null, setMember: () => {} });
export const useAuth = () => useContext(AuthContext);

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
  const [screen, setScreen] = useState<'welcome' | 'signup' | 'signin' | 'premium' | 'app'>('welcome');
  const [member, setMember] = useState<Member>(null);
  const authValue = useMemo(() => ({ member, setMember }), [member]);

  return (
    <AuthContext.Provider value={authValue}>
      <NavigationContainer>
        {screen === 'welcome' && (
          <WelcomeScreen
            onBrowse={() => setScreen('app')}
            onSignUp={() => setScreen('signup')}
            onSignIn={() => setScreen('signin')}
            onPremium={() => setScreen('premium')}
          />
        )}
        {screen === 'signup' && (
          <AuthEmailScreen
            mode="signup"
            onBack={() => setScreen('welcome')}
            onAuthed={(nextMember) => {
              setMember(nextMember);
              setScreen('app');
            }}
          />
        )}
        {screen === 'signin' && (
          <AuthEmailScreen
            mode="signin"
            onBack={() => setScreen('welcome')}
            onAuthed={(nextMember) => {
              setMember(nextMember);
              setScreen('app');
            }}
          />
        )}
        {screen === 'premium' && (
          <AuthEmailScreen
            mode="premium"
            onBack={() => setScreen('welcome')}
            onAuthed={(nextMember) => {
              setMember(nextMember);
              setScreen('app');
            }}
          />
        )}
        {screen === 'app' && <MainTabs />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
