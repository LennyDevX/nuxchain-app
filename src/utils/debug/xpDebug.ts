/**
 * Utilidades para debugging de XP
 * Funciones simples sin dependencias wagmi/core
 */

/**
 * Log formateado de XP y estado
 */
export function logXPStatus(totalXP: bigint, level: number, nftsCreated: bigint) {
  const nextLevelXP = BigInt((level + 1) ** 2 * 100);
  const currentLevelXP = BigInt(level ** 2 * 100);
  const xpIntoCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = (Number(xpIntoCurrentLevel) / Number(xpNeededForNextLevel)) * 100;

  console.log('� Estado XP:', {
    'Total XP': totalXP.toString(),
    'Nivel Actual': level,
    'XP en Nivel': `${xpIntoCurrentLevel}/${xpNeededForNextLevel}`,
    'Progreso': `${progressPercent.toFixed(1)}%`,
    'NFTs Creados': nftsCreated.toString(),
  });
}

/**
 * Valida si el XP es consistente con NFTs creados
 */
export function validateXPConsistency(totalXP: bigint, nftsCreated: bigint) {
  const expectedMinXP = nftsCreated * 10n;
  
  if (totalXP < expectedMinXP) {
    console.warn(`⚠️ XP bajo: esperado ~${expectedMinXP} pero tenemos ${totalXP}`);
    return false;
  }
  
  console.log(`✅ XP consistente: ${nftsCreated} NFTs = ${expectedMinXP} XP mínimo`);
  return true;
}
