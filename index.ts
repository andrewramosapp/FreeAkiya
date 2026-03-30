// WeakRef polyfill — react-navigation v7 uses WeakRef which Hermes may not expose
if (typeof (global as any).WeakRef === 'undefined') {
  (global as any).WeakRef = class WeakRef<T extends object> {
    private _target: T;
    constructor(target: T) { this._target = target; }
    deref(): T { return this._target; }
  };
}

// WebCrypto polyfill — Supabase PKCE needs crypto.subtle.digest (SHA256).
// Without this it falls back to "plain" which Google OAuth rejects.
import * as ExpoCrypto from 'expo-crypto';

if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = {};
}
if (typeof (global as any).crypto.getRandomValues === 'undefined') {
  (global as any).crypto.getRandomValues = (arr: Uint8Array) => {
    return ExpoCrypto.getRandomValues(arr);
  };
}
if (typeof (global as any).crypto.subtle === 'undefined') {
  (global as any).crypto.subtle = {
    digest: async (_algorithm: string, data: ArrayBuffer) => {
      // Supabase only calls digest for SHA-256 PKCE challenge
      const bytes = new Uint8Array(data);
      const hex = await ExpoCrypto.digestStringAsync(
        ExpoCrypto.CryptoDigestAlgorithm.SHA256,
        String.fromCharCode(...bytes),
        { encoding: ExpoCrypto.CryptoEncoding.BASE64 }
      );
      // Return as ArrayBuffer (Supabase converts to base64url itself)
      const binary = atob(hex);
      const buf = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
      return buf.buffer;
    },
  };
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
