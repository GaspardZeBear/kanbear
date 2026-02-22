@echo off
setlocal enabledelayedexpansion

:: Configuration
set SERVER=RPCGateway
set NODE_PATH="C:\Program Files\nodejs\node.exe"
set NODE_SCRIPT_PATH="C:\Users\gzbze\kanbear\src\scripts\%SERVER%.mjs"
set PORT=3001

%NODE_PATH% %NODE_SCRIPT_PATH% %PORT%
pause
