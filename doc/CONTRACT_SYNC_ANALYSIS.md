# Sincronización de Contratos - Análisis Completo

## 📊 Estado Actual

**Direcciones Configuradas:**
- ✅ Treasury Manager: `0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9` (Deployed)
- ✅ SmartStaking: Configured (ACTIVE)
- ✅ Allocations correctas en ABI

**Problema Identificado:** 
❌ **SmartStaking NO está autorizado como fuente de ingresos en TreasuryManager**

---

## 🔍 Flujo de Comunicación Entre Contratos

### TreasuryManager (0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9)

**Cómo recibe fondos:**
1. **receive()** - Recibe POL directo (cualquiera puede enviar)
2. **receiveRevenue(string revenueType)** - Recibe ingresos tipificados desde **SOLO fuentes autorizadas**

```solidity
function receiveRevenue(string calldata revenueType) external payable {
    require(authorizedSources[msg.sender], "Not authorized source");
    // ...
}
```

**Autorización de SmartStaking:**
```solidity
function setAuthorizedSource(address source, bool authorized) external onlyOwner {
    // Owner DEBE llamar a esto para autorizar SmartStaking
}
```

**Allocations iniciales (basis points):**
- REWARDS (0): 3000 = 30% de 80% distribuble = 24% del total
- STAKING (1): 3500 = 35% de 80% distributable = 28% del total
- COLLABORATORS (2): 2000 = 20% de 80% distributable = 16% del total
- DEVELOPMENT (3): 1500 = 15% de 80% distributable = 12% del total
- MARKETPLACE (4): 0 = 0% (reservado para futuro)
- **RESERVE**: 2000 = 20% del TOTAL recibido (automático)

---

### SmartStaking

**Configuración requerida:**
```solidity
function setTreasuryManager(address _treasuryManager) external onlyOwner
function changeTreasuryAddress(address _newTreasury) external onlyOwner
```

**Depósito y Comisión (esperado):**
Cuando un usuario hace un depósito de N POL:
1. SmartStaking recibe los N POL
2. Calcula comisión: `commission = N * 6 / 100`
3. **Debe enviar comisión a TreasuryManager:**
   ```solidity
   // Opción A: directamente (sin tipo)
   payable(treasuryManager).call{value: commission}("");
   
   // Opción B: con tipo (recomendado)
   ITreasuryManager(treasuryManager).receiveRevenue{value: commission}("staking_commission");
   ```

---

## ✅ Checklist de Sincronización

### 1. **VERIFICAR: SmartStaking está autorizado en TreasuryManager**

**Comando (en Admin o Etherscan):**
```javascript
// Llamar a function
treasuryManager.authorizedSources(SMARTSTAKING_ADDRESS)
// Debe retornar: true

// Si es false, ejecutar:
treasuryManager.setAuthorizedSource(SMARTSTAKING_ADDRESS, true)
```

**ABI Field:** `mapping(address => bool) public authorizedSources`

---

### 2. **VERIFICAR: SmartStaking tiene la dirección correcta del Treasury**

**Etherscan view function:**
```javascript
smartStaking.treasuryManager()
// Debe retornar: 0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9
```

**Si es incorrecta:**
```javascript
smartStaking.setTreasuryManager("0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9")
```

---

### 3. **VERIFICAR: Las comisiones se están enviando**

**Buscar transacciones:**
1. Ir a Etherscan
2. Buscar dirección del Treasury Manager: `0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9`
3. Pestaña "Transactions"
4. Buscar transacciones desde SmartStaking

**Esperado después de 2 depósitos de 18.80 POL:**
- Transacción 1: 18.80 POL → Depósito
- Transacción 2: ~1.13 POL → Comisión al Treasury (6% de 18.80)
- Transacción 3: 18.80 POL → Depósito
- Transacción 4: ~1.13 POL → Comisión al Treasury (6% de 18.80)
- **Total en Treasury:** ~2.26 POL en comisiones

---

### 4. **VERIFICAR: Treasury tiene saldo correcto**

**En Admin Dashboard:**
```
Treasury Manager:
├─ Address: 0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9
├─ Balance: Should show ~2.26 POL (o más si se ejecutó el último depósito)
└─ Reserve: Should show 20% de ingresos totales
```

**View functions a llamar:**
```javascript
treasuryManager.getBalance()           // Total balance
treasuryManager.getAvailableBalance()  // Balance - reserve
treasuryManager.getReserveStats()      // Reserve info
treasuryManager.getAllAllocations()    // [3000, 3500, 2000, 1500, 0]
```

---

## 🐛 Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| Reserve Balance: 0.00 | SmartStaking no enviando pagos | Autorizar SmartStaking en Treasury |
| Porcentajes incorrectos | ABI retorna basis points sin dividir | Frontend ya corregido (divide por 100) |
| Commission never arrives | SmartStaking sin autorización | Ejecutar `setAuthorizedSource()` |
| Wrong treasury address | Setup incorrecto en SmartStaking | Ejecutar `setTreasuryManager()` |

---

## 📝 Logs a Revisar

**Browser Console (DevTools F12):**
```
[useTreasuryStats] getStats success: [...]
[useTreasuryStats] getAllAllocations success: [3000, 3500, 2000, 1500, 0]
[useTreasuryStats] getReserveStats success: [...]
[useTreasuryStats] getBalance success: [...]
```

**Si ves "failed":**
- revisa el mensaje de error
- significa que la función no está disponible o falla

---

## 🔗 Archivos Relacionados

**ABI:**
- `src/abi/Treasury/TreasuryManager.json` - ABI correcto
- `src/abi/SmartStaking/EnhancedSmartStakingCoreV2.json` - Staking ABI

**Hooks:**
- `src/hooks/treasury/useTreasuryStats.ts` - Ya corregido (allocations/100 implementado)

**Componentes:**
- `src/components/staking/TreasuryPoolChart.tsx` - UI con debug log

---

## ✨ Resumen de la Solución

1. **En Admin Panel:** Ir a Treasury Manager
2. **Ejecutar:** `setAuthorizedSource(SMARTSTAKING_ADDRESS, true)`
3. **Verificar en Etherscan** que SmartStaking enviará comisiones en los próximos depósitos
4. **Validar** en 7 días cuando se ejecute el ciclo de distribución

**Después del fix:**
- Reserve Balance mostrará los fondos acumulados
- Las allocations mostrarán los porcentajes correctos
- Las transacciones aparecerán en Etherscan
