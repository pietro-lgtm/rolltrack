import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { site } from "@/config/site";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { OrgJsonLd } from "@/lib/jsonld";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Run club de Costa Rica`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "run club costa rica",
    "club de running san josé",
    "no corro nada",
    "no pasa nada",
    "correr en costa rica",
    "bunker gp",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Run club de Costa Rica`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Run club de Costa Rica`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col bg-black text-ink">
        <OrgJsonLd />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
