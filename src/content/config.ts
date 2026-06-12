
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.string().transform(str => new Date(str)),
    description: z.string(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = {
  blog: blogCollection
};