#!/usr/bin/env bash

# ============================================
# 🎁 INSTALACIÓN - Sistema de Gestión Airdrop
# ============================================

echo "🚀 Configurando Sistema de Gestión de Airdrop $NUX"
echo ""

# ============================================
# PASO 1: Verificar Node.js
# ============================================

echo "📋 Paso 1: Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "   Descargalo desde: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js instalado: $NODE_VERSION"
echo ""

# ============================================
# PASO 2: Instalar dependencias
# ============================================

echo "📋 Paso 2: Instalando dependencias..."
echo "   npm install firebase-admin json2csv chalk"
echo ""

npm install firebase-admin json2csv chalk

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi
echo ""

# ============================================
# PASO 3: Crear estructura de carpetas
# ============================================

echo "📋 Paso 3: Creando directorios..."

if [ ! -d "airdrop-exports" ]; then
    mkdir -p airdrop-exports
    echo "✅ Directorio airdrop-exports creado"
else
    echo "ℹ️  Directorio airdrop-exports ya existe"
fi
echo ""

# ============================================
# PASO 4: Verificar credenciales Firebase
# ============================================

echo "📋 Paso 4: Verificando Firebase credentials..."

if [ -f "firebase-credentials.json" ]; then
    echo "✅ firebase-credentials.json encontrado"
else
    echo "⚠️  firebase-credentials.json NO encontrado"
    echo ""
    echo "   Para obtenerlo:"
    echo "   1. Ve a Firebase Console → nuxchain1"
    echo "   2. Configuración → Cuentas de servicio"
    echo "   3. Haz clic en 'Generar nueva clave privada' (JSON)"
    echo "   4. Guarda como: firebase-credentials.json (en la raíz)"
    echo ""
fi
echo ""

# ============================================
# PASO 5: Crear archivo .env
# ============================================

echo "📋 Paso 5: Creando archivo .env..."

if [ ! -f ".env.airdrop" ]; then
    cat > .env.airdrop << 'EOF'
# Airdrop Configuration
FIREBASE_CREDENTIALS=./firebase-credentials.json

# Parámetros del Airdrop
AIRDROP_TOKENS_PER_USER=50000
AIRDROP_MAX_POOL=50000000
AIRDROP_MAX_USERS=1000
AIRDROP_POL_BONUS=20

# Firestore
FIRESTORE_COLLECTION=nuxchainAirdropRegistrations

# Rutas
EXPORT_DIR=./src/utils/scripts/airdrop-exports
EOF
    echo "✅ Archivo .env.airdrop creado"
else
    echo "ℹ️  Archivo .env.airdrop ya existe"
fi
echo ""

# ============================================
# PASO 6: Permisos de ejecución
# ============================================

echo "📋 Paso 6: Configurando permisos..."

chmod +x AirdropsWallet.js
chmod +x setup.js
chmod +x distribute.js

echo "✅ Permisos configurados"
echo ""

# ============================================
# RESUMEN FINAL
# ============================================

echo "============================================================"
echo "✅ INSTALACIÓN COMPLETADA"
echo "============================================================"
echo ""
echo "📊 Próximos pasos:"
echo ""
echo "1️⃣  Descargar Firebase credentials:"
echo "   Firebase Console → Configuración → Cuentas de servicio"
echo "   Guardar como: firebase-credentials.json"
echo ""
echo "2️⃣  Probar que todo funciona:"
echo "   node AirdropsWallet.js stats"
echo ""
echo "3️⃣  Leer documentación:"
echo "   - GUIA_RAPIDA.md (5 minutos)"
echo "   - README.md (completa)"
echo "   - INDEX.md (navegación)"
echo ""
echo "4️⃣  Usar los comandos:"
echo "   node AirdropsWallet.js stats       # Ver estadísticas"
echo "   node AirdropsWallet.js export      # Descargar datos"
echo "   node AirdropsWallet.js validate    # Validar wallets"
echo "   node distribute.js solana          # Preparar distribución"
echo ""
echo "============================================================"
echo ""
