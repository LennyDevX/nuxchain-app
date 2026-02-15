# 🔄 Sincronizar ABIs desde Hardhat

Este script automático extrae los ABIs compilados desde tu proyecto Hardhat y los actualiza en el frontend.

## 📋 Por qué necesitas esto

Cuando recompilan tus contratos en Hardhat:
- Los archivos en `artifacts/` tienen los ABIs más recientes
- El frontend en `src/abi/` tiene versiones viejas
- Las funciones nuevas no estarán disponibles hasta que sincronices

## 🚀 Cómo usar

### Opción 1: Desde el Frontend (Recomendado)

```bash
# Asumiendo que tu Hardhat está en la carpeta padre
node scripts/sync-hardhat-abis.js ../nuxchain-protocol

# O especifica la ruta completa
node scripts/sync-hardhat-abis.js /Users/lenny/projects/nuxchain-protocol
```

### Opción 2: Agregar script a package.json

```json
{
  "scripts": {
    "sync:abis": "node scripts/sync-hardhat-abis.js ../nuxchain-protocol"
  }
}
```

Luego ejecuta:
```bash
npm run sync:abis
```

## ✅ Lo que hace el script

1. **Lee** los artefactos compilados de Hardhat (`artifacts/contracts/`)
2. **Extrae** solo la propiedad `abi` (sin bytecode ni metadata innecesaria)
3. **Actualiza** los archivos JSON en `src/abi/` con las versiones nuevas
4. **Preserva** la estructura de carpetas utilizada

**Ejemplo**: 
- Input: `hardhat-project/artifacts/contracts/SmartStaking/DynamicAPYCalculator.sol/DynamicAPYCalculator.json`
- Output: `frontend/src/abi/DynamicAPYCalculator.sol/DynamicAPYCalculator.json` (actualizado)

## 📊 Ejemplo de salida

```
🔄 Sincronizando ABIs desde Hardhat...

📂 Proyecto Hardhat: /Users/lenny/projects/nuxchain-protocol

✅ GameifiedMarketplaceProxy → GameifiedMarketplaceProxy/GameifiedMarketplaceProxy.json (42 elementos ABI)
✅ EnhancedSmartStaking → SmartStaking/EnhancedSmartStaking.json (28 elementos ABI)
✅ DynamicAPYCalculator → DynamicAPYCalculator.sol/DynamicAPYCalculator.json (35 elementos ABI)
✅ LevelingSystem → LevelingSystem/LevelingSystem.json (18 elementos ABI)
⏭️  IndividualSkills → No encontrado
❌ CustomContract → Error: Invalid JSON

======================================================================
📊 RESUMEN
======================================================================
✅ Actualizados: 12
⏭️  Omitidos:     3
❌ Errores:      1
```

## 🔧 Configuración

El script mapea automáticamente los contratos. Si tienes contratos nuevos, agrega el mapeo en `scripts/sync-hardhat-abis.js`:

```javascript
const CONTRACT_MAPPING = {
  'MiNuevoContrato': { 
    path: 'MiNuevoContrato/MiNuevoContrato.json' 
  }
};
```

## 🐛 Troubleshooting

### Error: "No se encontró: /path/to/artifacts"
```
Solución: Verifica que:
1. La ruta a Hardhat es correcta
2. Compilaste los contratos: cd hardhat && npx hardhat compile
3. La carpeta artifacts/ existe
```

### Error: "Sin propiedad 'abi' en el artefacto"
```
Solución: El archivo de artefacto está corrompido
1. Limpia la carpeta artifacts: rm -rf artifacts
2. Recompila: npx hardhat compile
3. Intenta sincronizar de nuevo
```

### Los ABIs no cambian después de sincronizar
```
Solución: 
1. Verifica que el script encontró los archivos (busca ✅ en la salida)
2. Revisa que no hay errores (❌)
3. Recarga el navegador para limpiar el cache
4. Reinicia el servidor: npm run dev
```

## 🎯 Workflow recomendado

```bash
# 1. Modificas tus contratos en Hardhat
cd nuxchain-protocol
vim contracts/SmartStaking/DynamicAPYCalculator.sol

# 2. Recompilan
npx hardhat compile

# 3. Despliegas (si es necesario)
npx hardhat run scripts/deploy.ts --network polygon

# 4. Sincronizas ABIs al frontend
cd ../nuxchain-app
node scripts/sync-hardhat-abis.js ../nuxchain-protocol

# 5. Verificas que funciona
npm run dev
```

## 📚 Después de sincronizar

El `contracts.config.ts` ya está configurado para usar los ABIs. Solo asegúrate de que los estás importando correctamente:

```typescript
import { getContractABI, getContractAddress } from '@/abi/contracts.config';

const abi = getContractABI('DynamicAPYCalculator');  // ✅ ABI actualizado
const address = getContractAddress('DynamicAPYCalculator');  // ✅ Dirección del .env
```

---

**Tip**: Ejecuta este script después de cada recompilación importante en Hardhat para mantener todo sincronizado. 🚀
