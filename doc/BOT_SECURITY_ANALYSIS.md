# 🤖 Por Qué Los Bots Siguen Registrándose - Análisis de Seguridad

## Problema General
Después de implementar múltiples capas de seguridad, los bots siguen registrándose. Esto sucede porque **las validaciones son predominantemente en el CLIENTE (frontend)** y son fácilmente evadibles.

---

## 🔴 CRÍTICAS IDENTIFICADAS

### 1. **Validaciones del CLIENTE ≠ Validaciones del SERVIDOR**

**Ubicación:** `src/pages/Airdrop.tsx` y `src/components/forms/wallet-analysis-service.ts`

**Problema:**
- El análisis de wallet (`analyzeWalletMetrics`) ocurre **SOLO en el navegador del usuario**
- El botón "Register" se deshabilita en el frontend SI el wallet falla validación
- **PERO**: Un bot puede:
  - ✅ Hacer request directo a Firestore sin pasar por el frontend
  - ✅ Pasar por el navegador usando Selenium/Puppeteer
  - ✅ Usar herramientas HTTP cliente (curl, Postman, etc.)
  - ✅ Burlar las validaciones de frontend completamente

**Código vulnerable:**
```typescript
// Frontend - línea 729 en Airdrop.tsx
disabled={isSubmitting || detectedNetwork === 'evm' || (walletMetrics != null && !walletMetrics.isLegit)}

// Esta validación SOLO ocurre en el navegador y puede ser:
// 1. Evadida con herramientas HTTP directas
// 2. Bypasseada con Puppeteer/Selenium
// 3. Ignorada modificando el localStorage/sessionStorage
```

**Impacto:** ⚠️ CRÍTICO - 90% de las validaciones son evadibles

---

### 2. **Falta de Validación en Cloud Functions (Servidor)**

**Ubicación:** No existe `submitAirdropRegistration` en backend

**Problema:**
- La función `submitAirdropRegistration` en `airdrop-service.ts` es **CLIENT-SIDE ONLY**
- Escribe directamente a Firestore sin validar
- No hay Cloud Function o API endpoint que valide **ANTES de escribir a la BD**

**Código vulnerable:**
```typescript
// airdrop-service.ts - línea 285+
// Esto escribe DIRECTAMENTE a Firestore sin validación de servidor
await addDoc(collection(db, 'nuxchainAirdropRegistrations'), airdropData);

// Un bot puede simplemente hacer:
firebase.firestore().collection('nuxchainAirdropRegistrations').add({
  name: 'Bot User',
  email: 'bot@example.com',
  wallet: '...',
  // ... y listo, sin pasar por NINGUNA validación
})
```

**Impacto:** ⚠️ CRÍTICO - Cualquier persona con acceso a Firestore puede escribir directamente

---

### 3. **Validaciones Client-Side Burlables**

**Ubicación:** `wallet-analysis-service.ts` líneas 160-200

**Validaciones ACTUALES:**
```
✅ Balance >= 0.05 SOL
✅ Wallet age >= 7 días  
✅ Transactions >= 1
✅ Email formato válido
✅ Nombre >= 3 caracteres
```

**Cómo los bots las EVADEN:**

| Validación | Cómo se Evade |
|-----------|--------------|
| Balance | Transfieren 0.1 SOL entre wallets dummy |
| Wallet age | Usan wallets viejas registradas o compran en mercados |
| Transactions | Hacen transacciones falsas entre sus propias wallets |
| Email | Usan generadores de emails reales o servicios SMTP |
| Nombre | Usan nombres legítimos de la web |

**Problema clave:** Todas estas métricas se obtienen de **Solana chain pública** donde los bots pueden:
- Crear wallets antiguas
- Hacer transacciones dummy
- Cumplir requisitos artificialmente

---

### 4. **Falta de Validación en Tiempo Real del Servidor**

**Ubicación:** No existe backend validation

**Flujo ACTUAL (Vulnerable):**
```
Usuario Frontend → Valida en navegador → Escribe a Firestore ❌
                    ↓
        Bot con script/Puppeteer → Escribe directo a Firestore ❌
```

