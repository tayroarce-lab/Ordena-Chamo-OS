@echo off
title Chamos FastFlow - Development Server
echo.
echo =============================================
echo   Iniciando Chamos FastFlow
echo =============================================
echo.

REM Verificar si estamos en el directorio correcto
if not exist "chamos-house" (
    echo Error: Ejecuta este script desde la raiz del proyecto
    exit /b 1
)

REM Crear dos ventanas: una para backend, otra para frontend
echo Iniciando Backend en puerto 3001...
start "Backend Chamos" cmd /k "cd chamos-house\backend && npm run dev"

timeout /t 3 /nobreak

echo Iniciando Frontend en puerto 5173...
start "Frontend Chamos" cmd /k "cd chamos-house\frontend && npm run dev"

echo.
echo =============================================
echo Servidores iniciados:
echo - Backend:  http://localhost:3001
echo - Frontend: http://localhost:5173
echo - API:      http://localhost:3001/api
echo =============================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause
