"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MapPin, CalendarDays } from "lucide-react";

export type PlanStop = {
  id: string;
  title: string;
  summary?: string;
  city?: string;          // e.g., "Mexico City"
  day?: number;           // e.g., 1, 2, 3...
  tags?: string[];        // ["food","art","history"]
  img?: string;           // full URL; if missing we’ll generate one
  link?: string;          // external detail link (maps, museum site, etc.)
  checkInDate?: string;   // YYYY-MM-DD (optional for hotel button)
  checkOutDate?: string;  // YYYY-MM-DD
  adults?: number;        // for hotel search
  currency?: string;      // "USD" default
  cityCode?: string;      // IATA like "MEX" or "PVR" (for hotels)
};

export type TravelPlanGridProps = {
  title?: string;
  subtitle?: string;
  items: PlanStop[];
  dense?: boolean;       // set true for smaller cards
  showHotelButton?: boolean; // shows “Live Hotels” button per card if cityCode present
};

function imgFor(stop: PlanStop) {
  if (stop.img) return stop.img;
  // Use a tasteful keyword-based fallback (Unsplash)
  const q = encodeURIComponent(
    `${stop.city || ""} ${stop.title || ""} travel cityscape architecture food museum beach`
  );
  return `https://source.unsplash.com/1200x900/?${q}`;
}

function hotelUrl(stop: PlanStop) {
  if (!stop.cityCode) return null;
  const inDate = stop.checkInDate ?? "";
  const outDate = stop.checkOutDate ?? "";
  const adults = String(stop.adults ?? 2);
  const currency = stop.currency ?? "USD";
  return `/api/hotels?cityCode=${encodeURIComponent(
    stop.cityCode
  )}&checkInDate=${inDate}&checkOutDate=${outDate}&adults=${adults}&currency=${currency}`;
}

export default function TravelPlanGrid({
  title = "Your Trip Plan",
  subtitle = "Curated days with photos, links, and live options.",
  items,
  dense = false,
  showHotelButton = true,
}: TravelPlanGridProps) {
  return (
    <section className="w-full">
      <header className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </header>

      {/* Full-bleed responsive grid */}
      <div
        className={[
          "grid gap-4",
          dense ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        ].join(" ")}
      >
        {items.map((stop) => {
          const photo = imgFor(stop);
          const hUrl = hotelUrl(stop);

          return (
            <Card
              key={stop.id}
              className="group overflow-hidden hover:shadow-xl transition-shadow rounded-2xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={photo}
                  alt={stop.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Day badge */}
                {typeof stop.day === "number" && (
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-emerald-600/90 text-white flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      DAY {stop.day}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-semibold leading-snug line-clamp-2">
                      {stop.title}
                    </h3>
                    {(stop.city || stop.tags?.length) && (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {stop.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {stop.city}
                          </span>
                        )}
                        {stop.tags?.slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="rounded-full">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {stop.summary && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-4">
                    {stop.summary}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {stop.link && (
                    <Button asChild className="rounded-2xl">
                      <a href={stop.link} target="_blank" rel="noopener noreferrer">
                        View Spot <ArrowUpRight className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  {showHotelButton && hUrl && stop.checkInDate && stop.checkOutDate && (
                    <Button asChild variant="secondary" className="rounded-2xl">
                      <a href={hUrl} target="_blank" rel="noopener noreferrer">
                        Live Hotels
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
