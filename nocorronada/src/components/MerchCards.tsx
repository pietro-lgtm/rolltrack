/* eslint-disable @next/next/no-img-element */
import { site } from "@/config/site";
import { GhostLink } from "@/components/ui";

/** Minimal shape of a Shopify products.json entry — only what we render. */
type ShopifyProduct = {
  handle: string;
  title: string;
  images?: { src: string }[];
  variants?: { price: string; currency?: string }[];
};

function MerchFallback() {
  return (
    <GhostLink href={site.merchUrl} external>
      Merch · shop.nopasanada.com ↗
    </GhostLink>
  );
}

/**
 * Home merch strip. Pulls up to 4 products from the Shopify collection's
 * public products.json and renders them as cards. Any failure (network,
 * non-2xx, malformed, or empty) degrades to a single external link.
 */
export async function MerchCards() {
  let products: ShopifyProduct[] = [];

  try {
    const res = await fetch(`${site.merchCollection}/products.json?limit=4`, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NCNSite/1.0)" },
    });
    if (!res.ok) return <MerchFallback />;
    const data = (await res.json()) as { products?: ShopifyProduct[] };
    products = Array.isArray(data.products) ? data.products : [];
  } catch {
    return <MerchFallback />;
  }

  if (products.length === 0) return <MerchFallback />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.slice(0, 4).map((p) => {
        const image = p.images?.[0]?.src;
        const variant = p.variants?.[0];
        const price = variant?.price
          ? `${variant.price}${variant.currency ? ` ${variant.currency}` : " USD"}`
          : null;

        return (
          <a
            key={p.handle}
            href={`https://shop.nopasanada.com/products/${p.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col border hairline bg-asphalt transition-colors hover:border-volt"
          >
            {image && (
              <img
                src={image}
                alt={p.title}
                className="aspect-square w-full object-cover"
              />
            )}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="text-ink transition-colors group-hover:text-volt">
                {p.title}
              </h3>
              {price && <p className="label-mono text-muted">{price}</p>}
            </div>
          </a>
        );
      })}
    </div>
  );
}
