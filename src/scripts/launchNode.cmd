@echo off
set SERVER=RPCGateway.mjs
title %SERVER%

set NODE_PATH="C:\Program Files\nodejs\node.exe"
set NODE_SCRIPT_PATH="C:\Users\gzbze\kanbear\src\scripts"

if not exist %NODE_PATH% (
    echo Error Node not found %NODE_PATH%
    pause
    exit /b 1
)

if not exist %NODE_SCRIPT_PATH% (
    echo Error :  %NODE_SCRIPT_PATH% not found
    pause
    exit /b 1
)

cd %NODE_SCRIPT_PATH%

set PORT=3001
echo Node.js : %SERVER% /min %NODE_PATH% %SERVER% %PORT% 
start %SERVER% /min %NODE_PATH% %SERVER% %PORT%
pause

echo %SERVER% shutting down
taskkill /f /FI "WINDOWTITLE eq %SERVER%" /im node.exe >nul 2>&1
echo %SERVER% stopped
pause
