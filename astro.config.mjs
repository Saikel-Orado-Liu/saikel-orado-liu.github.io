import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkAlert } from 'remark-github-blockquote-alert';
import rehypeExternalLinks from './src/scripts/rehype-external-links.mjs';
import customLight from './src/scripts/shiki-theme.mjs';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://saikel-orado-liu.github.io',
  output: 'static',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  markdown: {
    remarkPlugins: [[remarkAlert, { tagName: "blockquote" }]],
    rehypePlugins: [rehypeExternalLinks],
    shikiConfig: {
      themes: { dark: 'github-dark', light: customLight },
      defaultColor: 'dark',
    },
  },

  i18n: {
    defaultLocale: 'zh-cn',
    locales: ['zh-cn', 'en-us', 'ja-jp', 'ko-kr', 'ar-sa', 'es-es', 'fr-fr', 'pt-pt', 'ru-ru', 'de-de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'zh-cn',
        locales: {
          'zh-cn': 'zh-CN',
          'en-us': 'en-US',
          'ja-jp': 'ja-JP',
          'ko-kr': 'ko-KR',
          'ar-sa': 'ar-SA',
          'es-es': 'es-ES',
          'fr-fr': 'fr-FR',
          'pt-pt': 'pt-PT',
          'ru-ru': 'ru-RU',
          'de-de': 'de-DE',
        },
      },
    }),
  ],

  image: {
    service: {
      entrypoint: './src/scripts/avif-image-service.mjs',
    },
    layout: 'constrained',
  },

  build: {
    format: 'directory',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});