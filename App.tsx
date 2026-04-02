import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

WebBrowser.maybeCompleteAuthSession();
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScrollTestScreen from './src/screens/ScrollTestScreen';
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import ListingsScreen from './src/screens/ListingsScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import MapScreen from './src/screens/MapScreen';
import SavedScreen from './src/screens/SavedScreen';
import AccountScreen from './src/screens/AccountScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthEmailScreen from './src/screens/AuthEmailScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import SubsidyScreen from './src/screens/SubsidyScreen';
import { configurePurchases, getCurrentOffering, getCustomerInfo, hasProEntitlement, purchasePackage, restorePurchases } from './src/lib/purchases';
import { registerForPushNotifications } from './src/lib/notifications';

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
  setShowScrollTest: (show: boolean) => void;
};

const AuthContext = createContext<AuthContextValue>({ member: null, setMember: () => {}, authReady: false, customerInfo: null, offering: null, refreshPurchases: async () => {}, showPaywall: false, setShowPaywall: () => {}, setShowScrollTest: () => {} });
export const useAuth = () => useContext(AuthContext);
const MEMBER_STORAGE_KEY = 'cheapakiya.member';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ListingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="ListingsList" component={ListingsScreen} />
      <Stack.Screen name="Listing" component={ListingDetailScreen} />
      <Stack.Screen name="Subsidy" component={SubsidyScreen} />
    </Stack.Navigator>
  );
}

