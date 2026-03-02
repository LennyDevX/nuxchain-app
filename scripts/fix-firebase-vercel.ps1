# Fix FIREBASE_SERVICE_ACCOUNT in Vercel (strip outer quotes)
$raw = (Get-Content .env.vercel.prod | Where-Object { $_ -match "^FIREBASE_SERVICE_ACCOUNT=" } | Select-Object -First 1).Substring("FIREBASE_SERVICE_ACCOUNT=".Length)
Write-Host "Raw length: $($raw.Length)"
Write-Host "Starts with quote: $($raw.StartsWith('`"'))"

if ($raw.StartsWith('"') -and $raw.EndsWith('"')) {
    $fixed = $raw.Substring(1, $raw.Length - 2)
    Write-Host "Stripped outer quotes. Fixed length: $($fixed.Length)"
    Write-Host "Fixed starts: $($fixed.Substring(0,10))"
} else {
    $fixed = $raw
    Write-Host "No outer quotes to strip"
}

$tmp = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tmp, $fixed, [System.Text.UTF8Encoding]::new($false))
Write-Host "Temp file: $tmp"

Write-Host "Removing old value..."
& npx vercel env rm FIREBASE_SERVICE_ACCOUNT production --yes 2>&1 | Out-Null

Write-Host "Uploading fixed value..."
$out = & cmd /c "type `"$tmp`" | npx vercel env add FIREBASE_SERVICE_ACCOUNT production --non-interactive 2>&1"
Write-Host "Result: $out"

Remove-Item $tmp -ErrorAction SilentlyContinue
Write-Host "Done."
