---
title: Texturge Beta — Text Animation Engine for Unreal Engine 5
date: 2026-07-24
locale: en-us
---

# Texturge Beta

**Texturge Beta** is a comprehensive architectural rebuild of the plugin. Building on the stable Alpha foundation, Beta introduces a brand-new **multi-layer animation composition system**, **stage-based animation bake compilation pipeline**, **runtime stage controller**, and a complete **Blueprint & C++ API**, delivering unprecedented flexibility and performance for professional text animation production.

## Key Beta Updates

- **Multi-Layer Animation Composition** — Independent animation layers with additive, override, and cross-fade blending via `UGlyphAnimationLayer` and `UGlyphAnimationFactory`
- **Compile-Time Animation Bake** — `FAnimationCompiler` pre-compiles animation blueprints into `FBakedAnimation`, eliminating runtime recomputation
- **Fingerprint Caching** — CityHash64-based text and blueprint fingerprint caching for maximum runtime performance
- **Stage Control** — `UTextAnimationStageController` manages Intro / Default / Outro three-stage animation playback and transitions
- **Glyph Scheduling** — `FGlyphScheduleInfo` provides per-glyph scheduling parameters (delay, scale, offset, jitter, etc.)
- **BlueprintNativeEvent Custom Logic** — `BuildDefaultAnimation` lets designers override default animation generation in Blueprint
- **21-Channel Per-Layer Curve Storage** — `FPerLayerCurves` stores complete curve data independently per layer, eliminating curve merge errors

## Documentation Navigation

### Tutorials

Step-by-step guides to mastering Texturge Beta from scratch.

- **[Quick Start →](tutorials/quick-start)** — Build your first typewriter animation in 10 minutes
- **[Rich Text Animation →](tutorials/rich-text-animation)** — Multi-animation blending with rich text tags
- **[Dialog System →](tutorials/dialog-system)** — Build a complete RPG-style dialog interface
- **[Custom Blueprint Animation Logic →](tutorials/custom-blueprint-logic)** — Override `BuildDefaultAnimation` for unique effects

### Guides

Deep dives into Texturge Beta's architecture and design.

- **[Architecture Deep Dive →](guides/architecture-deep-dive)** — Module structure, data flow, and core design decisions
- **[Bake Pipeline →](guides/bake-pipeline)** — Compile-time animation baking and fingerprint caching
- **[Multi-Layer Animation →](guides/multi-layer-animation)** — Understanding layer blend modes and independent evaluation
- **[Localization Guide →](guides/localization-guide)** — Semantic anchors and cross-language text positioning
- **[Performance Optimization →](guides/performance-optimization)** — Maximizing runtime frame rate and memory efficiency
- **[Migration from Alpha →](guides/migration-from-alpha)** — Complete steps for Alpha users upgrading to Beta

### Reference

Complete reference for configuration, track types, and tag syntax.

- **[Configuration Reference →](reference/configuration-reference)** — All project settings and defaults
- **[Animation Track Types →](reference/track-types-reference)** — Parameters and value ranges for 10 track types
- **[Blend Modes →](reference/blend-modes-reference)** — Additive / Override / Multiply / CrossFade in detail
- **[Glyph Schedule Reference →](reference/schedule-reference)** — Scheduling parameters and glyph classification system
- **[Rich Text Tags →](reference/rich-text-tags-reference)** — Custom tag syntax and nesting rules
- **[Blueprint Nodes Reference →](reference/blueprint-nodes-reference)** — Complete Blueprint-callable node catalog

### API

Complete technical documentation for C++ and Blueprint APIs.

- **[Runtime API →](api/runtime-api)** — C++ classes and interfaces in the Texturge runtime module
- **[Editor API →](api/editor-api)** — Extension points and utility classes in TexturgeEditor
- **[Blueprint API →](api/blueprint-api)** — Public method signatures for all BlueprintType classes
- **[Data Structures Reference →](api/data-structures)** — Complete USTRUCT and non-UObject data structure definitions
