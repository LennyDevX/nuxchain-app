# 🔄 Guía: Actualizar ABIs desde Hardhat

Este script procesa automáticamente **todos** tus ABIs exportados desde Hardhat (all-abis.json) en un solo comando.

## ⚡ TL;DR (10 segundos)

```bash
node scripts/update-abis-from-export.cjs
```

Eso es todo. El script:
1. ✅ Lee `all-abis.json` (contiene TODOS los ABIs)
2. ✅ Lee `abis-by-category.json` (estructura por categoría)
3. ✅ Actualiza los ABIs existentes
4. ✅ Crea los nuevos ABIs
5. ✅ Genera un reporte completo

## 📋 Requisitos Previos

- Debes tener los archivos exportados en tu proyecto Hardhat:
  - `all-abis.json`
  - `abis-by-category.json`

Si no los tienes, primero debes generar los archivos de exportación en tu proyecto Hardhat.

## 🚀 Pasos (Con Explicación)

### 1️⃣ Compila tus contratos en Hardhat

```bash
cd ../nuxchain-protocol
npx hardhat compile
```

### 2️⃣ Ejecuta el script de exportación en Hardhat

Asume que ya tienes un script que genera `all-abis.json` y `abis-by-category.json`.

### 3️⃣ Vuelve al proyecto frontend

```bash
cd ../nuxchain-app
```

### 4️⃣ Ejecuta el script de actualización

```bash
node scripts/update-abis-from-export.js ../nuxchain-protocol
```

### 5️⃣ El script mostrará un reporte como este:

```
================================

🔄 Actualizando ABIs desde Hardhat

================================

📂 Buscando archivos en: C:\...\nuxchain-protocol

📦 ABIs encontrados en all-abis.json: 45

📂 Categorías encontradas en abis-by-category.json:
   • marketplace (12 contratos)
   • staking (8 contratos)
   • skills (10 contratos)
   • utilities (15 contratos)

✨ GameifiedMarketplaceProxy  → GameifiedMarketplaceProxy/GameifiedMarketplaceProxy.json
✨ GameifiedMarketplaceCore   → MarketplaceCore/GameifiedMarketplaceCoreV1.json
♻️  EnhancedSmartStaking      → SmartStaking/EnhancedSmartStaking.json
[... más contratos ...]

================================================================================
📊 RESUMEN DE ACTUALIZACIÓN
================================================================================
✨ Creados:    15
♻️  Actualizados:  28
⏭️  Omitidos:     2
❌ Errores:      0
================================================================================

✅ TOTAL PROCESADOS: 43 ABIs

✨ Los ABIs han sido actualizados correctamente!

💡 Próximos pasos:
   1. Verifica que todos los ABIs se actualizaron correctamente
   2. npm run dev
   3. Los cambios se reflejarán automáticamente (Ctrl+F5 para recargar)
```

## 📊 Interpretando el reporte

| Símbolo | Significado |
|---------|------------|
| ✨ | Nuevo ABI creado |
| ♻️  | ABI existente actualizado |
| ⏭️  | Omitido (problema con estructura) |
| ❌ | Error al procesar |

## ✅ Verificar que funcionó

Después de ejecutar el script:

1. **Verifica la carpeta `src/abi/`**
   ```bash
   # En VS Code, abre src/abi/ y revisa que:
   # - Los archivos JSON se ven frescos (hora modificada reciente)
   # - Hay nuevas carpetas si agregaste contratos
   # - Todos los archivos tienen contenido válido
   ```

2. **Ejecuta el servidor dev**
   ```bash
   npm run dev
   ```

3. **Verifica en la consola del navegador**
   - Los ABIs se cargan correctamente
   - No hay errores de "ABI not found"

## 🔧 Solucionar problemas

### ❌ "Ruta no encontrada"
```
❌ Ruta no encontrada: C:\Users\...\nuxchain-protocol
```

**Solución:**
- Verifica que la ruta al proyecto Hardhat es correcta
- Usa la ruta relativa desde `nuxchain-app`: `../nuxchain-protocol`
- O usa la ruta absoluta completa

### ❌ "No se pudo cargar: all-abis.json"
```
❌ No se pudo cargar: all-abis.json
```

**Solución:**
- Verifica que compilaste los contratos en Hardhat: `npx hardhat compile`
- Verifica que tienes un script que genera `all-abis.json`
- Comprueba que el archivo existe en la carpeta raíz de Hardhat

