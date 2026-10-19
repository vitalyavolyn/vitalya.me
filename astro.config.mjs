// @ts-check

import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { site } from "./src/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: site.url,
  trailingSlash: "always",

  adapter: node({
    mode: "standalone",
  }),

  output: "server",

  build: {
    inlineStylesheets: "always",
  },

  server: {
    allowedHosts: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      // /blog/ is a legacy redirect to /posts/ and should not be indexed.
      filter: (page) => !page.endsWith("/blog/"),
    }),
  ],
});
