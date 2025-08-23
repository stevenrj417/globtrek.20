// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // optional, create the file if you want global styles

export const metadata: Metadata = {
  title: "Globtrek — AI Trip Planner",
  description: "Plan trips with AI itineraries and rough costs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
