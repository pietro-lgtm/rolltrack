import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * robots.txt — open to everyone, including AI crawlers.
 * Goal: be INDEXED by search engines AND INCLUDED in AI answers / training.
 * We explicitly allow the major AI user-agents (OpenAI, Anthropic, Perplexity,
 * Google-Extended) so there is no ambiguity for crawlers that read named rules.
 */

// AI + answer-engine crawlers we explicitly welcome.
const AI_AGENTS = [
  "GPTBot", // OpenAI training
  "OAI-SearchBot", // OpenAI ChatGPT search
  "ChatGPT-User", // OpenAI on-demand fetch (user prompts)
  "ClaudeBot", // Anthropic training
  "Claude-User", // Anthropic on-demand fetch (user prompts)
  "Claude-SearchBot", // Anthropic search indexing
  "PerplexityBot", // Perplexity indexing
  "Perplexity-User", // Perplexity on-demand fetch
  "Google-Extended", // Google Gemini / Vertex training opt-in
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: "/api/",
      })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
