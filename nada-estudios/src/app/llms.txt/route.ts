import { site, clients } from "@/config/site";
import { packages, addOns, formatUsd } from "@/data/services";

export const dynamic = "force-static";

export async function GET() {
  const lines: string[] = [];

  lines.push(`# ${site.name}`);
  lines.push("");
  lines.push(
    `> ${site.description} Offices in San José (Costa Rica), Ciudad de México (Mexico) and New York (USA).`,
  );
  lines.push("");
  lines.push(
    "Editorial content production studio. Video, photo and social media production sold as fixed monthly retainers and one-off add-ons, all with published USD pricing — no discovery call required.",
  );
  lines.push("");

  lines.push("## Services & pricing (USD, IVA/tax not included)");
  lines.push("");
  for (const p of packages) {
    lines.push(`- **${p.name}** — ${p.summary}: ${formatUsd(p.price)}/mo (${formatUsd(p.renewalPrice)}/mo after month 3, ${formatUsd(p.totalFirstTerm)} first 3-month term)`);
  }
  lines.push("");
  lines.push("### Add-ons (one-off unless noted)");
  lines.push("");
  for (const a of addOns) {
    lines.push(`- ${a.name}: ${a.priceLabel}${a.recurring ? " (monthly)" : ""}`);
  }
  lines.push("");

  lines.push("## Clients");
  lines.push("");
  lines.push(clients.join(", "));
  lines.push("");

  lines.push("## Cities");
  lines.push("");
  lines.push(site.cities.join(", ") + " (nearshore lane for US brands via the New York office)");
  lines.push("");

  lines.push("## Contact");
  lines.push("");
  lines.push(`- Email: ${site.email}`);
  lines.push(`- WhatsApp: ${site.whatsappUrl}`);
  lines.push(`- Instagram: ${site.instagram}`);
  lines.push("");

  lines.push("## Key URLs");
  lines.push("");
  lines.push(`- Home: ${site.url}/`);
  lines.push(`- Work / portfolio: ${site.url}/trabajo`);
  lines.push(`- Services & pricing: ${site.url}/servicios`);
  lines.push(`- Start a project: ${site.url}/empezar`);
  lines.push(`- About: ${site.url}/nosotros`);
  lines.push(`- FAQ & pricing questions: ${site.url}/faq`);
  lines.push(`- English landing (nearshore): ${site.url}/en`);
  lines.push(`- San José: ${site.url}/produccion/san-jose`);
  lines.push(`- CDMX: ${site.url}/produccion/cdmx`);
  lines.push(`- New York / nearshore: ${site.url}/produccion/nueva-york`);
  lines.push("");

  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
