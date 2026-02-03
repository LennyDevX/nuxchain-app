# 🔍 Cómo Identificar Bots en Tu Base de Datos Actual

## Patrón 1: Email Disposable

```sql
-- Buscar todos los emails disposables
SELECT COUNT(*) as bot_count
FROM nuxchainAirdropRegistrations
WHERE email LIKE '%tempmail%'
   OR email LIKE '%guerrillamail%'
   OR email LIKE '%10minutemail%'
   OR email LIKE '%mailinator%'
   OR email LIKE '%throwaway%'
   OR email LIKE '%yopmail%'
   OR email LIKE '%temp-mail%'
   OR email LIKE '%maildrop%'
```

**Ejemplo de respuesta:** 245 bots detectados

---

## Patrón 2: IP Farm (Múltiples wallets de misma IP)

```sql
-- Agrupar por IP y ver cuántos wallets desde cada IP
SELECT 
  ipAddress,
  COUNT(*) as registration_count,
  GROUP_CONCAT(DISTINCT wallet) as wallets
FROM nuxchainAirdropRegistrations
WHERE ipAddress != 'unknown'
GROUP BY ipAddress
HAVING COUNT(*) > 3
ORDER BY registration_count DESC;
```

**Qué buscar:**
- IPs con 5+ registros = definitivamente bot farm
- IPs con 3-4 registros = sospechoso
- Mismas wallets de diferentes IPs = proxy farm

**Ejemplo:**
```
IP: 192.168.1.1
- 23 registros
- Wallets diferentes pero todas con 0.1 SOL exactamente
- Todas creadas dentro de 5 minutos
- Todos emails tipo "user123@tempmail.com"
```

---

## Patrón 3: Nombres Pattern Bot

```sql
-- Buscar nombres tipo bot
SELECT *
FROM nuxchainAirdropRegistrations
WHERE name LIKE 'user%'
   OR name LIKE 'test%'
   OR name LIKE 'bot%'
   OR name LIKE 'admin%'
   OR name LIKE 'fake%'
   OR name REGEXP '^[a-z]{1,3}$'
   OR name REGEXP '^[0-9]{5,}$'
   OR name LIKE 'spam%'
   OR name LIKE 'hack%'
ORDER BY createdAt DESC;
```

---

## Patrón 4: Wallets Creadas Recientemente (< 7 días)

```sql
-- Wallets muy nuevas = creadas solo para este airdrop
SELECT 
  wallet,
  email,
  walletAge,
  solBalance,
  transactionCount,
  createdAt
FROM nuxchainAirdropRegistrations
WHERE walletAge < 7
  AND transactionCount < 3
ORDER BY createdAt DESC;
```

---

## Patrón 5: Mismo Browser/Device Fingerprint

```sql
-- Múltiples registros del mismo device = mismo usuario/bot
SELECT 
  fingerprint,
  COUNT(*) as user_count,
  GROUP_CONCAT(DISTINCT email) as emails,
  GROUP_CONCAT(DISTINCT wallet) as wallets
FROM nuxchainAirdropRegistrations
WHERE fingerprint != 'unknown'
GROUP BY fingerprint
HAVING COUNT(*) > 1
ORDER BY user_count DESC;
```

---

## Patrón 6: Wallets con Balance Exacto

```sql
-- Bots transfieren montos exactos (0.1 SOL, 0.5 SOL, etc)
SELECT 
  solBalance,
  COUNT(*) as wallet_count,
  STRING_AGG(DISTINCT wallet, ', ') as example_wallets
FROM nuxchainAirdropRegistrations
WHERE solBalance IN (0.1, 0.2, 0.5, 1.0, 2.0)
GROUP BY solBalance
ORDER BY wallet_count DESC;
```

**Patrón esperado:**
```
Balance: 0.1 SOL
- 147 wallets
- Todas creadas hace < 24 horas
- Todas con 1 transacción exactamente
```

---

## Patrón 7: Tiempo de Registro Anómalo

```sql
-- Formulario enviado muy rápido = bot
-- Usuarios reales tardan 30+ segundos
SELECT 
  timeToSubmit,
  COUNT(*) as user_count
FROM nuxchainAirdropRegistrations
WHERE timeToSubmit < 5000  -- < 5 segundos
GROUP BY timeToSubmit
ORDER BY user_count DESC;
```

---

## Patrón 8: Data Center IPs

```sql
-- IPs de Amazon, Azure, Google, Hetzner = probablemente bots
SELECT *
FROM nuxchainAirdropRegistrations
WHERE ipAddress IN (
  -- AWS ranges (ejemplo)
  '52.%', '34.%', '35.%',
  -- Google Cloud
  '104.%', '35.%',
  -- Azure
  '13.%', '40.%'
)
ORDER BY createdAt DESC;
```

---

## Patrón 9: Registros en Clusters de Tiempo

