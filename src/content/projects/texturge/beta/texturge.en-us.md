---
title: Texturge Pro — Text Animation Engine for Unreal Engine 5
date: 2026-08-07
locale: en-us
excerpt: Texturge Pro — A high-performance modular glyph processing and text animation engine for Unreal Engine 5, filling the professional per-character animation workflow gap in UE5.
featured: true
---

# Texturge

![Texturge Pro showcase page](images/Texturge%20Pro%20Page.avif)

**Texturge Beta** is a comprehensive architectural rebuild of the plugin. Building on the stable Alpha foundation, Beta introduces a brand-new **multi-layer animation composition system**, **compile-time animation bake pipeline**, **runtime stage controller**, and a complete **Blueprint & C++ API**, delivering unprecedented flexibility and performance for professional text animation production.

## Key Beta Updates

- **Multi-Layer Animation Composition** — `UGlyphAnimationLayer` (73 Blueprint functions) and `UGlyphAnimationFactory` (69 Blueprint functions) implement additive, override, and cross-fade blending of independent animation layers, with ordered tweak steps of 10 properties × 5 operations (51 functions per side)
- **Compile-Time Animation Bake** — `FAnimationCompiler` pre-compiles animation blueprints into `FBakedAnimation`, zero bake overhead at runtime
- **Fingerprint Caching** — CityHash64 dual fingerprints (text + blueprint) with automatic invalidation after compilation via `CompileCount` and Track/Section signatures
- **Stage Control** — `UTextAnimationStageController` manages playback, direction, looping, and per-glyph evaluation
- **Glyph Scheduling** — `FGlyphScheduleInfo` provides independent scheduling per glyph (delay, skip, classification) with `Index = -1` global semantics
- **BlueprintNativeEvent Custom Logic** — `BuildDefaultAnimation` lets designers override the default animation generation logic in Blueprint
- **Animation Clipping** — Layer / Factory-level `SetAnimationClipAt` front/back trimming (playback axis, 0.3.0)
- **PBM Physical Pigment Tinting** — tinting uses the **Pigment-Based Mixing (PBM)** algorithm: real-time pigment mixing built on Kubelka–Munk two-flux theory — yellow + blue makes green, complementary pairs mix into muddy colors, deep colors lightened with white stay saturated, matching real paint intuition; no look-up tables, O(1) constant time (`Texturge::GlyphRender::ApplyTint`, [Apache 2.0 open source](https://github.com/Saikel-Orado-Liu/pigment-based-mixing))
- **21-Channel Per-Layer Curve Storage** — `FPerLayerCurves` stores each layer's complete curve data independently, eliminating curve merge errors

## Documentation Navigation

### Tutorials

Step-by-step guides to mastering Texturge Beta from scratch.

- **[Quick Start →](tutorials/quick-start/setup)** — Install, configure, and verify the Texturge plugin
- **[Using Preset Animations →](tutorials/quick-start/use-presets)** — Quick results with the 16 built-in presets
- **[Creating Custom Animations →](tutorials/quick-start/create-animation)** — Author your own `UTextAnimationBlueprint` animations
- **[Rich Text Animation →](tutorials/rich-text-animation/basic-tags)** — `<anim id="...">` tags and `UTextAnimationDataAsset` mapping
- **[Custom Blueprint Logic →](tutorials/custom-blueprint-logic/nodes)** — Override `BuildDefaultAnimation` and Blueprint nodes

### Guides

Deep dives into Texturge Beta's architecture and design.

- **[Architecture Overview →](guides/architecture/overview)** — Module structure, data flow, and core design principles
- **[Bake Pipeline →](guides/bake-pipeline/pipeline)** — `FAnimationCompiler` compile-time baking and fingerprint caching
- **[Multi-Layer Animation →](guides/multi-layer/setup)** — Layer stacking modes and `UGlyphAnimationFactory` orchestration
- **[Localization →](guides/localization/setup)** — `ULocalizationSubsystem` semantic anchors and 15-language support
- **[Performance →](guides/performance/profiling)** — Maximize runtime frame rate and memory efficiency
- **[Migration from Alpha →](guides/migration/from-alpha)** — Complete steps for upgrading from Alpha to Beta

### Reference

Complete reference for configuration, track types, and tag syntax.

- **[Configuration Reference →](reference/configuration/settings)** — `UTexturgeSettings` and animation asset configuration
- **[Track Types →](reference/track-types/overview)** — Sequencer track types and 21-channel properties
- **[Blend Modes →](reference/blend-modes/modes)** — The four `ETextAnimationBlendMode` modes in detail
- **[Glyph Schedule →](reference/schedule/reference)** — `FGlyphScheduleInfo` parameters and scheduling API
- **[Rich Text Tags →](reference/rich-text-tags/tag-syntax)** — `FTagParser` syntax and `FAnimationEntry`
- **[Blueprint Nodes →](reference/blueprint-nodes/nodes)** — Full node quick reference and parameter override priority

### API

Complete technical documentation for C++ and Blueprint APIs.

- **[Runtime API →](api/runtime/overview)** — `UTextAnimationStageController`, `UTextAnimator`, and other C++ classes
- **[Editor API →](api/editor/tools)** — `FTextAnimationBlueprintEditor` and designer viewport extensions
- **[Blueprint API →](api/blueprint/nodes)** — `SetBlueprintVariable` and playback control method signatures
- **[Data Structures →](api/data-structures/types)** — `FBakedAnimation`, `FGlyphAnimationState`, and complete struct definitions
