# 安装

1. 设置 → 扩展 → 添加扩展，选择本目录或 Git URL。
2. 允许访问：
   - `~/.config/opencode/agents/build.md`
   - `~/.config/openchamber/prompt-override/**`
3. 打开「内置提示词」，应用覆盖或还原为空。

注意：

- 覆盖替换 build 的 system prompt，不是追加规则。
- 还原固定写回空 stub，交回 OpenCode 默认；不会恢复覆盖前的非空内容，需要保留请先备份。
- 本扩展不包含内置 prompt 正文。
- 卸载前先还原为空。
