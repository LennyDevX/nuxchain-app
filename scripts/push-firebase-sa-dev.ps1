# Push FIREBASE_SERVICE_ACCOUNT to Vercel development environment
# Stores compact single-line JSON so vercel env pull writes a .env.local that dotenv can parse correctly

# Pull current production env to get the correct SA value
Write-Host "Pulling production env to extract SA..."
& npx vercel env pull .env.sa.tmp --environment=production --yes 2>&1 | Out-Null

$rawContent = [System.IO.File]::ReadAllText('.env.sa.tmp', [System.Text.Encoding]::UTF8)
$match = [regex]::Match($rawContent, "FIREBASE_SERVICE_ACCOUNT=([^\r\n]+)")
if (-not $match.Success) { Write-Host "ERROR: FIREBASE_SERVICE_ACCOUNT not found in production env"; exit 1 }

$rawVal = $match.Groups[1].Value.Trim()
Write-Host "Raw value length: $($rawVal.Length)"

# Strip outer quotes if present
$stripped = if ($rawVal.StartsWith('"') -and $rawVal.EndsWith('"')) {
    $rawVal.Substring(1, $rawVal.Length - 2)
} else { $rawVal }

# Convert literal \n to actual newlines
$fixed = $stripped.Replace('\n', "`n")

# Validate JSON
try {
    $parsed = $fixed | ConvertFrom-Json -ErrorAction Stop
    Write-Host "✅ JSON valid, project_id: $($parsed.project_id)"
} catch {
    Write-Host "❌ JSON invalid: $_"; exit 1
}

# IMPORTANT: Re-serialize as COMPACT single-line JSON using node
# This ensures vercel env pull writes a single-line value to .env.local
# that dotenv can parse without "bad control character" errors
$saFixedFile = [System.IO.Path]::GetTempFileName() + ".json"
[System.IO.File]::WriteAllText($saFixedFile, $fixed, [System.Text.UTF8Encoding]::new($false))

$compactJson = node scripts/compact-sa.cjs $saFixedFile 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR compacting JSON: $compactJson"
    exit 1
}

Write-Host "Compact JSON length: $($compactJson.Length)"
Write-Host "Compact JSON starts with: $($compactJson.Substring(0, [Math]::Min(20, $compactJson.Length)))"

$tmp = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tmp, $compactJson, [System.Text.UTF8Encoding]::new($false))

# Remove existing development environment SA
Write-Host "Removing old development FIREBASE_SERVICE_ACCOUNT..."
& npx vercel env rm FIREBASE_SERVICE_ACCOUNT development --yes 2>&1 | Out-Null

# Add to development environment
Write-Host "Adding FIREBASE_SERVICE_ACCOUNT to development environment (compact JSON)..."
$out = & cmd /c "type `"$tmp`" | npx vercel env add FIREBASE_SERVICE_ACCOUNT development --non-interactive 2>&1"
Write-Host "Result: $out"

Remove-Item $tmp -ErrorAction SilentlyContinue
Remove-Item $saFixedFile -ErrorAction SilentlyContinue
Remove-Item .env.sa.tmp -ErrorAction SilentlyContinue

Write-Host "`nDone! Now run: npx vercel env pull"
Write-Host "Then restart your dev server to pick up the clean FIREBASE_SERVICE_ACCOUNT"
