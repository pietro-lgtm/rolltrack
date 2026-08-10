import type { Metadata } from "next";
import { JsonLd, serviceJsonLd } from "@/components/seo/JsonLd";
import { VerticalPage } from "@/components/verticals/VerticalPage";
import { site } from "@/config/site";
import { verticals } from "@/data/verticals";

const vertical = verticals.restaurantes;
const url = `${site.url}/${vertical.slug}`;

export const metadata: Metadata = {
  title: vertical.metaTitle,
  description: vertical.metaDescription,
  alternates: { canonical: url },
};

export default function RestaurantesPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: vertical.metaTitle,
          description: vertical.metaDescription,
          url,
        })}
      />
      <VerticalPage vertical={vertical} />
    </>
  );
}
