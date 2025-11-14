# 📖 Frontend Read Functions Guide - Complete Reference

## 🎯 Overview

Este documento describe **TODAS las funciones de lectura** disponibles en los contratos principales para que el frontend pueda mostrar eficientemente los datos de los usuarios.

---

## 🏪 IndividualSkillsMarketplace - Funciones de Lectura

### ✅ Nuevas Funciones (Agregadas para el Frontend)

#### 1. **getUserSkillsByCategory** (RECOMENDADO - Función Principal)
```solidity
function getUserSkillsByCategory(address _user) external view returns (
    IndividualSkill[] memory stakingSkills,
    IndividualSkill[] memory activeSkills
)
```

**Uso en Frontend:**
```javascript
const { stakingSkills, activeSkills } = await contract.getUserSkillsByCategory(userAddress);

// stakingSkills = todas tus compras de STAKING (types 1-7)
// activeSkills = todas tus compras de PLATFORM (types 8-16)
console.log(`Skills de Staking: ${stakingSkills.length}`);
console.log(`Skills de Plataforma: ${activeSkills.length}`);
```

**Retorna:**
- ✅ **STAKING Skills** (tipos 1-7): Que afectan rewards de staking
- ✅ **PLATFORM Skills** (tipos 8-16): Que dan acceso a features del marketplace

---

#### 2. **getUserStakingSkills** (Filtro Específico)
```solidity
function getUserStakingSkills(address _user) external view returns (
    IndividualSkill[] memory skills,
    bool[] memory isActive,
    bool[] memory isExpired
)
```

**Uso en Frontend:**
```javascript
const { skills, isActive, isExpired } = await contract.getUserStakingSkills(userAddress);

skills.forEach((skill, i) => {
    console.log(`${skill.title}:`);
    console.log(`  - Activo: ${isActive[i]}`);
    console.log(`  - Expirado: ${isExpired[i]}`);
    console.log(`  - Rarity: ${skill.rarity}`);
});
```

**Retorna SOLO:**
- ✅ Skills que afectan staking rewards (STAKE_BOOST, AUTO_COMPOUND, LOCK_REDUCER, FEE_REDUCER)
- ✅ Con estado de activación y expiración

---

#### 3. **getUserPlatformSkills** (Filtro Específico)
```solidity
function getUserPlatformSkills(address _user) external view returns (
    IndividualSkill[] memory skills,
    bool[] memory isActive,
    bool[] memory isExpired
)
```

**Uso en Frontend:**
```javascript
const { skills, isActive, isExpired } = await contract.getUserPlatformSkills(userAddress);

skills.forEach((skill, i) => {
    if (isActive[i] && !isExpired[i]) {
        console.log(`✅ ${skill.title} está activo`);
    }
});
```

**Retorna SOLO:**
- ✅ Skills de plataforma (PRIORITY_LISTING, BATCH_MINTER, etc.)
- ✅ Con estado de activación y expiración

---

#### 4. **getUserSkillsComprehensive** (Más Detalles)
```solidity
function getUserSkillsComprehensive(address _user) external view returns (
    IndividualSkill[] memory allSkills,
    bool[] memory isActive,
    bool[] memory isExpired,
    uint256[] memory expiresIn,
    string[] memory categoryNames
)
```

**Uso en Frontend:**
```javascript
const { allSkills, isActive, isExpired, expiresIn, categoryNames } = 
    await contract.getUserSkillsComprehensive(userAddress);

allSkills.forEach((skill, i) => {
    const category = categoryNames[i];
    const daysLeft = Math.floor(expiresIn[i] / 86400);
    
    console.log(`${skill.title} (${category})`);
    console.log(`  Expira en: ${daysLeft} días`);
    console.log(`  Estado: ${isActive[i] ? 'ACTIVO' : 'INACTIVO'}`);
});
```

**Retorna:**
- ✅ TODOS los skills con información completa
- ✅ Tiempo restante hasta expiración en segundos
- ✅ Categoría (STAKING/PLATFORM) en texto

---

#### 5. **getUserSkillStats** (Resumen/Dashboard)
```solidity
function getUserSkillStats(address _user) external view returns (
    uint256 totalSkills,
    uint256 totalStakingSkills,
    uint256 totalPlatformSkills,
    uint256 activeCount,
    uint256 expiredCount
)
```

**Uso en Frontend:**
```javascript
const stats = await contract.getUserSkillStats(userAddress);

console.log(`
    📊 Tu Inventario de Skills:
    - Total: ${stats.totalSkills}
    - Staking: ${stats.totalStakingSkills}
    - Platform: ${stats.totalPlatformSkills}
    - Activos: ${stats.activeCount}
    - Expirados: ${stats.expiredCount}
`);
```

**Uso Ideal:**
- ✅ Dashboard/summary en home
- ✅ Mostrar estadísticas rápidas
- ✅ Contador de skills

---

### 📚 Funciones Existentes Importantes

#### 6. **getIndividualSkill** (Detalles de UN skill)
```solidity
function getIndividualSkill(uint256 _skillId) external view returns (IndividualSkill memory)
```

