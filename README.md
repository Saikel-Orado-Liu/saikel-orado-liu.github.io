<p align="center">
  <img src="./.github/assets/readme-cover.svg" alt="游戏极客-Saikel · GameGeek-Saikel — personal website, blog, UE5 plugin documentation and an acrylic design system" width="100%" />
</p>

<h1 align="center">GameGeek-Saikel · Personal Website</h1>

<p align="center">
  <img src="./.github/assets/badges.svg" alt="Astro 7.3 · Tailwind CSS 4.3 · 10 locales · RTL · Code MIT · Content All Rights Reserved" />
</p>

<p align="center">
  <strong>English</strong>
  &nbsp;·&nbsp;
  <a href="./README.zh-CN.md">简体中文</a>
</p>

**The personal website of Saikel-Orado-Liu (@GameGeek-Saikel)** — a fully static, multilingual (10 locales, including RTL Arabic) Astro site carrying a tech blog, documentation for Unreal Engine 5 plugins, and a hand-built design system with its own local review pages.

No server, no runtime database, no client framework: everything is generated at build time from Markdown/MDX content collections, ships a Pagefind index for ten languages, and deploys to GitHub Pages on every push to `main`.

> **Licensing at a glance** — code and styles are **MIT** ([`LICENSE`](./LICENSE)); articles, documentation, images and brand assets are **All Rights Reserved** ([`LICENSE-CONTENT`](./LICENSE-CONTENT)); third-party assets keep their own terms ([`THIRD-PARTY.md`](./THIRD-PARTY.md)). See [License](#license).

## Contents

- [Highlights](#highlights)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Repository map](#repository-map)
- [Writing content](#writing-content)
- [Design system](#design-system)
- [Local design reference](#local-design-reference)
- [Deployment](#deployment)
- [Privacy and runtime](#privacy-and-runtime)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)
- [Links](#links)

## Highlights

| Area | What it does |
| --- | --- |
| **Multilingual** | Ten locales — `zh-cn` (default), `en-us`, `ja-jp`, `ko-kr`, `ar-sa` (RTL), `es-es`, `fr-fr`, `pt-pt`, `ru-ru`, `de-de`. The default locale is unprefixed; the rest live under `/<locale>/` via dynamic routes, and missing translations fall back to `zh-cn` |
| **Content collections** | Blog posts plus a per-project documentation tree (chapters → pages → translations) compiled into a build-time document registry that drives sidebars, prev/next paging and per-page tables of contents — no hand-maintained index |
| **Search** | Pagefind index built in the same pipeline, ten languages in one multilingual index |
| **Design system** | Material Design 3 colour roles fused with an *abstract skeuomorphism* material language: three-layer shadows as physical thickness, SVG fractal-noise grain, 160° diffuse sheen, groove-and-slider navigation |
| **Design reference** | `/spec/` (tokens) and `/spec/components/` (components and their states) are a self-contained implementation that shares **no** CSS or components with the site — and they are **local-only** (see [Local design reference](#local-design-reference)) |
| **Images** | Custom Astro image service emitting AVIF via sharp; click-to-zoom lightbox; paper-grain overlay on figures |
| **SEO & feeds** | Per-locale RSS, sitemap with `hreflang` alternates, Open Graph / Twitter cards, JSON-LD, and IndexNow submission of changed URLs after each deploy |
| **Accessibility** | WCAG 2.2 AA target: contrast-audited palette, `:focus-visible` ring tokens, complete keyboard paths, ≥24 px touch targets, and a global `prefers-reduced-motion` fallback on the site |

## Tech stack

| Layer | Choice |
| --- | --- |
| Site framework | [Astro](https://astro.build) 7.3 — `output: 'static'`, directory build format |
| Styling | Tailwind CSS 4.3 through `@tailwindcss/vite`, plus hand-written CSS for the acrylic materials (`src/styles/`) |
| Language | TypeScript 5.9 — `astro check` runs before every build |
| Content | Markdown + MDX (`@astrojs/mdx` 8), GitHub-style callouts (`remark-github-blockquote-alert`), an external-link rehype plugin |
| Syntax highlighting | Shiki with dual themes (`github-dark` + a custom light theme), switched through CSS variables |
| Search | [Pagefind](https://pagefind.app) 1.5 |
| Images | `sharp` through a custom AVIF-emitting image service |
| Feeds and SEO | `@astrojs/rss`, `@astrojs/sitemap` |
| CI/CD | GitHub Actions → GitHub Pages: `pnpm install --frozen-lockfile`, Node 26.3.0, build guard, IndexNow, Pagefind |

## Quick start

Requirements: **Node ≥ 22.19** (CI uses 26.3.0) and **pnpm 11**.

```bash
pnpm install
pnpm dev        # http://127.0.0.1:4321 — also serves the local-only /spec/ reference pages
pnpm build      # astro check → astro build → public-output guard → Pagefind index
pnpm preview    # preview the built site
```

`pnpm build` is the delivery gate. It type-checks the project, generates the static site, then runs `scripts/verify-public-output.mjs`, which **fails the build** if an internal page (such as `/spec/`) or any `__`-prefixed temporary page leaks into `dist/`. A change is not done until it passes.

## Repository map

```
src/
  components/   UI: layout (header, footer, search), home, blog, doc, page and route components
  content/      Content collections — blog/ (one file per locale) and projects/ (documentation trees)
  i18n/         Ten locale dictionaries (interface strings) plus locale helpers
  layouts/      BaseLayout (the site) and SpecLayout (the independent design reference)
  pages/        Routes: the default locale at the root, others under [locale]/
  scripts/      Client scripts: theme, nav/TOC sliders, Hilbert and Gosper curve generators, lightbox
  styles/       tokens · base · components · ui-spec · doc-shared · specbook
  utils/        Content and document-registry helpers
docs/           Design and engineering specifications
scripts/        Build-time helpers: the IndexNow submitter, the public-output guard, and the README asset generators (cover + badges)
public/         Static assets (favicon, robots.txt)
LICENSES/       License texts referenced by REUSE.toml (MIT + the content terms)
REUSE.toml      Machine-readable per-path licensing (REUSE Specification 3.3)
```

## Writing content

- **Blog** — `src/content/blog/*.md`. The default locale carries no suffix; translations add `.{locale}.md`.
- **Project docs** — `src/content/projects/{slug}/`, with `{NN}.{chapter-slug}/` chapter folders and `{NN}.{doc-slug}[.{locale}].md` pages. A custom content loader builds the document registry (order, chapters, titles, translations) at build time, so sidebars and prev/next navigation are generated rather than maintained by hand.
- **Interface strings** — `src/i18n/{locale}.json`; missing keys fall back to `zh-cn`.

## Design system

The visual language and its numbers live in `docs/` and are implemented in `src/styles/`:

| Document | Content |
| --- | --- |
| `docs/网页设计规范.md` | Design charter: philosophy, the ten-colour palette, typography, shape scale, the three-layer shadow/thickness system, material pipeline |
| `docs/组件设计规范.md` | Per-component specification: structure, sizes, state machines, light/dark parity, motion, implementation files |
| `docs/响应式设计规范.md` | Breakpoint set, navigation folding, documentation grid, overflow governance, RTL, screenshot matrix |
| `docs/动效设计规范.md` | Motion tokens, easing semantics, the component motion matrix, view transitions, reduced-motion policy |
| `docs/无障碍设计规范.md` | WCAG 2.2 AA targets, measured contrast tables, focus/keyboard/touch rules, acceptance checklist |
| `docs/版本控制规范.md` | The commit-message convention used by this repository |

**Implementation rule:** styling and behaviour changes are prototyped on the independent `/spec/` pages, reviewed there, and only then ported into the site. The reference pages and the site deliberately share no CSS or component files — only the numeric standards.

## Local design reference

The reference pages are a review surface for the design system, and they are intentionally **not part of the public site**:

- Their sources live in `src/spec/` — outside `src/pages/`, so Astro does not route them by default.
- A `specLocalOnly()` integration injects their routes **only when `command === 'dev'`**, so a production build can never emit `/spec/`.
- `scripts/verify-public-output.mjs` fails the build if an internal page ever appears in `dist/` anyway (defence in depth, together with `noindex` and the sitemap filter).

```bash
pnpm dev   # then open http://127.0.0.1:4321/spec/ and /spec/components/
```

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`: install → build (`astro check`, `astro build`, the public-output guard, Pagefind) → submit changed URLs to IndexNow → upload `dist` → deploy to GitHub Pages. Everything the browser needs is prebuilt; the only external requests at runtime come from the two font CDNs.

## Privacy and runtime

This site ships **no analytics, no tracking scripts, no cookies and no third-party embeds**. Pages are static HTML/CSS with a small amount of vanilla JavaScript for the theme switch, sliders and the lightbox; font files are the only resources fetched from a third-party origin. Any future addition that would change this must be documented here first.

## Contributing

This is a personal website, not a community project:

- **Issues are welcome** — typos, broken links, translation corrections and accessibility problems in particular.
- **Pull requests:** please open an issue first and wait for a reply before investing in a patch, so we agree on the approach.
- **Content reuse** is governed by the [License](#license) below — code is MIT, articles and documentation are not.

## License

This repository is **multi-licensed** — please check the scope before reusing anything.

| Part | License | Files |
| --- | --- | --- |
| **Source code, build configuration, design-system implementation** — components, layouts, scripts, styles and design tokens, utilities, interface string dictionaries, CI configuration | **MIT** — see [`LICENSE`](./LICENSE) | `src/**` except `src/content/**`, `scripts/**`, config files |
| **Textual and editorial content** — blog articles, project documentation, their translations and images, design specification documents — and **brand assets** (the names 游戏极客-Saikel / GameGeek-Saikel, logo, avatar, social images) | **All Rights Reserved** — see [`LICENSE-CONTENT`](./LICENSE-CONTENT) | `src/content/**`, `docs/**`, brand assets |
| **Third-party assets** — fonts, icons, dependencies | Their own licenses — see [`THIRD-PARTY.md`](./THIRD-PARTY.md) | as noted there |

The mapping is machine-readable as well: [`REUSE.toml`](./REUSE.toml) declares which paths carry which
license and [`LICENSES/`](./LICENSES) holds the license texts, so the split follows the
[REUSE Specification 3.3](https://reuse.software/spec/) and can be checked with a linter:

```bash
uvx --from "reuse[charset-normalizer]" reuse lint   # → compliant: 267/267 files covered
```

In short:

- **Code and styles (MIT)** — use, modify and ship them freely; keep the copyright notice.
- **Content (All Rights Reserved)** — read, link, and quote short excerpts **with clear attribution**: the author name *Saikel-Orado-Liu (GameGeek-Saikel)* plus a link to the original page. Republishing, mirroring, translating for publication, commercial reuse, or including the content in AI/ML training corpora requires **prior written permission**.

```text
Code & styles : MIT © 2026 Saikel-Orado-Liu aka GameGeek-Saikel
Content       : All Rights Reserved © 2026 Saikel-Orado-Liu aka GameGeek-Saikel
```

## Credits

Fonts, icons and libraries rendered or bundled by this site belong to their respective authors and are used under their own licenses; the full list with links lives in [`THIRD-PARTY.md`](./THIRD-PARTY.md). Notably **MiSans** (© Xiaomi, loaded from Xiaomi's official CDN), **JetBrains Mono** (SIL OFL 1.1), **Boxicons** (MIT), **Astro**, **Tailwind CSS**, **Pagefind** and **Shiki** (all MIT), and **sharp** (Apache-2.0). The X, 抖音 and Bilibili marks are inline SVGs and remain trademarks of their owners, used for identification only.

## Links

- Website — <https://saikel-orado-liu.github.io>
- GitHub — <https://github.com/Saikel-Orado-Liu>
- X (Twitter) — <https://x.com/GameGeek_Saikel>
- Texturge, a UE5 text-animation plugin — <https://saikel-orado-liu.github.io/projects/texturge/>
