$file = Get-Content 'c:\Users\lenny\OneDrive\Documentos\GitHub\nuxchain-app\.env.local'
$vars = @{}
$dups = @()

foreach ($line in $file) {
    if ($line -match '^([A-Z_]+)=') {
        $key = $matches[1]
        if ($vars.ContainsKey($key)) {
            $dups += $key
        } else {
            $vars[$key] = $true
        }
    }
}

if ($dups.Count -gt 0) {
    Write-Host "⚠️ DUPLICADOS ENCONTRADOS:" -ForegroundColor Yellow
    $dups | Sort-Object -Unique | ForEach-Object { Write-Host "  - $_" }
} else {
    Write-Host "✅ OK - NO HAY DUPLICADOS" -ForegroundColor Green
}

Write-Host ""
Write-Host "Total de variables: $($vars.Count)" -ForegroundColor Cyan
