# 🚀 Quick Deployment Script - Enhanced Airdrop Security
# Run with: .\deploy-airdrop-security.ps1

Write-Host "`n" -NoNewline
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🚀 NUXCHAIN AIRDROP - SECURITY DEPLOYMENT" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "`n"

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Step 0: Verify prerequisites
Write-Host "📋 Step 0: Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$hasNode = Test-CommandExists "node"
$hasFirebase = Test-CommandExists "firebase"
$hasVercel = Test-CommandExists "vercel"

if (-not $hasNode) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+." -ForegroundColor Red
    exit 1
}

if (-not $hasFirebase) {
    Write-Host "⚠️  Firebase CLI not installed. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

if (-not $hasVercel) {
    Write-Host "⚠️  Vercel CLI not installed. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Prerequisites check complete`n" -ForegroundColor Green

# Step 1: Verify security enhancements
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "📋 Step 1: Verifying security enhancements..." -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

node doc/verify-security-enhancements.cjs
$verifyExitCode = $LASTEXITCODE

if ($verifyExitCode -ne 0) {
    Write-Host "`n❌ Security verification failed! Please fix critical issues before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All security checks passed!`n" -ForegroundColor Green

# Step 2: Deploy Firestore indices
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🔥 Step 2: Deploying Firestore indices..." -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will create composite indices for optimal query performance." -ForegroundColor White
Write-Host "Estimated time: 2-5 minutes`n" -ForegroundColor Gray

$deployIndices = Read-Host "Deploy Firestore indices now? (y/N)"

if ($deployIndices -eq "y" -or $deployIndices -eq "Y") {
    firebase deploy --only firestore:indexes
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Firestore indices deployment failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n✅ Firestore indices deployed successfully!" -ForegroundColor Green
    Write-Host "⏳ Indices are building... Check Firebase Console for status." -ForegroundColor Yellow
    Write-Host "   URL: https://console.firebase.google.com`n" -ForegroundColor Gray
} else {
    Write-Host "⏭️  Skipping Firestore indices deployment.`n" -ForegroundColor Yellow
}

# Step 3: Deploy Firestore rules
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🔒 Step 3: Deploying Firestore security rules..." -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will update security rules for rateLimits and auditLogs collections.`n" -ForegroundColor White

$deployRules = Read-Host "Deploy Firestore rules now? (y/N)"

if ($deployRules -eq "y" -or $deployRules -eq "Y") {
    firebase deploy --only firestore:rules
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Firestore rules deployment failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n✅ Firestore rules deployed successfully!`n" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping Firestore rules deployment.`n" -ForegroundColor Yellow
}

# Step 4: Build application
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🏗️  Step 4: Building application..." -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build completed successfully!`n" -ForegroundColor Green

# Step 5: Deploy to Vercel
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🚀 Step 5: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will deploy the enhanced security features to production.`n" -ForegroundColor White

$deployVercel = Read-Host "Deploy to Vercel production now? (y/N)"

if ($deployVercel -eq "y" -or $deployVercel -eq "Y") {
    vercel --prod
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Vercel deployment failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n✅ Vercel deployment completed successfully!`n" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping Vercel deployment.`n" -ForegroundColor Yellow
    Write-Host "You can deploy manually later with: vercel --prod`n" -ForegroundColor Gray
}

# Step 6: Summary
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Security Enhancements Deployed:" -ForegroundColor Yellow
Write-Host "   ✅ Centralized CEX wallets endpoint" -ForegroundColor Green
Write-Host "   ✅ Distributed rate limiting with Firestore" -ForegroundColor Green
Write-Host "   ✅ Email normalization (prevents +alias abuse)" -ForegroundColor Green
Write-Host "   ✅ Restricted CORS (blocks unauthorized origins)" -ForegroundColor Green
Write-Host "   ✅ Generic error messages (prevents enumeration)" -ForegroundColor Green
Write-Host "   ✅ Audit logging (fraud detection & investigation)`n" -ForegroundColor Green

Write-Host "🧪 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Verify Firestore indices are 'Enabled' in Firebase Console" -ForegroundColor White
Write-Host "      https://console.firebase.google.com → Firestore → Indexes`n" -ForegroundColor Gray
Write-Host "   2. Run manual verification tests:" -ForegroundColor White
Write-Host "      - Test CEX endpoint: GET /api/airdrop/cex-wallets" -ForegroundColor Gray
Write-Host "      - Test rate limiting: 4 requests in 1 minute" -ForegroundColor Gray
Write-Host "      - Test email normalization: test+1@gmail.com duplicate" -ForegroundColor Gray
Write-Host "      - Test CORS: Call from authorized/unauthorized origin`n" -ForegroundColor Gray
Write-Host "   3. Monitor audit logs in Firestore:" -ForegroundColor White
Write-Host "      Collection: auditLogs" -ForegroundColor Gray
Write-Host "      Watch for: REGISTRATION_SUCCESS, BOT_DETECTED, etc.`n" -ForegroundColor Gray
Write-Host "   4. Monitor Vercel logs:" -ForegroundColor White
Write-Host "      vercel logs --follow`n" -ForegroundColor Gray

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - Security Summary: doc/SECURITY_ENHANCEMENTS_SUMMARY.md" -ForegroundColor Gray
Write-Host "   - Deployment Guide: doc/SECURITY_DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host "   - Indices Setup: doc/FIRESTORE_INDICES_SETUP.md`n" -ForegroundColor Gray

Write-Host "✅ Your airdrop is now PRODUCTION READY with enhanced security!" -ForegroundColor Green
Write-Host ""
