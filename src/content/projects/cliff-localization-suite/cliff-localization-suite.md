---
title: CLIFF Localization Suite — UE5 CLIFF 本地化套件
date: 2026-09-11
excerpt: CLIFF Localization Suite — 把 CLIFF 1.0（Contextual Localization Integrated File Format）接入虚幻引擎官方本地化系统，实现 .cliff ↔ UE 本地化数据的双向无损转换，并内置 DeepSeek AI 自动翻译。
featured: true
tags:
  - 本地化
  - CLIFF
  - UE5
  - AI 翻译
versions:
  - alpha
versionNames:
  alpha: "Alpha"
currentVersion: "alpha"
---

# CLIFF Localization Suite

**CLIFF Localization Suite**（Contextual Localization Integrated File Format for Unreal Engine）把 **CLIFF 1.0** 接入虚幻引擎官方本地化链路。它在官方 `GatherText` 管线里新增 `CliffImport` / `CliffExport` / `CliffAITranslate` 三个步骤，让 `.cliff` 与 UE 的 manifest / archive / `.locres` 之间双向转换，并内置 **DeepSeek AI 自动翻译**。

插件不修改引擎源码、不旁路官方二进制格式：所有写入都走官方 `FLocTextHelper` 与 `FTextLocalizationResourceGenerator`，因此 Dashboard、Translation Editor、打包流程看到的数据与官方工作流完全一致。

## 核心能力

- **CLIFF 1.0 完整解析与校验** — `FCliffDocument` 覆盖 header / group / entry 全部字段，与参考实现 `cliff_format.validate()` 判定一致
- **导入** — `.cliff` → manifest / archive → 官方编译 `.locmeta` / `.locres` → 热刷新，一次执行完成
- **导出** — manifest + 各 culture archive（或直接读 `.locres`）→ 按 culture 输出 `.cliff` + `.cliffmap.json` 原键侧车
- **语义映射** — clan ↔ UE Namespace、Namespace → `type` / `emotion` 规则全部可在项目设置中调整，不硬编码
- **DeepSeek AI 翻译** — 只补缺失译文、多语言并发、占位符校验、自翻译与空译文防护、CLIFF 自动修复闭环
- **官方工作流融入** — Localization Dashboard 工具栏按钮 + 官方同款进度窗口 + 控制台命令，无自建窗口

## 选择版本

- **[Alpha →](alpha/)** — 当前最新版本：CLIFF 双向转换、官方管线集成、DeepSeek AI 翻译（`0.1.0-alpha.1`）
- **v1.0** — 规划中（文档尚未发布）
