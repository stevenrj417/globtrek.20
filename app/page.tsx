"use client";

import * as React from "react";
import TravelPlanGrid, { PlanStop } from "@/components/TravelPlanGrid";

// DEMO DATA SO YOU SEE BIG PHOTO CARDS INSTANTLY.
// You can replace this later with your real AI response.
const demoPlan: PlanStop[] = [
  {
    id: "d1",
    day: 1,
    title: "Arrival • Polanco Galleries & Fine Dining",
    city: "Mexico City",
    cityCode: "MEX",
    summary: "Museo Jumex, Soumaya, Masaryk stroll, rooftop cocktail.",
    tags: ["art", "luxury", "food"],
    link: "https://maps.google.com/?q=Polanco%20Mexico%20City",
    checkInDate: "2025-11-06",
    checkOutDate: "2025-11-07",
    adults: 2,
    currency: "USD",
  },
  {
    id: "d2",
    day: 2,
    title: "Centro Histórico • Anthropology Museum",
    city: "Mexico City",
    cityCode: "MEX",
    summary: "Zócalo, Cathedral, Palacio murals, Anthropology Museum.",
    tags: ["history", "culture", "walking"],
    link: "https://www.mna.inah.gob.mx/",
    checkInDate: "2025-11-07",
    checkOutDate: "2025-11-08",
    adults: 2,
    currency: "USD",
  },
  {
    id: "d3",
    day: 3,
    title: "Roma/Condesa • Mercado Roma",
    city: "Mexico City",
    cityCode: "MEX",
    summary: "Gallery crawl, parks, Casa Lamm, street food & mezcal.",
    tags: ["art", "food", "neighborhoods"],
    link: "https://maps.google.com/?q=Roma%20Norte%20CDMX",
    checkInDate: "2025-11-08",
    checkOutDate: "2025-11-09",
    adults: 2,
    currency: "USD",
  },
  {
    id: "d4",
    day: 4,
    title: "Teotihuacan • Coyoacán (Frida Kahlo)",
    city: "Mexico City",
    cityCode: "MEX",
    summary: "Sunrise pyramids, Casa Azul, Coyoacán market snacks.",
    tags: ["ancient", "museum", "markets"],
    link: "https://www.museofridakahlo.org.mx/",
    checkInDate: "2025-11-09",
    checkOutDate: "2025-11-10",
    adults: 2,
    currency: "USD",
  },
  {
    id: "d5",
    day: 5,
    title: "Puerto Vallarta • Beach + Malecón",
    city: "Puerto Vallarta",
    cityCode: "PVR",
    summary: "Playa Los Muertos, sunset dinner, galleries in Zona Romántica.",
    tags: ["beach", "relax", "shopping"],
    link: "https://maps.google.com/?q=Zona%20Romantica%20Puerto%20Vallarta",
    checkInDate: "2025-11-10",
    checkOutDate: "2025-11-11",
    adults: 2,
    currency: "USD",
  },
];

export default function Page() {
  const [items, setItems] = React.useState<PlanStop[]>([]);

  function handleGenerate() {
    // LATER: call your AI API, map result -> PlanStop[]
    // FOR NOW: show the demo so you can SEE the cards immediately.
    setItems(demoPlan);
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* SIMPLE HEADER */}
      <header className="w-full border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight">GLOBTREK</div>
          <nav className="text-sm text-neutral-600 flex gap-4">
            <a href="#">Discover</a>
            <a href="#">AI Planner</a>
            <a href="#">Suggestions</a>
            <a href="#">About</a>
          </nav>
        </div>
      </header>

      {/* PLANNER CARD */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">AI Trip Planner</h1>
        <p className="text-neutral-600 mt-1">
          Describe your dream trip and get a generated plan instantly.
        </p>

        <div className="mt-6 rounded-2xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-black/5">
          <textarea
            placeholder="Example: 5 days in Tokyo under $1500, food + culture, relaxed pace"
            className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select className="rounded-xl border border-neutral-200 p-2">
              <option>Budget: Mid</option>
              <option>Budget: Low</option>
              <option>Budget: High</option>
            </select>
            <select className="rounded-xl border border-neutral-200 p-2">
              <option>Pace: Balanced</option>
              <option>Pace: Relaxed</option>
              <option>Pace: Fast</option>
            </select>
            <input
              placeholder="Destination (e.g., Tokyo)"
              className="flex-1 min-w-[220px] rounded-xl border border-neutral-200 p-2"
            />
            <input placeholder="Days" className="w-24 rounded-xl border border-neutral-200 p-2" />
            <button
              onClick={handleGenerate}
              className="rounded-2xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            >
              Generate Plan
            </button>
          </div>

          <div className="mt-8">
            {items.length === 0 ? (
              <p className="text-sm text-neutral-500">Your plan will appear here…</p>
            ) : (
              <TravelPlanGrid
                title="GlobTrek — Mexico • 5 Days"
                subtitle="PHOTOS • LINKS • LIVE HOTEL BUTTONS"
                items={items}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
