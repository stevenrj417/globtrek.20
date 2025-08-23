"use client";

import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, MapPin } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HotelSearch() {
  const today = new Date();
  const inDefault = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const outDefault = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [cityCode, setCityCode] = React.useState("PDX");
  const [checkIn, setCheckIn] = React.useState(inDefault);
  const [checkOut, setCheckOut] = React.useState(outDefault);
  const [adults, setAdults] = React.useState(2);

  const query = `/api/hotels?cityCode=${cityCode}&checkInDate=${checkIn}&checkOutDate=${checkOut}&adults=${adults}`;

  const { data, isLoading } = useSWR<{ items: any[] }>(query, fetcher, { refreshInterval: 180000 });

  return (
    <section>
      <h2 className="text-2xl font-semibold">Live Hotel Prices</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-4">
        <div><Label>City</Label><Input value={cityCode} onChange={(e) => setCityCode(e.target.value)} /></div>
        <div><Label>Adults</Label><Input type="number" value={adults} onChange={(e) => setAdults(Number(e.target.value))} /></div>
        <div><Label>Check In</Label><Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></div>
        <div><Label>Check Out</Label><Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items.map((h) => (
            <Card key={h.id}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={h.img} alt={h.title} className="h-full w-full object-cover" />
                {h.badge && <Badge className="absolute left-3 top-3">{h.badge}</Badge>}
              </div>
              <CardContent className="p-4">
                <h3 className="text-base font-medium">{h.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.address}</p>
                <div className="text-xl font-bold mt-2">{new Intl.NumberFormat("en-US", { style: "currency", currency: h.currency }).format(h.price)}</div>
                <Button asChild className="mt-3"><a href={h.url} target="_blank">View Deal <ArrowUpRight className="ml-1 h-4 w-4" /></a></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