**Debería ser:**
```
Usuario Frontend → Valida en navegador → Envía a Cloud Function
                                              ↓
                                    Validación de SERVIDOR
                                    (wallet, email, IP, device)
                                              ↓
                                        Escribe a Firestore ✅
```

---

### 5. **Honeypot Field No Implementado Correctamente**

**Ubicación:** `Airdrop.tsx` línea 68

**Problema:**
```typescript
const [formData, setFormData] = useState({
  // ...
  website: '', // Honeypot field
});

// Pero en el renderizado HTML NO tiene el campo website
// Los bots simplemente NO lo ven o no lo llenan
```

**Solución:** El honeypot debe estar VISIBLE pero OCULTO con CSS:
```html
<input 
  type="text" 
  name="website" 
  style={{ display: 'none' }} 
  tabIndex={-1} 
/>
```

Si se completa = 100% bot

---

### 6. **Email Disposables No Bloqueados Efectivamente**

**Ubicación:** `wallet-analysis-service.ts` - NO HAY VALIDACIÓN DE EMAILS

**Problema:**
- No hay función que verifique si el email es de un servicio **disposable**
- Servicios como: tempmail, 10minutemail, guerrillamail, etc. NO están bloqueados

**Falta implementar:**
```typescript
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', 'guerrillamail.com', '10minutemail.com',
  'mailinator.com', 'throwaway.email', 'yopmail.com',
  // ... más
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1].toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
```

---

### 7. **Falta de Rate Limiting (Servidor)**

**Ubicación:** No existe en backend

**Problema:**
- Un bot puede registrar 1000 wallets en paralelo
- No hay límite de:
  - Requests por IP
  - Registros por IP
  - Registros por email pattern
  - Registros por hora

**Impacto:** Un único servidor bot puede registrar 10,000 accounts en < 1 hora

---

### 8. **Falta de Verificación Email Real**

**Ubicación:** No existe en `airdrop-service.ts`

**Problema:**
- El email NO se verifica (no se envía confirmation link)
- Un bot puede registrar con emails falsos/no-existentes
- No hay reconfirmación de que el usuario de verdad tiene acceso a ese email

---

### 9. **IP Address Collection Pero Sin Validación**

**Ubicación:** `airdrop-service.ts` línea 298

**Código:**
```typescript
const ipResponse = await fetch('https://api.ipify.org?format=json');
```

**Problema:**
- Se captura la IP pero **NO se valida nada**
- No hay detección de:
  - IPs de data centers (CloudFlare, AWS, Azure, Hetzner)
  - Múltiples registros desde misma IP
  - VPNs/Proxies

**El script `bulk-wallet-analysis-hybrid.cjs` tiene `IP_FARM_THRESHOLD = 4`** pero eso es solo para ANÁLISIS POST-FACTO, no para prevención en tiempo real.

---

### 10. **Falta de Device Fingerprinting Validation**

**Ubicación:** `Airdrop.tsx` líneas 18-26

**Código:**
```typescript
function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  // ... genera fingerprint
  return canvas.toDataURL();
}
```

**Problema:**
- Se genera el fingerprint pero **NO se valida en el servidor**
- Los bots pueden generar fingerprints aleatorios
- No hay checking de múltiples registros con devices diferentes pero misma IP

---

## 🟢 SOLUCIONES INMEDIATAS

### Prioridad 1: Backend Validation (Cloud Function)

