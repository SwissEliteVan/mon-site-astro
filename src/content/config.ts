import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content', // On force le mode "content" classique
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  blog: blog,
};