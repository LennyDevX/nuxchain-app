param(
    [switch]$ToV2,      # Switch TO gemini-embedding-2-preview (forward)
    [switch]$ToV1,      # Switch BACK to gemini-embedding-001 (rollback)
    [switch]$Vercel,    # Also push to Vercel env vars
    [switch]$DryRun     # Preview changes without applying them
)

# =====================================================================
# ROLLBACK / SWITCH DE MODELO DE EMBEDDINGS
# =====================================================================
# Propósito: Cambiar entre gemini-embedding-001 y gemini-embedding-2-preview
#            de forma instantánea, sin tocar ningún archivo de código.
#
# Uso:
#   .\scripts\rollback-embedding.ps1 -ToV2           # Activa Embedding 2
#   .\scripts\rollback-embedding.ps1 -ToV1           # Rollback a 001
#   .\scripts\rollback-embedding.ps1 -ToV2 -Vercel   # + sube a Vercel
#   .\scripts\rollback-embedding.ps1 -ToV1 -DryRun   # Solo preview
# =====================================================================

$ErrorActionPreference = "Stop"
$envFile = ".env"

# --- Configuraciones por versión ---
$configV1 = @{
    GEMINI_EMBEDDING_MODEL      = "gemini-embedding-001"
    GEMINI_EMBEDDING_DIMENSIONS = "1536"
    USE_EMBEDDING_V2            = "false"
    label                       = "gemini-embedding-001 (texto, 1536D) [ESTABLE]"
    color                       = "Yellow"
}
$configV2 = @{
    GEMINI_EMBEDDING_MODEL      = "gemini-embedding-2-preview"
    GEMINI_EMBEDDING_DIMENSIONS = "3072"
    USE_EMBEDDING_V2            = "true"
    label                       = "gemini-embedding-2-preview (multimodal, 3072D) [NUEVO]"
    color                       = "Cyan"
}

# --- Determinar target ---
if (-not $ToV1 -and -not $ToV2) {
    Write-Host ""
    Write-Host "== SWITCH MODELO EMBEDDINGS - Nuxbee AI 2.0 ==" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor White
    Write-Host "  -ToV2          Activar gemini-embedding-2-preview (nuevo, 3072D)" -ForegroundColor Cyan
    Write-Host "  -ToV1          Rollback a gemini-embedding-001 (estable, 1536D)" -ForegroundColor Yellow
    Write-Host "  -Vercel        Tambem push a Vercel"
    Write-Host "  -DryRun        Solo mostrar cambios"
    Write-Host ""

    if (Test-Path $envFile) {
        $currentModel = (Get-Content $envFile | Where-Object { $_ -match "^GEMINI_EMBEDDING_MODEL=" }) -replace "^GEMINI_EMBEDDING_MODEL=", ""
        if ($currentModel) {
            Write-Host "Estado actual en .env:" -ForegroundColor Gray
            Write-Host "  GEMINI_EMBEDDING_MODEL = $currentModel" -ForegroundColor White
        }
    }
    exit 0
}

$target = if ($ToV2) { $configV2 } else { $configV1 }
$direction = if ($ToV2) { "UPGRADE -> v2" } else { "ROLLBACK -> 001" }
$dirColor = if ($ToV2) { "Cyan" } else { "Yellow" }

Write-Host ""
Write-Host "== $direction ==" -ForegroundColor $dirColor
Write-Host "Target: $($target.label)" -ForegroundColor $dirColor
Write-Host ""

$varsToSet = @{
    "GEMINI_EMBEDDING_MODEL"      = $target.GEMINI_EMBEDDING_MODEL
    "GEMINI_EMBEDDING_DIMENSIONS" = $target.GEMINI_EMBEDDING_DIMENSIONS
    "USE_EMBEDDING_V2"            = $target.USE_EMBEDDING_V2
}

Write-Host "Cambios a aplicar:" -ForegroundColor White
foreach ($key in $varsToSet.Keys) {
    Write-Host "  $key = $($varsToSet[$key])" -ForegroundColor $dirColor
}
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN - No se aplicaron cambios" -ForegroundColor Gray
    exit 0
}

# ========================
# ACTUALIZAR .env LOCAL
# ========================
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    $changed = 0

    foreach ($key in $varsToSet.Keys) {
        $newVal = $varsToSet[$key]
        if ($content -match "(?m)^$key=.+$") {
            # Variable existe → reemplazar
            $content = $content -replace "(?m)^$key=.+$", "$key=$newVal"
            $changed++
        } else {
            # Variable no existe → agregar al final
            $content = $content.TrimEnd() + "`n$key=$newVal`n"
            $changed++
        }
    }

    Set-Content -Path $envFile -Value $content -NoNewline
    Write-Host "OK: .env actualizado" -ForegroundColor Green
} else {
    Write-Host "WARN: .env no existe - creando" -ForegroundColor Yellow
    foreach ($key in $varsToSet.Keys) {
        Add-Content -Path $envFile -Value "$key=$($varsToSet[$key])"
    }
    Write-Host "OK: .env creado" -ForegroundColor Green
}

# ========================
# ACTUALIZAR VERCEL (opcional)
# ========================
if ($Vercel) {
    Write-Host ""
    Write-Host "Sincronizando con Vercel..." -ForegroundColor Cyan

    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Vercel CLI no encontrado - instala con: npm i -g vercel" -ForegroundColor Red
        Write-Host "Solo actualizado .env local" -ForegroundColor Yellow
    } else {
        foreach ($key in $varsToSet.Keys) {
            $val = $varsToSet[$key]
            Write-Host "  Push $key=$val..." -ForegroundColor Gray
            try {
                echo $val | vercel env add $key production --force 2>&1 | Out-Null
                echo $val | vercel env add $key preview --force 2>&1 | Out-Null
                Write-Host "  OK: $key -> Vercel" -ForegroundColor Green
            } catch {
                Write-Host "  WARN en $key`: $_" -ForegroundColor Yellow
            }
        }
        Write-Host ""
        Write-Host "OK: Vercel actualizado. Redeploya: vercel --prod" -ForegroundColor Green
    }
}

Write-Host ""
if ($ToV2) {
    Write-Host "OK: Embedding 2 ACTIVADO (3072D, multimodal)" -ForegroundColor Cyan
    Write-Host "Ejecuta test: node scripts/test-embedding-v2.mjs" -ForegroundColor White
} else {
    Write-Host "OK: ROLLBACK -> gemini-embedding-001 (1536D)" -ForegroundColor Yellow
    Write-Host "Sistema vuelto al modelo estable" -ForegroundColor Gray
}
Write-Host ""
