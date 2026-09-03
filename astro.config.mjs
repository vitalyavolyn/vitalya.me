// @ts-check

import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { site } from "./src/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: site.url,

  adapter: node({
    mode: "standalone",
  }),

  output: "server",

  server: {
    allowedHosts: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],
});