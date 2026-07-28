import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { JsonLd, orgJsonLd } from "@/components/seo/JsonLd";

/** Public site chrome. Admin, ad landings (/l) and onboarding stay bare. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd data={orgJsonLd()} />
      <Nav />
      <main className="min-h-screen pt-14">{children}</main>
      <Footer />
    </>
  );
}
