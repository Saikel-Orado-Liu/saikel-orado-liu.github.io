# 使用 Astro 构建现代化静态站点

_Astro_ 是一款现代化的静态站点生成器，它通过创新的 Island 架构和默认零 JavaScript 的输出策略，为内容驱动的网站带来了全新的构建范式。

~~在本文中~~，我们将深入探讨如何使用 [Astro v6](https://astro.build) 搭建一个功能完整的个人站点。

## 项目架构设计

一个典型的 Astro 项目采用基于文件的路由系统，`src/pages/` 目录下的每个文件对应一个路由。通过 `Content Collections` API 管理内容。

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  i18n: {
    defaultLocale: 'zh-cn',
    locales: ['zh-cn', 'en-us', 'ja-jp'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
});
```

### 内容集合与类型安全

Astro 的 Content Collections 是内容管理的核心。通过在 `src/content.config.ts` 中定义 Schema，即可获得完整的 TypeScript 类型推导。

> [!NOTE]
> 使用 `remark` 和 `rehype` 插件扩展代码高亮、数学公式和目录生成等功能。

> [!TIP]
> 推荐使用 Astro Content Collections 管理内容，通过 `getCollection()` API 获取类型安全的内容查询。

> [!IMPORTANT]
> 定义 Schema 可获得完整的 TypeScript 类型推导，编辑器自动补全和类型检查确保内容结构正确。

> [!WARNING]
> 确保构建前运行 `astro check` 验证类型，避免生产环境出现类型错误。

> [!CAUTION]
> 破坏性变更需要正确标记，遵循语义化版本规范并通知依赖方。

> 没有 Alert 类型的提示块，显示主强调色左侧竖条，无标题。

## 配置项参考

以下是 Astro 项目的核心配置选项：

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `site` | `string` | `undefined` | 部署站点的最终 URL |
| `output` | `'static' \| 'server' \| 'hybrid'` | `'static'` | 构建输出模式 |
| `build.format` | `'file' \| 'directory'` | `'directory'` | 页面输出文件结构 |
| `i18n.defaultLocale` | `string` | — | 默认语言，无 URL 前缀 |
| `i18n.locales` | `string[]` | — | 所有支持的语言列表 |
| `markdown.shikiConfig.theme` | `string` | `'github-dark'` | 代码高亮主题 |

## 构建与部署

Astro 项目的开发流程简洁高效，以下为推荐实践：

### 推荐工具链

- [Node.js](https://nodejs.org/) v22 或更高版本

  1. XX
  2. 11

- [pnpm](https://pnpm.io/) 作为包管理器
- [VS Code](https://code.visualstudio.com/) 搭配 Astro 官方扩展
- [Vercel](https://vercel.com) 或 [Cloudflare Pages](https://pages.cloudflare.com) 部署

### 部署步骤

1. 将代码推送至 GitHub 仓库

   - XXX
   - 1111

2. 在部署平台导入项目仓库
3. 配置构建命令：`npm run build`
4. 设置输出目录：`dist`
5. 触发首次部署，后续自动 CI/CD

---

## 总结

Astro 通过以下特性重新定义了静态站点生成：

1. **零 JS 默认输出** — 首屏加载即纯 HTML，按需激活交互
2. **Island 架构** — 独立组件各自加载，互不阻塞
3. **内容集合** — 类型安全的 Markdown/MDX 管理
4. **多语言支持** — 内置 i18n 路由，开箱即用
5. **灵活部署** — 输出纯静态文件，适配任意平台

无论构建个人博客、技术文档还是产品站点，Astro 都提供了出色的开发体验和卓越的最终性能。

![Astro logo](https://astro.build/assets/press/astro-logo-dark.png)

示意图：Astro 项目标识
