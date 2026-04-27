import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

const categoriesWithSubcategories = [
  "Антикварни часовници",
  "Изобразително изкуство",
  "Колекционерски предмети",
  "Етника и Фолклор",
];

const antiques = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/antiques" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    subcategory: z.string().optional().or(z.literal("")),
    images: z.array(z.union([
    z.string(),
    z.object({
      url: z.string(),
      caption: z.string().optional(),
    })
  ])).nonempty("At least one image is required"),
    price: z.number().min(0),
    featured: z.boolean().default(false).optional(),
    available: z.boolean().default(true).optional(),
    new: z.boolean().default(true).optional(),
    date: z.coerce.date().optional(),
    views: z.number().min(0).default(0).optional(),
  }).superRefine((data, ctx) => {
    if (categoriesWithSubcategories.includes(data.category) && !data.subcategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Subcategory is required for category "${data.category}"`,
        path: ['subcategory'],
      });
    }
  }),
});

export const collections = {
  antiques,
};