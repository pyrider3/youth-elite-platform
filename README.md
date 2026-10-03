# 青年菁英协会网站

青年菁英生涯发展协会官网、志愿时长登记、报名管理和文件协助处理平台。后台使用 Node.js 原生 HTTP 服务、SQLite 和 HTML/CSS/JavaScript；官网为独立静态页面。

## 功能

- 协会官网：沉浸式介绍、活动照片、部门介绍、公众号展示与常驻报名入口，文件位于 [`official-site/`](official-site/README.md)，现有访问地址为 <https://sxufe.qnjyxh.xyz/>。
- 公众登记志愿时长，管理员审核、修改、删除和导出，统计仅包含已通过记录。
- 青年菁英生涯发展协会报名：小菁交互式报名、手动表单、按部门查看和筛选、已联系标记。
- 大数据分析与机器学习实践社报名和独立管理页面。
- 文件工具：上传文件并描述要求，自由选择本机 Codex 或 Antigravity，查看进度并下载结果。

## 本地启动

官网可单独预览和部署，见 [`official-site/README.md`](official-site/README.md)。下面的步骤用于后台与报名平台。

需要 Node.js 22.13 或更新版本（使用 `node:sqlite`）。当前项目没有额外 npm 依赖。

1. 克隆仓库后进入项目根目录。
2. 创建 `data/` 目录，将 `admin-passwords.example.json` 复制为 `data/admin-passwords.json`。
3. 为需要启用的管理员角色填写密码字符串数组。例如 `"superadmin": ["自行设定密码"]`。空数组表示该角色无法登录。配置文件不要提交到 Git。
4. 执行 `npm start`，访问 `http://localhost:3000`。

Windows 可双击 `运行志愿时长后台.cmd`。单独运行报名网站时双击 `运行报名后台.cmd`，使用端口 3001；也可设置 `PORT=3001` 和 `SIGNUP_ONLY=1` 后运行 `node server.js`。

## 页面

| 服务 | 路径 |
| --- | --- |
| 志愿时长登记、统计及管理员后台 | `/` |
| 文件协助处理 | `/gj` |
| 大数据社报名管理 | `/dsj`（主服务） |
| 小菁报名 | `/` 或 `/qing`（报名服务） |
| 手动报名 | `/biao`（报名服务） |
| 大数据社报名 | `/dsj`（报名服务） |

报名服务通过 `SIGNUP_ONLY=1` 启用；原部署也根据 `new.qnjyxh.xyz` 主机名选择报名页面。

## 管理员角色

`superadmin` 为超级管理员；`auditadmin` 为审核管理员；`applicationviewer` 可查看全部报名表并使用文件工具；`office`、`media`、`project`、`practice` 为部门管理员；`dsj` 为大数据社管理员。实际权限以服务端校验为准。

## AI 文件处理

AI 功能依赖服务器电脑上已安装、已登录的 CLI，克隆代码不会带入这些程序或登录凭据。

- Antigravity：通过 `AGY_PATH` 指定可执行文件；默认查找用户目录下 `agy/bin/agy.exe`，也支持 `data/file-assistant-agy/agy.exe`。文件任务自动批准 CLI 工具操作，并保留 `--sandbox` 参数。
- Codex：默认查找本机 Codex 应用的可执行文件。文件处理使用独立的 `data/file-assistant-codex/` 配置目录，部署者需自行完成相应 CLI 配置与认证。
- 引擎按用户选择执行；失败不会自动切换另一个引擎。上传内容可能发送至对应模型服务。

## 数据与部署

数据库、附件、处理任务、CLI 程序及凭据保存在 `data/`，已通过 `.gitignore` 排除。应单独备份此目录，GitHub 只保存代码与网页资源。

原部署使用 Cloudflare Tunnel 连接本机 3000 和 3001 端口。隧道登录信息、DNS 配置和这台电脑专用的服务守护脚本不在仓库内，新环境需要自行配置。

仓库未声明第三方资源的再分发许可；公开发布或复用第三方素材前，请核实其原始许可。
