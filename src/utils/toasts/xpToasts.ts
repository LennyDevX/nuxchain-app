/**
 * 🎮 XP & Gamification Toast Notifications
 * Notifications for XP gain, level up and achievements in the Marketplace
 */

import toast from 'react-hot-toast'

/**
 * 🎨 Toast Style Presets for XP Notifications
 */
const xpToastStyles = {
  xpGained: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(251, 191, 36, 0.3)',
    border: '1px solid rgba(251, 191, 36, 0.5)',
    icon: '✨'
  },
  levelUp: {
    background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)',
    border: '1px solid rgba(196, 181, 253, 0.5)',
    icon: '⭐'
  },
  achievement: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
    border: '1px solid rgba(134, 239, 172, 0.5)',
    icon: '🏆'
  }
}

/**
 * Converts reason code to readable text with emoji
 */
function getReasonText(reason: string): string {
  const reasonMap: Record<string, string> = {
    'NFT_CREATED': '🎨 NFT Created',
    'NFT_LISTED': '📋 NFT Listed',
    'NFT_SOLD': '💰 NFT Sold',
    'NFT_BOUGHT': '🛒 NFT Purchased',
    'LIKE': '❤️ New Like',
    'COMMENT': '💬 Comment Added',
    'STAKING': '🔐 Staking Completed',
    'REFERRAL': '👥 Friend Referred',
    'ACTIVITY': '⚡ Activity Completed',
  };

  return reasonMap[reason] || `⚡ ${reason}`;
}

/**
 * XP Toast Notifications
 */
export const xpToasts = {
  /**
   * XP gained notification
   * @param amount Amount of XP earned
   * @param reason Reason for earning (NFT_CREATED, LIKE, etc.)
   */
  xpGained: (amount: number, reason: string = 'ACTIVITY') => {
    const reasonText = getReasonText(reason);
    
    toast.success(
      `${reasonText} +${amount} XP`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: xpToastStyles.xpGained.background,
          color: xpToastStyles.xpGained.color,
          fontSize: xpToastStyles.xpGained.fontSize,
          fontWeight: xpToastStyles.xpGained.fontWeight,
          borderRadius: xpToastStyles.xpGained.borderRadius,
          padding: xpToastStyles.xpGained.padding,
          boxShadow: xpToastStyles.xpGained.boxShadow,
          border: xpToastStyles.xpGained.border
        }
      }
    )
  },

  /**
   * Level up notification
   * @param newLevel The new level reached
   * @param nextLevelXP XP required for next level
   */
  levelUp: (newLevel: number, nextLevelXP: number) => {
    toast.success(
      `⭐ LEVEL ${newLevel} REACHED!\nNext: ${nextLevelXP} XP`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: xpToastStyles.levelUp.background,
          color: xpToastStyles.levelUp.color,
          fontSize: xpToastStyles.levelUp.fontSize,
          fontWeight: xpToastStyles.levelUp.fontWeight,
          borderRadius: xpToastStyles.levelUp.borderRadius,
          padding: xpToastStyles.levelUp.padding,
          boxShadow: xpToastStyles.levelUp.boxShadow,
          border: xpToastStyles.levelUp.border
        }
      }
    )
  },

  /**
   * Achievement unlocked notification
   * @param achievementName Achievement name
   * @param xpReward XP earned for the achievement
   */
  achievementUnlocked: (achievementName: string, xpReward: number) => {
    toast.success(
      `🏆 ACHIEVEMENT UNLOCKED!\n${achievementName}\n+${xpReward} XP`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: xpToastStyles.achievement.background,
          color: xpToastStyles.achievement.color,
          fontSize: xpToastStyles.achievement.fontSize,
          fontWeight: xpToastStyles.achievement.fontWeight,
          borderRadius: xpToastStyles.achievement.borderRadius,
          padding: xpToastStyles.achievement.padding,
          boxShadow: xpToastStyles.achievement.boxShadow,
          border: xpToastStyles.achievement.border
        }
      }
    )
  },

  /**
   * Activity streak notification
   * @param streakDays Consecutive days of activity
   */
  activityStreak: (streakDays: number) => {
    const message = streakDays === 7 ? '🔥 Complete week of activity!' 
                  : streakDays >= 3 ? `🔥 ${streakDays}-day streak!`
                  : `📈 ${streakDays} days of activity`;
    
    toast.success(
      message,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: xpToastStyles.xpGained.background,
          color: xpToastStyles.xpGained.color,
          fontSize: xpToastStyles.xpGained.fontSize,
          fontWeight: xpToastStyles.xpGained.fontWeight,
          borderRadius: xpToastStyles.xpGained.borderRadius,
          padding: xpToastStyles.xpGained.padding,
          boxShadow: xpToastStyles.xpGained.boxShadow,
          border: xpToastStyles.xpGained.border
        }
      }
    )
  },

  /**
   * XP milestone notification
   * @param totalXP User's total XP
   * @param milestone Milestone reached (1000, 5000, 10000, etc.)
   */
  xpMilestone: (totalXP: number, milestone: number) => {
    toast.success(
      `🎯 ${milestone.toLocaleString()} XP REACHED!\nTotal: ${totalXP.toLocaleString()}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: xpToastStyles.levelUp.background,
          color: xpToastStyles.levelUp.color,
          fontSize: xpToastStyles.levelUp.fontSize,
          fontWeight: xpToastStyles.levelUp.fontWeight,
          borderRadius: xpToastStyles.levelUp.borderRadius,
          padding: xpToastStyles.levelUp.padding,
          boxShadow: xpToastStyles.levelUp.boxShadow,
          border: xpToastStyles.levelUp.border
        }
      }
    )
  },

  /**
   * XP bonus notification
   * @param bonusXP Amount of bonus XP
   * @param reason Reason for the bonus
   */
  xpBonus: (bonusXP: number, reason: string = 'BONUS') => {
    toast.success(
      `🎁 BONUS APPLIED!\n+${bonusXP} Extra XP - ${reason}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: xpToastStyles.achievement.background,
          color: xpToastStyles.achievement.color,
          fontSize: xpToastStyles.achievement.fontSize,
          fontWeight: xpToastStyles.achievement.fontWeight,
          borderRadius: xpToastStyles.achievement.borderRadius,
          padding: xpToastStyles.achievement.padding,
          boxShadow: xpToastStyles.achievement.boxShadow,
          border: xpToastStyles.achievement.border
        }
      }
    )
  }
}
