@echo off
title Drug Reaction Dashboard - Setup
color 0A
echo ============================================
echo   Drug Reaction Dashboard - Auto Setup
echo ============================================
echo.

:: -------------------------------------------
:: Check for admin privileges
:: -------------------------------------------
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] This script requires Administrator privileges.
    echo     Right-click setup.bat and select "Run as administrator"
    pause
    exit /b 1
)

:: -------------------------------------------
:: Step 1: Enable WSL2 (required for Docker)
:: -------------------------------------------
echo [1/6] Checking Windows features (WSL2, Virtual Machine Platform)...

:: Check if WSL is already working
wsl --status >nul 2>&1
if %errorlevel% equ 0 (
    echo       WSL2 is already enabled.
    goto :check_docker
)

:: Enable required Windows features
echo       Enabling WSL and Virtual Machine Platform...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart >nul 2>&1
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart >nul 2>&1

:: Install/update WSL
echo       Installing WSL2...
wsl --install --no-distribution >nul 2>&1
wsl --set-default-version 2 >nul 2>&1

:: Check if a reboot is needed (features just enabled for the first time)
:: We check by trying wsl --status again
wsl --status >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  =============================================
    echo   Windows features have been enabled.
    echo   A RESTART is required before continuing.
    echo.
    echo   After restart, run this script again.
    echo  =============================================
    echo.
    set /p REBOOT=  Restart now? (Y/N):
    if /i "%REBOOT%"=="Y" shutdown /r /t 10 /c "Restarting for Docker setup..."
    pause
    exit /b 0
)

echo       WSL2 is ready.

:check_docker
:: -------------------------------------------
:: Step 2: Check/Install Docker Desktop
:: -------------------------------------------
echo [2/6] Checking for Docker Desktop...

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
    echo       Installing via winget (this may take a few minutes)...
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
        echo.
        set /p REBOOT=  Restart now? (Y/N):
        if /i "%REBOOT%"=="Y" shutdown /r /t 10 /c "Restarting for Docker setup..."
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
echo.
set /p REBOOT=  Restart now? (Y/N):
if /i "%REBOOT%"=="Y" shutdown /r /t 10 /c "Restarting for Docker setup..."
pause
exit /b 0

:check_docker_running
:: -------------------------------------------
:: Step 3: Ensure Docker Desktop is running
:: -------------------------------------------
echo [3/6] Ensuring Docker Desktop is running...

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    echo       Waiting for Docker engine to be ready (can take up to 90 seconds)...
    set /a attempts=0
    :wait_loop
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% equ 0 goto :docker_ready
    set /a attempts+=1
    echo       ... still waiting (%attempts%/18)
    if %attempts% lss 18 goto :wait_loop

    echo [ERROR] Docker Desktop did not start in time.
    echo         Please start Docker Desktop manually and run this script again.
    pause
    exit /b 1
)

:docker_ready
echo       Docker engine is running.

:: -------------------------------------------
:: Step 4: Build and start all services
:: -------------------------------------------
echo [4/6] Building and starting all services (first run takes 3-5 minutes)...
echo.

:: Change to the directory where this script lives
cd /d "%~dp0"

docker compose up --build -d 2>nul
if %errorlevel% neq 0 (
    :: Try legacy docker-compose command
    docker-compose up --build -d
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start services. Check the output above for details.
        pause
        exit /b 1
    )
)

:: -------------------------------------------
:: Step 5: Wait for backend to be healthy
:: -------------------------------------------
echo.
echo [5/6] Waiting for services to be ready...
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
:: Step 6: Extract sample data
:: -------------------------------------------
echo [6/6] Extracting sample data file...
timeout /t 5 /nobreak >nul
docker cp med_datagen:/output/drug_reactions_sample.xlsx "%~dp0drug_reactions_sample.xlsx" >nul 2>&1
if exist "%~dp0drug_reactions_sample.xlsx" (
    echo       Sample file ready: drug_reactions_sample.xlsx (3000 records)
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
echo     3. Go to "Upload Data" page
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
