@echo off
echo ==============================================================
echo Extraction des couches Spring Boot (snapshot-dependencies...)
echo ==============================================================
powershell -ExecutionPolicy Bypass -File "%~dp0extract-layers.ps1"
pause
