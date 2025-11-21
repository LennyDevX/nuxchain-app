import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SkillData } from '../skills/config';
import { RARITY_NAMES } from '../../types/contracts';
import { calculateSkillPrice } from './pricing-config';
import { SKILL_DURATION_DAYS, MAX_ACTIVE_SKILLS } from './pricing-config';

interface UserSkill {
  skill: SkillData;
  isActive: boolean;
  expiresAt?: number; // Unix timestamp
  purchasedAt: number; // Unix timestamp
}

interface MySkillsProps {
  userSkills: UserSkill[];
  onActivate: (skill: SkillData) => void;
  onRenew: (skill: SkillData) => void;
  onBrowseSkills?: () => void;
  isLoading?: boolean;
}

// Helper function to calculate days remaining
const getDaysRemaining = (expiresAt: number): number => {
  const now = Date.now() / 1000; // Convert to seconds
  const secondsRemaining = expiresAt - now;
  return Math.max(0, Math.ceil(secondsRemaining / (24 * 60 * 60)));
};

// Helper function to check if skill is expired
const isExpired = (expiresAt?: number): boolean => {
  if (!expiresAt) return false;
  return Date.now() / 1000 > expiresAt;
};

const SkillStatusBadge = ({ isActive, expiresAt }: { isActive: boolean; expiresAt?: number }) => {
  if (!isActive) {
    return (
      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-semibold">
        Inactive
      </span>
    );
  }

  const expired = isExpired(expiresAt);
  if (expired) {
    return (
      <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-xs font-semibold">
        Expired
      </span>
    );
  }

  const daysLeft = expiresAt ? getDaysRemaining(expiresAt) : 0;
  const isExpiringSoon = daysLeft <= 7;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        isExpiringSoon
          ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
          : 'bg-green-500/20 border border-green-500/30 text-green-400'
      }`}
    >
      {daysLeft} days left
    </span>
  );
};

export const MySkills: React.FC<MySkillsProps> = ({
  userSkills,
  onActivate,
  onRenew,
  onBrowseSkills,
  isLoading = false,
}) => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'inactive'>('active');

  const activeSkills = userSkills.filter(s => s.isActive && !isExpired(s.expiresAt));
  const expiredSkills = userSkills.filter(s => s.isActive && isExpired(s.expiresAt));
  const inactiveSkills = userSkills.filter(s => !s.isActive);

  const canActivateMore = activeSkills.length < MAX_ACTIVE_SKILLS;

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/50 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (userSkills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-2xl font-bold text-white mb-2">No skills yet</h3>
        <p className="text-gray-400 mb-6">
          Purchase your first skill from the Catalog to get started!
        </p>
        <button
          onClick={onBrowseSkills}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-semibold"
        >
          Browse Skills
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4"
        >
          <div className="text-3xl font-bold text-green-400">{activeSkills.length}</div>
          <div className="text-sm text-gray-300">Active Skills</div>
          <div className="text-xs text-gray-500 mt-1">Max {MAX_ACTIVE_SKILLS} active</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.0 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4"
        >
          <div className="text-3xl font-bold text-blue-400">{activeSkills.length}</div>
          <div className="text-sm text-gray-300">Active Skills</div>
          <div className="text-xs text-gray-500 mt-1">Currently boosting</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4"
        >
          <div className="text-3xl font-bold text-yellow-400">{expiredSkills.length}</div>
          <div className="text-sm text-gray-300">Expired Skills</div>
          <div className="text-xs text-gray-500 mt-1">Ready to renew for 50% off</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-xl p-4"
        >
          <div className="text-3xl font-bold text-gray-300">{inactiveSkills.length}</div>
          <div className="text-sm text-gray-300">Inactive Skills</div>
          <div className="text-xs text-gray-500 mt-1">Ready to activate</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setSelectedTab('active')}
          className={`px-6 py-3 font-semibold transition-all ${
            selectedTab === 'active'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Active ({activeSkills.length})
        </button>
        <button
          onClick={() => setSelectedTab('inactive')}
          className={`px-6 py-3 font-semibold transition-all ${
            selectedTab === 'inactive'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Inactive ({inactiveSkills.length + expiredSkills.length})
        </button>
      </div>

      {/* Active Skills Grid */}
      {selectedTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSkills.map((userSkill, index) => (
            <motion.div
              key={userSkill.skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden"
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 opacity-5"
                style={{ backgroundColor: userSkill.skill.color }}
              />

              {/* Active Badge */}
              <div className="absolute top-4 right-4 z-10">
                <SkillStatusBadge isActive={userSkill.isActive} expiresAt={userSkill.expiresAt} />
              </div>

              {/* Icon */}
              <div className="text-4xl mb-4 relative z-10">{userSkill.skill.icon}</div>

              {/* Skill Info */}
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-white mb-1">
                  {userSkill.skill.name.split(' - ')[0]}
                </h4>
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: userSkill.skill.color }}
                >
                  {userSkill.skill.effectFormatted}
                </p>
                <span
                  className="inline-block text-xs font-bold px-2 py-1 rounded-full text-white mb-4"
                  style={{ backgroundColor: userSkill.skill.color }}
                >
                  {RARITY_NAMES[userSkill.skill.rarity]}
                </span>

                {/* Expiration Progress */}
                {userSkill.expiresAt && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Duration</span>
                      <span>{getDaysRemaining(userSkill.expiresAt)} / {SKILL_DURATION_DAYS} days</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(getDaysRemaining(userSkill.expiresAt) / SKILL_DURATION_DAYS) * 100}%`,
                          backgroundColor: userSkill.skill.color,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Renew Button (if expiring soon) */}
                {userSkill.expiresAt && getDaysRemaining(userSkill.expiresAt) <= 7 && (
                  <button
                    onClick={() => onRenew(userSkill.skill)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold text-sm"
                  >
                    Renew (50% Off)
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Inactive Skills Grid */}
      {selectedTab === 'inactive' && (
        <>
          {/* Expired Skills */}
          {expiredSkills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">⏰ Expired Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredSkills.map((userSkill, index) => (
                  <motion.div
                    key={userSkill.skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 border border-red-500/30 rounded-xl p-6"
                  >
                    <div className="text-4xl mb-4">{userSkill.skill.icon}</div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {userSkill.skill.name.split(' - ')[0]}
                    </h4>
                    <p className="text-sm text-gray-400 mb-4">Expired skill</p>

                    <button
                      onClick={() => onRenew(userSkill.skill)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold flex flex-col items-center gap-1"
                    >
                      <span>♻️ Renew Skill</span>
                      <span className="text-xs opacity-90">{calculateSkillPrice(userSkill.skill.skillType, userSkill.skill.rarity, true)} POL (50% off)</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Skills */}
          {inactiveSkills.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">📦 Ready to Activate</h3>
              {!canActivateMore && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ You've reached the maximum of {MAX_ACTIVE_SKILLS} active skills. 
                    Deactivate a skill to activate a new one.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveSkills.map((userSkill, index) => (
                  <motion.div
                    key={userSkill.skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                  >
                    <div className="text-4xl mb-4">{userSkill.skill.icon}</div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {userSkill.skill.name.split(' - ')[0]}
                    </h4>
                    <p
                      className="text-sm font-semibold mb-4"
                      style={{ color: userSkill.skill.color }}
                    >
                      {userSkill.skill.effectFormatted}
                    </p>

                    <button
                      onClick={() => onActivate(userSkill.skill)}
                      disabled={!canActivateMore}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Activate Skill
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
