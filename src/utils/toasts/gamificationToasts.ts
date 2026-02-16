/**
 * 🎮 Gamification Toast Notifications
 * Level-ups, badges, quests, skills, auto-compound notifications
 */

import toast from 'react-hot-toast';
import { formatBadge, formatLevel, formatPOL } from '../staking/formatters';

// ============================================
// STYLE PRESETS
// ============================================

const styles = {
  levelUp: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600' as const,
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
    border: '1px solid rgba(139, 92, 246, 0.5)',
  },
  badge: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600' as const,
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
    border: '1px solid rgba(245, 158, 11, 0.5)',
  },
  quest: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600' as const,
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
    border: '1px solid rgba(16, 185, 129, 0.5)',
  },
  skill: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600' as const,
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
  },
  compound: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600' as const,
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(6, 182, 212, 0.4)',
    border: '1px solid rgba(6, 182, 212, 0.5)',
  },
  xp: {
    background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500' as const,
    borderRadius: '10px',
    padding: '12px 20px',
    boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
    border: '1px solid rgba(168, 85, 247, 0.4)',
  },
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
    toast.success(
      `🎉 Level Up! You reached Level ${newLevel} - ${title}!${rewardText}`,
      {
        duration: 8000,
        position: 'top-center',
        style: styles.levelUp,
      }
    );
  },

  /**
   * Badge unlocked notification
   */
  badgeUnlocked: (badgeId: number) => {
    const badge = formatBadge(badgeId);
    toast.success(
      `${badge.icon} Badge Earned: ${badge.name} - ${badge.description}`,
      {
        duration: 7000,
        position: 'top-center',
        style: styles.badge,
      }
    );
  },

  /**
   * Quest completed notification
   */
  questCompleted: (questId: number, rewardAmount?: bigint) => {
    const reward = rewardAmount ? ` Reward: ${formatPOL(rewardAmount)} POL` : '';
    toast.success(
      `✅ Quest #${questId} Complete! Claim your reward.${reward}`,
      {
        duration: 6000,
        position: 'top-center',
        style: styles.quest,
      }
    );
  },

  /**
   * Quest reward claimed notification
   */
  questRewardClaimed: (amount: string) => {
    toast.success(
      `🏆 Quest Reward Claimed: ${amount} POL`,
      {
        duration: 5000,
        position: 'top-center',
        style: styles.quest,
      }
    );
  },

  /**
   * Achievement unlocked notification
   */
  achievementUnlocked: (achievementId: number, rewardAmount?: string) => {
    const reward = rewardAmount ? ` Reward: ${rewardAmount} POL` : '';
    toast.success(
      `⭐ Achievement #${achievementId} Unlocked!${reward}`,
      {
        duration: 6000,
        position: 'top-center',
        style: styles.badge,
      }
    );
  },

  /**
   * Skill activated notification
   */
  skillActivated: (skillName: string, boostPercent: number) => {
    toast.success(
      `⚡ Skill Activated: ${skillName} (+${boostPercent.toFixed(2)}% Boost)`,
      {
        duration: 5000,
        position: 'top-center',
        style: styles.skill,
      }
    );
  },

  /**
   * Skill deactivated notification
   */
  skillDeactivated: (skillName: string) => {
    toast(
      `🔄 Skill Deactivated: ${skillName}`,
      {
        duration: 4000,
        position: 'top-center',
        style: styles.skill,
      }
    );
  },

  /**
   * Auto-compound notification
   */
  autoCompoundEnabled: (minAmount: string) => {
    toast.success(
      `🔄 Auto-Compound Enabled! Min threshold: ${minAmount} POL`,
      {
        duration: 5000,
        position: 'top-center',
        style: styles.compound,
      }
    );
  },

  autoCompoundDisabled: () => {
    toast(
      '⏹️ Auto-Compound Disabled',
      {
        duration: 4000,
        position: 'top-center',
        style: styles.compound,
      }
    );
  },

  autoCompoundExecuted: (amount: string) => {
    toast.success(
      `🔄 Auto-Compound: ${amount} POL reinvested!`,
      {
        duration: 5000,
        position: 'top-center',
        style: styles.compound,
      }
    );
  },

  /**
   * XP gained notification (subtle)
   */
  xpGained: (amount: number, action: string) => {
    toast(
      `✨ +${amount} XP (${action})`,
      {
        duration: 3000,
        position: 'top-right',
        style: styles.xp,
      }
    );
  },

  /**
   * Skill boost limit warning
   */
  boostLimitReached: () => {
    toast.error(
      '⚠️ Cannot activate: Would exceed max boost limit of 37.5%',
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
        },
      }
    );
  },

  /**
   * Protocol health warning
   */
  protocolHealthWarning: (status: string) => {
    toast.error(
      `🚨 Protocol Health: ${status} - APY may be affected`,
      {
        duration: 8000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)',
          border: '1px solid rgba(245, 158, 11, 0.5)',
        },
      }
    );
  },

  /**
   * Transaction pending
   */
  txPending: (action: string) => {
    return toast.loading(
      `⏳ ${action}... Confirm in wallet`,
      {
        position: 'top-center',
        style: {
          background: '#1f2937',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '12px',
          padding: '16px 24px',
          border: '1px solid #374151',
        },
      }
    );
  },

  /**
   * Transaction confirmed
   */
  txConfirmed: (toastId?: string) => {
    if (toastId) toast.dismiss(toastId);
    toast.success('✅ Transaction confirmed!', {
      duration: 4000,
      position: 'top-center',
      style: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '16px 24px',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
        border: '1px solid rgba(16, 185, 129, 0.5)',
      },
    });
  },

  /**
   * Transaction failed
   */
  txFailed: (error?: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId);
    toast.error(
      `❌ Transaction failed${error ? `: ${error}` : ''}`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
        },
      }
    );
  },
};

export default gamificationToasts;
