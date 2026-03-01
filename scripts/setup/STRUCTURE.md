# 📁 NUX Deployment Folder Structure

## Organización Final

```
scripts/setup/
│
├─ 📄 README.md                           ← 📖 LEER PRIMERO: Guía completa de deployment
├─ 📄 SCRIPTS.md                          ← Scripts npm a agregar en package.json
├─ 📄 .gitignore                          ← Protege wallet.json y archivos sensibles
│
├─ 🔧 core/                              ← Scripts PRINCIPALES de deployment
│  ├─ deploy-nux-full.ts                ← ⭐ MAIN: Ejecuta TODO automáticamente
│  └─ upload-metadata.ts                ← Sube metadata a IPFS (paso previo)
│
├─ 📚 lib/                              ← Librerías reutilizables
│  └─ solana-token-factory.ts           ← Funciones auxiliares de token creation
│
├─ ⚙️ config/                           ← Configuración del token
│  └─ nux-token-mainnet-beta.json      ← ⭐ Config principal: name, symbol, decimals
│
├─ 🔨 utils/                            ← Herramientas auxiliares
│  ├─ generate-wallet-from-env.ts      ← Genera wallet desde .env
│  └─ check-env.js                      ← Verifica variables de entorno
│
├─ 📦 archived/                         ← Versiones antiguas (legado)
│  ├─ deploy-nux-token.ts              ← Versión intermedia
│  ├─ deploy-nux-token-simple.ts       ← Versión simplificada
│  ├─ create-token-metadata-uri.ts     ← Metadata creation standalone
│  ├─ set-token-metadata-onchain.ts    ← Metadata setter standalone
│  └─ verify-installation.cjs           ← Verificación antigua
│
├─ 🔑 wallet.json                       ← ⚠️ Wallet Solana (en .gitignore)
├─ 🖼️ nux-logo.png                      ← Logo del token (usado en metadata)
├─ 📝 nux-metadata-uri.txt              ← URI IPFS de metadata (generado)
└─ 📊 nux-token-deploy-result.json      ← Output del deployment (generado)
```

---

## 🚀 Flujo de Deployment

```
1️⃣ PREPARACIÓN
   └─ ✅ Verificar .env: VITE_PINATA_JWT, VITE_SOLANA_RPC_QUICKNODE
   └─ ✅ Verificar wallet.json existe
   └─ ✅ Verificar imagen nux-logo.png existe

2️⃣ EJECUCIÓN (Una línea)
   └─ npm run deploy:nux
      │
      ├─ 📤 Sube logo → IPFS
      ├─ 📤 Sube metadata → IPFS  
      ├─ 🎨 Crea SPL Token Mint en Solana
      ├─ 🔑 Crea Associated Token Account
      ├─ 📋 Escribe metadata ON-CHAIN (Metaplex)
      ├─ 🪙 Minta 100,000,000 NUX
      ├─ 🔐 Revoca Mint Authority (IRREVERSIBLE)
      └─ 🔐 Revoca Freeze Authority (IRREVERSIBLE)

3️⃣ RESULTADO
   └─ ✅ nux-token-deploy-result.json con:
      └─ Mint Address
      └─ ATA Address
      └─ Tx Signatures
      └─ Metadata URI
```

---

## 📋 Checklist Pre-Deploy

- [ ] `.env` contiene:
  - [ ] `VITE_PINATA_JWT` ✓
  - [ ] `VITE_SOLANA_RPC_QUICKNODE` ✓
  - [ ] `PRIVATE_KEY_SOLANA` ✓
  - [ ] `VITE_DEPLOYER_NUX` ✓

- [ ] `wallet.json` existe en `scripts/setup/`
- [ ] `nux-logo.png` existe en `scripts/setup/`
- [ ] `config/nux-token-mainnet-beta.json` está actualizado
- [ ] Wallet tiene mínimo **0.05 SOL**
- [ ] Tienes node 18+ y ts-node instalado
- [ ] `.gitignore` incluye `wallet.json`

---

## 🎯 Comandos Rápidos

```bash
# Full deployment (recomendado)
npm run deploy:nux

# Solo subir metadata a IPFS
npm run deploy:nux:upload-metadata

# Generar wallet desde env
npm run deploy:nux:generate-wallet

# Verificar variables de entorno
npm run deploy:nux:check-env
```

---

## 📁 Archivos por Propósito

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `deploy-nux-full.ts` | 🎯 Main script - ejecuta TODO | `core/` |
| `solana-token-factory.ts` | 📚 Librería auxiliar | `lib/` |
| `nux-token-mainnet-beta.json` | ⚙️ Config del token | `config/` |
| `upload-metadata.ts` | 📤 Upload IPFS | `core/` |
| `wallet.json` | 🔑 Wallet Solana | `setup/` |
| `nux-logo.png` | 🖼️ Logo | `setup/` |

---

## ✅ Después de Deploy

1. **Guarda el output:**
   ```bash
   cat nux-token-deploy-result.json
   ```

2. **Verifica en explorer:**
   ```
   https://explorer.solana.com/address/[MINT_ADDRESS]?cluster=mainnet-beta
   ```

3. **Update .env con el new Mint:**
   ```env
   VITE_NUX_MINT_ADDRESS=so1...
   ```

4. **Compartir responsablemente:**
   - ✅ Mint Address (público)
   - ✅ Metadata URI (público)
   - ❌ wallet.json (privado - NUNCA compartir)
   - ❌ Private keys (privado - NUNCA compartir)

---

**Estado:** ✅ Listo para Mainnet Deploy  
**Última actualización:** Marzo 1, 2026  
**Versión:** 1.0
