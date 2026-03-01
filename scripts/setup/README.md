# 🚀 NUX Token Deployment Guide

Este directorio contiene todos los scripts y configuración necesaria para desplegar el token **NUX** en **Solana Mainnet-Beta**.

## 📋 Estructura de Carpetas

```
scripts/setup/
├── core/                          ← Scripts principales de deployment
│   ├── deploy-nux-full.ts        → MAIN: Ejecuta el deployment completo
│   └── upload-metadata.ts        → Sube metadata a IPFS (paso preliminar)
│
├── lib/                           ← Librerías reutilizables
│   └── solana-token-factory.ts   → Funciones de creación de tokens
│
├── config/                        ← Configuración
│   └── nux-token-mainnet-beta.json → Config del token NUX
│
├── utils/                         ← Utilidades
│   ├── generate-wallet-from-env.ts → Genera wallet desde .env
│   └── check-env.js              → Verifica variables de entorno
│
├── archived/                      ← Scripts antiguos/duplicados
│   └── [old versions...]
│
└── wallet.json                    ← Wallet Solana (⚠️ Agregar a .gitignore)
```

---

## 🔧 Requisitos Previos

Antes de ejecutar el deployment, asegúrate de tener:

1. **Solana CLI instalada**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   ```

2. **Node.js 18+**
   ```bash
   node --version
   ```

3. **Wallet Solana con SOL**
   - Mínimo **0.05 SOL** en la wallet para rent y fees
   - Wallet guardada como `wallet.json`

4. **Variables de entorno en `.env`**
   ```env
   VITE_PINATA_JWT=your_jwt_token
   VITE_SOLANA_RPC_QUICKNODE=your_rpc_url
   PRIVATE_KEY_SOLANA=your_private_key
   VITE_DEPLOYER_NUX=your_solana_address
   ```

---

## 🚀 Cómo Desplegar el Token NUX

### **Opción 1: Deployment Automático Completo (RECOMENDADO)**

Ejecuta el main script que automatiza TODO:

```bash
npm run deploy:nux
# O directamente:
npx ts-node scripts/setup/core/deploy-nux-full.ts
```

**Este script hace automáticamente:**
1. ✅ Sube imagen PNG → Pinata IPFS
2. ✅ Sube metadata JSON → Pinata IPFS
3. ✅ Crea nuevo SPL Token Mint en Solana
4. ✅ Crea Associated Token Account (ATA)
5. ✅ Escribe metadata ON-CHAIN vía Metaplex
6. ✅ Minta 100,000,000 tokens NUX
7. ✅ Revoca Mint Authority (no minteable para siempre)
8. ✅ Revoca Freeze Authority (no congelable para siempre)

**Output esperado:**
```
✅ Image uploaded to IPFS: ipfs://QmXXXXX...
✅ Metadata uploaded to IPFS: ipfs://QmYYYYY...
✅ Token Mint: NUXxxx...
✅ Associated Token Account: AAAaaa...
✅ Metadata written on-chain
✅ Tokens minted: 100,000,000 NUX
✅ Mint authority revoked
✅ Freeze authority revoked
🎉 Deployment complete!
```

---

### **Opción 2: Deployment Manual por Pasos**

#### **Paso 1: Subir Metadata a IPFS**
```bash
npx ts-node scripts/setup/core/upload-metadata.ts
```
Este comando genera un `metadata-uri.txt` con el IPFS URL.

#### **Paso 2: Ejecutar Deploy Principal**
```bash
npx ts-node scripts/setup/core/deploy-nux-full.ts
```

---

### **Opción 3: Generar Wallet Solana**

Si no tienes wallet aún:

```bash
npx ts-node scripts/setup/utils/generate-wallet-from-env.ts
```

Esto crea `wallet.json` basado en `PRIVATE_KEY_SOLANA` del `.env`.

---

## 📝 Configuración del Token (config/nux-token-mainnet-beta.json)

```json
{
  "name": "Nuxchain",
  "symbol": "NUX",
  "decimals": 6,
  "uri": "ipfs://QmXXXXX...",  ← Metadata IPFS URI
  "initialSupply": 100000000,
  "image": "public/assets/nux-token-logo.png"
}
```

**Modifica este archivo si necesitas:**
- Cambiar nombre, símbolo, decimales
- Actualizar logo o metadata
- Ajustar supply inicial

---

## ⚠️ Notas Importantes

### **IRREVERSIBLE después de deployment:**
- ❌ NO se puede cambiar el símbolo ni nombre del token
- ❌ NO se puede mintear más tokens (auth revocada)
- ❌ NO se puede congelar cuentas (freeze revocada)
- ✅ Solo se pueden actualizar metadata y logo

### **Seguridad:**
- 🔒 `wallet.json` contiene private keys → **NUNCA** lo expongas
- 🔒 Agrégalo a `.gitignore`:
  ```bash
  echo "wallet.json" >> .gitignore
  ```
- 🔒 `nux-metadata-uri.txt` es público, puedes compartirlo

---

## 🔍 Verificar el Deployment

Después de la ejecución, verifica en:

1. **Solana Explorer**
   ```
   https://explorer.solana.com/address/[MINT_ADDRESS]?cluster=mainnet-beta
   ```

2. **Birdeye Exchange**
   ```
   https://birdeye.so/token/[MINT_ADDRESS]
   ```

3. **Magic Eden**
   ```
   https://magiceden.io
   ```

---

## 📚 Scripts Disponibles (package.json)

Asegúrate de tener estos scripts en tu `package.json`:

```json
{
  "scripts": {
    "deploy:nux": "npx ts-node scripts/setup/core/deploy-nux-full.ts",
    "upload:nux-metadata": "npx ts-node scripts/setup/core/upload-metadata.ts",
    "generate:solana-wallet": "npx ts-node scripts/setup/utils/generate-wallet-from-env.ts",
    "check:env": "node scripts/setup/utils/check-env.js"
  }
}
```

---

## 🐛 Troubleshooting

### Error: "VITE_PINATA_JWT not found"
**Solución:** Asegúrate de tener `VITE_PINATA_JWT` en tu `.env`

### Error: "Insufficient funds"
**Solución:** Tu wallet necesita mínimo 0.05 SOL. Solicita en faucet o transfiere SOL.

### Error: "Transaction failed"
**Solución:** Verifica que:
- El RPC está disponible (`VITE_SOLANA_RPC_QUICKNODE`)
- La wallet tiene SOL suficiente
- El private key es correcto

### Error: "Already deployed"
**Solución:** El token ya existe. Si necesitas re-crear, genera una nueva wallet.

---

## 📞 Contacto & Soporte

- **Solana Devnet**: `/archived/deploy-nux-token-simple.ts` para testear antes
- **Documentation**: [Solana Docs](https://docs.solana.com/)
- **Metaplex**: [Metaplex Docs](https://developers.metaplex.com/)

---

## 📦 Archivos Archivados

En la carpeta `archived/` encontrarás versiones antiguas:
- `deploy-nux-token.ts` - Versión intermedia
- `deploy-nux-token-simple.ts` - Versión simplificada
- `create-token-metadata-uri.ts` - Metadata creation standalone
- `set-token-metadata-onchain.ts` - Metadata setter standalone
- `verify-installation.cjs` - Verificación de instalación

**Úsalos solo si necesitas funcionalidad específica o debugging.**

---

**Última actualización:** Marzo 1, 2026  
**Estado:** ✅ Listo para Production Mainnet
