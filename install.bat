@echo off
:: =============================================================================
:: Tab Sorter AI — Windows Install Script
:: Checks Node.js, copies .env.example, installs dependencies, builds the app,
:: and prints available npm scripts.
:: =============================================================================

setlocal enabledelayedexpansion
title Tab Sorter AI — Install

echo.
echo ============================================================
echo   Tab Sorter AI -- Install Script
echo ============================================================
echo.

:: ── Step 1: Check Node.js ────────────────────────────────────────────────────
echo [1/4] Checking Node.js...

where node >nul 2>&1
if errorlevel 1 (
    echo [ERR] Node.js is not installed or not in PATH.
    echo       Download Node.js 20+ from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo [ OK ] Node.js %NODE_VERSION% found

:: Extract major version number (strip leading 'v')
set NODE_MAJOR=%NODE_VERSION:v=%
for /f "tokens=1 delims=." %%m in ("%NODE_MAJOR%") do set NODE_MAJOR=%%m

if %NODE_MAJOR% LSS 20 (
    echo [ERR] Node.js 20 or later is required. Found: %NODE_VERSION%
    echo       Download the latest LTS from https://nodejs.org/
    exit /b 1
)

echo [ OK ] Node.js version requirement met (20+)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERR] npm not found. It should be bundled with Node.js -- please reinstall Node.js.
    exit /b 1
)

for /f "tokens=*" %%v in ('npm --version') do set NPM_VERSION=%%v
echo [ OK ] npm %NPM_VERSION% found

:: ── Step 2: Set up .env file ─────────────────────────────────────────────────
echo.
echo [2/4] Setting up environment...

if exist ".env" (
    echo [ OK ] .env already exists -- skipping copy
) else if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo [WARN] .env created from .env.example
    echo [WARN] Open .env and set GEMINI_API_KEY before using AI features.
    echo [WARN] Get a free key at: https://aistudio.google.com/app/apikey
) else (
    echo [WARN] .env.example not found. Create .env manually with:
    echo [WARN]   GEMINI_API_KEY=your_key_here
)

:: ── Step 3: Install dependencies ─────────────────────────────────────────────
echo.
echo [3/4] Installing dependencies...

npm install
if errorlevel 1 (
    echo [ERR] npm install failed. Check the output above for details.
    exit /b 1
)

echo [ OK ] Dependencies installed

:: ── Step 4: Build ────────────────────────────────────────────────────────────
echo.
echo [4/4] Building for production...

npm run build
if errorlevel 1 (
    echo [ERR] Build failed. Run "npm run lint" and "npm run typecheck" to diagnose.
    exit /b 1
)

echo [ OK ] Production build complete (dist/)

:: ── Print usage ───────────────────────────────────────────────────────────────
echo.
echo ============================================================
echo   Tab Sorter AI -- Installation complete!
echo ============================================================
echo.
echo Available scripts:
echo.
echo   npm run dev             Start development server at http://localhost:3000
echo   npm run build           Build for production (outputs to dist/)
echo   npm run preview         Preview the production build at http://localhost:4173
echo   npm run typecheck       Run TypeScript type checking
echo   npm run lint            Run ESLint + TypeScript checks
echo   npm run lint:fix        Auto-fix ESLint issues
echo   npm run format          Format all files with Prettier
echo   npm run format:check    Check formatting without writing changes
echo   npm test                Run all tests once
echo   npm run test:watch      Run tests in watch mode
echo   npm run test:coverage   Run tests with coverage report
echo   npm run clean           Remove dist/ directory
echo.
echo Next step: edit .env and set GEMINI_API_KEY, then run "npm run dev"
echo.

endlocal
