import TravelPlanGrid, { PlanStop } from "@/components/TravelPlanGrid";

// EXAMPLE: transform your AI text into structured items.
// Ideally your plan API should already return JSON like this.
const plan: PlanStop[] = [
  {
    id: "d1",
    day: 1,
    title: "Arrival + Polanco Galleries & Fine Dining",
    city: "Mexico City",
    cityCode: "MEX",
    summary: "Museo Jumex, Soumaya, Masaryk stroll, rooftop cocktail.",
    tags: ["art", "luxury", "food"],
    // leave img blank to auto-generate a relevant Unsplash photo,
    // or set a custom image:
    // img: "https://images.unsplash.com/photo-..."
    link: "https://maps.google.com/?q=Polanco%20Mexico%20City",
    checkInDate: "2025-11-06",
    checkOutDate: "2025-11-07",
    adults: 2,
    currency: "USD",
  },
  {
    id: "d2",
    day: 2,
    title: "Centro Histórico + Anthropology Museum",
    city: "Mexico City",
    cityCode: "MEX",
    summary: "Zócalo, Cathedral, Palacio Nacional murals, Anthropology Museum.",
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
    title: "Roma/Condesa Galleries + Mercado Roma",
    city: "Mexico City",
    cityCode: "MEX",
    summary: "Gallery crawl, parks, Casa Lamm, street food, mezcal.",
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
    title: "Teotihuacan + Coyoacán (Frida Kahlo)",
    city: "Mexico City",
    cityCode: "MEX",
    summary: "Pyramids at sunrise, Casa Azul, Coyoacán market snacks.",
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
    title: "Puerto Vallarta Beach Day + Malecón",
    city: "Puerto Vallarta",
    cityCode: "PVR",
    summary: "Short hop to PV, Playa Los Muertos, sunset dinner on the Malecón.",
    tags: ["beach", "relax", "shopping"],
    link: "https://maps.google.com/?q=Zona%20Rom%C3%A1ntica%20Puerto%20Vallarta",
    checkInDate: "2025-11-10",
    checkOutDate: "2025-11-11",
    adults: 2,
    currency: "USD",
  },
];

export default function PlannerResultSection() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <TravelPlanGrid
        title="GlobTrek — Mexico • 5 Days"
        subtitle="Curated days with photos, quick links, and live hotel options."
        items={plan}
        dense={false}           // set true if you want smaller cards
        showHotelButton={true}  // shows “Live Hotels” (links to your /api/hotels)
      />
    </div>
  );
}