**Uso:**
```javascript
const skillDetails = await contract.getIndividualSkill(skillId);
console.log(`${skillDetails.title} - Rarity: ${skillDetails.rarity}`);
```

---

#### 7. **getUserIndividualSkills** (Solo IDs)
```solidity
function getUserIndividualSkills(address _user) external view returns (uint256[] memory)
```

**Uso:**
```javascript
const skillIds = await contract.getUserIndividualSkills(userAddress);
console.log(`Tienes ${skillIds.length} skills comprados`);
```

**Nota:** Retorna SOLO los IDs, usar `getIndividualSkill()` para detalles

---

#### 8. **getActiveIndividualSkills** (Solo Activos Sin Expirar)
```solidity
function getActiveIndividualSkills(address _user) external view returns (uint256[] memory)
```

**Uso:**
```javascript
const activeSkillIds = await contract.getActiveIndividualSkills(userAddress);
console.log(`${activeSkillIds.length} skills activos ahora`);
```

---

#### 9. **getUserIndividualSkillsDetailed** (Con Estado)
```solidity
function getUserIndividualSkillsDetailed(address _user) external view returns (
    IndividualSkill[] memory skills,
    bool[] memory isActive
)
```

**Uso:**
```javascript
const { skills, isActive } = await contract.getUserIndividualSkillsDetailed(userAddress);

skills.forEach((skill, i) => {
    console.log(`${skill.title}: ${isActive[i] ? 'ACTIVO' : 'INACTIVO'}`);
});
```

---

#### 10. **getSkillPrice** (Precio Individual)
```solidity
function getSkillPrice(
    IStakingIntegration.SkillType _skillType,
    IStakingIntegration.Rarity _rarity
) external view returns (uint256)
```

**Uso:**
```javascript
// Obtener precio de STAKE_BOOST_I (type=1) LEGENDARY (rarity=4)
const price = await contract.getSkillPrice(1, 4);
console.log(`Cuesta: ${ethers.formatEther(price)} POL`);
```

---

#### 11. **getSkillPricesAllRarities** (Todos los Precios)
```solidity
function getSkillPricesAllRarities(IStakingIntegration.SkillType _skillType)
    external view returns (uint256[5] memory)
```

**Uso:**
```javascript
// Obtener precios para STAKE_BOOST_I en todas las rarities
const prices = await contract.getSkillPricesAllRarities(1);
console.log(`
    COMMON: ${ethers.formatEther(prices[0])} POL
    UNCOMMON: ${ethers.formatEther(prices[1])} POL
    RARE: ${ethers.formatEther(prices[2])} POL
    EPIC: ${ethers.formatEther(prices[3])} POL
    LEGENDARY: ${ethers.formatEther(prices[4])} POL
`);
```

---

#### 12. **getAllSkillsPricing** (Tabla Completa de Precios)
```solidity
function getAllSkillsPricing() external view returns (
    IStakingIntegration.SkillType[] memory skillTypes,
    uint8[] memory categories,
    uint256[][] memory prices
)
```

**Uso:**
```javascript
const { skillTypes, categories, prices } = await contract.getAllSkillsPricing();

// prices[0] = prices para skill type 1 (STAKE_BOOST_I)
// prices[0][0] = COMMON price
// prices[0][4] = LEGENDARY price

skillTypes.forEach((type, i) => {
    console.log(`Type ${type}:`);
    console.log(`  Category: ${categories[i] === 0 ? 'STAKING' : 'PLATFORM'}`);
    prices[i].forEach((price, j) => {
        console.log(`    Rarity ${j}: ${ethers.formatEther(price)} POL`);
    });
});
```

---

#### 13. **getUserActiveSkillCountByType** (Contador por Tipo)
```solidity
function getUserActiveSkillCountByType(address _user, IStakingIntegration.SkillType _skillType)
    external view returns (uint8)
```

**Uso:**
```javascript
// Cuántos STAKE_BOOST_I tiene activos
const count = await contract.getUserActiveSkillCountByType(userAddress, 1);
console.log(`Tienes ${count} STAKE_BOOST_I activos`);
```

---

## 🎨 Estructura de IndividualSkill

```solidity
struct IndividualSkill {
    uint256 skillId;                                    // ID único
    address owner;                                      // Propietario
    IStakingIntegration.SkillType skillType;           // Tipo (1-17)
    IStakingIntegration.Rarity rarity;                 // Raridad (0-4)
    uint256 level;                                      // Nivel
    uint256 purchasedAt;                               // Timestamp de compra
    uint256 expiresAt;                                 // Timestamp de expiración
    bool isActive;                                      // ¿Está activado?
    string metadata;                                    // JSON con info adicional
}
```

---

## 🎯 Recomendaciones Para Frontend

### ✅ Mejor Práctica: Usar `getUserSkillsByCategory`

```javascript
// RECOMENDADO - Llamada única que retorna todo organizado
const { stakingSkills, activeSkills } = await contract.getUserSkillsByCategory(userAddress);

// Tu frontend ya tiene TODOS los skills categorizados y listos para mostrar
```

### ❌ Evitar: Múltiples Llamadas

