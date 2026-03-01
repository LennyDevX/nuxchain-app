# 🔧 ACCIONES REQUERIDAS - Sincronización de Contratos

## ⚠️ PROBLEMA IDENTIFICADO

**SmartStaking NO está autorizado en TreasuryManager para enviar comisiones**

Después de revisar los contratos y ABIs, encontré que:
- ✅ TreasuryManager está deployado correctamente
- ✅ SmartStaking tiene configurada la dirección del Treasury
- ❌ **SmartStaking NO está en la lista de fuentes autorizadas**

Debido a esto, cuando SmartStaking intenta enviar la comisión del 6%, **TreasuryManager rechaza la transacción** con:
```
Error: Not authorized source
```

---

## ✅ SOLUCIÓN: Pasos a Ejecutar

### Paso 1: Ir a Admin Panel

Navega a tu Admin Dashboard:
```
http://localhost:5173/admin/dashboard
```

o en producción:
```
https://tudominio.com/admin/dashboard
```

---

### Paso 2: Busca "Treasury Manager"

En el panel, busca la sección **Treasury Manager**:
- Address: `0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9`
- Status: "Deployed"

---

### Paso 3: Autorizar SmartStaking

**Opción A: Usando Etherscan (Más directo)**

1. Ve a [Etherscan Polygon](https://polygonscan.com/)
2. Busca la dirección: `0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9`
3. Pestaña "Write as Proxy" (necesitas conectar tu wallet)
4. Busca la función: `setAuthorizedSource`
5. Ingresa los parámetros:
   - **source**: `0xC67F0a0cB719e4f4358D980a5D966878Fd6f3946` (SmartStaking)
   - **authorized**: `true`
6. Click "Write"
7. Confirma la transacción en tu wallet

**Opción B: Usando Admin Panel (Si está implementado)**

1. En el Admin Dashboard, busca "Contract Manager"
2. Selecciona **TreasuryManager**
3. Busca función: **setAuthorizedSource**
4. Ingresa SmartStaking address: `0xC67F0a0cB719e4f4358D980a5D966878Fd6f3946`
5. Selecciona: **Authorize = true**
6. Ejecuta la transacción

---

## 🔐 Parámetros Exactos

### setAuthorizedSource

```
Function: setAuthorizedSource(address source, bool authorized)

Parámetro 1 (source):
0xC67F0a0cB719e4f4358D980a5D966878Fd6f3946
(Dirección de SmartStaking)

Parámetro 2 (authorized):
true
```

---

## ✨ Verificar que Funcionó

Después de ejecutar `setAuthorizedSource`, verifica:

### 1. En Etherscan
```
Función: authorizedSources(0xC67F0a0cB719e4f4358D980a5D966878Fd6f3946)
Debe retornar: true
```

### 2. En el Dashboard
Haz un nuevo depósito en Staking y verifica:
- Una transacción de comisión llega a Treasury Manager
- Reserve Balance aumenta
- Allocations muestran los porcentajes correctos

### 3. En la Consola (DevTools F12)
```
[useTreasuryStats] Treasury Data: {
  allocations: {
    rewards: 24,      // 30% of 80%
    staking: 28,      // 35% of 80%
    collaborators: 16,// 20% of 80%
    development: 12,  // 15% of 80%
    marketplace: 0
  },
  reserve: {
    currentBalance: "1.13", // Aumentó después del depósito
    healthLevel: "Low",
    ...
  }
}
```

---

## 📊 Resultado Esperado

**Antes:**
```
Reserve Balance: 0.00 POL
Allocations: [2000, 2500, 1500, 2000, 2000] (mostrando mal)
```

**Después:**
```
Reserve Balance: ~1.13 POL (6% de primer depósito + comisión)
Allocations: [20%, 25%, 15%, 20%, 20%] (porcentajes correctos)
```

---

## 📝 Dirección del TreasuryManager

```
0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9
```

**Enlaces útiles:**
- [Etherscan - Treasury Manager](https://polygonscan.com/address/0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9)
- [Etherscan - SmartStaking](https://polygonscan.com/address/0xC67F0a0cB719e4f4358D980a5D966878Fd6f3946)

---

## ⏰ Línea de Tiempo Después del Fix

1. **Ahora**: Ejecuta `setAuthorizedSource`
2. **Próximo depósito**: SmartStaking enviará comisión al Treasury
3. **En 7 días**: TreasuryManager ejecutará distribución automática
4. **Resultado**: Allocations se distribuirán a los treasuries configurados

---

## 🆘 Si No Funciona

**Síntomas:**
- Depósito se ejecuta pero comisión no llega
- Reserve Balance sigue en 0.00

**Causas Posibles:**
1. ❌ Transacción `setAuthorizedSource` no se confirmó (revisa Etherscan)
2. ❌ SmartStaking no tiene payable en deposit (bug en contrato)
3. ❌ TreasuryManager en pausa (función paused() retorna true)
4. ❌ Otra función de autorización pendiente

**Actions:**
- Verifica en Etherscan que `setAuthorizedSource` se ejecutó
- Busca logs de error en tu contrato SmartStaking
- Contacta al equipo de desarrollo

---

## 🎯 Summary

**Una sola acción requiere autorización:**
```
setAuthorizedSource(0xC67F0a0cB719e4f4358D980a5D966878Fd6f3946, true)
```

Después de esto, todo debería funcionar automáticamente.
