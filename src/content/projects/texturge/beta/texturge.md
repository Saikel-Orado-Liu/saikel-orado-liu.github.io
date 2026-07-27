---
title: Texturge Beta — UE5 逐字文本动画引擎
date: 2026-07-24
---

# Texturge Beta

**Texturge Beta** 是对插件架构的全面重构版本。在 Alpha 版本稳定基础上，Beta 引入了全新的**多层动画合成系统**、**阶段性动画烘焙编译管线**、**运行时阶段控制器**以及完整的**Blueprint 与 C++ API**，为专业文本动画制作提供了前所未有的灵活性与性能。

## Beta 核心更新

- **多层动画合成** — 通过 `UGlyphAnimationLayer` 和 `UGlyphAnimationFactory` 实现独立动画层的叠加、覆盖与交叉渐变
- **编译期动画烘焙** — `FAnimationCompiler` 将动画蓝图预编译为 `FBakedAnimation`，运行时无需重复计算
- **指纹缓存系统** — 基于 CityHash64 的文本与蓝图指纹缓存，最大化运行时性能
- **阶段控制** — `UTextAnimationStageController` 管理 Intro / Default / Outro 三阶段动画播放与转换
- **字形调度** — `FGlyphScheduleInfo` 为每个字形提供独立的调度参数（延迟、缩放、偏移、抖动等）
- **BlueprintNativeEvent 自定义逻辑** — `BuildDefaultAnimation` 允许设计师在蓝图中覆盖默认动画生成逻辑
- **21 通道逐层曲线存储** — `FPerLayerCurves` 独立存储每层的完整曲线数据，消除曲线合并误差

## 文档导航

### 教程

逐步引导，从零开始掌握 Texturge Beta。

- **[快速入门 →](tutorials/quick-start/setup)** — 安装配置并验证 Texturge 插件
- **[创建第一个动画 →](tutorials/quick-start/create-animation)** — 使用 `UTextAnimationBlueprint` 创建动画
- **[多格式文本动画 →](tutorials/rich-text-animation/basic-tags)** — 使用 `UTextAnimationDataAsset` 实现标签动画
- **[对话系统 →](tutorials/dialog-system/overview)** — 构建 RPG 风格对话界面
- **[自定义 Blueprint 逻辑 →](tutorials/custom-blueprint-logic/nodes)** — 覆盖 `BuildDefaultAnimation` 与 Blueprint 节点

### 指南

深入理解 Texturge Beta 的架构与设计。

- **[架构总览 →](guides/architecture/overview)** — 两模块结构、数据流与核心设计决策
- **[烘焙管线 →](guides/bake-pipeline/pipeline)** — `FAnimationCompiler` 编译期动画烘焙与指纹缓存
- **[多层动画 →](guides/multi-layer/setup)** — 理解图层的叠加模式与 `UGlyphAnimationFactory`
- **[本地化 →](guides/localization/setup)** — `ULocalizationSubsystem` 语义锚点与跨语言文本定位
- **[性能优化 →](guides/performance/profiling)** — 最大化运行时帧率与内存效率
- **[从 Alpha 迁移 →](guides/migration/from-alpha)** — Alpha 用户升级到 Beta 的完整步骤

### 参考

配置项、轨道类型与标签语法的完整参考。

- **[配置参考 →](reference/configuration/settings)** — `UTexturgeSettings` 与动画资产配置
- **[动画轨道类型 →](reference/track-types/overview)** — Sequencer 轨道类型与 21 通道属性
- **[混合模式 →](reference/blend-modes/modes)** — `ETextAnimationBlendMode` 四种模式详解
- **[字形调度参考 →](reference/schedule/reference)** — `FGlyphScheduleInfo` 参数与字形分类
- **[多格式文本标签 →](reference/rich-text-tags/tag-syntax)** — `FTagParser` 语法与 `FAnimationEntry`
- **[Blueprint 节点参考 →](reference/blueprint-nodes/nodes)** — `SetBlueprintVariable` 与参数覆写系统

### API

C++ 与 Blueprint API 的完整技术文档。

- **[Runtime API →](api/runtime/overview)** — `UTextAnimationStageController`、`UTextAnimator` 等 C++ 类
- **[Editor API →](api/editor/tools)** — `FTextAnimationBlueprintEditor` 与设计视口扩展
- **[Blueprint API →](api/blueprint/nodes)** — `SetBlueprintVariable` 与播放控制的方法签名
- **[数据结构参考 →](api/data-structures/types)** — `FBakedAnimation`、`FGlyphAnimationState` 等完整结构定义
