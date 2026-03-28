import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fairworkhelp.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/security-industry-award`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/languages`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