### ⏭️  "Sin propiedad 'abi' válida"
Significa que algún contrato en `all-abis.json` no tiene la estructura correcta. Generalmente es para contratos auxiliares que no tienen métodos.

**Solución:** Ignora estos avisos, es normal.

## 🎯 Cómo se estructura automáticamente

El script mapea los contratos a carpetas:

```
src/abi/
├── GameifiedMarketplaceProxy/
│   └── GameifiedMarketplaceProxy.json
├── MarketplaceCore/
│   └── GameifiedMarketplaceCoreV1.json
├── SmartStaking/
│   ├── EnhancedSmartStaking.json
│   ├── EnhancedSmartStakingRewards.json
│   ├── EnhancedSmartStakingSkills.json
│   └── ...
├── DynamicAPYCalculator.sol/
│   └── DynamicAPYCalculator.json
└── [... más categorías ...]
```

## 💾 Formato de los ABIs generados

Cada archivo ABI tiene esta estructura:

```json
{
  "_format": "hh-sol-artifact-1",
  "contractName": "GameifiedMarketplaceProxy",
  "sourceName": "contracts/GameifiedMarketplaceProxy.sol",
  "abi": [
    {
      "type": "function",
      "name": "buySkill",
      "inputs": [...],
      "outputs": [...]
    },
    ...
  ],
  "bytecode": "0x...",
  "deployedBytecode": "0x..."
}
```

El ABI es la propiedad más importante y es la que usa el frontend.

## 🔗 Relación con contracts.config.ts

Después de actualizar los ABIs, el archivo `src/abi/contracts.config.ts` automáticamente carga todos los ABIs nuevos/actualizados porque importa:

```typescript
import GAMEIFIED_MARKETPLACE_PROXY_ABI from './GameifiedMarketplaceProxy/GameifiedMarketplaceProxy.json';
import ENHANCED_SMARTSTAKING_ABI from './SmartStaking/EnhancedSmartStaking.json';
// ... etc
```

Por eso es importante mantener los nombres de archivos consistentes.

## 📅 Cuándo ejecutar este script

Ejecuta este script cada vez que:
- ✅ Despliegues nuevos contratos en Hardhat
- ✅ Actualices contratos existentes
- ✅ Agregues nuevas funciones a los ABIs
- ✅ Modifiques eventos o structs en los contratos

**NO es necesario** si solo modificas la lógica de contract sin cambiar el ABI.

## 🎓 Ejemplo paso a paso

```bash
# 1. Estás en nuxchain-app
cd /path/to/nuxchain-app

# 2. Compilaste tus contratos en Hardhat
cd ../nuxchain-protocol
npx hardhat compile
# Esto genera: all-abis.json y abis-by-category.json

# 3. Vuelves a frontend y ejecutas el script
cd ../nuxchain-app
node scripts/update-abis-from-export.js ../nuxchain-protocol

# 4. Ves el reporte exitoso
# ✨ Creados: 5
# ♻️  Actualizados: 28
# ✅ TOTAL PROCESADOS: 33 ABIs

# 5. Reinicia el servidor dev
npm run dev

# 6. Los ABIs nuevos están listos en React!
```

## ✨ Resultado

Después de ejecutar este script correctamente, todos tus contratos tendrán:
- ✅ ABIs actualizados de la última compilación
- ✅ Nuevos contratos disponibles en `contracts.config.ts`
- ✅ Disponibles para importar en React components

```typescript
// En cualquier componente React:
import { getContractABI, getContractAddress } from '@/abi/contracts.config';

const marketplaceABI = getContractABI('GameifiedMarketplaceProxy');
const stakingAddress = getContractAddress('EnhancedSmartStaking');
```

## ❓ Preguntas frecuentes

**P: ¿Puedo ejecutarlo múltiples veces?**
A: Sí, sin problemas. Actualiza los archivos si cambiaron, no hace nada si son iguales.

**P: ¿Qué pasa si agrego un nuevo contrato a Hardhat?**
A: El script lo detecta y lo crea automáticamente en `src/abi/`.

**P: ¿Los bytecodes se incluyen en los ABIs?**
A: Sí, para que tengas toda la información completa si la necesitas. Solo se usa el ABI en el frontend.

**P: ¿Necesito actualizar contracts.config.ts manualmente?**
A: Si agregaste contratos completamente nuevos, probablemente sí. Pero los existentes se actualizan solos.

---

**¡Listo!** Ahora tienes un flujo automático para mantener tus ABIs sincronizados con Hardhat. 🎉
