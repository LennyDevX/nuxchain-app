# 🛠️ Guía Manual: Crear Token NUX en Solana (CLI)

Si prefieres no usar el script TypeScript y quieres tener control absoluto paso a paso usando la línea de comandos oficial de Solana, esta es la guía exacta para crear el token NUX con todas las medidas de seguridad (Non-mintable, Burnable, 100M Supply).

**Costo total estimado:** ~0.01 SOL (Ahorras ~3.59 SOL vs tools.smithii)

---

## 📋 Requisitos Previos

1. **Instalar Solana CLI**:
   - Windows (CMD como Administrador):
     ```cmd
     cmd /c "curl https://release.solana.com/v1.18.4/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"
     C:\solana-install-tmp\solana-install-init.exe v1.18.4
     ```
   - Mac/Linux:
     ```bash
     sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
     ```

2. **Instalar SPL Token CLI**:
   ```bash
   cargo install spl-token-cli
   ```
   *(Requiere tener Rust instalado: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)*

3. **Preparar tu Wallet**:
   - Crea una nueva wallet (o usa una existente):
     ```bash
     solana-keygen new -o ~/.config/solana/id.json
     ```
   - Configura la red a Mainnet (o Devnet para pruebas):
     ```bash
     solana config set --url https://api.mainnet-beta.solana.com
     ```
   - Verifica tu balance (necesitas al menos 0.05 SOL):
     ```bash
     solana balance
     ```

---

## 🚀 Paso 1: Crear el Token (Mint Account)

Primero, creamos la dirección base del token con 6 decimales (estándar en Solana).

```bash
spl-token create-token --decimals 6
```

**Salida esperada:**
```text
Creating token <DIRECCION_DEL_TOKEN>
Signature: ...
```
*Guarda la `<DIRECCION_DEL_TOKEN>`, la necesitarás en todos los pasos siguientes.*

---

## 🏦 Paso 2: Crear tu Cuenta de Token (ATA)

Necesitas una "billetera" específica para guardar tus nuevos tokens NUX antes de distribuirlos.

```bash
spl-token create-account <DIRECCION_DEL_TOKEN>
```

**Salida esperada:**
```text
Creating account <DIRECCION_DE_TU_CUENTA_TOKEN>
Signature: ...
```

---

## 🖨️ Paso 3: Mintear el Supply Total (100 Millones)

Ahora creamos los 100,000,000 de tokens y los enviamos a tu cuenta.

```bash
spl-token mint <DIRECCION_DEL_TOKEN> 100000000
```

**Salida esperada:**
```text
Minting 100000000 tokens
  Token: <DIRECCION_DEL_TOKEN>
  Recipient: <DIRECCION_DE_TU_CUENTA_TOKEN>
Signature: ...
```

Verifica que tienes los tokens:
```bash
spl-token balance <DIRECCION_DEL_TOKEN>
```
*Debe mostrar: `100000000`*

---

## 🔒 Paso 4: Seguridad (Revocar Autoridades) - CRÍTICO PARA DEXTOOLS

Para que el token sea seguro (Non-mintable y sin riesgo de congelación), **DEBES** revocar estas dos autoridades. Esto es irreversible.

### 4.1 Revocar Mint Authority (Nadie podrá crear más tokens)
```bash
spl-token authorize <DIRECCION_DEL_TOKEN> mint --disable
```

### 4.2 Revocar Freeze Authority (Nadie podrá congelar cuentas)
```bash
spl-token authorize <DIRECCION_DEL_TOKEN> freeze --disable
```

Verifica que las autoridades están en `None`:
```bash
spl-token display <DIRECCION_DEL_TOKEN>
```
*Busca `Mint authority: (not set)` y `Freeze authority: (not set)`.*

---

## 🏷️ Paso 5: Añadir Metadata (Nombre, Logo, Símbolo)

Para que tu token no aparezca como "Unknown Token" en Phantom o Solflare, necesitas añadir Metadata usando el estándar de Metaplex.

### 5.1 Preparar el JSON
Sube tu logo a IPFS (ej. Pinata) y crea un archivo `metadata.json`:
```json
{
  "name": "NuxChain",
  "symbol": "NUX",
  "description": "The official token of the NuxChain ecosystem.",
  "image": "https://tu-link-de-ipfs-al-logo.png"
}
```
Sube este `metadata.json` a IPFS y obtén su URL (URI).

### 5.2 Usar Metaplex CLI (Umi)
La forma más fácil de añadir metadata manualmente es usando la herramienta web de Metaplex o un script simple de JS, ya que el CLI de Solana no lo soporta nativamente.

Si prefieres hacerlo sin código, usa la herramienta gratuita:
**[Strata Protocol Token Launchpad](https://app.strataprotocol.com/launchpad/create)** o **[Metaplex Token Creator](https://token-creator-ui.vercel.app/)** (Solo te cobrarán la tarifa de red de Solana, ~0.01 SOL).

Si quieres usar nuestro script para esta parte:
Ejecuta el script `scripts/setup/deploy-nux-token.ts` que hemos preparado en el workspace.

---

## 🔥 Paso 6: Cómo Quemar Tokens (Burnable)

Cualquier usuario (incluyéndote a ti) puede quemar sus propios tokens para reducir el supply total.

```bash
spl-token burn <DIRECCION_DE_TU_CUENTA_TOKEN> <CANTIDAD_A_QUEMAR>
```
Ejemplo para quemar 1 millón de NUX:
```bash
spl-token burn <DIRECCION_DE_TU_CUENTA_TOKEN> 1000000
```

---

## ✅ Verificación Final

Ve a [Solana Explorer](https://explorer.solana.com/) y busca tu `<DIRECCION_DEL_TOKEN>`.
Asegúrate de que:
1. **Current Supply**: 100,000,000 (o menos si quemaste).
2. **Mint Authority**: `None`.
3. **Freeze Authority**: `None`.
4. **Decimals**: 6.

¡Felicidades! Has creado un token seguro, listo para preventa y con un score alto en DEXTools, ahorrando más de 3.5 SOL.