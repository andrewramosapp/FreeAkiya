import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import ListingsScreen from './src/screens/ListingsScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import MapScreen from './src/screens/MapScreen';
import SavedScreen from './src/screens/SavedScreen';
import AccountScreen from './src/screens/AccountScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthEmailScreen from './src/screens/AuthEmailScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { configurePurchases, getCurrentOffering, getCustomerInfo, hasProEntitlement, purchasePackage, restorePurchases } from './src/lib/purchases';

type Member = { email: string; tier: 'free' | 'premium' } | null;

type AuthContextValue = {
  member: Member;
  setMember: (member: Member) => void;
  authReady: boolean;
  customerInfo: CustomerInfo | null;
  offering: PurchasesOffering | null;
  refreshPurchases: () => Promise<void>;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
};

const AuthContext = createContext<AuthContextValue>({ member: null, setMember: () => {}, authReady: false, customerInfo: null, offering: null, refreshPurchases: async () => {}, showPaywall: false, setShowPaywall: () => {} });
export const useAuth = () => useContext(AuthContext);
const MEMBER_STORAGE_KEY = 'cheapakiya.member';

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
  const [member, setMemberState] = useState<Member>(null);
  const [authReady, setAuthReady] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(MEMBER_STORAGE_KEY);
        let parsed: Member = null;
        if (raw) {
          parsed = JSON.parse(raw);
          if (parsed?.email && parsed?.tier) {
            setMemberState(parsed);
            setScreen('app');
          }
        }
        await configurePurchases(parsed?.email || null);
        const [info, currentOffering] = await Promise.all([getCustomerInfo(), getCurrentOffering()]);
        setCustomerInfo(info);
        setOffering(currentOffering);
        if (parsed?.email && hasProEntitlement(info)) {
          setMemberState({ email: parsed.email, tier: 'premium' });
        }
      } catch {}
      setAuthReady(true);
    })();
  }, []);

  async function refreshPurchases() {
    try {
      const [info, currentOffering] = await Promise.all([getCustomerInfo(), getCurrentOffering()]);
      setCustomerInfo(info);
      setOffering(currentOffering);
      if (member?.email && hasProEntitlement(info) && member.tier !== 'premium') {
        await setMember({ email: member.email, tier: 'premium' });
      }
    } catch {}
  }

  async function setMember(member: Member) {
    setMemberState(member);
    try {
      if (member) await AsyncStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(member));
      else await AsyncStorage.removeItem(MEMBER_STORAGE_KEY);
    } catch {}
    await configurePurchases(member?.email || null);
    await refreshPurchases();
  }

  async function handlePurchase(pkg: PurchasesPackage) {
    try {
      setPurchaseLoading(true);
      setPurchaseError(null);
      const result = await purchasePackage(pkg);
      setCustomerInfo(result.customerInfo);
      if (member?.email && hasProEntitlement(result.customerInfo)) {
        await setMember({ email: member.email, tier: 'premium' });
      }
      setShowPaywall(false);
    } catch (e: any) {
      setPurchaseError(e?.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  }

  async function handleRestore() {
    try {
      setPurchaseLoading(true);
      setPurchaseError(null);
      const info = await restorePurchases();
      setCustomerInfo(info);
      if (member?.email && hasProEntitlement(info)) {
        await setMember({ email: member.email, tier: 'premium' });
      }
      setShowPaywall(false);
    } catch (e: any) {
      setPurchaseError(e?.message || 'Restore failed');
    } finally {
      setPurchaseLoading(false);
    }
  }

  const authValue = useMemo(() => ({ member, setMember, authReady, customerInfo, offering, refreshPurchases, showPaywall, setShowPaywall }), [member, authReady, customerInfo, offering, showPaywall]);

  if (!authReady) return null;

  return (
    <AuthContext.Provider value={authValue}>
      <NavigationContainer>
        {screen === 'welcome' && (
          <WelcomeScreen
            onBrowse={() => setScreen('app')}
            onSignUp={() => setScreen('signup')}
            onSignIn={() => setScreen('signin')}
            onPremium={() => setShowPaywall(true)}
          />
        )}
        {screen === 'signup' && (
          <AuthEmailScreen
            mode="signup"
            onBack={() => setScreen('welcome')}
            onAuthed={async (nextMember) => {
              await setMember(nextMember);
              setScreen('app');
            }}
          />
        )}
        {screen === 'signin' && (
          <AuthEmailScreen
            mode="signin"
            onBack={() => setScreen('welcome')}
            onAuthed={async (nextMember) => {
              await setMember(nextMember);
              setScreen('app');
            }}
          />
        )}
        {screen === 'app' && <MainTabs />}
      </NavigationContainer>
      {showPaywall ? (
        <PaywallScreen
          packages={offering?.availablePackages || []}
          loading={purchaseLoading}
          error={purchaseError}
          onPurchase={handlePurchase}
          onRestore={handleRestore}
          onClose={() => setShowPaywall(false)}
        />
      ) : null}
    </AuthContext.Provider>
  );
}