```sql
-- Muchos registros en corto tiempo = ataque coordinado
SELECT 
  DATE_TRUNC('minute', createdAt) as minute,
  COUNT(*) as registrations_per_minute
FROM nuxchainAirdropRegistrations
WHERE createdAt > NOW() - INTERVAL 7 days
GROUP BY minute
HAVING COUNT(*) > 20  -- > 20 registros/minuto es anómalo
ORDER BY registrations_per_minute DESC;
```

---

## Patrón 10: Email Pattern Análisis

```sql
-- Emails que parecen generados automáticamente
SELECT 
  email,
  COUNT(*) as count
FROM nuxchainAirdropRegistrations
WHERE email LIKE '%bot%'
   OR email LIKE '%test%'
   OR email LIKE '%fake%'
   OR email LIKE '%user%'
   OR email LIKE '%admin%'
   OR email REGEXP '^[0-9]{3,}@'
   OR email REGEXP '@[0-9]+\.[a-z]+$'
GROUP BY email
ORDER BY count DESC;
```

---

## 📊 Script de Auditoría Automática

```sql
-- COMPREHENSIVE BOT DETECTION QUERY
-- Combina todos los patrones

SELECT 
  'DISPOSABLE_EMAIL' as detection_type,
  COUNT(*) as bot_count,
  GROUP_CONCAT(email LIMIT 5) as examples
FROM nuxchainAirdropRegistrations
WHERE email LIKE '%tempmail%' OR email LIKE '%guerrillamail%'
UNION ALL
SELECT 
  'IP_FARM' as detection_type,
  COUNT(*) as bot_count,
  GROUP_CONCAT(DISTINCT ipAddress LIMIT 5) as examples
FROM nuxchainAirdropRegistrations
WHERE ipAddress IN (
  SELECT ipAddress 
  FROM nuxchainAirdropRegistrations 
  WHERE ipAddress != 'unknown' 
  GROUP BY ipAddress 
  HAVING COUNT(*) > 3
)
UNION ALL
SELECT 
  'SUSPICIOUS_NAME' as detection_type,
  COUNT(*) as bot_count,
  GROUP_CONCAT(name LIMIT 5) as examples
FROM nuxchainAirdropRegistrations
WHERE name LIKE 'user%' OR name LIKE 'test%' OR name LIKE 'bot%'
UNION ALL
SELECT 
  'NEW_WALLET' as detection_type,
  COUNT(*) as bot_count,
  GROUP_CONCAT(wallet LIMIT 5) as examples
FROM nuxchainAirdropRegistrations
WHERE walletAge < 7 AND transactionCount < 2
UNION ALL
SELECT 
  'DUPLICATE_FINGERPRINT' as detection_type,
  COUNT(*) as bot_count,
  GROUP_CONCAT(DISTINCT fingerprint LIMIT 5) as examples
FROM nuxchainAirdropRegistrations
WHERE fingerprint IN (
  SELECT fingerprint 
  FROM nuxchainAirdropRegistrations 
  WHERE fingerprint != 'unknown' 
  GROUP BY fingerprint 
  HAVING COUNT(*) > 1
)
ORDER BY bot_count DESC;
```

---

## 🎯 Scoring Sistema

Asigna puntos por cada patrón:

```
DISPOSABLE_EMAIL:     +30 puntos
IP_FARM:              +25 puntos
SUSPICIOUS_NAME:      +15 puntos
NEW_WALLET:           +20 puntos
DUPLICATE_FINGERPRINT:+25 puntos
FAST_SUBMISSION:      +10 puntos (< 5 segundos)
EXACT_BALANCE:        +15 puntos (0.1, 0.5, 1.0 SOL exactos)
DATA_CENTER_IP:       +20 puntos

TOTAL:
0-30:   Probablemente usuario real
31-60:  Sospechoso
61+:    Definitivamente bot
```

---

## 📈 Ejemplo de Análisis Real

```
Email: user123bot@tempmail.com
Score: 30 (disposable) + 25 (IP farm) + 15 (name) = 70 ❌ BOT

Email: john.smith@gmail.com
Score: 0 (real email) + 0 + 0 = 0 ✅ REAL

Email: test.user.999@tempmail.org
Score: 30 + 25 + 15 = 70 ❌ BOT

Email: alice@protonmail.com
Score: 0 = 0 ✅ REAL
```

---

## 🛠️ Próximos Pasos

1. **Ejecuta estas queries** en tu Firestore console
2. **Identifica patrones** en tus datos actuales
3. **Elimina bots obvios** (score 70+)
4. **Audita dudosos** (score 30-60)
5. **Implementa protecciones** para futuros registros

---

## 📊 Métricas a Monitorear

```
Total registros: X
Bots detectados: Y (Y/X %)
Usuarios reales: Z (Z/X %)

Después de Cloud Function:
- Reducción de bots diarios: [tracking]
- Tasa de falsos positivos: [tracking]
- Usuarios reales permitidos: [tracking]
```

