/**
 * 🎮 Gamification Toast Notifications
 * Level-ups, badges, quests, skills, auto-compound notifications
 */

import toast from 'react-hot-toast';
import { formatBadge, formatLevel, formatPOL } from '../staking/formatters';
import { makeToastStyle, xpToastStyle, neutralToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles';

const styles = {
  levelUp:  makeToastStyle('levelUp'),
  badge:    makeToastStyle('warning'),
  quest:    makeToastStyle('success'),
  skill:    makeToastStyle('info'),
  compound: makeToastStyle('compound'),
  xp:       xpToastStyle,
};

// ============================================
// GAMIFICATION TOASTS
// ============================================

export const gamificationToasts = {
  /**
   * Level up notification
   */
  levelUp: (newLevel: number, rewardPOL?: number) => {
    const { title } = formatLevel(newLevel);
    const rewardText = rewardPOL ? ` Reward: ${rewardPOL} POL` : '';
    toast.success(`🎉 Level Up! You reached Level ${newLevel} - ${title}!${rewardText}`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: styles.levelUp });
  },

  /**
   * Badge unlocked notification
   */
  badgeUnlocked: (badgeId: number) => {
    const badge = formatBadge(badgeId);
    toast.success(`${badge.icon} Badge Earned: ${badge.name} - ${badge.description}`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: styles.badge });
  },

  /**
   * Quest completed notification
   */
  questCompleted: (questId: number, rewardAmount?: bigint) => {
    const reward = rewardAmount ? ` Reward: ${formatPOL(rewardAmount)} POL` : '';
    toast.success(`✅ Quest #${questId} Complete! Claim your reward.${reward}`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: styles.quest });
  },

  /**
   * Quest reward claimed notification
   */
  questRewardClaimed: (amount: string) => {
    toast.success(`🏆 Quest Reward Claimed: ${amount} POL`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: styles.quest });
  },

  /**
   * Achievement unlocked notification
   */
  achievementUnlocked: (achievementId: number, rewardAmount?: string) => {
    const reward = rewardAmount ? ` Reward: ${rewardAmount} POL` : '';
    toast.success(`⭐ Achievement #${achievementId} Unlocked!${reward}`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: styles.badge });
  },

  /**
   * Skill activated notification
   */
  skillActivated: (skillName: string, boostPercent: number) => {
    toast.success(`⚡ Skill Activated: ${skillName} (+${boostPercent.toFixed(2)}% Boost)`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: styles.skill });
  },

  /**
   * Skill deactivated notification
   */
  skillDeactivated: (skillName: string) => {
    toast(`🔄 Skill Deactivated: ${skillName}`, { duration: toastDurations.medium, position: DEFAULT_POSITION, style: styles.skill });
  },

  /**
   * Auto-compound notification
   */
  autoCompoundEnabled: (minAmount: string) => {
    toast.success(`🔄 Auto-Compound Enabled! Min threshold: ${minAmount} POL`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: styles.compound });
  },

  autoCompoundDisabled: () => {
    toast('⏹️ Auto-Compound Disabled', { duration: toastDurations.medium, position: DEFAULT_POSITION, style: styles.compound });
  },

  autoCompoundExecuted: (amount: string) => {
    toast.success(`🔄 Auto-Compound: ${amount} POL reinvested!`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: styles.compound });
  },

  /**
   * XP gained notification (subtle)
   */
  xpGained: (amount: number, action: string) => {
    toast(`✨ +${amount} XP (${action})`, { duration: toastDurations.default, position: 'top-right', style: styles.xp });
  },

  /**
   * Skill boost limit warning
   */
  boostLimitReached: () => {
    toast.error('⚠️ Cannot activate: Would exceed max boost limit of 37.5%', { duration: toastDurations.error, position: DEFAULT_POSITION, style: makeToastStyle('error') });
  },

  /**
   * Protocol health warning
   */
  protocolHealthWarning: (status: string) => {
    toast.error(`🚨 Protocol Health: ${status} - APY may be affected`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: makeToastStyle('warning') });
  },

  /**
   * Transaction pending
   */
  txPending: (action: string) => {
    return toast.loading(`⏳ ${action}... Confirm in wallet`, { position: DEFAULT_POSITION, style: neutralToastStyle });
  },

  /**
   * Transaction confirmed
   */
  txConfirmed: (toastId?: string) => {
    if (toastId) toast.dismiss(toastId);
    toast.success('✅ Transaction confirmed!', { duration: toastDurations.medium, position: DEFAULT_POSITION, style: makeToastStyle('success') });
  },

  /**
   * Transaction failed
   */
  txFailed: (error?: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId);
    toast.error(`❌ Transaction failed${error ? `: ${error}` : ''}`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: makeToastStyle('error') });
  },
};

export default gamificationToasts;
