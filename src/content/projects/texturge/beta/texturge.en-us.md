---
title: Texturge Pro — Text Animation Engine for Unreal Engine 5
date: 2026-07-24
locale: en-us
excerpt: Texturge Pro — A high-performance modular glyph processing and text animation engine for Unreal Engine 5, filling the professional per-character animation workflow gap in UE5.
featured: true
---

# Texturge

![Texturge Pro 展示页面](images/Texturge%20Pro%20Page.avif)

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

- **[Quick Start →](tutorials/quick-start/setup)** — Install and verify the Texturge plugin
- **[Create Your First Animation →](tutorials/quick-start/create-animation)** — Create animations with `UTextAnimationBlueprint`
- **[Rich Text Animation →](tutorials/rich-text-animation/basic-tags)** — Tag-based animation with `UTextAnimationDataAsset`
- **[Dialog System →](tutorials/dialog-system/overview)** — Build an RPG-style dialog interface
- **[Custom Blueprint Logic →](tutorials/custom-blueprint-logic/nodes)** — Override `BuildDefaultAnimation` and Blueprint nodes

### Guides

Deep dives into Texturge Beta's architecture and design.

- **[Architecture Overview →](guides/architecture/overview)** — Two-module structure, data flow, and core decisions
- **[Bake Pipeline →](guides/bake-pipeline/pipeline)** — `FAnimationCompiler` compile-time animation baking
- **[Multi-Layer Animation →](guides/multi-layer/setup)** — Layer blend modes and `UGlyphAnimationFactory`
- **[Localization →](guides/localization/setup)** — `ULocalizationSubsystem` semantic anchors
- **[Performance →](guides/performance/profiling)** — Maximize runtime frame rate and memory efficiency
- **[Migration from Alpha →](guides/migration/from-alpha)** — Complete steps for upgrading to Beta

### Reference

Complete reference for configuration, track types, and tag syntax.

- **[Configuration Reference →](reference/configuration/settings)** — `UTexturgeSettings` and animation asset configuration
- **[Track Types →](reference/track-types/overview)** — Sequencer tracks and 21 animation channels
- **[Blend Modes →](reference/blend-modes/modes)** — `ETextAnimationBlendMode`: Additive / Override / Multiply / CrossFade
- **[Glyph Schedule →](reference/schedule/reference)** — `FGlyphScheduleInfo` parameters and glyph classification
- **[Rich Text Tags →](reference/rich-text-tags/tag-syntax)** — `FTagParser` syntax and `FAnimationEntry` structure
- **[Blueprint Nodes →](reference/blueprint-nodes/nodes)** — `SetBlueprintVariable` and parameter override system

### API

Complete technical documentation for C++ and Blueprint APIs.

- **[Runtime API →](api/runtime/overview)** — `UTextAnimationStageController`, `UTextAnimator`, and core C++ classes
- **[Editor API →](api/editor/tools)** — `FTextAnimationBlueprintEditor` and designer viewport extensions
- **[Blueprint API →](api/blueprint/nodes)** — `SetBlueprintVariable` and playback control method signatures
- **[Data Structures →](api/data-structures/types)** — `FBakedAnimation`, `FGlyphAnimationState`, and complete struct definitions
