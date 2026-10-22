# 内置提示词 · openchamber-prompt

当前版本 **0.1.5**，核对日期 **2026-10-22**。在 OpenChamber 中管理 OpenCode `build` agent 的提示词覆盖文件：一键应用、预览差异、备份、还原内置。

> 本仓库只发布扩展框架，不包含任何提示词正文。编辑框默认空白，请填入你要应用的提示词。

> 这里管理的是 **`~/.config/opencode/agents/build.md`**，它会替换 build agent 的内置 system prompt，不是追加规则。全局 `AGENTS.md` 仍由「规则方案」扩展管理，两者互不替代。

## 与规则方案的区别

| | 规则方案 `openchamber-agents` | 本扩展 `openchamber-prompt` |
| --- | --- | --- |
| 目标 | `~/.config/opencode/AGENTS.md` | `~/.config/opencode/agents/build.md` |
| 语义 | 追加指令 | 替换 build 的 system prompt |
| 影响 | 规则文本层 | 智能体基础提示词层 |
| 还原 | 切回另一个方案 | 写回基线 stub |

## 安装

### 从 GitHub 安装（可自动更新）

在 OpenChamber **设置 → 扩展 → 添加扩展** 中粘贴：

```text
https://github.com/chenyuhao0628/openchamber-prompt
```

设置页会按仓库根 `package.json` 的 `version` 检查更新。有新版本时，卡片会显示「更新」。只有 Git URL 安装会自动更新；文件夹和 zip 安装需要手动替换。

### 从文件夹安装（开发）

在本目录运行：

```sh
npm ci
npm run typecheck
npm test
```

然后在 OpenChamber **设置 → 扩展 → 添加扩展 → 文件夹** 选择本目录。宿主会显示两个文件范围：

| 范围 | 用途 |
| --- | --- |
| `~/.config/opencode/agents/build.md` | 读取、替换与还原 build 提示词 |
| `~/.config/openchamber/prompt-override/**` | 覆盖状态与备份 |

安装或修改后，新建会话确认提示词加载；已有会话是否重新加载由 OpenCode 决定。

## 日常使用

1. 从右侧「内置提示词」或工作状态分区进入。
2. 顶部显示当前状态：使用内置提示词 / 已应用覆盖 / 文件已被外部修改 / build.md 缺失。
3. **覆盖内容**：编辑框常显，默认空白；填入你要应用的提示词后点底部「应用覆盖」，先预览与当前文件的差异，确认后备份并写入。
4. **还原内置**：预览后写回基线 stub；空正文等于不覆盖，因此不需要删除文件。
5. **备份**：每次写入前自动备份；选择时间可查看原文并预览恢复。

应用或还原后建议新建会话验证；面板只表示文件状态，不代表已有会话已加载。

## 状态

| 状态 | 判定 | 含义 |
| --- | --- | --- |
| `使用内置提示词` | 当前内容等于基线 stub | 未覆盖 |
| `已应用覆盖` | 当前内容等于上次写入内容 | 覆盖生效 |
| `文件已被外部修改` | 两者都不等 | 需要重新预览，不静默覆盖 |
| `build.md 缺失` | 文件不存在 | 应用会创建，还原会写回 stub |

## 风险与限制

- **整体替换**：覆盖文本会替换 build 的完整 system prompt；工具策略、代码引用等必须保留在覆盖文本里。
- **所有 provider**：一份覆盖会作用于所有 provider；如果某个 provider 的内置 prompt 不同，也会被盖掉。
- **上游漂移**：OpenCode 升级后内置 prompt 可能变化；本扩展内置的基线不会自动更新，也不会读取二进制里的新文本。界面显示基线日期，升级后建议重新评估。
- **卸载残留**：移除扩展不会自动还原 `build.md`；卸载前请先点“还原内置”。
- **空正文**：stub 的空正文等于不覆盖；还原写回 stub 而不是删除文件，因为 SDK 没有删除接口。
- **中文目录**：当前项目路径含中文等字符时，宿主文件请求可能返回 `Extension operation failed.`；可暂时在无项目会话中从右侧图标进入。该问题属于宿主接口，不是本扩展的数据损坏。
- **无自动 rebase**：扩展没有 exec 权限，读不到 `/Applications/.../opencode`；基线只能随扩展版本更新或由用户提供。

## 开发

```sh
npm run build
npm run watch
npm run typecheck
npm test
```

`npm test` 的 `pretest` 会先构建；面板产物为 `panel/main.js`、`panel/section.js`。业务 CSS 与 `ui/native.css` 由 esbuild 以内联文本打包。

| 目录 | 职责 |
| --- | --- |
| `src/core/` | 状态校验、差异、备份与写入流程 |
| `src/platform/` | SDK 文件接口与错误说明 |
| `src/panel/` | 面板、状态分区、SDK 控件 |
| `tests/` | 内存文件夹具：应用、还原、漂移、冲突、备份 |

## 验证记录

2026-10-21，本机 OpenChamber 2.5.0 / SDK 2.0.3：

- `npm run typecheck` 通过。
- `npm test` 构建通过，10 项测试通过。
- 工作状态摘要与规则方案 0.1.6 对齐：20px 状态行、底栏无额外上边距，清单高度 56px；隔离预览测得两者内容高度均为 56px。
- 合成宿主预览检查了面板与状态分区：头部、页签、底栏与「规则方案」对齐；应用/还原差异、备份页、权限错误、深色主题和 280/400px 宽度均可用。
- 宿主安装、文件授权与面板交互尚未在本机验收；安装后需检查侧栏、状态分区、应用/还原差异和备份恢复。

## 官方依据

- [OpenCode V2 配置](https://opencode.ai/v2/docs/config)
- [OpenCode V2 Agents](https://opencode.ai/v2/docs/agents)
- [OpenChamber SDK](https://github.com/openchamber/openchamber/blob/main/packages/sdk/API.md)

官方字段以锁定 SDK 和本机宿主实际行为为准。