```javascript
// MAL - Múltiples llamadas innecesarias
const stakingSkills = await contract.getUserStakingSkills(userAddress);
const activeSkills = await contract.getUserPlatformSkills(userAddress);
const stats = await contract.getUserSkillStats(userAddress);
// 3 llamadas = 3x gas = 3x latencia
```

### ✅ Para Dashboard: Usar `getUserSkillStats`

```javascript
// Para mostrar resumen rápido
const stats = await contract.getUserSkillStats(userAddress);
// 1 llamada = números para el dashboard
```

### ✅ Para Detalles Completos: Usar `getUserSkillsComprehensive`

```javascript
// Para página detallada con todo
const data = await contract.getUserSkillsComprehensive(userAddress);
// Tienes TODOS los skills con timestamps, categorías, etc.
```

---

## 📊 Enums de Referencia

### SkillType (1-16)

**STAKING SKILLS (1-7):**
```
1: STAKE_BOOST_I        (+5% APY)
2: STAKE_BOOST_II       (+10% APY)
3: STAKE_BOOST_III      (+20% APY)
4: AUTO_COMPOUND        (Auto-compund diario)
5: LOCK_REDUCER         (-25% lock time)
6: FEE_REDUCER_I        (-10% fees)
7: FEE_REDUCER_II       (-25% fees)
```

**PLATFORM SKILLS (8-16):**
```
8:  PRIORITY_LISTING    (Destacado en inicio)
9:  BATCH_MINTER        (Mintear múltiples NFTs)
10: VERIFIED_CREATOR    (Badge verificado)
11: INFLUENCER          (2x peso en likes/comments)
12: CURATOR             (Crear colecciones destacadas)
13: AMBASSADOR          (2x bonus referral)
14: VIP_ACCESS          (Acceso a drops exclusivos)
15: EARLY_ACCESS        (24h acceso anticipado)
16: PRIVATE_AUCTIONS    (Acceso a subastas privadas)
```

### Rarity (0-4)

```
0: COMMON      (1-3 stars)    50 POL base
1: UNCOMMON    (4-5 stars)    80 POL base
2: RARE        (6-7 stars)    100 POL base
3: EPIC        (8-9 stars)    150 POL base
4: LEGENDARY   (10 stars)     220 POL base
```

---

## 🔧 Ejemplo Completo: Página de Skills del Usuario

```javascript
async function loadUserSkillsPage(userAddress) {
    const contract = getContract(); // Tu instancia del contrato
    
    // 1️⃣ Obtener stats para dashboard
    const stats = await contract.getUserSkillStats(userAddress);
    displayStatsCard(stats);
    
    // 2️⃣ Obtener todos los skills categorizados
    const { stakingSkills, activeSkills } = await contract.getUserSkillsByCategory(userAddress);
    
    // 3️⃣ Mostrar STAKING skills
    displayStakingSkillsSection(stakingSkills);
    
    // 4️⃣ Mostrar PLATFORM skills
    displayPlatformSkillsSection(activeSkills);
    
    // 5️⃣ Para cada skill, obtener detalles si es necesario
    for (let skill of [...stakingSkills, ...activeSkills]) {
        const fullDetails = await contract.getIndividualSkill(skill.skillId);
        updateSkillCard(skill.skillId, fullDetails);
    }
}

// Usar así en tu React/Vue/etc:
useEffect(() => {
    loadUserSkillsPage(userAddress);
}, [userAddress]);
```

---

## 🚀 Llamadas Recomendadas por Escenario

| Escenario | Función | Por qué |
|-----------|---------|--------|
| **Home Dashboard** | `getUserSkillStats()` | Rápido, solo números |
| **Página de Skills** | `getUserSkillsByCategory()` | Todo organizado en 1 llamada |
| **Detalles Completos** | `getUserSkillsComprehensive()` | Includes timestamps, categorías, etc |
| **Ver 1 Skill** | `getIndividualSkill(id)` | Detalles específicos |
| **Listar Precios** | `getAllSkillsPricing()` | Tabla de precios para tienda |
| **Precio Individual** | `getSkillPrice(type, rarity)` | Un skill específico |

---

## ✨ Conclusión

Ahora tienes **13 funciones diferentes** para leer datos:

1. ✅ **`getUserSkillsByCategory`** - MAIN: Todo categor izado
2. ✅ **`getUserStakingSkills`** - Solo staking
3. ✅ **`getUserPlatformSkills`** - Solo platform
4. ✅ **`getUserSkillsComprehensive`** - Todo con detalles
5. ✅ **`getUserSkillStats`** - Resumen/números
6. `getIndividualSkill()` - Detalles 1 skill
7. `getUserIndividualSkills()` - Solo IDs
8. `getActiveIndividualSkills()` - Solo activos
9. `getUserIndividualSkillsDetailed()` - Con estado
10. `getSkillPrice()` - 1 precio
11. `getSkillPricesAllRarities()` - Todos los precios
12. `getAllSkillsPricing()` - Tabla completa
13. `getUserActiveSkillCountByType()` - Contador

**Usa `getUserSkillsByCategory()` como principal - retorna TODOS tus skills organizados en una sola llamada.**
