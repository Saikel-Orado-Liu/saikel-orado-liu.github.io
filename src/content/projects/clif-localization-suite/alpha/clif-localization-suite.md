---
title: CLIF Localization Suite — UE5 CLIF 本地化套件
date: 2026-09-11
excerpt: CLIF Localization Suite — 把 CLIF 1.0 接入虚幻引擎官方本地化系统，实现 .clif ↔ UE 本地化数据的双向无损转换，并内置 DeepSeek AI 自动翻译。
featured: true
---

# CLIF Localization Suite

<figure class="img-placeholder"><figcaption>images/clif-localization-suite-overview.png — 本地化 Dashboard 上的 CLIF 工具栏（CLIF 导入 / CLIF 导出 / AI 翻译）与官方同款进度窗口 — Localization Dashboard with the CLIF toolbar (CLIF Import / CLIF Export / AI Translate) and the official commandlet progress window</figcaption></figure>

**CLIF Localization Suite Alpha** 是插件的首个公开版本（`0.1.0-alpha.1`）。它把 CLIF 1.0 变成 UE 本地化数据的**可读、可评审、可交给 AI 的中间格式**：导入与导出都作为官方 `GatherText` 管线的一个步骤执行，写入仍然由引擎的 manifest / archive / `.locres` 生成器完成。

## Alpha 核心能力

- **CLIF 1.0 解析与校验** — `FClifDocument` / `FClifValidator` 覆盖 header、group、entry 全部字段与词表检查，通过 10 个有效夹具 + 32 个无效夹具的双向验证
- **官方管线导入** — `.clif` → `FLocTextHelper` 写 manifest / archive → `GenerateTextLocalizationResource` 编译 `.locmeta` / `.locres` → `FTextLocalizationManager` 热刷新
- **官方管线导出** — manifest + 全部 culture archive（或直接读 `.locres`）→ 每个 culture 一个 `<target-language>/<clan>.clif` + `.clifmap.json` 原键侧车
- **语义映射表** — clan ↔ UE Namespace、Namespace → `type` / `emotion`，全部可在 Project Settings 中配置；无信息时落到 `sentence` 并告警
- **DeepSeek AI 翻译** — 导出 CLIF → AI 翻译 → 导入 CLIF 三段式管线，多语言并发、占位符校验、自翻译与空译文拒绝写回、CLIF 自动修复闭环
- **官方入口** — Dashboard 工具栏按钮、官方同款 Slate 进度窗口、`ClifLocalizationSuite.Import/Export/AITranslate` 控制台命令

## 文档导航

### 教程

逐步引导，从安装到第一次完整跑通 CLIF 工作流。

- **[安装与启用 →](tutorials/quick-start/installation)** — 插件安装、模块启用与验证
- **[Dashboard 工作流 →](tutorials/quick-start/dashboard-workflow)** — 第一次导出与导入 CLIF
- **[第一次 AI 翻译 →](tutorials/quick-start/ai-translation)** — 配置 DeepSeek 并补齐缺失译文
- **[CLIF 格式速览 →](tutorials/clif-basics/clif-format)** — 用 5 分钟读懂一个 `.clif` 文件

### 指南

理解管线、语义映射与 AI 翻译的设计。

- **[架构总览 →](guides/architecture/overview)** — 模块划分、官方链路接入点与设计取舍
- **[数据流 →](guides/architecture/data-flow)** — 导入 / 导出 / AI 翻译三条完整链路
- **[导入管线 →](guides/pipeline/import)** — manifest / archive 写入、元数据、编译与热刷新
- **[导出管线 →](guides/pipeline/export)** — 分组、稳定 ID、语义回填与侧车
- **[语义映射 →](guides/semantic-mapping/mapping)** — clan ↔ Namespace 与 `type` / `emotion` 推导规则
- **[AI 翻译配置 →](guides/ai-translation/setup)** — 模型、提示词、翻译标准与批量参数
- **[写回防护与修复 →](guides/ai-translation/safety)** — 自翻译、空译文、占位符与 CLIF 修复闭环
- **[故障排查 →](guides/troubleshooting/troubleshooting)** — 常见报错、原因与处理

### 参考

配置项、命令与数据格式的完整参考。

- **[设置参考 →](reference/settings/settings)** — `UClifLocalizationSuiteSettings` 全部字段
- **[命令与命令let →](reference/cli/commands)** — 控制台命令、GatherText 步骤与参数
- **[词表与映射 →](reference/vocabulary/vocabulary)** — type / emotion / status 词表与 UE 映射
- **[原键侧车 →](reference/sidecar/sidecar)** — `.clifmap.json` 结构与还原规则
- **[常见问题 →](reference/faq/faq)** — 高频疑问与行为说明

### API

C++ API 与数据结构的完整技术文档。

- **[Runtime 模块概述 →](api/runtime/overview)** — 解析、校验、序列化与语义映射的入口
- **[Runtime 类参考 →](api/runtime/classes)** — `FClifDocument`、`FClifEntry`、`FClifSemanticMapping` 等
- **[导入器与导出器 →](api/editor/importer-exporter)** — `FClifImporter` / `FClifExporter` 与设置结构
- **[AI 翻译与命令let →](api/editor/ai-and-commandlets)** — `FClifAITranslator` 与 `UGatherTextCommandletBase` 子类
