import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

const antiques = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/antiques" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    subcategory: z.string(),
    images: z.array(z.union([
      z.string(),
      z.object({
        url: z.string(),
        caption: z.string().optional(),
      })
    ])),
    price: z.number().min(0),
    featured: z.boolean().default(false).optional(),
    available: z.boolean().default(true).optional(),
    new: z.boolean().default(true).optional(),
    views: z.number().min(0).default(0).optional(),
  }),
});

export const collections = {
  antiques,
};