/**
 * 🎮 XP & Gamification Toast Notifications
 * Notifications for XP gain, level up and achievements in the Marketplace
 */

import toast from 'react-hot-toast'
import { makeToastStyle, xpToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles'

const s = {
  xpGained:    makeToastStyle('warning'),
  levelUp:     makeToastStyle('xp'),
  achievement: makeToastStyle('achievement'),
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
    const reasonText = getReasonText(reason)
    toast.success(`${reasonText} +${amount} XP`, { duration: toastDurations.medium, position: DEFAULT_POSITION, style: xpToastStyle })
  },

  /**
   * Level up notification
   * @param newLevel The new level reached
   * @param nextLevelXP XP required for next level
   */
  levelUp: (newLevel: number, nextLevelXP: number) => {
    toast.success(`⭐ LEVEL ${newLevel} REACHED!\nNext: ${nextLevelXP} XP`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.levelUp })
  },

  /**
   * Achievement unlocked notification
   * @param achievementName Achievement name
   * @param xpReward XP earned for the achievement
   */
  achievementUnlocked: (achievementName: string, xpReward: number) => {
    toast.success(`🏆 ACHIEVEMENT UNLOCKED!\n${achievementName}\n+${xpReward} XP`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.achievement })
  },

  /**
   * Activity streak notification
   * @param streakDays Consecutive days of activity
   */
  activityStreak: (streakDays: number) => {
    const message = streakDays === 7 ? '🔥 Complete week of activity!'
                  : streakDays >= 3 ? `🔥 ${streakDays}-day streak!`
                  : `📈 ${streakDays} days of activity`
    toast.success(message, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.xpGained })
  },

  /**
   * XP milestone notification
   * @param totalXP User's total XP
   * @param milestone Milestone reached (1000, 5000, 10000, etc.)
   */
  xpMilestone: (totalXP: number, milestone: number) => {
    toast.success(`🎯 ${milestone.toLocaleString()} XP REACHED!\nTotal: ${totalXP.toLocaleString()}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.levelUp })
  },

  /**
   * XP bonus notification
   * @param bonusXP Amount of bonus XP
   * @param reason Reason for the bonus
   */
  xpBonus: (bonusXP: number, reason: string = 'BONUS') => {
    toast.success(`🎁 BONUS APPLIED!\n+${bonusXP} Extra XP - ${reason}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.achievement })
  }
}
