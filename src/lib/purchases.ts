import Purchases, { LOG_LEVEL, CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

export const REVENUECAT_API_KEY = 'test_juUSmfQDXDHNARmeRsgqbKlCLpJ';
export const PRO_ENTITLEMENT = 'Cheap Akiya Pro';

export async function configurePurchases(appUserID?: string | null) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
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
