@echo off
title Drug Reaction Dashboard - Setup
color 0A
echo ============================================
echo   Drug Reaction Dashboard - Auto Setup
echo ============================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] This script requires Administrator privileges.
    echo     Right-click setup.bat and select "Run as administrator"
    pause
    exit /b 1
)

:: -------------------------------------------
:: Step 1: Check/Install Docker Desktop
:: -------------------------------------------
echo [1/5] Checking for Docker Desktop...

where docker >nul 2>&1
if %errorlevel% equ 0 (
    echo       Docker is already installed.
    goto :check_docker_running
)

echo       Docker not found. Installing Docker Desktop...
echo.

:: Try winget first (Windows 10 1709+ / Windows 11)
where winget >nul 2>&1
if %errorlevel% equ 0 (
    echo       Installing via winget...
    winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
    if %errorlevel% equ 0 (
        echo.
        echo       Docker Desktop installed successfully.
        echo.
        echo  =============================================
        echo   IMPORTANT: A system RESTART is required
        echo   for Docker to work properly.
        echo.
        echo   After restart, run this script again.
        echo  =============================================
        pause
        exit /b 0
    )
)

:: Fallback: download installer directly via PowerShell
echo       winget not available. Downloading Docker Desktop installer...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe' -OutFile '%TEMP%\DockerInstaller.exe' -UseBasicParsing }"

if not exist "%TEMP%\DockerInstaller.exe" (
    echo [ERROR] Failed to download Docker Desktop.
    echo         Please install Docker Desktop manually from:
    echo         https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo       Running Docker Desktop installer (this may take a few minutes)...
start /wait "" "%TEMP%\DockerInstaller.exe" install --quiet --accept-license
del "%TEMP%\DockerInstaller.exe" >nul 2>&1

echo.
echo  =============================================
echo   Docker Desktop installed successfully.
echo   IMPORTANT: A system RESTART is required.
echo.
echo   After restart, run this script again.
echo  =============================================
pause
exit /b 0

:check_docker_running
:: -------------------------------------------
:: Step 2: Ensure Docker Desktop is running
:: -------------------------------------------
echo [2/5] Ensuring Docker Desktop is running...

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    echo       Waiting for Docker to be ready (this may take up to 60 seconds)...
    set /a attempts=0
    :wait_loop
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% equ 0 goto :docker_ready
    set /a attempts+=1
    if %attempts% lss 12 goto :wait_loop

    echo [ERROR] Docker Desktop did not start in time.
    echo         Please start Docker Desktop manually and run this script again.
    pause
    exit /b 1
)

:docker_ready
echo       Docker is running.

:: -------------------------------------------
:: Step 3: Build and start all services
:: -------------------------------------------
echo [3/5] Building and starting all services (first run takes 3-5 minutes)...
echo.

docker compose up --build -d
if %errorlevel% neq 0 (
    :: Try legacy docker-compose command
    docker-compose up --build -d
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start services.
        pause
        exit /b 1
    )
)

:: -------------------------------------------
:: Step 4: Wait for backend to be healthy
:: -------------------------------------------
echo.
echo [4/5] Waiting for services to be ready...
set /a attempts=0
:health_loop
timeout /t 3 /nobreak >nul
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/login' -Method POST -Body '{\"username\":\"test\",\"password\":\"test\"}' -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop; exit 0 } catch { if ($_.Exception.Response) { exit 0 } else { exit 1 } }" >nul 2>&1
if %errorlevel% equ 0 goto :backend_ready
set /a attempts+=1
if %attempts% lss 20 goto :health_loop
echo       Backend is taking longer than expected, but services may still be starting...

:backend_ready
echo       All services are up.

:: -------------------------------------------
:: Step 5: Extract sample data
:: -------------------------------------------
echo [5/5] Extracting sample data file...
timeout /t 5 /nobreak >nul
docker cp med_datagen:/output/drug_reactions_sample.xlsx "%~dp0drug_reactions_sample.xlsx" >nul 2>&1
if exist "%~dp0drug_reactions_sample.xlsx" (
    echo       Sample file: drug_reactions_sample.xlsx (3000 records)
) else (
    echo       Sample file generation in progress, run this to get it later:
    echo       docker cp med_datagen:/output/drug_reactions_sample.xlsx .
)

:: -------------------------------------------
:: Done!
:: -------------------------------------------
echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo   Application:  http://localhost:3000
echo   Login:        admin / admin
echo.
echo   Next steps:
echo     1. Open http://localhost:3000 in your browser
echo     2. Login with admin / admin
echo     3. Go to Upload Data page
echo     4. Upload drug_reactions_sample.xlsx
echo     5. View charts on the Dashboard
echo.
echo   To stop:  docker compose down
echo   To reset: docker compose down -v
echo ============================================
echo.

:: Open browser automatically
start http://localhost:3000

pause
