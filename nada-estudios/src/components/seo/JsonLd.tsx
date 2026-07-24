import { site } from "@/config/site";

/**
 * JSON-LD injector. Renders a <script type="application/ld+json"> with the
 * given structured-data object, safely serialized (escapes `</script>` to
 * prevent premature tag closing / injection).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** Site-wide Organization schema. Mount once via <JsonLd data={orgJsonLd()}/> in the (site) layout. */
export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    email: site.email,
    sameAs: [site.instagram],
    areaServed: ["Costa Rica", "México", "Estados Unidos"],
    address: [
      {
        "@type": "PostalAddress",
        addressLocality: "San José",
        addressCountry: "CR",
      },
      {
        "@type": "PostalAddress",
        addressLocality: "Ciudad de México",
        addressCountry: "MX",
      },
      {
        "@type": "PostalAddress",
        addressLocality: "Nueva York",
        addressRegion: "NY",
        addressCountry: "US",
      },
    ],
  };
}

export function serviceJsonLd({
  name,
  description,
  url,
  offers,
}: {
  name: string;
  description: string;
  url: string;
  offers: { name: string; price: number; priceCurrency?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: name,
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    areaServed: ["Costa Rica", "México", "Estados Unidos"],
    offers: offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      price: o.price,
      priceCurrency: o.priceCurrency ?? "USD",
      url,
    })),
  };
}

export function faqJsonLd(pairs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((p) => ({
      "@type": "Question",
      name: p.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: p.answer,
      },
    })),
  };
}

export function videoJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
}: {
  name: string;
  description: string;
  thumbnailUrl: string[];
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
    ...(contentUrl ? { contentUrl } : {}),
    ...(embedUrl ? { embedUrl } : {}),
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}
