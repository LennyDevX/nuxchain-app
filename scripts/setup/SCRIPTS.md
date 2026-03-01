# 📜 NUX Token Deployment Scripts

Este archivo lista los comandos npm recomendados para agregar en tu `package.json`.

## Agregar estos scripts

```json
{
  "scripts": {
    "deploy:nux": "npx ts-node scripts/setup/core/deploy-nux-full.ts",
    "deploy:nux:upload-metadata": "npx ts-node scripts/setup/core/upload-metadata.ts",
    "deploy:nux:generate-wallet": "npx ts-node scripts/setup/utils/generate-wallet-from-env.ts",
    "deploy:nux:check-env": "node scripts/setup/utils/check-env.js"
  }
}
```

## Uso desde terminal

```bash
# 🚀 Ejecutar deployment completo (PRINCIPAL)
npm run deploy:nux

# 📤 Solo subir metadata a IPFS
npm run deploy:nux:upload-metadata

# 🔑 Generar wallet desde .env
npm run deploy:nux:generate-wallet

# ✅ Verificar que todas las variables de entorno están OK
npm run deploy:nux:check-env
```

## Ubicación de scripts

- **Core Deployment:** `scripts/setup/core/deploy-nux-full.ts`
- **Metadata Upload:** `scripts/setup/core/upload-metadata.ts`  
- **Token Factory:** `scripts/setup/lib/solana-token-factory.ts` (librería)
- **Configuration:** `scripts/setup/config/nux-token-mainnet-beta.json`
- **Utilities:** `scripts/setup/utils/`
- **Archive:** `scripts/setup/archived/` (versiones antiguas)

---

**Próximo paso:** Copia los scripts anteriores en tu `package.json` y ejecuta `npm run deploy:nux`
