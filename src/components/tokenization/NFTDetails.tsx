// Types for Skill NFTs - Updated for new architecture
export type SkillType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17; // All 18 official skills
export type Rarity = 0 | 1 | 2 | 3 | 4; // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY

import { useEffect, useMemo } from 'react';
import { SKILL_CONFIGS, RARITY_CONFIGS, calculateTotalSkillFees, formatSkillDisplayWithBenefit } from '../../constants/skillsConfig';
import { useUserSkills } from '../../hooks/nfts/useUserSkills';
import { useUserStaking } from '../../hooks/staking/useUserStaking';
import SkillSecurityInfo from './SkillSecurityInfo';
import { motion } from 'framer-motion';

export interface Skill {
  skillType: SkillType;
  rarity: Rarity;
  level: number; // 1-100
}

interface FormData {
  name: string;
  description: string;
  category: string;
  royaltyPercentage: number;
  count: number;
  attributes: Array<{ trait_type: string; value: string }>;
  nftType: 'standard' | 'skill';
  skills: Skill[];
}

interface NFTDetailsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  addAttribute: () => void;
  removeAttribute: (index: number) => void;
  updateAttribute: (index: number, field: 'trait_type' | 'value', value: string) => void;
  isUploading: boolean;
  isPending: boolean;
  isConfirming: boolean;
  error?: string;
}

