import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/members", "/saved"],
      },
    ],
    sitemap: "https://cheapakiya.com/sitemap.xml",
  };
}
