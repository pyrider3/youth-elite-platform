@echo off
cd /d "%~dp0"
echo 正在启动青年菁英志愿时长登记系统...
echo 请在本机浏览器打开：http://localhost:3000
echo 如需让同一局域网的设备访问，请使用本机 IP 地址加端口 3000。
node server.js
