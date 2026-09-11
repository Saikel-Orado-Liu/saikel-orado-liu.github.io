import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkAlert } from 'remark-github-blockquote-alert';
import rehypeExternalLinks from './src/scripts/rehype-external-links.mjs';
import customLight from './src/scripts/shiki-theme.mjs';

import tailwindcss from '@tailwindcss/vite';

/**
 * 内部规范参考页（/spec/）——**仅本地开发可见**。
 *
 * 页面实体位于 src/spec/（不在 src/pages/ 下，因此默认不参与路由）。
 * 本集成只在 `astro dev` 时注入路由；`astro build`（CI 使用的命令）**永不产出**
 * /spec/ 与 /spec/components/，从结构上保证内部参考页不会进入 GitHub Pages 产物。
 *
 * 依据：docs/网页设计规范.md §0.1「样式规范参考页与分离约束」。
 * 变更此行为前请先确认「参考页不出站」这一硬约束是否仍然成立。
 */
const SPEC_ROUTES = [
  { pattern: '/spec', entrypoint: './src/spec/index.astro' },
  { pattern: '/spec/components', entrypoint: './src/spec/components.astro' },
];

const specLocalOnly = () => ({
  name: 'spec-local-only',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command !== 'dev') return;
      for (const route of SPEC_ROUTES) injectRoute(route);
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://saikel-orado-liu.github.io',
  output: 'static',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  markdown: {
    processor: unified({
      remarkPlugins: [[remarkAlert, { tagName: "blockquote" }]],
      rehypePlugins: [rehypeExternalLinks],
    }),
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
    specLocalOnly(),
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
      // 移除未使用的 XML 命名空间，精简 sitemap 体积
      namespaces: {
        news: false,
        image: false,
        video: false,
      },
      filter: (page) => {
        const path = page || '';
        // 排除旧版本文档（alpha/beta），避免重复内容
        if (/\/alpha\//.test(path) || /\/beta\//.test(path)) return false;
        // 排除标签页（thin content）
        if (/\/blog\/tag\//.test(path)) return false;
        // 排除样式规范参考页（noindex 内部参考页）
        // 注意：filter 收到的是完整 URL（https://host/spec/），故不能用 ^\/spec\/ 锚定，
        // 否则规则永不命中、参考页会漏进 sitemap（违反《网页设计规范》§0.1「不出站」）。
        if (/\/spec\//.test(path)) return false;
        return true;
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