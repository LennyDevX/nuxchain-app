// Types for Skill NFTs
export type SkillType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Rarity = 0 | 1 | 2 | 3 | 4;

import { SKILL_CONFIGS, RARITY_CONFIGS, calculateTotalSkillFees, formatSkillDisplayWithBenefit } from '../../constants/skillsConfig';
import { motion } from 'framer-motion';

export interface Skill {
  skillType: SkillType;
  effectValue: number;
  rarity: Rarity;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  royaltyPercentage: number;
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
        className="text-2xl font-bold text-white mb-6"
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
          <label className="block text-white font-medium mb-2">Name *</label>
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
          <label className="block text-white font-medium mb-2">Description *</label>
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
          <label className="block text-white font-medium mb-2">Category</label>
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

        {/* NFT Type Selection */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-white font-medium mb-3">NFT Type</label>
          <div className="grid grid-cols-2 gap-3">
            {['standard', 'skill'].map((type) => (
              <motion.button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, nftType: type as 'standard' | 'skill', skills: type === 'standard' ? [] : prev.skills }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.nftType === type
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-1">{type === 'standard' ? '🖼️' : '⚡'}</div>
                <div className="text-white font-medium">{type === 'standard' ? 'Standard NFT' : 'Skill NFT'}</div>
                <div className="text-white/60 text-xs mt-1">{type === 'standard' ? 'Basic NFT without skills' : 'NFT with special abilities'}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Skill Configuration - Only show for Skill NFTs */}
        {formData.nftType === 'skill' && (
          <div className="space-y-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">Skills Configuration</h3>
                <p className="text-white/60 text-sm">Add up to 5 skills (First skill is FREE)</p>
              </div>
              {formData.skills.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      skills: [...prev.skills, { skillType: 0, effectValue: 10, rarity: 0 }]
                    }));
                  }}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Skill
                </button>
              )}
            </div>

            {/* Skills List */}
            {formData.skills.length === 0 ? (
              <div className="text-center py-6 text-white/60">
                <p>No skills added yet. Click "Add Skill" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="p-3 bg-white/10 rounded-lg border border-white/20 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium text-sm">
                        Skill #{index + 1}
                        {index === 0 && <span className="ml-2 text-green-400">(FREE)</span>}
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
                        >
                          <option value="">Select a skill...</option>
                          {SKILL_CONFIGS.map((skillConfig) => (
                            <option key={skillConfig.id} value={skillConfig.id}>
                              {formatSkillDisplayWithBenefit(skillConfig.id)}
                            </option>
                          ))}
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

                    {/* Effect Value */}
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Effect Value: {skill.effectValue}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={skill.effectValue}
                        onChange={(e) => {
                          const newSkills = [...formData.skills];
                          newSkills[index].effectValue = parseInt(e.target.value);
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
