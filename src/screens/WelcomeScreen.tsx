import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

// Simple Google "G" icon rendered as styled text
function GoogleG() {
  return (
    <View style={g.iconWrap}>
      <Text style={g.iconText}>G</Text>
    </View>
  );
}

export default function WelcomeScreen({
  onSignUp,
  onSignIn,
  onPremium,
  onGoogle,
  onApple,
}: {
  onSignUp: () => void;
  onSignIn: () => void;
  onPremium: () => void;
  onGoogle: () => void;
  onApple: (credential: AppleAuthentication.AppleAuthenticationCredential) => void;
}) {
  const [appleAvailable, setAppleAvailable] = useState(false);
  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => setAppleAvailable(false));
  }, []);

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.inner}>
        <Image source={require('../../assets/icon.png')} style={s.logoIcon} />
        <Text style={s.logo}>CheapAkiya</Text>
        <Text style={s.title}>Japanese homes,{'\n'}for a steal.</Text>
        <Text style={s.subtitle}>
          Browse real akiya listings, save your favourites, and connect directly — all in English.
        </Text>

        {/* Apple Sign-In — only shown when capability is available */}
        {appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={14}
            style={s.appleBtn}
            onPress={async () => {
              try {
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });
                onApple(credential);
              } catch (e: any) {
                if (e.code !== 'ERR_REQUEST_CANCELED') {
                  console.warn('Apple sign-in error:', e);
                }
              }
            }}
          />
        )}

        {/* Google button */}
        <TouchableOpacity style={s.googleBtn} onPress={onGoogle} activeOpacity={0.85}>
          <GoogleG />
          <Text style={s.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.primaryBtn} onPress={onSignUp} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>Join free with email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.secondaryBtn} onPress={onSignIn} activeOpacity={0.85}>
          <Text style={s.secondaryBtnText}>Sign in with email</Text>
        </TouchableOpacity>

        <View style={s.divider} />

        <TouchableOpacity style={s.premiumBtn} onPress={onPremium} activeOpacity={0.85}>
          <Text style={s.premiumBtnText}>⭐ Go Premium — $12/mo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const g = StyleSheet.create({
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
  },
});

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  logoIcon: { width: 72, height: 72, borderRadius: 16, marginBottom: 12 },
  appleBtn: { width: '100%', height: 52, borderRadius: 14, marginBottom: 12 },
  logo: { color: '#e85d2f', fontSize: 28, fontWeight: '900', marginBottom: 14 },
  title: { color: '#fff', fontSize: 36, fontWeight: '900', lineHeight: 42, marginBottom: 12 },
  subtitle: { color: '#9ca3af', fontSize: 15, lineHeight: 23, marginBottom: 32 },

  // Google — most visual weight: white bg + border + icon
  googleBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  googleBtnText: { color: '#111827', fontWeight: '800', fontSize: 16 },

  // Email CTA — orange brand colour
  primaryBtn: {
    backgroundColor: '#e85d2f',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Sign in — ghost / secondary
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 12,
  },
  secondaryBtnText: { color: '#e5e7eb', fontWeight: '700', fontSize: 15 },

  // Visual separator before premium
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 16,
  },

  // Premium — outlined with brand accent
  premiumBtn: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e85d2f',
  },
  premiumBtnText: { color: '#e85d2f', fontWeight: '800', fontSize: 15 },
});