function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="Listing" component={ListingDetailScreen} />
      <Stack.Screen name="Subsidy" component={SubsidyScreen} />
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
            Listings: 'list-outline',        // changed from home-outline
            Map: 'map-outline',
            Saved: 'heart-outline',
            Account: 'person-circle-outline', // changed from person-outline
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Listings" component={ListingsStack} />
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  // Google OAuth via expo-auth-session.
  // expoClientId is used in Expo Go / development builds.
  // Google OAuth — uses expo-auth-session.
  // The redirectUri is set to the app's custom scheme so it works in both
  // Expo Go (development) and standalone production builds.
  const IOS_CLIENT_ID = '36597882593-lftu2d642n0m0qdargu71fjr2i613emr.apps.googleusercontent.com';

  const [_googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  const [screen, setScreen] = useState<'onboarding' | 'welcome' | 'signup' | 'signin' | 'app'>('onboarding');
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [member, setMemberState] = useState<Member>(null);
  const [authReady, setAuthReady] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showScrollTest, setShowScrollTest] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const ONBOARDING_KEY = 'cheapakiya.onboarding_done';

  useEffect(() => {
    (async () => {
      try {
        // Check if user has seen onboarding before
        const sawOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (sawOnboarding) setOnboardingDone(true);

        const raw = await AsyncStorage.getItem(MEMBER_STORAGE_KEY);
        let parsed: Member = null;
        if (raw) {
          parsed = JSON.parse(raw);
          if (parsed?.email && parsed?.tier) {
            setMemberState(parsed);
            memberRef.current = parsed;
            setScreen('app');
          }
        }
        await configurePurchases(parsed?.email || null);
        const [info, currentOffering] = await Promise.all([getCustomerInfo(), getCurrentOffering()]);
        setCustomerInfo(info);
        setOffering(currentOffering);
        if (parsed?.email && hasProEntitlement(info)) {
          const upgraded: Member = { email: parsed.email, tier: 'premium' };
          setMemberState(upgraded);
          memberRef.current = upgraded;
        }
      } catch {}
      setAuthReady(true);
    })();
  }, []);

  // Use a ref so setMember and refreshPurchases can call each other without stale closures
  const memberRef = useRef<Member>(null);

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const token = (googleResponse as any).authentication?.accessToken;
      if (!token) return;
      fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(async (profile) => {
          const email = profile?.email;
          if (!email) return;
          const { verifyMember } = await import('./src/lib/api');
          let tier: 'free' | 'premium' = 'free';
          try {
            const r = await verifyMember(email, 'app_google');
            tier = r?.tier || 'free';
          } catch {
            try {
              const { subscribeEmail } = await import('./src/lib/api');
              await subscribeEmail(email);
            } catch {}
          }
          await setMember({ email, tier });
          setScreen('app');
        })
        .catch(() => setScreen('signin'));
    } else if (googleResponse?.type === 'error') {
      setScreen('signin');
    }
  }, [googleResponse]);



  const refreshPurchases = useCallback(async () => {
    try {
      const [info, currentOffering] = await Promise.all([getCustomerInfo(), getCurrentOffering()]);
      setCustomerInfo(info);
      setOffering(currentOffering);
      const current = memberRef.current;
      if (current?.email && hasProEntitlement(info) && current.tier !== 'premium') {
        // Update tier to premium without re-triggering full setMember flow
        const upgraded: Member = { email: current.email, tier: 'premium' };
        setMemberState(upgraded);
        memberRef.current = upgraded;
        try { await AsyncStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(upgraded)); } catch {}
      }
    } catch {}
  }, []);

  const setMember = useCallback(async (next: Member) => {
    setMemberState(next);
    memberRef.current = next;
    try {
      if (next) await AsyncStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(next));
      else await AsyncStorage.removeItem(MEMBER_STORAGE_KEY);
    } catch {}
    await configurePurchases(next?.email || null);
    await refreshPurchases();
    // Register for push notifications whenever a member signs in
    if (next?.email) {
      registerForPushNotifications(next.email).catch(() => {});
    }
  }, [refreshPurchases]);

  async function handleAppleSignIn(credential: any) {
    try {
      // Apple gives email only on first sign-in — must store it
      const email = credential.email || `apple_${credential.user}@privaterelay.appleid.com`;
      const cleanEmail = email.toLowerCase().trim();
      // Verify against CheapAkiya backend
      const { verifyMember } = await import('./src/lib/api');
      let tier: 'free' | 'premium' = 'free';
      try {
        const result = await verifyMember(cleanEmail, 'app_apple');
        if (result?.tier) tier = result.tier;
      } catch {
        // New user — default to free
      }
      await setMember({ email: cleanEmail, tier });
      setScreen('app');
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        // ERR_REQUEST_CANCELED = user dismissed the sheet — not an error
        const { Alert } = await import('react-native');
        Alert.alert('Sign in failed', e?.message || 'Apple sign-in unavailable. Try email instead.');
      }
      setScreen('signin');
    }
  }

  async function handleGoogleSignIn() {
    if (!IOS_CLIENT_ID || (IOS_CLIENT_ID as string) === 'PASTE_IOS_CLIENT_ID_HERE') {
      // No iOS client ID yet — fall back to email sign-in
      setScreen('signin');
      return;
    }
    await googlePromptAsync();
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
      Alert.alert('Premium unlocked', 'Cheap Akiya Pro is now active on this device.');
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
      Alert.alert('Restored', 'Purchases restored successfully.');
    } catch (e: any) {
      setPurchaseError(e?.message || 'Restore failed');
    } finally {
      setPurchaseLoading(false);
    }
  }

  const authValue = useMemo(
    () => ({ member, setMember, authReady, customerInfo, offering, refreshPurchases, showPaywall, setShowPaywall, setShowScrollTest }),
    [member, setMember, authReady, customerInfo, offering, refreshPurchases, showPaywall, setShowScrollTest],
  );

  if (!authReady) return null;

  return (
    <SafeAreaProvider>
    <AuthContext.Provider value={authValue}>
      <NavigationContainer>
        {screen === 'onboarding' && !onboardingDone && (
          <OnboardingScreen
            onDone={async () => {
              await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
              setOnboardingDone(true);
              setScreen('welcome');
            }}
          />
        )}
        {(screen === 'welcome' || (screen === 'onboarding' && onboardingDone)) && (
          <WelcomeScreen
            onSignUp={() => setScreen('signup')}
            onSignIn={() => setScreen('signin')}
            onPremium={() => setShowPaywall(true)}
            onGoogle={handleGoogleSignIn}
            onApple={handleAppleSignIn}
          />
        )}
        {(screen === 'signup' || screen === 'signin') && (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <AuthEmailScreen
              mode={screen === 'signup' ? 'signup' : 'signin'}
              onBack={() => setScreen('welcome')}
              onAuthed={async (nextMember) => {
                await setMember(nextMember);
                setScreen('app');
              }}
            />
          </KeyboardAvoidingView>
        )}
        {screen === 'app' && <MainTabs />}
      </NavigationContainer>
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowPaywall(false)}
      >
        <PaywallScreen
          packages={offering?.availablePackages || []}
          loading={purchaseLoading}
          error={purchaseError}
          onPurchase={handlePurchase}
          onRestore={handleRestore}
          onClose={() => setShowPaywall(false)}
        />
      </Modal>
      <Modal
        visible={showScrollTest}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowScrollTest(false)}
      >
        <ScrollTestScreen onClose={() => setShowScrollTest(false)} />
      </Modal>
    </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
