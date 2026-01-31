import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AYDevelopers Admin Task Dashboard",
    short_name: "AYDevelopers",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5d87ff",
    icons: [
      {
        src: "/images/logos/aydevelopers-BemNdjvJ.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logos/aydevelopers-BemNdjvJ.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
