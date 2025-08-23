// app/api/hotels/route.ts
// SERVER ROUTE FOR LIVE HOTEL PRICING VIA AMADEUS

import { NextResponse } from "next/server";

let tokenCache: { token: string; expiresAt: number } | null = null;

function amadeusBase() {
  return process.env.AMADEUS_ENV === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";
}

async function getAmadeusToken() {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) return tokenCache.token;
  const res = await fetch(`${amadeusBase()}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
    cache: "no-store",
  });
  const json: any = await res.json();
  tokenCache = { token: json.access_token, expiresAt: Date.now() + (json.expires_in || 1800) * 1000 };
  return tokenCache.token;
}

function fallbackImageFor() {
  return "https://images.unsplash.com/photo-1559599101-59df613ebc84?q=80&w=1600&auto=format&fit=crop";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityCode = searchParams.get("cityCode") || "PDX";
  const checkInDate = searchParams.get("checkInDate") || "2025-09-01";
  const checkOutDate = searchParams.get("checkOutDate") || "2025-09-03";
  const adults = searchParams.get("adults") || "2";
  const currency = searchParams.get("currency") || "USD";

  const qs = new URLSearchParams({
    cityCode,
    adults,
    roomQuantity: "1",
    checkInDate,
    checkOutDate,
    currency,
    bestRateOnly: "true",
    sort: "PRICE",
  });

  const token = await getAmadeusToken();
  const res = await fetch(`${amadeusBase()}/v3/shopping/hotel-offers?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data: any = await res.json();
  const items = (data?.data || []).map((entry: any) => {
    const hotel = entry.hotel || {};
    const first = (entry.offers || [])[0] || {};
    return {
      id: entry.id,
      title: hotel.name,
      img: hotel.media?.[0]?.uri || fallbackImageFor(),
      price: Number(first?.price?.total || 0),
      currency: first?.price?.currency || currency,
      url: `https://www.booking.com/searchresults.html?aid=YOURAID&ss=${encodeURIComponent(hotel.name + " " + hotel.address?.cityName)}&checkin=${checkInDate}&checkout=${checkOutDate}&group_adults=${adults}`,
      badge: hotel.rating ? `${hotel.rating}★` : undefined,
      address: [hotel.address?.lines?.[0], hotel.address?.cityName].filter(Boolean).join(", "),
    };
  });

  return NextResponse.json({ items });
}
