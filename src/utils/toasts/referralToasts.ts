/**
 * 👥 Referral System Toast Notifications
 * Notificaciones para sistema de referidos, bonos y códigos de referencia
 */

import toast from 'react-hot-toast'

/**
 * 🎨 Toast Style Presets for Referral System
 */
const referralToastStyles = {
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
    border: '1px solid rgba(16, 185, 129, 0.5)',
    icon: '✅'
  },
  bonus: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(251, 191, 36, 0.3)',
    border: '1px solid rgba(251, 191, 36, 0.5)',
    icon: '💰'
  },
  info: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    icon: 'ℹ️'
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
 * Referral System Toast Notifications
 */
export const referralToasts = {
  /**
   * Notificación cuando se genera un código de referido
   * @param code El código generado
   */
  codeGenerated: (code: string) => {
    const shortCode = code.length > 10 ? `${code.slice(0, 10)}...` : code;
    
    toast.success(
      `🎟️ ¡Código de Referido Generado!\n${shortCode}`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: referralToastStyles.success.background,
          color: referralToastStyles.success.color,
          fontSize: referralToastStyles.success.fontSize,
          fontWeight: referralToastStyles.success.fontWeight,
          borderRadius: referralToastStyles.success.borderRadius,
          padding: referralToastStyles.success.padding,
          boxShadow: referralToastStyles.success.boxShadow,
          border: referralToastStyles.success.border
        }
      }
    )
  },

  /**
   * Notificación cuando un usuario se registra con código de referido
   * @param referrerAddress Dirección del referidor
   */
  referralRegistered: (referrerAddress: string) => {
    const shortAddress = `${referrerAddress.slice(0, 6)}...${referrerAddress.slice(-4)}`;
    
    toast.success(
      `👥 ¡Referido Registrado!\nReferidor: ${shortAddress}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: referralToastStyles.success.background,
          color: referralToastStyles.success.color,
          fontSize: referralToastStyles.success.fontSize,
          fontWeight: referralToastStyles.success.fontWeight,
          borderRadius: referralToastStyles.success.borderRadius,
          padding: referralToastStyles.success.padding,
          boxShadow: referralToastStyles.success.boxShadow,
          border: referralToastStyles.success.border
        }
      }
    )
  },

  /**
   * Notificación cuando el referidor gana bono
   * @param xpAmount Cantidad de XP ganada
   * @param reason Razón del bono
   */
  bonusEarned: (xpAmount: number, reason: string = 'REFERRAL') => {
    toast.success(
      `💰 ¡Bono de Referido Ganado!\n+${xpAmount} XP - ${reason}`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: referralToastStyles.bonus.background,
          color: referralToastStyles.bonus.color,
          fontSize: referralToastStyles.bonus.fontSize,
          fontWeight: referralToastStyles.bonus.fontWeight,
          borderRadius: referralToastStyles.bonus.borderRadius,
          padding: referralToastStyles.bonus.padding,
          boxShadow: referralToastStyles.bonus.boxShadow,
          border: referralToastStyles.bonus.border
        }
      }
    )
  },

  /**
   * Notificación cuando el comprador recibe bono por usar código
   * @param xpAmount Cantidad de XP recibida
   */
  bonusReceived: (xpAmount: number) => {
    toast.success(
      `🎁 ¡Bono de Bienvenida Recibido!\n+${xpAmount} XP`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: referralToastStyles.bonus.background,
          color: referralToastStyles.bonus.color,
          fontSize: referralToastStyles.bonus.fontSize,
          fontWeight: referralToastStyles.bonus.fontWeight,
          borderRadius: referralToastStyles.bonus.borderRadius,
          padding: referralToastStyles.bonus.padding,
          boxShadow: referralToastStyles.bonus.boxShadow,
          border: referralToastStyles.bonus.border
        }
      }
    )
  },

  /**
   * Notificación de código copiado al portapapeles
   */
  codeCopied: () => {
    toast(
      `📋 ¡Código Copiado!\nCompártelo con tus amigos`,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: referralToastStyles.info.background,
          color: referralToastStyles.info.color,
          fontSize: referralToastStyles.info.fontSize,
          fontWeight: referralToastStyles.info.fontWeight,
          borderRadius: referralToastStyles.info.borderRadius,
          padding: referralToastStyles.info.padding,
          boxShadow: referralToastStyles.info.boxShadow,
          border: referralToastStyles.info.border
        }
      }
    )
  },

  /**
   * Notificación de estadísticas de referidos
   * @param totalReferrals Total de referidos
   * @param totalEarnings Total ganado en XP
   */
  referralStats: (totalReferrals: number, totalEarnings: number) => {
    toast(
      `📊 Estadísticas de Referidos\n${totalReferrals} referidos • ${totalEarnings} XP ganados`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: referralToastStyles.info.background,
          color: referralToastStyles.info.color,
          fontSize: referralToastStyles.info.fontSize,
          fontWeight: referralToastStyles.info.fontWeight,
          borderRadius: referralToastStyles.info.borderRadius,
          padding: referralToastStyles.info.padding,
          boxShadow: referralToastStyles.info.boxShadow,
          border: referralToastStyles.info.border
        }
      }
    )
  },

  /**
   * Notificación de código inválido
   */
  invalidCode: () => {
    toast.error(
      `❌ Código de Referido Inválido\nVerifica e intenta nuevamente`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: referralToastStyles.error.background,
          color: referralToastStyles.error.color,
          fontSize: referralToastStyles.error.fontSize,
          fontWeight: referralToastStyles.error.fontWeight,
          borderRadius: referralToastStyles.error.borderRadius,
          padding: referralToastStyles.error.padding,
          boxShadow: referralToastStyles.error.boxShadow,
          border: referralToastStyles.error.border
        }
      }
    )
  },

  /**
   * Notificación cuando alcanza milestone de referidos
   * @param milestone Hito alcanzado (10, 25, 50, 100)
   * @param bonusXP XP bonificado por el hito
   */
  referralMilestone: (milestone: number, bonusXP: number) => {
    toast.success(
      `🎯 ¡${milestone} REFERIDOS ALCANZADOS!\n+${bonusXP} XP Bonus`,
      {
        duration: 7000,
        position: 'top-center',
        style: {
          background: referralToastStyles.bonus.background,
          color: referralToastStyles.bonus.color,
          fontSize: referralToastStyles.bonus.fontSize,
          fontWeight: referralToastStyles.bonus.fontWeight,
          borderRadius: referralToastStyles.bonus.borderRadius,
          padding: referralToastStyles.bonus.padding,
          boxShadow: referralToastStyles.bonus.boxShadow,
          border: referralToastStyles.bonus.border
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
          background: referralToastStyles.error.background,
          color: referralToastStyles.error.color,
          fontSize: referralToastStyles.error.fontSize,
          fontWeight: referralToastStyles.error.fontWeight,
          borderRadius: referralToastStyles.error.borderRadius,
          padding: referralToastStyles.error.padding,
          boxShadow: referralToastStyles.error.boxShadow,
          border: referralToastStyles.error.border
        }
      }
    )
  }
}
