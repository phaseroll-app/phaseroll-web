import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        `${SITE_URL}/japan_trip_phase_view.png`,
        `${SITE_URL}/film_signature.png`,
        `${SITE_URL}/phase_diary.png`,
      ],
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}