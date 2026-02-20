import { motion } from 'framer-motion';

/**
 * SkillSecurityInfo Component
 * Displays skill system security features and limitations
 * 
 * Features:
 * - 30-day expiration
 * - Max 3 active skills per user
 * - One skill type per user
 * - 50% renewal cost
 */

export default function SkillSecurityInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">🔒</div>
        <div className="flex-1">
          <h3 className="jersey-15-regular text-amber-300 font-semibold text-lg md:text-xl mb-2">Skill System Security</h3>
          
          {/* Expiration Info */}
          <div className="space-y-2 jersey-20-regular text-sm md:text-base text-white/80">
            {/* Feature 1: Expiration */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
            >
              <span className="text-blue-400">⏰</span>
              <div>
                <span className="jersey-20-regular font-medium">30-Day Expiration</span>
                <p className="jersey-20-regular text-xs text-white/60 mt-0.5">Skills automatically expire after 30 days</p>
              </div>
            </motion.div>

            {/* Feature 2: Renewal */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
            >
              <span className="text-green-400">♻️</span>
              <div>
                <span className="jersey-20-regular font-medium">50% Renewal Cost</span>
                <p className="jersey-20-regular text-xs text-white/60 mt-0.5">Renew for half the original price after expiry</p>
              </div>
            </motion.div>

            {/* Feature 3: Max Skills */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
            >
              <span className="text-purple-400">⚡</span>
              <div>
                <span className="jersey-20-regular font-medium">Max 3 Active Skills</span>
                <p className="jersey-20-regular text-xs text-white/60 mt-0.5">You can have up to 3 skills active simultaneously</p>
              </div>
            </motion.div>

            {/* Feature 4: No Duplicates */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
            >
              <span className="text-red-400">🚫</span>
              <div>
                <span className="jersey-20-regular font-medium">One Skill Type per User</span>
                <p className="jersey-20-regular text-xs text-white/60 mt-0.5">Cannot have duplicate skill types active</p>
              </div>
            </motion.div>
          </div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-3 pt-3 border-t border-amber-500/20"
          >
            <p className="jersey-20-regular text-xs text-amber-300 font-medium mb-2">💡 Why These Limits?</p>
            <ul className="jersey-20-regular text-xs text-white/60 space-y-1">
              <li>✓ Prevents abuse and exploit exploitation</li>
              <li>✓ Maintains balanced reward system</li>
              <li>✓ Ensures sustainable staking rewards</li>
              <li>✓ Creates recurring revenue model</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