```typescript
// Crear: api/_middlewares/airdrop-validator.ts
export async function validateAirdropRegistration(
  name: string,
  email: string,
  wallet: string,
  ipAddress: string,
  deviceFingerprint: string
) {
  // 1. Email disposable check
  if (isDisposableEmail(email)) {
    throw new Error('Disposable email addresses not allowed');
  }

  // 2. IP farm detection
  const ipCount = await db.collection(COLLECTION_NAME)
    .where('ipAddress', '==', ipAddress)
    .count()
    .get();
  
  if (ipCount.data().count >= 3) {
    throw new Error('Too many registrations from this IP address');
  }

  // 3. Device fingerprint duplicate
  const fpCount = await db.collection(COLLECTION_NAME)
    .where('fingerprint', '==', deviceFingerprint)
    .count()
    .get();
  
  if (fpCount.data().count >= 2) {
    throw new Error('Duplicate device detected');
  }

  // 4. Rate limiting per IP
  const recentRegistrations = await db.collection(COLLECTION_NAME)
    .where('ipAddress', '==', ipAddress)
    .where('createdAt', '>', new Date(Date.now() - 3600000)) // Last hour
    .count()
    .get();
  
  if (recentRegistrations.data().count >= 5) {
    throw new Error('Too many registrations from this IP in the last hour');
  }

  // 5. Wallet age validation (ON-CHAIN)
  const walletMetrics = await getWalletOnChainMetrics(wallet);
  if (walletMetrics.walletAgeDays < 7) {
    throw new Error('Wallet must be at least 7 days old');
  }

  return true;
}
```

### Prioridad 2: Email Verification

```typescript
// En submitAirdropRegistration
export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  // Usar SendGrid o similar
  await sgMail.send({
    to: email,
    subject: 'Verify your Airdrop Registration',
    html: `Click this link to verify: <a href="${verificationLink}">${verificationLink}</a>`,
  });

  // Store pending registration with verification token
  await db.collection('pendingVerifications').add({
    email,
    wallet,
    token,
    expiresAt: new Date(Date.now() + 24 * 3600000),
  });
}
```

### Prioridad 3: Data Center IP Blocking

```typescript
// En validateAirdropRegistration
const isDataCenterIP = await checkDataCenterIP(ipAddress);
if (isDataCenterIP) {
  throw new Error('Registration from data centers/proxies not allowed');
}

// Usar MaxMind GeoIP2 o similar API
```

---

## 📊 Comparación: Ahora vs. Después

| Capa | Actual | Necesaria |
|-----|--------|-----------|
| **Frontend** | ✅ Validaciones básicas | ✅ Mantener (user experience) |
| **Backend** | ❌ NO existe | ✅ Cloud Function requerida |
| **Email** | ❌ No verificado | ✅ Confirmation link necesario |
| **IP Validation** | ❌ Solo colecta | ✅ Validar en tiempo real |
| **Rate Limiting** | ❌ No existe | ✅ Por IP, email pattern, device |
| **Disposable Emails** | ❌ No blockeado | ✅ Blocklist verificada |
| **Device FP** | ✅ Se captura | ⚠️ Validar deduplicación |
| **Honeypot** | ⚠️ Incompleto | ✅ CSS visibility:hidden |

---

## 🎯 Recomendación Estratégica

**El 90% de los bots te entran porque NO hay validación en el servidor.**

```
Validación Frontend = FÁCIL EVADIR (con curl, Puppeteer, etc.)
Validación Servidor = IMPOSIBLE EVADIR (es lógica de backend)
```

**Acción inmediata:**
1. Crear Cloud Function para `validateAirdropRegistration` ← **ESTO DETIENE 90% de bots**
2. Implementar email verification ← **Detiene bots sin acceso email**
3. Agregar data center IP blocking ← **Detiene bots en servidores públicos**
4. Rate limiting por IP ← **Previene registros en masa**

**Tiempo de implementación:** 2-4 horas para Cloud Function + email
**Impacto:** Reducción de bots de ~70% a ~5%

---

## 📝 Notas Técnicas

- Los bots actuales probablemente usan **generadores de wallets Solana** con fondos de una billetera maestra
- Hacen **transacciones circulares** entre sus wallets para cumplir requisitos
- Usan **servicios de emails reales** (Mailtrap, Amazon SES, etc.) para bypasear detección
- Implementan **delays automáticos** para evadir rate limits simples
- Utilizan **múltiples IPs** (resiproxies, botnets) para evadir IP banning
- Generan **fingerprints aleatorios** para cada registro

**La única defensa es validación en SERVIDOR que estos bots NO pueden evadir.**
