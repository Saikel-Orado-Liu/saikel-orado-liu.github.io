import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const localeEnum = z.enum(['zh-cn', 'en-us', 'ja-jp', 'ko-kr', 'ar-sa', 'es-es', 'fr-fr', 'pt-pt', 'ru-ru', 'de-de']);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    locale: localeEnum,
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    date: z.date().optional(),
    locale: localeEnum.optional().default('zh-cn'),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    github: z.string().optional(),
    demo: z.string().optional(),
    featured: z.boolean().optional().default(false),
    versions: z.array(z.string()).optional(),
    currentVersion: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const ue5Plugins = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/ue5-plugins' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    locale: localeEnum,
    version: z.string().optional(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog, projects, 'ue5-plugins': ue5Plugins };
