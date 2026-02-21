/**
 * ⚡ Skills System Toast Notifications
 * Notificaciones para compra, activación y beneficios de Skills NFT
 */

import toast from 'react-hot-toast'
import { makeToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles'

const s = {
  purchase:   makeToastStyle('premium'),
  activation: makeToastStyle('success'),
  upgrade:    makeToastStyle('warning'),
  benefit:    makeToastStyle('comment'),
  error:      makeToastStyle('error'),
}

/**
 * Skills System Toast Notifications
 */
export const skillToasts = {
  /**
   * Notificación cuando se compra un skill
   * @param skillName Nombre del skill
   * @param price Precio pagado
   * @param rarity Rareza del skill
   */
  skillPurchased: (skillName: string, price: string, rarity: string) => {
    toast.success(`⚡ Skill Adquirido!\n"${skillName}" (${rarity})\n${price} POL`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.purchase })
  },

  /**
   * Notificación cuando se activa un skill
   * @param skillName Nombre del skill
   * @param benefit Beneficio principal
   */
  skillActivated: (skillName: string, benefit: string) => {
    toast.success(`✨ Skill Activado!\n"${skillName}"\n${benefit}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.activation })
  },

  /**
   * Notificación cuando se mejora un skill
   * @param skillName Nombre del skill
   * @param newLevel Nuevo nivel
   * @param improvedBenefit Beneficio mejorado
   */
  skillUpgraded: (skillName: string, newLevel: number, improvedBenefit: string) => {
    toast.success(`⬆️ Skill Mejorado!\n"${skillName}" → Nivel ${newLevel}\n${improvedBenefit}`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.upgrade })
  },

  /**
   * Notificación cuando se aplica un descuento por skill
   * @param discountPercent Porcentaje de descuento
   * @param skillName Nombre del skill que otorga el descuento
   */
  discountApplied: (discountPercent: number, skillName: string) => {
    toast(`💰 ¡Descuento Aplicado!\n${discountPercent}% OFF gracias a "${skillName}"`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.benefit })
  },

  /**
   * Notificación de beneficio de skill activado
   * @param skillName Nombre del skill
   * @param benefitDescription Descripción del beneficio
   */
  benefitActivated: (skillName: string, benefitDescription: string) => {
    toast(`💎 Beneficio Activo!\n"${skillName}"\n${benefitDescription}`, { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.benefit })
  },

  /**
   * Notificación de combo de skills activado
   * @param comboName Nombre del combo
   * @param bonusPercent Bonificación adicional del combo
   */
  comboActivated: (comboName: string, bonusPercent: number) => {
    toast.success(`🔥 ¡COMBO ACTIVADO!\n"${comboName}"\n+${bonusPercent}% Bonus Extra`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: s.upgrade })
  },

  /**
   * Notificación de recompensa por staking con skill
   * @param bonusReward Recompensa bonificada
   * @param skillName Skill que otorga el bonus
   */
  stakingBonusEarned: (bonusReward: string, skillName: string) => {
    toast.success(`💰 ¡Bonus de Staking Ganado!\n+${bonusReward} gracias a "${skillName}"`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.benefit })
  },

  /**
   * Notificación de XP extra por skill
   * @param xpBonus XP extra ganado
   * @param skillName Skill que otorga el bonus
   */
  xpBonusEarned: (xpBonus: number, skillName: string) => {
    toast(`✨ ¡XP Bonus Ganado!\n+${xpBonus} XP extra por "${skillName}"`, { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.benefit })
  },

  /**
   * Notificación de colección completada
   * @param collectionName Nombre de la colección
   * @param bonusReward Recompensa por completar
   */
  collectionCompleted: (collectionName: string, bonusReward: string) => {
    toast.success(`🏆 ¡Colección Completa!\n"${collectionName}"\nRecompensa: ${bonusReward}`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: s.upgrade })
  },

  /**
   * Notificación de skill ya poseído
   */
  skillAlreadyOwned: () => {
    toast.error(`⚠️ Ya posees este Skill`, { duration: toastDurations.default, position: DEFAULT_POSITION, style: s.error })
  },

  /**
   * Notificación de fondos insuficientes para skill
   * @param required Cantidad requerida
   * @param current Balance actual
   */
  insufficientFunds: (required: string, current: string) => {
    toast.error(`💸 Fondos Insuficientes\nRequiere: ${required} POL\nTienes: ${current} POL`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  /**
   * Error genérico
   */
  error: (message: string) => {
    toast.error(message, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  }
}
