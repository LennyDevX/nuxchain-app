/**
 * SkillsPanel
 * Sidebar panel for the AI chat — shows active Skills as chips,
 * locked skills with upgrade CTA, and free tier daily usage progress.
 *
 * Usage: drop into the chat page alongside the chat interface.
 */

import { useState } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { SKILLS, type SkillId } from '../../constants/subscription';
import { SubscriptionModal } from '../subscription/SubscriptionModal';

type SkillCallHandler = (skillId: SkillId) => void;

interface SkillsPanelProps {
  onSkillSelect?: SkillCallHandler;
  dailyUsed?: number;
  onUpgrade?: () => void;
  onShowAll?: () => void;
}

export function SkillsPanel({ onSkillSelect, onUpgrade, onShowAll }: SkillsPanelProps) {
  const { activeSkills, addOns } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<SkillId | null>(null);

  const allSkillIds = Object.keys(SKILLS) as SkillId[];
  const unlockedSkills = [...activeSkills, ...addOns];
  const lockedSkills = allSkillIds.filter(id => !unlockedSkills.includes(id));

  const triggerUpgrade = () => {
    if (onUpgrade) { onUpgrade(); } else { setShowUpgradeModal(true); }
  };

  const handleSkillClick = (skillId: SkillId) => {
    if (!unlockedSkills.includes(skillId)) {
      triggerUpgrade();
      return;
    }
    setActiveSkillId(activeSkillId === skillId ? null : skillId);
    onSkillSelect?.(skillId);
  };

  return (
    <>
      <div className="flex flex-col gap-1 w-full bg-transparent">
        {/* Unlocked skills */}
        {unlockedSkills.length > 0 && (
          <div className="flex flex-col gap-1">
            {unlockedSkills.map(id => {
              const skill = SKILLS[id];
              const isSelected = activeSkillId === id;
              return (
                <button
                  key={id}
                  onClick={() => handleSkillClick(id)}
                  title={skill.description}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'hover:bg-[#2A2A2A] text-white/80'
                  }`}
                >
                  <span className="text-xl leading-none">{skill.icon}</span>
                  <span className="flex-1 font-medium truncate">{skill.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Locked skills */}
        {lockedSkills.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {lockedSkills.slice(0, 3).map(id => {
              const skill = SKILLS[id];
              return (
                <button
                  key={id}
                  onClick={() => triggerUpgrade()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] text-left hover:bg-[#2A2A2A] text-white/50 transition-colors group"
                >
                  <span className="text-xl leading-none grayscale opacity-70 group-hover:opacity-100">{skill.icon}</span>
                  <span className="flex-1 truncate">{skill.label}</span>
                  <span className="text-sm" title="Upgrade required">🔒</span>
                </button>
              );
            })}
            {onShowAll && lockedSkills.length > 3 && (
              <button
                onClick={onShowAll}
                className="w-full py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors mt-1"
              >
                View all skills →
              </button>
            )}
          </div>
        )}
      </div>

      {!onUpgrade && (
        <SubscriptionModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
}

export default SkillsPanel;
