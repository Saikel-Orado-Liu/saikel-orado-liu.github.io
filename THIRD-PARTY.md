# Third-Party Assets & Credits

Everything listed here belongs to its respective authors and is used under its own license.
These items are **excluded** from both this repository's MIT License ([`LICENSE`](./LICENSE))
and its content license ([`LICENSE-CONTENT`](./LICENSE-CONTENT)).

Per-path licensing is declared machine-readably in [`REUSE.toml`](./REUSE.toml). The asset rows below
are referenced by URL (CDN) rather than stored here — this repository ships **no font binaries, no
vendored icon sets and no vendored third-party code**.

---

## Fonts

| Asset | Owner | Terms | How it is used |
| --- | --- | --- | --- |
| **MiSans** | © Xiaomi | Xiaomi's MiSans font license — see <https://hyperos.mi.com/font/> | Primary typeface for all locales; loaded at runtime from Xiaomi's official CDN (`cdn-font.hyperos.mi.com`), not redistributed in this repository |
| **JetBrains Mono** | © JetBrains s.r.o. | SIL Open Font License 1.1 | Monospace face for code and technical labels; loaded from Google Fonts |
| System UI fallbacks (`system-ui`, `-apple-system`, `Segoe UI`, …) | Platform vendors | Platform terms | Final fallback of the font stack |

Fonts are referenced by URL only. No font binaries are stored in this repository.

## Icons & brand marks

| Asset | Owner | Terms | Notes |
| --- | --- | --- | --- |
| **Boxicons** 2.1.4 | © Boxicons (Atisa) | MIT | Interface icons, loaded from the unpkg CDN (`base.css`) |
| X (Twitter), 抖音 (Douyin), Bilibili marks | © X Corp. / 字节跳动 / 哔哩哔哩 | Trademark rules of the respective owners | Inline SVG brand marks in the footer, used **for identification only** — linking to the author's accounts, no endorsement implied |

## Runtime & build dependencies

| Package | Purpose | License |
| --- | --- | --- |
| `astro`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/check`, `@astrojs/markdown-remark` | Static site framework and integrations | MIT |
| `tailwindcss`, `@tailwindcss/vite` | Utility CSS layer | MIT |
| `typescript` | Type checking | Apache-2.0 |
| `pagefind`, `@pagefind/component-ui` | Multilingual full-text search index & UI | MIT |
| `sharp` | Image processing (custom AVIF image service) | Apache-2.0 |
| `@shikijs/rehype`, `@shikijs/themes` | Syntax highlighting (dual light/dark themes) | MIT |
| `remark-github-blockquote-alert` | GitHub-style `[!NOTE]` callouts | MIT |
| `unist-util-visit` | Markdown AST traversal | MIT |

Dev-time tooling used by CI (GitHub Actions runners, `actions/checkout`, `actions/setup-node`,
`pnpm/action-setup`, `actions/cache`, `actions/upload-pages-artifact`, `actions/deploy-pages`)
is provided by GitHub under its own terms.

## Reference & inspiration

The repository structure, badges and license-section conventions of the README follow the general
practice of open-source web projects; the README was written from scratch. No third-party site
content is reproduced in this repository.

## Corrections

If you believe an attribution is missing or inaccurate, please open an issue at
<https://github.com/Saikel-Orado-Liu/saikel-orado-liu.github.io/issues> — it will be corrected promptly.
