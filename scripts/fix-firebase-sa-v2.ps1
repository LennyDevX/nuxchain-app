# Fix FIREBASE_SERVICE_ACCOUNT - convert \n to actual newlines and strip outer quotes
$rawContent = [System.IO.File]::ReadAllText('.env.vercel.prod', [System.Text.Encoding]::UTF8)

# Find the line
$match = [regex]::Match($rawContent, "FIREBASE_SERVICE_ACCOUNT=([^\r\n]+)")
if (-not $match.Success) { Write-Host "NOT FOUND"; exit 1 }

$rawVal = $match.Groups[1].Value
Write-Host "Raw length: $($rawVal.Length)"
Write-Host "First 30: $($rawVal.Substring(0, [Math]::Min(30, $rawVal.Length)))"

# Strip outer quotes
$stripped = if ($rawVal.StartsWith('"') -and $rawVal.EndsWith('"')) {
    $rawVal.Substring(1, $rawVal.Length - 2)
} else { $rawVal }

Write-Host "Stripped first 30: $($stripped.Substring(0, [Math]::Min(30, $stripped.Length)))"

# Replace literal \n (two chars) with actual newline
$fixed = $stripped.Replace('\n', "`n")

Write-Host "Fixed first 30: $($fixed.Substring(0, [Math]::Min(30, $fixed.Length)))"
Write-Host "Fixed starts with open brace: $($fixed.StartsWith('{'))"

# Validate as JSON
try {
    $parsed = $fixed | ConvertFrom-Json -ErrorAction Stop
    Write-Host "✅ JSON is VALID! project_id: $($parsed.project_id)"
} catch {
    Write-Host "❌ JSON still invalid: $_"
    exit 1
}

# Write to temp file with UTF8 no BOM
$tmp = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tmp, $fixed, [System.Text.UTF8Encoding]::new($false))
Write-Host "Written to temp: $tmp (length: $((Get-Item $tmp).Length) bytes)"

# Upload to Vercel
Write-Host "Removing old FIREBASE_SERVICE_ACCOUNT..."
& npx vercel env rm FIREBASE_SERVICE_ACCOUNT production --yes 2>&1 | Out-Null

Write-Host "Uploading fixed FIREBASE_SERVICE_ACCOUNT..."
$out = & cmd /c "type `"$tmp`" | npx vercel env add FIREBASE_SERVICE_ACCOUNT production --non-interactive 2>&1"
Write-Host "Upload result: $out"

Remove-Item $tmp -ErrorAction SilentlyContinue
Write-Host "Done."
