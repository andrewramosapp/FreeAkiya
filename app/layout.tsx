import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CheapAkiya — Buy a House in Japan for Under $10,000",
    template: "%s | CheapAkiya",
  },
  description:
    "Japan has 9 million vacant homes called akiya. Many sell for under $10,000. CheapAkiya finds and translates the best Japanese vacant home listings — with station distances, disaster risk scores, government subsidies, and fiber internet data — delivered in English.",
  keywords: [
    "akiya", "akiya for sale", "buy house japan", "cheap house japan",
    "vacant homes japan", "japan real estate", "akiya bank", "japanese property",
    "move to japan", "rural japan", "japan migration subsidy", "akiya under 10000",
  ],
  authors: [{ name: "CheapAkiya" }],
  creator: "CheapAkiya",
  metadataBase: new URL("https://cheapakiya.com"),
  alternates: { canonical: "https://cheapakiya.com" },
  openGraph: {
    title: "CheapAkiya — Buy a House in Japan for Under $10,000",
    description: "Japan's 9 million vacant homes, curated in English. Prices from $7. Station distances, disaster risk, government subsidies — all on one platform.",
    url: "https://cheapakiya.com",
    siteName: "CheapAkiya",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://cheapakiya.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CheapAkiya — Buy a House in Japan for Under $10,000",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CheapAkiya — Buy a House in Japan for Under $10,000",
    description: "Japan's 9M vacant homes, curated in English. Prices from $7.",
    site: "@cheapakiya",
    images: ["https://cheapakiya.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "add-your-google-search-console-token-here",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* X (Twitter) Conversion Tracking */}
        <Script id="twitter-pixel" strategy="afterInteractive">{`
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config','rbrvm');
        `}</Script>
      </body>
    </html>
  );
}
