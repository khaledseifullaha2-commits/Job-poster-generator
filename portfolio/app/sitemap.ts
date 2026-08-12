import type { MetadataRoute } from "next";
import { nav } from "@/data/site";

const BASE = "https://khaled-seifullaha.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return nav.map((item) => ({
    url: `${BASE}${item.href === "/" ? "/" : item.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));
}
