#Requires -Version 5.1
# =============================================================================
# Tab Sorter AI — PowerShell Install Script
# Checks Node.js >= 20, copies .env.example to .env, installs dependencies
# via npm ci, runs the test suite (non-fatal), and prints available scripts.
# =============================================================================

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Colour helpers ────────────────────────────────────────────────────────────
function Write-Info    ($msg) { Write-Host "[Tab-Sorter] $msg" -ForegroundColor Cyan }
function Write-Success ($msg) { Write-Host "[  OK  ] $msg"     -ForegroundColor Green }
function Write-Warn    ($msg) { Write-Host "[ WARN ] $msg"     -ForegroundColor Yellow }
function Write-Err     ($msg) { Write-Host "[ ERR  ] $msg"     -ForegroundColor Red }

# ── Resolve script root ───────────────────────────────────────────────────────
$ScriptRoot = $PSScriptRoot
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}

Write-Host ""
Write-Host "Tab Sorter AI -- Install Script" -ForegroundColor Cyan -NoNewline
Write-Host ""
Write-Info "Working directory: $ScriptRoot"

# ── Step 1: Check Node.js >= 20 ───────────────────────────────────────────────
Write-Host ""
Write-Host "── Step 1/4 · Checking Node.js ──────────────────────────────" -ForegroundColor Cyan

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Err "Node.js is not installed or not in PATH."
    Write-Err "Download Node.js 20+ from https://nodejs.org/"
    exit 1
}

$nodeVersionString = (node --version).TrimStart('v')
$nodeMajor = [int]($nodeVersionString -split '\.')[0]

if ($nodeMajor -lt 20) {
    Write-Err "Node.js 20 or later is required. Found: v$nodeVersionString"
    Write-Err "Download the latest LTS from https://nodejs.org/"
    exit 1
}

Write-Success "Node.js v$nodeVersionString -- requirement met (20+)"

$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmCmd) {
    Write-Err "npm not found. It should be bundled with Node.js -- please reinstall Node.js."
    exit 1
}

$npmVersion = npm --version
Write-Success "npm v$npmVersion"

# ── Step 2: Set up .env file ──────────────────────────────────────────────────
Write-Host ""
Write-Host "── Step 2/4 · Environment setup ─────────────────────────────" -ForegroundColor Cyan

Push-Location $ScriptRoot
try {
    if (Test-Path '.env') {
        Write-Success ".env already exists -- skipping copy"
    }
    elseif (Test-Path '.env.example') {
        Copy-Item '.env.example' '.env'
        Write-Warn ".env created from .env.example"
        Write-Warn "Open .env and set GEMINI_API_KEY before using AI features."
        Write-Warn "Get a free key at: https://aistudio.google.com/app/apikey"
    }
    else {
        Write-Warn ".env.example not found. Create .env manually:"
        Write-Warn "  GEMINI_API_KEY=your_key_here"
    }
}
finally {
    Pop-Location
}

# ── Step 3: Install dependencies ──────────────────────────────────────────────
Write-Host ""
Write-Host "── Step 3/4 · Installing dependencies ───────────────────────" -ForegroundColor Cyan

Push-Location $ScriptRoot
try {
    if (Test-Path 'package-lock.json') {
        Write-Info "Running: npm ci  (reproducible install from lock file)"
        npm ci
    }
    else {
        Write-Info "No package-lock.json found -- running: npm install"
        npm install
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Err "Dependency installation failed. Check the output above."
        exit 1
    }

    Write-Success "Dependencies installed"
}
finally {
    Pop-Location
}

# ── Step 4: Run tests (non-fatal) ─────────────────────────────────────────────
Write-Host ""
Write-Host "── Step 4/4 · Running test suite ────────────────────────────" -ForegroundColor Cyan

Push-Location $ScriptRoot
try {
    Write-Info "Running: npm test"
    npm test
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All tests passed"
    }
    else {
        Write-Warn "Some tests failed -- the app may still work, but review the output above."
        Write-Warn "Run 'npm test' manually to investigate."
    }
}
catch {
    Write-Warn "Test run encountered an error: $_"
    Write-Warn "Run 'npm test' manually to investigate."
}
finally {
    Pop-Location
}

# ── Print usage ───────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Tab Sorter AI -- Installation complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Available scripts:" -ForegroundColor White
Write-Host ""

$scripts = @(
    @{ Cmd = "npm run dev";            Desc = "Start development server at http://localhost:3000" },
    @{ Cmd = "npm run build";          Desc = "Build for production (outputs to dist/)" },
    @{ Cmd = "npm run preview";        Desc = "Preview the production build at http://localhost:4173" },
    @{ Cmd = "npm run typecheck";      Desc = "Run TypeScript type checking" },
    @{ Cmd = "npm run lint";           Desc = "Run ESLint + TypeScript checks" },
    @{ Cmd = "npm run lint:fix";       Desc = "Auto-fix ESLint issues" },
    @{ Cmd = "npm run format";         Desc = "Format all files with Prettier" },
    @{ Cmd = "npm run format:check";   Desc = "Check formatting without writing changes" },
    @{ Cmd = "npm test";               Desc = "Run all tests once" },
    @{ Cmd = "npm run test:watch";     Desc = "Run tests in watch mode" },
    @{ Cmd = "npm run test:coverage";  Desc = "Run tests with coverage report" },
    @{ Cmd = "npm run clean";          Desc = "Remove dist/ directory" }
)

foreach ($s in $scripts) {
    Write-Host ("  {0,-30} {1}" -f $s.Cmd, $s.Desc)
}

Write-Host ""
Write-Host "Next step: " -NoNewline -ForegroundColor Cyan
Write-Host "edit .env and set GEMINI_API_KEY, then run " -NoNewline
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
