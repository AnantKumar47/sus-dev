import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sustainability AI Platform | Map Analysis",
  description: "Analyze and optimize sustainability metrics for urban and rural areas",
  keywords: ["sustainability", "AI", "climate", "analytics", "urban planning", "renewable energy"],
  authors: [{ name: "Sustainability AI Platform Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}
