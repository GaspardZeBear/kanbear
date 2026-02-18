@echo off
title Node.js

set NODE_PATH="C:\Program Files\nodejs\node.exe"
set NODE_SCRIPT_PATH="C:\Users\gzbze\kanbear\src\scripts"

if not exist %NODE_PATH% (
    echo Erreur : Node.js introuvable à %NODE_PATH%
    pause
    exit /b 1
)

if not exist %NODE_SCRIPT_PATH% (
    echo Erreur : Script Node.js introuvable à %NODE_SCRIPT_PATH%
    pause
    exit /b 1
)

echo Démarrage du serveur Node.js...
cd %NODE_SCRIPT_PATH%
set SERVER=RPCGateway.mjs
set PORT=3001
echo Démarrage du serveur Node.js... %SERVER%
start "Node.js" /min %NODE_PATH% %SERVER% %PORT%

echo Tous les serveurs sont démarrés.
echo - Node.js : %NODE_SCRIPT_PATH% : 
echo Appuyez sur une touche pour arrêter tous les serveurs...

pause

:: Arrêter les serveurs
echo Arrêt des serveurs en cours...

taskkill /f /im node.exe >nul 2>&1

echo Tous les serveurs sont arrêtés.
pause
