import Purchases, { LOG_LEVEL, CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

// NOTE: This is the RevenueCat PUBLIC API key (safe to ship in the binary).
// It is NOT a secret. Replace 'test_juUSmfQDXDHNARmeRsgqbKlCLpJ' with
// your production key before submitting to the App Store.
export const REVENUECAT_API_KEY = 'appl_PigLCYkHVkwwhpzLsfCVNrhWfEK';
export const PRO_ENTITLEMENT = 'Cheap Akiya Pro';

export async function configurePurchases(appUserID?: string | null) {
  // Only enable verbose logging in development builds
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: appUserID || undefined });
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(pkg: PurchasesPackage) {
  return Purchases.purchasePackage(pkg);
}

export async function restorePurchases() {
  return Purchases.restorePurchases();
}

export function hasProEntitlement(customerInfo: CustomerInfo | null | undefined) {
  return !!customerInfo?.entitlements?.active?.[PRO_ENTITLEMENT];
}

export function packageLabel(pkg: PurchasesPackage) {
  const id = pkg.product.identifier;
  if (id.includes('monthly') || id === 'monthly') return 'Monthly';
  if (id.includes('yearly') || id === 'yearly') return 'Yearly';
  if (id.includes('lifetime') || id === 'lifetime') return 'Lifetime';
  return pkg.product.title || id;
}
