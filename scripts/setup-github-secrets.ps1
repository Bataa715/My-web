# GitHub Secrets Setup Script (PowerShell)
# Энэ скриптийг Windows дээр ажиллуулж GitHub Secrets-ийг тохируулна

Write-Host "🔧 GitHub Secrets тохируулах скрипт" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if gh CLI is installed
try {
    $null = Get-Command gh -ErrorAction Stop
    Write-Host "✅ GitHub CLI суусан" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI (gh) суулгаагүй байна" -ForegroundColor Red
    Write-Host "📦 Суулгах: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "PowerShell: winget install --id GitHub.cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔐 GitHub-д нэвтэрнэ үү..." -ForegroundColor Yellow
    gh auth login
}

Write-Host "✅ GitHub бэлэн" -ForegroundColor Green
Write-Host ""

# Read environment variables from .env.local
$EnvFile = "apps\nextn\.env.local"

if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ $EnvFile файл олдсонгүй" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Environment variables уншиж байна..." -ForegroundColor Cyan
Write-Host ""

# Read file and set secrets
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    
    # Skip comments and empty lines
    if ($line -match '^#' -or [string]::IsNullOrWhiteSpace($line)) {
        return
    }
    
    # Parse key=value
    $parts = $line -split '=', 2
    if ($parts.Count -ne 2) {
        return
    }
    
    $key = $parts[0].Trim()
    $value = $parts[1].Trim()
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "⚠️  $key - хоосон утга, алгассан" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔒 $key тохируулж байна..." -ForegroundColor Cyan
    
    # Set GitHub secret
    $value | gh secret set $key
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $key амжилттай" -ForegroundColor Green
    } else {
        Write-Host "❌ $key алдаа гарлаа" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ""
Write-Host "🎉 Бүх secrets тохируулагдлаа!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Баталгаажуулах:" -ForegroundColor Cyan
Write-Host "gh secret list" -ForegroundColor Yellow
