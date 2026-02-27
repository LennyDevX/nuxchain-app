# 🛡️ NuxChain Token Security Guide (Solana SPL)

Esta guía documenta cómo crear el token NUX en Solana de forma segura, ahorrando ~3.6 SOL en comparación con plataformas como tools.smithii, y garantizando un **Score de Seguridad Alto (90-100/100)** en plataformas como DEXTools, DexScreener y RugCheck.

## 🎯 Objetivos de Seguridad

Para que un token sea considerado "seguro" por los inversores y las herramientas de análisis on-chain, debe cumplir con los siguientes requisitos:

1. **Supply Fijo (Non-Mintable)**: Nadie puede crear más tokens.
2. **Sin Congelación (No Freeze Authority)**: Nadie puede bloquear los fondos de los usuarios.
3. **Quemable (Burnable)**: Los usuarios pueden destruir sus propios tokens (reduce el supply).
4. **Metadata Verificada**: Nombre, logo y descripción on-chain (Metaplex Standard).
5. **Liquidez Bloqueada/Quemada**: (Paso posterior a la creación).

---

## 🛠️ Implementación Técnica (El Script)

Hemos creado un script en TypeScript (`scripts/setup/solana-token-factory.ts`) que automatiza este proceso.

### ¿Qué hace el script exactamente?

1. **Genera el Mint Account**: Crea la dirección base del token.
2. **Inicializa el Token**: Define los decimales (6) y establece autoridades temporales.
3. **Crea el ATA (Associated Token Account)**: Crea la billetera para recibir el supply inicial.
4. **Mintea el Supply Total**: Envía los 100,000,000 NUX a tu billetera.
5. **Agrega Metadata (Metaplex)**: Vincula el nombre "NuxChain", símbolo "NUX" y el logo (vía URI JSON).
6. **🔒 REVOCA AUTORIDADES (CRÍTICO)**:
   - `AuthorityType.MintTokens` -> `null` (Hace el token **Non-Mintable**)
   - `AuthorityType.FreezeAccount` -> `null` (Evita que el creador congele fondos)

---

## 📋 Checklist para DEXTools Score Alto

Antes de lanzar la preventa o añadir liquidez en Raydium/Orca, verifica estos puntos en [Solana Explorer](https://explorer.solana.com/):

- [ ] **Mint Authority**: Debe decir `None` (Revocado).
- [ ] **Freeze Authority**: Debe decir `None` (Revocado).
- [ ] **Current Supply**: Debe ser exactamente `100,000,000`.
- [ ] **Decimals**: Debe ser `6`.
- [ ] **Metadata**: El logo y el nombre deben ser visibles en el explorador.

### Pasos Post-Creación (Para llegar a 100/100)

El script cubre la creación segura del token. Para obtener el score perfecto en DEXTools, debes completar estos pasos al añadir liquidez:

1. **Añadir Liquidez (LP)**: Crea un pool en Raydium (ej. NUX/SOL).
2. **Bloquear o Quemar LP Tokens**:
   - **Quemar (Burn)**: Envía los tokens LP a una dirección nula. Es la señal más fuerte de seguridad (Rug-proof).
   - **Bloquear (Lock)**: Usa un servicio como PinkSale o Streamflow para bloquear los LP tokens por 6-12 meses.
3. **Auditoría (Opcional pero recomendado)**: Un reporte de seguridad de una firma reconocida.
4. **Actualizar DEXTools**: Reclama la página de tu token en DEXTools y añade tus redes sociales (Twitter, Telegram, Website).

---

## 💰 Análisis de Costos (Ahorro)

| Método | Costo de Creación | Costo Metadata | Revocar Autoridades | **Costo Total** |
|--------|-------------------|----------------|---------------------|-----------------|
| tools.smithii | ~3.5 SOL | Incluido | ~0.1 SOL | **~3.6 SOL** |
| **Nuestro Script** | ~0.002 SOL | ~0.001 SOL | ~0.001 SOL | **~0.004 SOL** |

**Ahorro Total: ~3.596 SOL** (Que puedes destinar a marketing o liquidez inicial).

---

## 🚀 Cómo Ejecutar el Script

1. **Preparar Metadata**:
   - Sube tu logo a IPFS (ej. Pinata) o Arweave.
   - Crea un archivo JSON con este formato:
     ```json
     {
       "name": "NuxChain",
       "symbol": "NUX",
       "description": "The official token of the NuxChain ecosystem.",
       "image": "URL_DE_TU_LOGO_EN_IPFS"
     }
     ```
   - Sube este JSON a IPFS/Arweave y obtén la URL (URI).

2. **Configurar el Script**:
   - Abre `scripts/setup/deploy-nux-token.ts`.
   - Actualiza la variable `uri` con la URL de tu JSON.
   - Asegúrate de tener una wallet con al menos 0.05 SOL.

3. **Ejecutar**:
   ```bash
   # Instalar dependencias si no lo has hecho
   npm install @solana/web3.js @solana/spl-token @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/umi-signer-wallet-adapters

   # Ejecutar el script (usa ts-node o compila primero)
   npx ts-node scripts/setup/deploy-nux-token.ts
   ```

---

## ❓ Preguntas Frecuentes

**¿Por qué el token es "Burnable"?**
En Solana, cualquier usuario puede quemar (destruir) los tokens que posee en su propia billetera usando el comando estándar de SPL Token. Esto reduce el supply total y es una característica nativa y segura. No requiere permisos especiales del creador.

**¿Puedo cambiar el logo después?**
Sí, el script configura `isMutable: true` en la metadata. Esto significa que el *Update Authority* (tu billetera) puede cambiar el JSON URI en el futuro si necesitas actualizar el logo o la descripción. Si quieres bloquearlo para siempre, cambia `isMutable: false` en el script antes de ejecutarlo.

**¿Qué pasa si pierdo la wallet creadora?**
Como las autoridades de Mint y Freeze están revocadas, el token seguirá funcionando perfectamente. Sin embargo, no podrás actualizar el logo/metadata (si lo dejaste mutable). Guarda bien tu frase semilla.