import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CheapAkiya — Affordable Vacant Homes in Japan",
  description:
    "Japan has 9 million vacant homes called akiya. Many sell for under $10,000. We find the best ones and deliver them to your inbox in English.",
  openGraph: {
    title: "CheapAkiya — Affordable Vacant Homes in Japan",
    description: "Own a home in Japan for under $10,000. Weekly listings in English.",
    url: "https://cheapakiya.com",
    siteName: "CheapAkiya",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CheapAkiya — Affordable Vacant Homes in Japan",
    description: "Own a home in Japan for under $10,000. Weekly listings in English.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
