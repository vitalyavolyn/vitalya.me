import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { site } from "../config";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");

  return rss({
    title: "Vitalya's blog",
    description: "Articles by Vitalya Volynskiy",
    site: site.url,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.title,
        link: `/posts/${post.id}`,
      })),
    customData: "<language>en-us</language>",
  });
};
