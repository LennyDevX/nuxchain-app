/**
 * 🎯 Quest System Toast Notifications
 * Notificaciones para sistema de misiones y objetivos del Marketplace
 */

import toast from 'react-hot-toast'
import { makeToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles'

const s = {
  started:   makeToastStyle('info'),
  progress:  makeToastStyle('comment'),
  completed: makeToastStyle('success'),
  reward:    makeToastStyle('warning'),
  expired:   makeToastStyle('error'),
}

/**
 * Quest System Toast Notifications
 */
export const questToasts = {
  /**
   * Notificación cuando se crea una nueva quest
   * @param questName Nombre de la quest
   * @param rewardXP XP de recompensa
   */
  questCreated: (questName: string, rewardXP: number) => {
    toast(`🎯 Nueva Quest Disponible!\n"${questName}" - ${rewardXP} XP`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.started })
  },

  /**
   * Notificación cuando se inicia una quest
   * @param questName Nombre de la quest
   */
  questStarted: (questName: string) => {
    toast.success(`🎯 Quest Iniciada!\n"${questName}"`, { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.started })
  },

  /**
   * Notificación de progreso actualizado
   * @param questName Nombre de la quest
   * @param progress Progreso actual (0-100)
   * @param currentValue Valor actual
   * @param targetValue Valor objetivo
   */
  questProgress: (questName: string, progress: number, currentValue: number, targetValue: number) => {
    const progressPercent = Math.min(100, Math.round(progress))
    toast(`📊 Progreso Quest: ${progressPercent}%\n"${questName}"\n${currentValue}/${targetValue}`, { duration: toastDurations.default, position: DEFAULT_POSITION, style: s.progress })
  },

  /**
   * Notificación cuando se completa una quest
   * @param questName Nombre de la quest
   * @param rewardXP XP ganado
   */
  questCompleted: (questName: string, rewardXP: number) => {
    toast.success(`✅ ¡Quest Completada!\n"${questName}"\n+${rewardXP} XP`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: s.completed })
  },

  /**
   * Notificación cuando se reclama recompensa de quest
   * @param questName Nombre de la quest
   * @param rewardXP XP reclamado
   * @param bonusReward Recompensa adicional (opcional)
   */
  rewardClaimed: (questName: string, rewardXP: number, bonusReward?: string) => {
    const bonusText = bonusReward ? `\n+ ${bonusReward}` : ''
    toast.success(`🎁 ¡Recompensa Reclamada!\n"${questName}"\n${rewardXP} XP${bonusText}`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.reward })
  },

  /**
   * Notificación de quest expirada
   * @param questName Nombre de la quest
   */
  questExpired: (questName: string) => {
    toast.error(`⏰ Quest Expirada\n"${questName}"`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.expired })
  },

  /**
   * Notificación de hito de quests alcanzado
   * @param questsCompleted Total de quests completadas
   * @param bonusXP XP bonificado
   */
  questMilestone: (questsCompleted: number, bonusXP: number) => {
    toast.success(`🏆 ¡${questsCompleted} Quests Completadas!\n+${bonusXP} XP Bonus`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: s.reward })
  },

  /**
   * Notificación de quest diaria disponible
   * @param questsAvailable Número de quests disponibles
   */
  dailyQuestsAvailable: (questsAvailable: number) => {
    toast(`📅 ${questsAvailable} Quest${questsAvailable !== 1 ? 's' : ''} Diari${questsAvailable !== 1 ? 'as' : 'a'} Disponible${questsAvailable !== 1 ? 's' : ''}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.started })
  },

  /**
   * Error genérico
   */
  error: (message: string) => {
    toast.error(message, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.expired })
  }
}
