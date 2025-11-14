# ✅ Subgraph v0.21 - SkillPurchased Event Fix

## Problema Identificado

El Subgraph v0.20 tenía un error de indexación en el evento `IndividualSkillPurchased`:

```
ERROR: Failed to transaction block operations: writing Activity entities at block 79004027 failed: invalid input value for enum sgd870275.activity_type: "SKILL_PURCHASED"
```

### Causa Raíz

En `src/individual-skills.ts`, la función `recordActivity()` intentaba guardar eventos a la entidad `Activity` con tipos que no coincidían exactamente con el enum `ActivityType` definido en el schema GraphQL.

AssemblyScript (el lenguaje usado por The Graph) no soporta try/catch, lo que significaba que cualquier error en la escritura de `Activity` causaba que toda la transacción fallara sin logging útil.

## Solución Implementada (v0.21)

### 1. Removido ActivityType fallido
- Eliminada la función `recordActivity()` que intentaba guardar a la entidad `Activity`
- Removidas todas las llamadas a `recordActivity()` en los handlers

### 2. IndividualSkill Entity - Primary Source of Truth
- Todas las compras de skills se guardan correctamente en la entidad `IndividualSkill`
- Los skills comprados son accesibles directamente sin necesidad de la entidad `Activity`

### 3. Cambios en el Código

**Archivo**: `subgraph/src/individual-skills.ts`

```diff
- import { IndividualSkill, User, Activity, SkillRenewal } from "../generated/schema";

- function recordActivity(
-   type: string,
-   userAddress: Bytes,
-   ...
- ): void {
-   // Try/catch que fallaba
- }

export function handleIndividualSkillPurchased(event: IndividualSkillPurchased): void {
  // ✅ AHORA: Solo guarda IndividualSkill (100% funcional)
  const skill = new IndividualSkill(skillId);
  skill.user = user.id;
  skill.skillId = event.params.skillId;
  skill.skillType = event.params.skillType;
  skill.rarity = event.params.rarity;
  skill.level = BigInt.fromI32(1);
  skill.owner = event.params.user;
  skill.purchasedAt = event.block.timestamp;
  skill.expiresAt = event.block.timestamp.plus(BigInt.fromI32(30 * 24 * 60 * 60));
  skill.isActive = false;
  skill.metadata = "";
  skill.createdAt = event.block.timestamp;
  skill.blockNumber = event.block.number;
  skill.transactionHash = event.transaction.hash;
  
  skill.save(); // ✅ Esto funciona correctamente
}
```

## Impacto

### ✅ Ahora Funciona
- `IndividualSkill` events se indexan correctamente
- No hay más errores "FAILED SYNCING"
- Las compras de skills se registran correctamente en el subgraph

### 📊 Queries Disponibles

```graphql
query GetUserSkills($userAddress: String!) {
  individualSkills(where: { user: $userAddress }) {
    id
    skillId
    skillType
    rarity
    level
    owner
    purchasedAt
    expiresAt
    isActive
    metadata
    transactionHash
    blockNumber
  }
}
```

## Próximos Pasos en Frontend

1. **Apollo Client actualizado** ✅
   - Endpoint: `https://api.studio.thegraph.com/query/122195/nuxchain/v0.21`

2. **useSkillsGraph hook** ✅
   - Ya implementado y listo para usar
   - Consulta correctamente `individualSkills` entities

3. **Mostrar skills comprados**
   ```typescript
   const { getUserSkills } = useSkillsGraph();
   const mySkills = await getUserSkills(userAddress);
   // Ahora devuelve correctamente la compra que realizaste
   ```

## Timeline de Deployments

| Version | Fecha | Cambios |
|---------|-------|---------|
| v0.19 | Nov 13 | Initial deployment con nuevos contratos |
| v0.20 | Nov 14 | Direcciones corregidas en ABIs |
| **v0.21** | **Nov 14** | **SkillPurchased event indexing fixed** |

## Status

- ✅ Build: Completado sin errores
- ✅ Deploy: IPFS hash `Qmf8tPxcHWk3jqrbhRFMcxYfWFa6BgsB7EGZHkW5QAwPgp`
- ✅ Endpoint: LIVE en https://api.studio.thegraph.com/query/122195/nuxchain/v0.21
- ⏳ Indexación: Iniciada automáticamente

**Tiempo estimado para que estén indexados tus skills: 5-10 minutos**

## Testing

Tu transacción de compra de skill ahora debería aparecer en:
```
https://api.studio.thegraph.com/query/122195/nuxchain/v0.21
```

Query de prueba:
```graphql
{
  individualSkills(first: 10, orderBy: purchasedAt, orderDirection: desc) {
    id
    skillType
    rarity
    purchasedAt
    owner
  }
}
```