export default function NFTDetails({
  formData,
  setFormData,
  onSubmit,
  addAttribute,
  removeAttribute,
  updateAttribute,
  isUploading,
  isPending,
  isConfirming,
  error
}: NFTDetailsProps) {
  // Get user's existing skills to determine what's available
  const { isFirstSkill, availableSkills, canAddMoreSkills, skillsUntilLimit } = useUserSkills();

  // Get user's staking balance for Skill NFT requirement check
  const { totalStaked } = useUserStaking();

  // Check if user has minimum 200 POL staked for Skill NFT creation
  const stakedAmount = useMemo(() => {
    try {
      return parseFloat(totalStaked || '0');
    } catch {
      return 0;
    }
  }, [totalStaked]);

  const hasMinimumStaking = stakedAmount >= 200;

  // Auto-assign first free skill (STAKE_BOOST_I) when nftType changes to 'skill'
  useEffect(() => {
    if (formData.nftType === 'skill' && formData.skills.length === 0 && isFirstSkill) {
      // First skill is always STAKE_BOOST_I (skillType = 0) with Common rarity (free)
      setFormData(prev => ({
        ...prev,
        skills: [{ skillType: 0 as SkillType, rarity: 0 as Rarity, level: 10 }]
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.nftType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="jersey-15-regular text-3xl md:text-5xl font-bold text-white mb-6"
      >
        NFT Details
      </motion.h2>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="jersey-20-regular block text-white font-medium mb-2">Name *</label>
          <motion.input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Enter NFT name"
            required
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="jersey-20-regular block text-white font-medium mb-2">Description *</label>
          <motion.textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none transition-all"
            placeholder="Describe your NFT"
            required
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>

        {/* Category */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="jersey-20-regular block text-white font-medium mb-2">Category</label>
          <motion.select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white transition-all"
            whileFocus={{ scale: 1.01 }}
          >
            <option value="art" className="bg-gray-800 text-white">Art</option>
            <option value="photography" className="bg-gray-800 text-white">Photography</option>
            <option value="music" className="bg-gray-800 text-white">Music</option>
            <option value="video" className="bg-gray-800 text-white">Video</option>
            <option value="collectibles" className="bg-gray-800 text-white">Collectibles</option>
          </motion.select>
        </motion.div>

        {/* Supply / Copies */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.28 }}
        >
          <div className="flex justify-between items-center mb-2">
            <label className="jersey-20-regular block text-white font-medium">Number of Copies</label>
            <span className={`text-xs font-bold px-2 py-1 rounded ${formData.count > 1 ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
              }`}>
              {formData.count > 1 ? 'Commercial (Multiple)' : 'Exclusive (1/1)'}
            </span>
          </div>
          <div className="flex gap-2">
            <motion.input
              type="number"
              min="1"
              max="500"
              value={formData.count}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setFormData(prev => ({ ...prev, count: Math.min(500, Math.max(1, val)) }));
              }}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Number of copies (1-500)"
              whileFocus={{ scale: 1.01 }}
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, count: Math.min(500, prev.count + 1) }))}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white text-xs border border-white/10 transition-colors"
                title="Increment"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, count: Math.max(1, prev.count - 1) }))}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white text-xs border border-white/10 transition-colors"
                title="Decrement"
              >
                ▼
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <p className="jersey-20-regular text-white/60 text-sm">
              {formData.count === 1
                ? "This will create a single, unique NFT."
                : `This will create ${formData.count} identical copies in one batch transaction (gas optimized).`}
            </p>
            {formData.count > 1 && formData.count <= 50 && (
              <p className="jersey-20-regular text-green-300 text-xs font-medium bg-green-500/10 px-2 py-1 rounded border border-green-500/30 flex items-center gap-1">
                <span>✅</span> Batch minting saves ~{Math.round((formData.count - 1) * 30)}% gas vs individual mints
              </p>
            )}
            {formData.count > 50 && formData.count <= 100 && (
              <p className="jersey-20-regular text-yellow-300 text-xs font-semibold bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30 flex items-center gap-1">
                <span>⚡</span> Large batch: Estimated gas ~{Math.round((300000 + formData.count * 200000) / 1000000)} million. Recommended: ≤50 copies
              </p>
            )}
            {formData.count > 100 && (
              <p className="jersey-20-regular text-orange-300 text-xs font-semibold bg-orange-500/10 px-2 py-1 rounded border border-orange-500/30 flex items-center gap-1">
                <span>⚠️</span> Very large batch: High gas costs. Max 500 copies. Consider splitting into smaller batches.
              </p>
            )}
          </div>
        </motion.div>

        {/* NFT Type Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="jersey-20-regular block text-white font-medium mb-3">NFT Type</label>
          <div className="grid grid-cols-2 gap-3">
            {['standard', 'skill'].map((type) => {
              const isSkillNFT = type === 'skill';
              const isDisabled = isSkillNFT && !hasMinimumStaking;

              return (
                <motion.button
                  key={type}
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      setFormData(prev => ({ ...prev, nftType: type as 'standard' | 'skill', skills: type === 'standard' ? [] : prev.skills }));
                    }
                  }}
                  disabled={isDisabled}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  className={`p-4 rounded-xl border-2 transition-all ${isDisabled
                    ? 'border-red-500/50 bg-red-500/10 cursor-not-allowed opacity-60'
                    : formData.nftType === type
                      ? 'border-purple-500 bg-purple-500/20 cursor-pointer'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer'
                    }`}
                >
                  <div className="text-2xl mb-1">{type === 'standard' ? '🖼️' : '⚡'}</div>
                  <div className="jersey-20-regular text-white font-medium text-base md:text-lg">{type === 'standard' ? 'Standard NFT' : 'Skill NFT'}</div>
                  {isDisabled ? (
                    <div className="jersey-20-regular text-red-400 text-xs mt-1">
                      🔒 Requires 200 POL staked ({stakedAmount.toFixed(2)}/{200})
                    </div>
                  ) : (
                    <div className="jersey-20-regular text-white/60 text-xs mt-1">{type === 'standard' ? 'Simple NFT (no skills)' : 'NFT with multiple abilities'}</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Skill Configuration - Only show for Skill NFTs */}
        {formData.nftType === 'skill' && (
          <div className="space-y-4">
            {/* Security Info */}
            <SkillSecurityInfo />

            {/* Skills Form */}
            <div className="space-y-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="jersey-15-regular text-white font-medium text-lg md:text-xl">Skills Configuration</h3>
                  <p className="jersey-20-regular text-white/60 text-sm md:text-base">Add up to 3 active skills (First skill is FREE)</p>
                </div>
                {formData.skills.length < 3 && availableSkills.length > formData.skills.length && canAddMoreSkills && (
                  <button
                    type="button"
                    onClick={() => {
                      // Find first available skill not already in form
                      const skillsInForm: number[] = formData.skills.map(s => s.skillType);
                      const nextSkillNumber = availableSkills.find(s => !skillsInForm.includes(s)) ?? 1;
                      const nextAvailableSkill = (nextSkillNumber as unknown) as SkillType;

                      setFormData(prev => ({
                        ...prev,
                        skills: [...prev.skills, { skillType: nextAvailableSkill, level: 10, rarity: 0 }]
                      }));
                    }}
                    className="jersey-20-regular text-purple-400 hover:text-purple-300 text-sm md:text-base flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Skill
                  </button>
                )}
                {formData.skills.length >= 3 && (
                  <p className="jersey-20-regular text-yellow-400 text-xs">🔒 Maximum 3 active skills reached (Security Limit)</p>
                )}
                {!canAddMoreSkills && formData.skills.length > 0 && (
                  <p className="jersey-20-regular text-orange-400 text-xs">⏰ You have reached your active skills limit ({skillsUntilLimit}/3). Wait for skills to expire to add new ones.</p>
                )}
                {availableSkills.length <= formData.skills.length && formData.skills.length > 0 && formData.skills.length < 3 && (
                  <p className="jersey-20-regular text-yellow-400 text-xs">All available skills are already added</p>
                )}
              </div>

              {/* Skills List */}
              {formData.skills.length === 0 ? (
                <div className="text-center py-6 text-white/60">
                  <p className="jersey-20-regular">No skills added yet. Click "Add Skill" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="p-3 bg-white/10 rounded-lg border border-white/20 space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="jersey-20-regular text-white font-medium text-sm">
                          Skill #{index + 1}
                          {index === 0 && <span className="ml-2 text-green-400">(FREE - Auto-assigned)</span>}
                          {index > 0 && (
                            <span className="ml-2 text-yellow-400">
                              ({calculateTotalSkillFees([skill])} POL)
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          x
                        </button>
                      </div>

                      {/* Skill Type with Tooltip */}
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Type</label>
                        <div className="relative group">
                          <select
                            value={skill.skillType}
                            onChange={(e) => {
                              const newSkills = [...formData.skills];
                              newSkills[index].skillType = parseInt(e.target.value) as SkillType;
                              setFormData(prev => ({ ...prev, skills: newSkills }));
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 cursor-help"
                            title="Select a skill type. Hover for details."
                            disabled={index === 0} // First skill (free) is locked
                          >
                            <option value="">Select a skill...</option>
                            {SKILL_CONFIGS.map((skillConfig) => {
                              // For other skills, only show skills not already in form
                              const skillAlreadyAdded = formData.skills.some(
                                (s, idx) => s.skillType === skillConfig.id && idx !== index
                              );

                              if (skillAlreadyAdded && index !== 0) return null;

                              return (
                                <option key={skillConfig.id} value={skillConfig.id}>
                                  {formatSkillDisplayWithBenefit(skillConfig.id)}
                                </option>
                              );
                            })}
                          </select>

                          {/* Tooltip on hover */}
                          <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-56 p-3 bg-gray-900 border border-purple-500/50 rounded-lg text-xs text-white/80 z-50 shadow-lg">
                            {skill.skillType !== undefined && SKILL_CONFIGS[skill.skillType] ? (
                              <>
                                <p className="font-semibold text-purple-300 mb-1">
                                  {SKILL_CONFIGS[skill.skillType].emoji} {SKILL_CONFIGS[skill.skillType].name}
                                </p>
                                <p className="mb-1 text-white">{SKILL_CONFIGS[skill.skillType].description}</p>
                                <p className="text-blue-300 text-xs">Impact: {SKILL_CONFIGS[skill.skillType].impact}</p>
                                <p className="text-gray-400 text-xs mt-1">Category: {SKILL_CONFIGS[skill.skillType].category}</p>
                              </>
                            ) : (
                              <p className="text-white/60">Select a skill to see details</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Skill Level (1-100) */}
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Level: {skill.level}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={skill.level}
                          onChange={(e) => {
                            const newSkills = [...formData.skills];
                            newSkills[index].level = parseInt(e.target.value);
                            setFormData(prev => ({ ...prev, skills: newSkills }));
                          }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Rarity with Tooltip */}
                      <div>
                        <label className="block text-white/80 text-sm mb-1">Rarity</label>
                        <div className="relative group">
                          <select
                            value={skill.rarity}
                            onChange={(e) => {
                              const newSkills = [...formData.skills];
                              newSkills[index].rarity = parseInt(e.target.value) as Rarity;
                              setFormData(prev => ({ ...prev, skills: newSkills }));
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 [&>option]:bg-gray-800 cursor-help"
                            title="Select rarity level. Hover for fees."
                          >
                            {RARITY_CONFIGS.map((rarity) => (
                              <option key={rarity.id} value={rarity.id}>
                                {rarity.emoji} {rarity.name} ({rarity.stars} stars)
                              </option>
                            ))}
                          </select>

                          {/* Fee Tooltip on hover */}
                          <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-56 p-3 bg-gray-900 border border-yellow-500/50 rounded-lg text-xs text-white/80 z-50 shadow-lg">
                            {skill.rarity !== undefined && RARITY_CONFIGS[skill.rarity] ? (
                              <>
                                <p className="font-semibold text-yellow-300 mb-1">
                                  {RARITY_CONFIGS[skill.rarity].emoji} {RARITY_CONFIGS[skill.rarity].name}
                                </p>
                                <p className="text-white mb-1">Stars: {RARITY_CONFIGS[skill.rarity].stars}</p>
                                <p className="text-green-300">
                                  Fee: {index === 0 ? 'FREE (first skill)' : RARITY_CONFIGS[skill.rarity].skillFee + ' POL'}
                                </p>
                              </>
                            ) : (
                              <p className="text-white/60">Select rarity to see cost</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Total Fee Display */}
                  {formData.skills.length > 1 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Total Skill Fee:</span>
                        <span className="text-yellow-400 font-bold">
                          {calculateTotalSkillFees(formData.skills)} POL
                        </span>
                      </div>
                      <p className="text-white/60 text-xs mt-1">
                        Warning: Requires minimum 200 POL staked
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Royalty Percentage */}
        <div>
          <label className="block text-white font-medium mb-2">
            Royalty Percentage ({(formData.royaltyPercentage / 100).toFixed(1)}%)
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1000"
              step="25"
              value={formData.royaltyPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercentage: parseInt(e.target.value) }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-white/60 text-sm mt-1">
              <span>0%</span>
              <span>2.5%</span>
              <span>5%</span>
              <span>7.5%</span>
              <span>10%</span>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-2">
            Info: Royalties are earned on every future sale of your NFT
          </p>
        </div>

        {/* Attributes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-white font-medium">Attributes</label>
            <button
              type="button"
              onClick={addAttribute}
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Attribute
            </button>
          </div>

          <div className="space-y-3">
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="text"
                  value={attr.trait_type}
                  onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                  placeholder="Attribute type (e.g., Color, Rarity)"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                  placeholder="Value (e.g., Blue, Legendary)"
                />
                {formData.attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="px-3 py-2 text-red-400 hover:text-red-300 self-start sm:self-center transition-colors"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && !error.includes('select') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
          >
            <p className="text-red-300 mb-2">{error}</p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isUploading || isPending || isConfirming}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform disabled:cursor-not-allowed shadow-lg"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.svg
                className="h-5 w-5"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </motion.svg>
              Uploading to IPFS...
            </span>
          ) : isPending ? (
            <span className="flex items-center justify-center gap-2">
              <motion.svg
                className="h-5 w-5"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </motion.svg>
              Creating NFT...
            </span>
          ) : isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <motion.svg
                className="h-5 w-5"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </motion.svg>
              Confirming Transaction...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Create NFT
            </span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
