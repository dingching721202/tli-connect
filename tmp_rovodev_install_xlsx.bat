@echo off
echo 正在安裝 xlsx 套件...
cd /d "%~dp0"
npm install xlsx@^0.18.5 @types/xlsx@^0.0.36
echo.
echo 安裝完成！請重新啟動開發伺服器。
echo.
pause