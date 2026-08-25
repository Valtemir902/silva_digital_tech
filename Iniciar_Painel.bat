@echo off
title Inicializando Control Center - Silva Digital Tech...
color 0b
echo ========================================================
echo        Iniciando o Silva Digital Tech Control Center
echo ========================================================
echo.
echo Carregando interface grafica profissional...
cd /d "%~dp0"
start /B python painel_admin.py
exit