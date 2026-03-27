export const API_BASE = 'https://cheapakiya.com';

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

export type MemberStatus = {
  premium: boolean;
  email: string | null;
};

export type VerifyMemberResult = {
  success: boolean;
  tier?: 'free' | 'premium';
  error?: string;
};

async function getJson(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `API ${res.status}: ${path}`);
  return data;
}

export async function getListingsPage(page = 0, sort: 'price_asc' | 'price_desc' | 'newest' = 'price_asc') {
  return getJson(`/api/listings-page?page=${page}&sort=${sort}`);
}

export async function getMemberStatus(): Promise<MemberStatus> {
  try {
    return await getJson('/api/member-status');
  } catch {
    return { premium: false, email: null };
  }
}

export async function verifyMember(email: string): Promise<VerifyMemberResult> {
  return getJson('/api/verify-member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function getSavedListings() {
  try {
    return await getJson('/api/saved-listings');
  } catch {
    return { listings: [] };
  }
}

export async function getSavedListingIds(): Promise<string[]> {
  try {
    const data = await getJson('/api/save-listing');
    return data?.saved || [];
  } catch {
    return [];
  }
}

export async function setSavedListing(listingId: string, shouldSave: boolean) {
  return getJson('/api/save-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listing_id: listingId,
      action: shouldSave ? 'save' : 'unsave',
    }),
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
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Inquiry failed');
  return data;
}
