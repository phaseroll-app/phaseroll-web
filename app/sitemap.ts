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
        `${SITE_URL}/phase_view.png`,
        `${SITE_URL}/film_signature.png`,
        `${SITE_URL}/roll_call.png`,
      ],
    },
  ];
}