# 安装说明

1. 在 OpenChamber **设置 → 扩展 → 添加扩展** 选择以下任一方式：
   - **Git URL（推荐，可自动更新）**：`https://github.com/chenyuhao0628/openchamber-prompt`
   - **文件夹**：选择 `openchamber-prompt/` 目录（开发时使用，不会自动更新）。
2. 宿主会显示文件范围，确认允许：
   - `~/.config/opencode/agents/build.md`
   - `~/.config/openchamber/prompt-override/**`
3. 打开右侧「内置提示词」，先点“重新读取”，确认状态为“使用内置提示词”。
4. 填入提示词，点“应用覆盖”，查看差异后确认写入；新建会话验证提示词是否生效。
5. 如需恢复，点“还原内置”，预览后确认；同样建议新建会话确认。

注意：

- 本扩展替换 build 的完整 system prompt，不是追加规则。
- 卸载扩展不会自动还原 `build.md`；卸载前先执行“还原内置”。
- 项目路径含中文等字符时，宿主文件接口可能报 `Extension operation failed.`；可暂时在无项目会话中从右侧图标进入。
