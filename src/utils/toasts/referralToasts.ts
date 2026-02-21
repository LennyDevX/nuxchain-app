/**
 * 👥 Referral System Toast Notifications
 * Notificaciones para sistema de referidos, bonos y códigos de referencia
 */

import toast from 'react-hot-toast'
import { makeToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles'

const s = {
  success: makeToastStyle('success'),
  bonus:   makeToastStyle('warning'),
  info:    makeToastStyle('info'),
  error:   makeToastStyle('error'),
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
    const shortCode = code.length > 10 ? `${code.slice(0, 10)}...` : code
    toast.success(`🎟️ ¡Código de Referido Generado!\n${shortCode}`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  /**
   * Notificación cuando un usuario se registra con código de referido
   * @param referrerAddress Dirección del referidor
   */
  referralRegistered: (referrerAddress: string) => {
    const shortAddress = `${referrerAddress.slice(0, 6)}...${referrerAddress.slice(-4)}`
    toast.success(`👥 ¡Referido Registrado!\nReferidor: ${shortAddress}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.success })
  },

  /**
   * Notificación cuando el referidor gana bono
   * @param xpAmount Cantidad de XP ganada
   * @param reason Razón del bono
   */
  bonusEarned: (xpAmount: number, reason: string = 'REFERRAL') => {
    toast.success(`💰 ¡Bono de Referido Ganado!\n+${xpAmount} XP - ${reason}`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.bonus })
  },

  /**
   * Notificación cuando el comprador recibe bono por usar código
   * @param xpAmount Cantidad de XP recibida
   */
  bonusReceived: (xpAmount: number) => {
    toast.success(`🎁 ¡Bono de Bienvenida Recibido!\n+${xpAmount} XP`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.bonus })
  },

  /**
   * Notificación de código copiado al portapapeles
   */
  codeCopied: () => {
    toast(`📋 ¡Código Copiado!\nCompártelo con tus amigos`, { duration: toastDurations.default, position: DEFAULT_POSITION, style: s.info })
  },

  /**
   * Notificación de estadísticas de referidos
   * @param totalReferrals Total de referidos
   * @param totalEarnings Total ganado en XP
   */
  referralStats: (totalReferrals: number, totalEarnings: number) => {
    toast(`📊 Estadísticas de Referidos\n${totalReferrals} referidos • ${totalEarnings} XP ganados`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.info })
  },

  /**
   * Notificación de código inválido
   */
  invalidCode: () => {
    toast.error(`❌ Código de Referido Inválido\nVerifica e intenta nuevamente`, { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.error })
  },

  /**
   * Notificación cuando alcanza milestone de referidos
   * @param milestone Hito alcanzado (10, 25, 50, 100)
   * @param bonusXP XP bonificado por el hito
   */
  referralMilestone: (milestone: number, bonusXP: number) => {
    toast.success(`🎯 ¡${milestone} REFERIDOS ALCANZADOS!\n+${bonusXP} XP Bonus`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: s.bonus })
  },

  /**
   * Error genérico
   */
  error: (message: string) => {
    toast.error(message, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  }
}
