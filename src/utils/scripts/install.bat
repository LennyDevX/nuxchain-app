@echo off
REM ============================================
REM 🎁 INSTALACIÓN - Sistema de Gestión Airdrop
REM ============================================

echo 🚀 Configurando Sistema de Gestión de Airdrop $NUX
echo.

REM ============================================
REM PASO 1: Verificar Node.js
REM ============================================

echo 📋 Paso 1: Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo    Descargalo desde: https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js instalado: %NODE_VERSION%
echo.

REM ============================================
REM PASO 2: Instalar dependencias
REM ============================================

echo 📋 Paso 2: Instalando dependencias...
echo    npm install firebase-admin json2csv chalk
echo.

call npm install firebase-admin json2csv chalk

if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente
echo.

REM ============================================
REM PASO 3: Crear estructura de carpetas
REM ============================================

echo 📋 Paso 3: Creando directorios...

if not exist "airdrop-exports" (
    mkdir airdrop-exports
    echo ✅ Directorio airdrop-exports creado
) else (
    echo ℹ️  Directorio airdrop-exports ya existe
)
echo.

REM ============================================
REM PASO 4: Verificar credenciales Firebase
REM ============================================

echo 📋 Paso 4: Verificando Firebase credentials...

if exist "firebase-credentials.json" (
    echo ✅ firebase-credentials.json encontrado
) else (
    echo ⚠️  firebase-credentials.json NO encontrado
    echo.
    echo    Para obtenerlo:
    echo    1. Ve a Firebase Console - nuxchain1
    echo    2. Configuración - Cuentas de servicio
    echo    3. Haz clic en 'Generar nueva clave privada' (JSON)
    echo    4. Guarda como: firebase-credentials.json (en la raíz)
    echo.
)
echo.

REM ============================================
REM PASO 5: Crear archivo .env
REM ============================================

echo 📋 Paso 5: Creando archivo .env...

if not exist ".env.airdrop" (
    (
        echo # Airdrop Configuration
        echo FIREBASE_CREDENTIALS=./firebase-credentials.json
        echo.
        echo # Parámetros del Airdrop
        echo AIRDROP_TOKENS_PER_USER=50000
        echo AIRDROP_MAX_POOL=50000000
        echo AIRDROP_MAX_USERS=1000
        echo AIRDROP_POL_BONUS=20
        echo.
        echo # Firestore
        echo FIRESTORE_COLLECTION=nuxchainAirdropRegistrations
        echo.
        echo # Rutas
        echo EXPORT_DIR=./src/utils/scripts/airdrop-exports
    ) > .env.airdrop
    echo ✅ Archivo .env.airdrop creado
) else (
    echo ℹ️  Archivo .env.airdrop ya existe
)
echo.

REM ============================================
REM RESUMEN FINAL
REM ============================================

echo ============================================================
echo ✅ INSTALACIÓN COMPLETADA
echo ============================================================
echo.
echo 📊 Próximos pasos:
echo.
echo 1️⃣  Descargar Firebase credentials:
echo    Firebase Console - Configuración - Cuentas de servicio
echo    Guardar como: firebase-credentials.json
echo.
echo 2️⃣  Probar que todo funciona:
echo    node AirdropsWallet.js stats
echo.
echo 3️⃣  Leer documentación:
echo    - GUIA_RAPIDA.md (5 minutos)
echo    - README.md (completa)
echo    - INDEX.md (navegación)
echo.
echo 4️⃣  Usar los comandos:
echo    node AirdropsWallet.js stats       # Ver estadísticas
echo    node AirdropsWallet.js export      # Descargar datos
echo    node AirdropsWallet.js validate    # Validar wallets
echo    node distribute.js solana          # Preparar distribución
echo.
echo ============================================================
echo.
pause
