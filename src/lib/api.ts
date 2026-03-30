export const API_BASE = 'https://cheapakiya.com';

/** Minimal pin type returned by /api/map-pins */
export type MapPin = {
  id: string;
  slug: string;
  name: string;
  price: string;
  priceNum: number;
  lat: number;
  lng: number;
  images: string[];
  isPremium: boolean;
  city: string;
  prefecture: string;
  condition: string | null;
  subsidyAvailable: boolean;
};

/** Fetch all map pins in one shot from the optimised endpoint */
export async function getMapPins(): Promise<MapPin[]> {
  const res = await fetch(`${API_BASE}/api/map-pins`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`map-pins ${res.status}`);
  return res.json();
}

export type Listing = {
  id: string;
  slug: string;
  name: string;
  price: string;
  priceNum: number;
  priceJPY?: string;
  city: string;
  prefecture: string;
  region: string;
  beds: number;
  size: string;
  built: string;
  parking?: string;
  notes: string;
  isPremium: boolean;
  contact: string;
  contactPhone?: string | null;
  tags: string[];
  images: string[];
  hasRealImages: boolean;
  isFeatured?: boolean;
  condition?: string | null;
  conditionScore?: number | null;
  stationName?: string | null;
  stationWalkMin?: number | null;
  subsidyAvailable?: boolean;
  subsidyAmountJPY?: number | null;
  subsidyNotes?: string | null;
  subsidyUrl?: string | null;
  floodRisk?: string | null;
  earthquakeRisk?: string | null;
  disasterScore?: number | null;
  internetType?: string | null;
  internetSpeedMbps?: number | null;
  convenienceStoreKm?: number | null;
  hospitalKm?: number | null;
  lat?: number | null;
  lng?: number | null;
  scrapedAt?: string | null;
};

// Minimal listing type for map view — only fields the map needs
export type MapListing = Pick<
  Listing,
  'id' | 'slug' | 'name' | 'price' | 'priceNum' | 'prefecture' | 'city' |
  'lat' | 'lng' | 'images' | 'isPremium'
>;

export type MemberStatus = {
  premium: boolean;
  email: string | null;
};

export type VerifyMemberResult = {
  success: boolean;
  tier?: 'free' | 'premium';
  email?: string;
  error?: string;
};

async function parseJsonSafely(res: Response) {
  return res.json().catch(() => null);
}

async function getJson(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = await parseJsonSafely(res);
  if (!res.ok) throw new Error(data?.error || `API ${res.status}: ${path}`);
  return data;
}

export async function getListingsPage(page = 0, sort: 'price_asc' | 'price_desc' | 'newest' = 'price_asc') {
  return getJson(`/api/listings-page?page=${page}&sort=${sort}`);
}

export async function getAllListings(sort: 'price_asc' | 'price_desc' | 'newest' = 'price_asc', maxPages = 8): Promise<Listing[]> {
  const seen = new Map<string, Listing>();

  for (let page = 0; page < maxPages; page += 1) {
    const data = await getListingsPage(page, sort);
    const pageListings = (data?.listings || []) as Listing[];

    for (const item of pageListings) {
      seen.set(item.id, item);
    }

    if (!data?.hasMore || pageListings.length === 0) break;
  }

  return Array.from(seen.values());
}

/**
 * Lightweight map-specific fetch: only keeps fields the map needs,
 * and caps at maxPages (default 4) to reduce memory/network usage.
 */
export async function getMapListings(maxPages = 4): Promise<Listing[]> {
  const MAP_FIELDS: (keyof Listing)[] = [
    'id', 'slug', 'name', 'price', 'priceNum',
    'prefecture', 'city', 'lat', 'lng', 'images', 'isPremium',
  ];

  const seen = new Map<string, Listing>();

  for (let page = 0; page < maxPages; page += 1) {
    const data = await getListingsPage(page, 'price_asc');
    const pageListings = (data?.listings || []) as Listing[];

    for (const item of pageListings) {
      if (typeof item.lat !== 'number' || typeof item.lng !== 'number') continue;
      // Only keep map-relevant fields to save memory
      const slim = MAP_FIELDS.reduce((acc, key) => {
        (acc as any)[key] = (item as any)[key];
        return acc;
      }, {} as Listing);
      seen.set(item.id, slim);
    }

    if (!data?.hasMore || pageListings.length === 0) break;
  }

  return Array.from(seen.values());
}

export async function getMemberStatus(): Promise<MemberStatus> {
  try {
    return await getJson('/api/member-status');
  } catch {
    return { premium: false, email: null };
  }
}

export async function subscribeEmail(email: string) {
  return getJson('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function verifyMember(
  email: string,
  source?: 'app_google' | 'app_apple' | 'web'
): Promise<VerifyMemberResult> {
  return getJson('/api/mobile/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: source || 'app_google' }),
  });
}

export async function updateNewsletterConsent(email: string, consent: boolean): Promise<{ success: boolean }> {
  return getJson('/api/mobile/newsletter-consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, consent }),
  });
}

export async function getSavedListings(email?: string) {
  try {
    const path = email ? `/api/saved-listings?email=${encodeURIComponent(email)}` : '/api/saved-listings';
    return await getJson(path);
  } catch {
    return { listings: [] };
  }
}

export async function getSavedListingIds(email?: string): Promise<string[]> {
  try {
    const path = email ? `/api/save-listing?email=${encodeURIComponent(email)}` : '/api/save-listing';
    const data = await getJson(path);
    return data?.saved || [];
  } catch {
    return [];
  }
}

export async function setSavedListing(listingId: string, shouldSave: boolean, email?: string) {
  return getJson('/api/save-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listing_id: listingId,
      action: shouldSave ? 'save' : 'unsave',
      email: email || undefined,
    }),
  });
}

export async function logoutMemberSession() {
  const res = await fetch(`${API_BASE}/api/logout`, {
    method: 'GET',
    credentials: 'include',
    redirect: 'manual',
    headers: { Accept: 'application/json,text/html' },
  });
  return res;
}

export async function createPremiumCheckout(email?: string) {
  return getJson('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function submitInquiry(input: {
  name: string;
  email: string;
  message: string;
  listing_slug: string;
  listing_name: string;
  listing_price: string;
  listing_url: string;
  member_tier?: 'free' | 'premium';
}) {
  const res = await fetch(`${API_BASE}/api/inquiries/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafely(res);
  if (!res.ok) throw new Error(data?.error || 'Inquiry failed');
  return data;
}

export async function registerPushToken(email: string, token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    });
  } catch {
    // Non-critical — don't throw
  }
}
