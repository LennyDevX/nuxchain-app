# Sync new Solana RPC and verify Firebase SA fix
$newRpc = "https://solana-rpc.publicnode.com"
$tmp = [System.IO.Path]::GetTempFileName()

Write-Host "=== Updating VITE_SOLANA_RPC_QUICKNODE ==="
[System.IO.File]::WriteAllText($tmp, $newRpc, [System.Text.UTF8Encoding]::new($false))
& npx vercel env rm VITE_SOLANA_RPC_QUICKNODE production --yes 2>&1 | Out-Null
$r1 = & cmd /c "type `"$tmp`" | npx vercel env add VITE_SOLANA_RPC_QUICKNODE production --non-interactive 2>&1"
Write-Host "VITE_SOLANA_RPC_QUICKNODE: $r1"

Write-Host "=== Updating SOLANA_RPC_QUICKNODE ==="
[System.IO.File]::WriteAllText($tmp, $newRpc, [System.Text.UTF8Encoding]::new($false))
& npx vercel env rm SOLANA_RPC_QUICKNODE production --yes 2>&1 | Out-Null
$r2 = & cmd /c "type `"$tmp`" | npx vercel env add SOLANA_RPC_QUICKNODE production --non-interactive 2>&1"
Write-Host "SOLANA_RPC_QUICKNODE: $r2"

Remove-Item $tmp -ErrorAction SilentlyContinue

Write-Host "=== Verifying FIREBASE_SERVICE_ACCOUNT ==="
& npx vercel env pull .env.vercel.prod2 --environment=production --yes 2>&1 | Out-Null
$lines = Get-Content .env.vercel.prod2
$saLine = $lines | Where-Object { $_ -match "^FIREBASE_SERVICE_ACCOUNT=" } | Select-Object -First 1
if ($saLine) {
    $val = $saLine.Substring("FIREBASE_SERVICE_ACCOUNT=".Length)
    Write-Host "SA length: $($val.Length)"
    Write-Host "SA first 20 chars: $($val.Substring(0,[Math]::Min(20,$val.Length)))"
    Write-Host "SA starts with brace: $($val.StartsWith('{'))"
    if (-not $val.StartsWith('{')) {
        Write-Host "WARNING: SA still does not start with '{' !"
    } else {
        Write-Host "OK: SA looks correct"
    }
} else { 
    Write-Host "SA NOT FOUND in pull"
}
Write-Host "All done."
