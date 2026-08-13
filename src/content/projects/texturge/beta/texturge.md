---
title: Texturge Pro — UE5 逐字文本动画引擎
date: 2026-08-07
excerpt: Texturge Pro — Unreal Engine 5 高性能模块化字形处理与文本动画引擎，为 UE5 补全专业逐字动画工作流。
featured: true
---

# Texturge

![Texturge Pro 展示页面](images/Texturge%20Pro%20Page.avif)

**Texturge Beta** 是对插件架构的全面重构版本。在 Alpha 版本稳定基础上，Beta 引入了全新的**多层动画合成系统**、**编译期动画烘焙管线**、**运行时阶段控制器**以及完整的 **Blueprint 与 C++ API**，为专业文本动画制作提供前所未有的灵活性与性能。

## Beta 核心更新

- **多层动画合成** — `UGlyphAnimationLayer`（73 个蓝图函数）与 `UGlyphAnimationFactory`（69 个蓝图函数）实现独立动画层的叠加、覆盖与交叉混合，10 属性 × 5 操作的有序微调步骤（51 个函数/侧）
- **编译期动画烘焙** — `FAnimationCompiler` 将动画蓝图预编译为 `FBakedAnimation`，运行时零烘焙开销
- **指纹缓存系统** — CityHash64 双指纹（文本 + 蓝图）缓存，`CompileCount` 与 Track/Section 签名保证编译后自动失效
- **阶段控制** — `UTextAnimationStageController` 管理动画的播放、方向、循环与逐字形求值
- **字形调度** — `FGlyphScheduleInfo` 为每个字形提供独立调度（延迟、跳过、分类），`Index = -1` 全局语义
- **BlueprintNativeEvent 自定义逻辑** — `BuildDefaultAnimation` 允许设计师在蓝图中覆盖默认动画生成逻辑
- **动画剪切** — Layer / Factory 级 `SetAnimationClipAt` 前端/末端裁剪（播放轴口径，0.3.0）
- **PBM 物理颜料混色** — 染色采用 **Pigment-Based Mixing（PBM）** 算法：基于 Kubelka–Munk 双流理论的实时颜料混色，黄+蓝变绿、互补色混合产生泥色、深色加白得到饱和浅色，贴合真实颜料直觉；无查找表、O(1) 常数时间（`Texturge::GlyphRender::ApplyTint`，[MIT 协议开源](https://github.com/Saikel-Orado-Liu/pigment-based-mixing)）
- **21 通道逐层曲线存储** — `FPerLayerCurves` 独立存储每层完整曲线数据，消除曲线合并误差

## 文档导航

### 教程

逐步引导，从零开始掌握 Texturge Beta。

- **[快速入门 →](tutorials/quick-start/setup)** — 安装配置并验证 Texturge 插件
- **[使用预设动画 →](tutorials/quick-start/use-presets)** — 用内置 16 种预设快速出效果
- **[创建自定义动画 →](tutorials/quick-start/create-animation)** — 制作自己的 `UTextAnimationBlueprint` 动画
- **[多格式文本动画 →](tutorials/rich-text-animation/basic-tags)** — `<anim id="...">` 标签与 `UTextAnimationDataAsset` 映射
- **[自定义 Blueprint 逻辑 →](tutorials/custom-blueprint-logic/nodes)** — 覆盖 `BuildDefaultAnimation` 与蓝图节点

### 指南

深入理解 Texturge Beta 的架构与设计。

- **[架构总览 →](guides/architecture/overview)** — 模块结构、数据流与核心设计理念
- **[烘焙管线 →](guides/bake-pipeline/pipeline)** — `FAnimationCompiler` 编译期烘焙与指纹缓存
- **[多层动画 →](guides/multi-layer/setup)** — 图层叠加模式与 `UGlyphAnimationFactory` 编排
- **[本地化 →](guides/localization/setup)** — `ULocalizationSubsystem` 语义锚点与 15 种语言支持
- **[性能优化 →](guides/performance/profiling)** — 最大化运行时帧率与内存效率
- **[从 Alpha 迁移 →](guides/migration/from-alpha)** — Alpha 用户升级到 Beta 的完整步骤

### 参考

配置项、轨道类型与标签语法的完整参考。

- **[配置参考 →](reference/configuration/settings)** — `UTexturgeSettings` 与动画资产配置
- **[动画轨道类型 →](reference/track-types/overview)** — Sequencer 轨道类型与 21 通道属性
- **[混合模式 →](reference/blend-modes/modes)** — `ETextAnimationBlendMode` 四种模式详解
- **[字形调度参考 →](reference/schedule/reference)** — `FGlyphScheduleInfo` 参数与调度 API
- **[多格式文本标签 →](reference/rich-text-tags/tag-syntax)** — `FTagParser` 语法与 `FAnimationEntry`
- **[Blueprint 节点参考 →](reference/blueprint-nodes/nodes)** — 全节点速查与参数覆盖优先级

### API

C++ 与 Blueprint API 的完整技术文档。

- **[Runtime API →](api/runtime/overview)** — `UTextAnimationStageController`、`UTextAnimator` 等 C++ 类
- **[Editor API →](api/editor/tools)** — `FTextAnimationBlueprintEditor` 与设计视口扩展
- **[Blueprint API →](api/blueprint/nodes)** — `SetBlueprintVariable` 与播放控制的方法签名
- **[数据结构参考 →](api/data-structures/types)** — `FBakedAnimation`、`FGlyphAnimationState` 等完整结构定义
