# 青年菁英生涯发展协会官网

当前线上官网：<https://sxufe.qnjyxh.xyz/>。

此目录保存线上官网的 HTML、CSS、JavaScript、字体和图片。网站为纯静态页面，无需安装 npm 依赖或执行构建。

## 本地预览

在仓库根目录运行以下任一命令，访问 <http://localhost:8099/>：

```powershell
# 已安装 Python 时
python -m http.server 8099 --bind 127.0.0.1 --directory official-site

# 已安装 Caddy 时
caddy file-server --listen 127.0.0.1:8099 --root ./official-site
```

请通过 HTTP 预览。直接双击 `index.html` 会使浏览器阻止模块脚本，动效无法正常运行。

## 部署

将 `official-site` 的内容放入静态网站服务的根目录，并保持 `assets/` 和 `index.html` 的相对位置。使用 Caddy 时，可在现有配置中添加一个站点，例如：

```caddyfile
:8090 {
    root * /absolute/path/to/official-site
    encode zstd gzip
    file_server
}
```

修改 `root` 为实际目录。如果使用 Cloudflare Tunnel，将官网域名指向对应的本机服务端口。已有网站的域名与隧道配置不会随 Git 上传自动迁移。

报名入口保持指向 <https://new.qnjyxh.xyz/>，报名服务独立运行。

## 文件与许可

- `index.html`：页面内容与导航。
- `assets/experience.js`：页面交互和滚动动效。
- `assets/experience.css`、`assets/continuous-motion.css`：样式和持续动效。
- `assets/club/`：协会图片和二维码。
- `THIRD_PARTY_NOTICES.md`、`LICENSE-*.txt`：现有第三方声明和许可。

协会照片、文案和二维码由网站所有者提供；相关使用范围不由第三方 MIT 许可证授予。

此目录只包含网站文件；本机日志、隧道凭据与电脑专用服务配置不纳入版本控制。
