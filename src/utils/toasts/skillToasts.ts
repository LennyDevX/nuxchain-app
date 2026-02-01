/**
 * ⚡ Skills System Toast Notifications
 * Notificaciones para compra, activación y beneficios de Skills NFT
 */

import toast from 'react-hot-toast'

/**
 * 🎨 Toast Style Presets for Skills System
 */
const skillToastStyles = {
  purchase: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
    border: '1px solid rgba(139, 92, 246, 0.5)',
    icon: '⚡'
  },
  activation: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
    border: '1px solid rgba(16, 185, 129, 0.5)',
    icon: '✨'
  },
  upgrade: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)',
    border: '1px solid rgba(245, 158, 11, 0.5)',
    icon: '⬆️'
  },
  benefit: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(6, 182, 212, 0.3)',
    border: '1px solid rgba(6, 182, 212, 0.5)',
    icon: '💎'
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    icon: '⚠️'
  }
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
    toast.success(
      `⚡ Skill Adquirido!\n"${skillName}" (${rarity})\n${price} POL`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: skillToastStyles.purchase.background,
          color: skillToastStyles.purchase.color,
          fontSize: skillToastStyles.purchase.fontSize,
          fontWeight: skillToastStyles.purchase.fontWeight,
          borderRadius: skillToastStyles.purchase.borderRadius,
          padding: skillToastStyles.purchase.padding,
          boxShadow: skillToastStyles.purchase.boxShadow,
          border: skillToastStyles.purchase.border
        }
      }
    )
  },

  /**
   * Notificación cuando se activa un skill
   * @param skillName Nombre del skill
   * @param benefit Beneficio principal
   */
  skillActivated: (skillName: string, benefit: string) => {
    toast.success(
      `✨ Skill Activado!\n"${skillName}"\n${benefit}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: skillToastStyles.activation.background,
          color: skillToastStyles.activation.color,
          fontSize: skillToastStyles.activation.fontSize,
          fontWeight: skillToastStyles.activation.fontWeight,
          borderRadius: skillToastStyles.activation.borderRadius,
          padding: skillToastStyles.activation.padding,
          boxShadow: skillToastStyles.activation.boxShadow,
          border: skillToastStyles.activation.border
        }
      }
    )
  },

  /**
   * Notificación cuando se mejora un skill
   * @param skillName Nombre del skill
   * @param newLevel Nuevo nivel
   * @param improvedBenefit Beneficio mejorado
   */
  skillUpgraded: (skillName: string, newLevel: number, improvedBenefit: string) => {
    toast.success(
      `⬆️ Skill Mejorado!\n"${skillName}" → Nivel ${newLevel}\n${improvedBenefit}`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: skillToastStyles.upgrade.background,
          color: skillToastStyles.upgrade.color,
          fontSize: skillToastStyles.upgrade.fontSize,
          fontWeight: skillToastStyles.upgrade.fontWeight,
          borderRadius: skillToastStyles.upgrade.borderRadius,
          padding: skillToastStyles.upgrade.padding,
          boxShadow: skillToastStyles.upgrade.boxShadow,
          border: skillToastStyles.upgrade.border
        }
      }
    )
  },

  /**
   * Notificación cuando se aplica un descuento por skill
   * @param discountPercent Porcentaje de descuento
   * @param skillName Nombre del skill que otorga el descuento
   */
  discountApplied: (discountPercent: number, skillName: string) => {
    toast(
      `💰 ¡Descuento Aplicado!\n${discountPercent}% OFF gracias a "${skillName}"`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: skillToastStyles.benefit.background,
          color: skillToastStyles.benefit.color,
          fontSize: skillToastStyles.benefit.fontSize,
          fontWeight: skillToastStyles.benefit.fontWeight,
          borderRadius: skillToastStyles.benefit.borderRadius,
          padding: skillToastStyles.benefit.padding,
          boxShadow: skillToastStyles.benefit.boxShadow,
          border: skillToastStyles.benefit.border
        }
      }
    )
  },

  /**
   * Notificación de beneficio de skill activado
   * @param skillName Nombre del skill
   * @param benefitDescription Descripción del beneficio
   */
  benefitActivated: (skillName: string, benefitDescription: string) => {
    toast(
      `💎 Beneficio Activo!\n"${skillName}"\n${benefitDescription}`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: skillToastStyles.benefit.background,
          color: skillToastStyles.benefit.color,
          fontSize: skillToastStyles.benefit.fontSize,
          fontWeight: skillToastStyles.benefit.fontWeight,
          borderRadius: skillToastStyles.benefit.borderRadius,
          padding: skillToastStyles.benefit.padding,
          boxShadow: skillToastStyles.benefit.boxShadow,
          border: skillToastStyles.benefit.border
        }
      }
    )
  },

  /**
   * Notificación de combo de skills activado
   * @param comboName Nombre del combo
   * @param bonusPercent Bonificación adicional del combo
   */
  comboActivated: (comboName: string, bonusPercent: number) => {
    toast.success(
      `🔥 ¡COMBO ACTIVADO!\n"${comboName}"\n+${bonusPercent}% Bonus Extra`,
      {
        duration: 7000,
        position: 'top-center',
        style: {
          background: skillToastStyles.upgrade.background,
          color: skillToastStyles.upgrade.color,
          fontSize: skillToastStyles.upgrade.fontSize,
          fontWeight: skillToastStyles.upgrade.fontWeight,
          borderRadius: skillToastStyles.upgrade.borderRadius,
          padding: skillToastStyles.upgrade.padding,
          boxShadow: skillToastStyles.upgrade.boxShadow,
          border: skillToastStyles.upgrade.border
        }
      }
    )
  },

  /**
   * Notificación de recompensa por staking con skill
   * @param bonusReward Recompensa bonificada
   * @param skillName Skill que otorga el bonus
   */
  stakingBonusEarned: (bonusReward: string, skillName: string) => {
    toast.success(
      `💰 ¡Bonus de Staking Ganado!\n+${bonusReward} gracias a "${skillName}"`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: skillToastStyles.benefit.background,
          color: skillToastStyles.benefit.color,
          fontSize: skillToastStyles.benefit.fontSize,
          fontWeight: skillToastStyles.benefit.fontWeight,
          borderRadius: skillToastStyles.benefit.borderRadius,
          padding: skillToastStyles.benefit.padding,
          boxShadow: skillToastStyles.benefit.boxShadow,
          border: skillToastStyles.benefit.border
        }
      }
    )
  },

  /**
   * Notificación de XP extra por skill
   * @param xpBonus XP extra ganado
   * @param skillName Skill que otorga el bonus
   */
  xpBonusEarned: (xpBonus: number, skillName: string) => {
    toast(
      `✨ ¡XP Bonus Ganado!\n+${xpBonus} XP extra por "${skillName}"`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: skillToastStyles.benefit.background,
          color: skillToastStyles.benefit.color,
          fontSize: skillToastStyles.benefit.fontSize,
          fontWeight: skillToastStyles.benefit.fontWeight,
          borderRadius: skillToastStyles.benefit.borderRadius,
          padding: skillToastStyles.benefit.padding,
          boxShadow: skillToastStyles.benefit.boxShadow,
          border: skillToastStyles.benefit.border
        }
      }
    )
  },

  /**
   * Notificación de colección completada
   * @param collectionName Nombre de la colección
   * @param bonusReward Recompensa por completar
   */
  collectionCompleted: (collectionName: string, bonusReward: string) => {
    toast.success(
      `🏆 ¡Colección Completa!\n"${collectionName}"\nRecompensa: ${bonusReward}`,
      {
        duration: 7000,
        position: 'top-center',
        style: {
          background: skillToastStyles.upgrade.background,
          color: skillToastStyles.upgrade.color,
          fontSize: skillToastStyles.upgrade.fontSize,
          fontWeight: skillToastStyles.upgrade.fontWeight,
          borderRadius: skillToastStyles.upgrade.borderRadius,
          padding: skillToastStyles.upgrade.padding,
          boxShadow: skillToastStyles.upgrade.boxShadow,
          border: skillToastStyles.upgrade.border
        }
      }
    )
  },

  /**
   * Notificación de skill ya poseído
   */
  skillAlreadyOwned: () => {
    toast.error(
      `⚠️ Ya posees este Skill`,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: skillToastStyles.error.background,
          color: skillToastStyles.error.color,
          fontSize: skillToastStyles.error.fontSize,
          fontWeight: skillToastStyles.error.fontWeight,
          borderRadius: skillToastStyles.error.borderRadius,
          padding: skillToastStyles.error.padding,
          boxShadow: skillToastStyles.error.boxShadow,
          border: skillToastStyles.error.border
        }
      }
    )
  },

  /**
   * Notificación de fondos insuficientes para skill
   * @param required Cantidad requerida
   * @param current Balance actual
   */
  insufficientFunds: (required: string, current: string) => {
    toast.error(
      `💸 Fondos Insuficientes\nRequiere: ${required} POL\nTienes: ${current} POL`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: skillToastStyles.error.background,
          color: skillToastStyles.error.color,
          fontSize: skillToastStyles.error.fontSize,
          fontWeight: skillToastStyles.error.fontWeight,
          borderRadius: skillToastStyles.error.borderRadius,
          padding: skillToastStyles.error.padding,
          boxShadow: skillToastStyles.error.boxShadow,
          border: skillToastStyles.error.border
        }
      }
    )
  },

  /**
   * Error genérico
   */
  error: (message: string) => {
    toast.error(
      message,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: skillToastStyles.error.background,
          color: skillToastStyles.error.color,
          fontSize: skillToastStyles.error.fontSize,
          fontWeight: skillToastStyles.error.fontWeight,
          borderRadius: skillToastStyles.error.borderRadius,
          padding: skillToastStyles.error.padding,
          boxShadow: skillToastStyles.error.boxShadow,
          border: skillToastStyles.error.border
        }
      }
    )
  }
}
