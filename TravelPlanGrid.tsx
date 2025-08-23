"use client";

import * as React from "react";

export type PlanStop = {
  id: string;
  day?: number;
  title: string;
  summary?: string;
  city?: string;
  cityCode?: string;          // e.g. MEX, PVR
  tags?: string[];            // ["food","art"]
  img?: string;               // optional; auto-fallback if missing
  link?: string;              // external spot link (maps/site)
  checkInDate?: string;       // YYYY-MM-DD
  checkOutDate?: string;      // YYYY-MM-DD
  adults?: number;
  currency?: string;          // e.g. USD
};

export default function TravelPlanGrid({
  title = "YOUR TRIP PLAN",
  subtitle = "PHOTOS • LINKS • LIVE HOTEL BUTTONS",
  items,
}: {
  title?: string;
  subtitle?: string;
  items: PlanStop[];
}) {
  return (
    <section className="w-full">
      <header className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </header>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((stop) => {
          const photo =
            stop.img ||
            `https://source.unsplash.com/1200x900/?${encodeURIComponent(
              `${stop.city || ""} ${stop.title} travel city architecture food museum beach`
            )}`;

          const hotelUrl =
            stop.cityCode && stop.checkInDate && stop.checkOutDate
              ? `/api/hotels?cityCode=${encodeURIComponent(
                  stop.cityCode
                )}&checkInDate=${stop.checkInDate}&checkOutDate=${
                  stop.checkOutDate
                }&adults=${stop.adults ?? 2}&currency=${stop.currency ?? "USD"}`
              : null;

          return (
            <div
              key={stop.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={photo}
                  alt={stop.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {typeof stop.day === "number" && (
                  <div className="absolute left-3 top-3 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    DAY {stop.day}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-semibold leading-snug line-clamp-2">
                      {stop.title}
                    </h3>
                    <div className="mt-1 text-xs text-neutral-500">
                      {stop.city}
                    </div>
                  </div>
                </div>

                {stop.summary && (
                  <p className="mt-2 text-sm text-neutral-600 line-clamp-4">{stop.summary}</p>
                )}

                {stop.tags && stop.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stop.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {stop.link && (
                    <a
                      href={stop.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700"
                    >
                      VIEW SPOT
                    </a>
                  )}
                  {hotelUrl && (
                    <a
                      href={hotelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 text-sm px-3 py-2 hover:bg-neutral-200"
                    >
                      LIVE HOTELS
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
