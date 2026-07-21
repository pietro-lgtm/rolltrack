import { site } from "@/config/site";
import { faqs } from "@/data/faq";
import type { ClubEvent } from "@/data/events";

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** SportsClub + Organization graph. Rendered once, in the root layout. */
export function OrgJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["SportsClub", "Organization"],
        name: site.name,
        alternateName: ["No Corro Nada", "NCN", "No Corro Nada Run Club"],
        url: site.url,
        description: site.description,
        slogan: site.tagline,
        foundingDate: String(site.foundedYear),
        sport: "Running",
        isAccessibleForFree: true,
        address: {
          "@type": "PostalAddress",
          addressLocality: "San José",
          addressCountry: "CR",
        },
        areaServed: "Costa Rica",
        email: site.contact.email,
        sameAs: [
          site.social.instagram,
          site.social.tiktok,
          site.social.strava,
          site.social.substack,
        ],
        parentOrganization: {
          "@type": "Organization",
          name: "No Pasa Nada",
          url: site.social.parentBrand,
        },
      }}
    />
  );
}

/**
 * SportsEvent markup. Returns null when the event has no confirmed date —
 * Google requires startDate for Event validity.
 */
export function EventJsonLd({ event }: { event: ClubEvent }) {
  if (!event.dateISO) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: `${event.title} — ${site.name}`,
        startDate: event.dateISO,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        description: event.description,
        location: {
          "@type": "Place",
          name: event.location.name,
          address: { "@type": "PostalAddress", addressLocality: "San José", addressCountry: "CR" },
        },
        organizer: { "@type": "Organization", name: site.name, url: site.url },
        ...(event.priceCRC
          ? {
              offers: {
                "@type": "Offer",
                price: event.priceCRC.toFixed(2),
                priceCurrency: "CRC",
                availability: "https://schema.org/InStock",
                url: `${site.url}/bunker-gp`,
              },
            }
          : { isAccessibleForFree: true }),
      }}
    />
  );
}

/** FAQPage markup from the shared FAQ data. Rendered on /faq. */
export function FaqJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }}
    />
  );
}
