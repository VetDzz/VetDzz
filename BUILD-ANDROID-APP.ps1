# VetDz Android App Builder
Write-Host "🚀 VetDz Android App Builder" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check Java
Write-Host "Checking Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java JDK 17+" -ForegroundColor Red
    Write-Host "Download from: https://adoptium.net/" -ForegroundColor Cyan
    exit 1
}

# Check Android SDK
Write-Host ""
Write-Host "Checking Android SDK..." -ForegroundColor Yellow
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $sdkPath) {
    Write-Host "✅ Android SDK found at: $sdkPath" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK not found" -ForegroundColor Red
    Write-Host "Please install Android Studio from: https://developer.android.com/studio" -ForegroundColor Cyan
    exit 1
}

# Create local.properties
Write-Host ""
Write-Host "Creating local.properties..." -ForegroundColor Yellow
$localProps = "sdk.dir=" + $sdkPath.Replace("\", "\\")
Set-Content -Path "android-app\local.properties" -Value $localProps
Write-Host "✅ local.properties created" -ForegroundColor Green

# Check if Android Studio is installed
Write-Host ""
Write-Host "⚠️  IMPORTANT: Building Android apps requires Android Studio" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please follow these steps:" -ForegroundColor Cyan
Write-Host "1. Install Android Studio: https://developer.android.com/studio" -ForegroundColor White
Write-Host "2. Open Android Studio" -ForegroundColor White
Write-Host "3. Click 'Open' and select the 'android-app' folder" -ForegroundColor White
Write-Host "4. Wait for Gradle sync to complete" -ForegroundColor White
Write-Host "5. Click Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor White
Write-Host "6. Wait for build to complete" -ForegroundColor White
Write-Host "7. Click 'locate' to find your APK" -ForegroundColor White
Write-Host ""
Write-Host "APK will be at: android-app\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to open Android Studio download page..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://developer.android.com/studio"
