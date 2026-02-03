/**
 * 🎯 Quest System Toast Notifications
 * Notificaciones para sistema de misiones y objetivos del Marketplace
 */

import toast from 'react-hot-toast'

/**
 * 🎨 Toast Style Presets for Quest System
 */
const questToastStyles = {
  started: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    icon: '🎯'
  },
  progress: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(6, 182, 212, 0.3)',
    border: '1px solid rgba(6, 182, 212, 0.5)',
    icon: '📊'
  },
  completed: {
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
  reward: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(251, 191, 36, 0.3)',
    border: '1px solid rgba(251, 191, 36, 0.5)',
    icon: '🎁'
  },
  expired: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    icon: '⏰'
  }
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
    toast(
      `🎯 Nueva Quest Disponible!\n"${questName}" - ${rewardXP} XP`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: questToastStyles.started.background,
          color: questToastStyles.started.color,
          fontSize: questToastStyles.started.fontSize,
          fontWeight: questToastStyles.started.fontWeight,
          borderRadius: questToastStyles.started.borderRadius,
          padding: questToastStyles.started.padding,
          boxShadow: questToastStyles.started.boxShadow,
          border: questToastStyles.started.border
        }
      }
    )
  },

  /**
   * Notificación cuando se inicia una quest
   * @param questName Nombre de la quest
   */
  questStarted: (questName: string) => {
    toast.success(
      `🎯 Quest Iniciada!\n"${questName}"`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: questToastStyles.started.background,
          color: questToastStyles.started.color,
          fontSize: questToastStyles.started.fontSize,
          fontWeight: questToastStyles.started.fontWeight,
          borderRadius: questToastStyles.started.borderRadius,
          padding: questToastStyles.started.padding,
          boxShadow: questToastStyles.started.boxShadow,
          border: questToastStyles.started.border
        }
      }
    )
  },

  /**
   * Notificación de progreso actualizado
   * @param questName Nombre de la quest
   * @param progress Progreso actual (0-100)
   * @param currentValue Valor actual
   * @param targetValue Valor objetivo
   */
  questProgress: (questName: string, progress: number, currentValue: number, targetValue: number) => {
    const progressPercent = Math.min(100, Math.round(progress));
    
    toast(
      `📊 Progreso Quest: ${progressPercent}%\n"${questName}"\n${currentValue}/${targetValue}`,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: questToastStyles.progress.background,
          color: questToastStyles.progress.color,
          fontSize: questToastStyles.progress.fontSize,
          fontWeight: questToastStyles.progress.fontWeight,
          borderRadius: questToastStyles.progress.borderRadius,
          padding: questToastStyles.progress.padding,
          boxShadow: questToastStyles.progress.boxShadow,
          border: questToastStyles.progress.border
        }
      }
    )
  },

  /**
   * Notificación cuando se completa una quest
   * @param questName Nombre de la quest
   * @param rewardXP XP ganado
   */
  questCompleted: (questName: string, rewardXP: number) => {
    toast.success(
      `✅ ¡Quest Completada!\n"${questName}"\n+${rewardXP} XP`,
      {
        duration: 7000,
        position: 'top-center',
        style: {
          background: questToastStyles.completed.background,
          color: questToastStyles.completed.color,
          fontSize: questToastStyles.completed.fontSize,
          fontWeight: questToastStyles.completed.fontWeight,
          borderRadius: questToastStyles.completed.borderRadius,
          padding: questToastStyles.completed.padding,
          boxShadow: questToastStyles.completed.boxShadow,
          border: questToastStyles.completed.border
        }
      }
    )
  },

  /**
   * Notificación cuando se reclama recompensa de quest
   * @param questName Nombre de la quest
   * @param rewardXP XP reclamado
   * @param bonusReward Recompensa adicional (opcional)
   */
  rewardClaimed: (questName: string, rewardXP: number, bonusReward?: string) => {
    const bonusText = bonusReward ? `\n+ ${bonusReward}` : '';
    
    toast.success(
      `🎁 ¡Recompensa Reclamada!\n"${questName}"\n${rewardXP} XP${bonusText}`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: questToastStyles.reward.background,
          color: questToastStyles.reward.color,
          fontSize: questToastStyles.reward.fontSize,
          fontWeight: questToastStyles.reward.fontWeight,
          borderRadius: questToastStyles.reward.borderRadius,
          padding: questToastStyles.reward.padding,
          boxShadow: questToastStyles.reward.boxShadow,
          border: questToastStyles.reward.border
        }
      }
    )
  },

  /**
   * Notificación de quest expirada
   * @param questName Nombre de la quest
   */
  questExpired: (questName: string) => {
    toast.error(
      `⏰ Quest Expirada\n"${questName}"`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: questToastStyles.expired.background,
          color: questToastStyles.expired.color,
          fontSize: questToastStyles.expired.fontSize,
          fontWeight: questToastStyles.expired.fontWeight,
          borderRadius: questToastStyles.expired.borderRadius,
          padding: questToastStyles.expired.padding,
          boxShadow: questToastStyles.expired.boxShadow,
          border: questToastStyles.expired.border
        }
      }
    )
  },

  /**
   * Notificación de hito de quests alcanzado
   * @param questsCompleted Total de quests completadas
   * @param bonusXP XP bonificado
   */
  questMilestone: (questsCompleted: number, bonusXP: number) => {
    toast.success(
      `🏆 ¡${questsCompleted} Quests Completadas!\n+${bonusXP} XP Bonus`,
      {
        duration: 7000,
        position: 'top-center',
        style: {
          background: questToastStyles.reward.background,
          color: questToastStyles.reward.color,
          fontSize: questToastStyles.reward.fontSize,
          fontWeight: questToastStyles.reward.fontWeight,
          borderRadius: questToastStyles.reward.borderRadius,
          padding: questToastStyles.reward.padding,
          boxShadow: questToastStyles.reward.boxShadow,
          border: questToastStyles.reward.border
        }
      }
    )
  },

  /**
   * Notificación de quest diaria disponible
   * @param questsAvailable Número de quests disponibles
   */
  dailyQuestsAvailable: (questsAvailable: number) => {
    toast(
      `📅 ${questsAvailable} Quest${questsAvailable !== 1 ? 's' : ''} Diari${questsAvailable !== 1 ? 'as' : 'a'} Disponible${questsAvailable !== 1 ? 's' : ''}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: questToastStyles.started.background,
          color: questToastStyles.started.color,
          fontSize: questToastStyles.started.fontSize,
          fontWeight: questToastStyles.started.fontWeight,
          borderRadius: questToastStyles.started.borderRadius,
          padding: questToastStyles.started.padding,
          boxShadow: questToastStyles.started.boxShadow,
          border: questToastStyles.started.border
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
          background: questToastStyles.expired.background,
          color: questToastStyles.expired.color,
          fontSize: questToastStyles.expired.fontSize,
          fontWeight: questToastStyles.expired.fontWeight,
          borderRadius: questToastStyles.expired.borderRadius,
          padding: questToastStyles.expired.padding,
          boxShadow: questToastStyles.expired.boxShadow,
          border: questToastStyles.expired.border
        }
      }
    )
  }
}
