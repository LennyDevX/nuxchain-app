# Push new Firebase SA key (serviceAccountKey.json) to ALL Vercel environments
# Run from project root: .\scripts\push-new-sa-all-envs.ps1

$saFile = "serviceAccountKey.json"

if (-not (Test-Path $saFile)) {
  Write-Error "serviceAccountKey.json not found in project root"
  exit 1
}

# Generate compact single-line JSON
$compact = node scripts/compact-sa.cjs $saFile
$len = $compact.Length

Write-Host "Compact JSON length: $len"
Write-Host "Starts with: $($compact.Substring(0, 40))"
Write-Host "Has new key ID (23b890): $($compact -match '23b890c5e2')"

if ($len -lt 1000) {
  Write-Error "Compact JSON too short, something went wrong"
  exit 1
}

# Write to temp file for piping
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $compact, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "Removing old FIREBASE_SERVICE_ACCOUNT from all environments..."
npx vercel env rm FIREBASE_SERVICE_ACCOUNT production --yes 2>&1 | Out-Null
npx vercel env rm FIREBASE_SERVICE_ACCOUNT preview --yes 2>&1 | Out-Null  
npx vercel env rm FIREBASE_SERVICE_ACCOUNT development --yes 2>&1 | Out-Null
Write-Host "Old entries removed"

Write-Host ""
Write-Host "Adding new SA to production..."
Get-Content $tempFile | npx vercel env add FIREBASE_SERVICE_ACCOUNT production
Write-Host "Adding new SA to preview..."
Get-Content $tempFile | npx vercel env add FIREBASE_SERVICE_ACCOUNT preview
Write-Host "Adding new SA to development..."
Get-Content $tempFile | npx vercel env add FIREBASE_SERVICE_ACCOUNT development

Remove-Item $tempFile -Force

Write-Host ""
Write-Host "Done! Run: npx vercel env pull --yes to update .env.local"
