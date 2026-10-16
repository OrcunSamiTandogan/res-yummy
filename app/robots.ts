import type { MetadataRoute } from "next";

// Arama motorları siteyi tarayabilir; panel taranmaz.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
  };
}
