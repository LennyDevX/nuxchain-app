import { CONTRACT_REWARD_INFO } from '../../data/AvatarData';

// Info icon
const InfoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function RewardInfo() {
  return (
    <div className="space-y-6">
      {/* How Rewards Work */}
      <div className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <InfoIcon className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="jersey-15-regular font-black text-white uppercase tracking-wide text-lg">
            How Rewards Work
          </h3>
        </div>
        
        <p className="jersey-20-regular text-gray-400 text-sm leading-relaxed mb-4">
          The <span className="text-purple-400 font-bold">Treasury Manager</span> allocates <span className="text-purple-400 font-bold">20% of ALL protocol revenue</span> (staking + marketplace + quest fees) 
          to fund quest rewards. Badge holders earn by completing quests created by the team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-black/30 rounded-xl text-center">
            <div className="text-2xl mb-1">📝</div>
            <div className="jersey-15-regular text-white text-sm">1. Complete Quests</div>
            <div className="jersey-20-regular text-gray-500 text-xs">Finish tasks to earn POL</div>
          </div>
          <div className="p-3 bg-black/30 rounded-xl text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="jersey-15-regular text-white text-sm">2. Accumulate</div>
            <div className="jersey-20-regular text-gray-500 text-xs">Rewards stored in contract</div>
          </div>
          <div className="p-3 bg-black/30 rounded-xl text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="jersey-15-regular text-white text-sm">3. Claim</div>
            <div className="jersey-20-regular text-gray-500 text-xs">Withdraw with tiered fee</div>
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="p-6 bg-[#1a1a1a]/50 border border-white/10 rounded-2xl">
        <h4 className="jersey-15-regular font-black text-white uppercase tracking-wide text-sm mb-4">
          Claim Fee Structure (Tiered)
        </h4>
        
        <div className="space-y-2">
          {CONTRACT_REWARD_INFO.claimFeeTiers.map((tier, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-3 bg-black/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                  ${idx === 0 ? 'bg-gray-700 text-gray-400' : 
                    idx === 1 ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-amber-500/20 text-amber-400'}
                `}>
                  {idx + 1}
                </div>
                <div>
                  <div className="jersey-15-regular text-white text-sm">
                    {tier.fee}% Fee
                  </div>
                  <div className="jersey-20-regular text-gray-500 text-xs">
                    {idx === 0 ? 'Default rate' : `After ${tier.volume} volume`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="jersey-20-regular text-gray-400 text-xs">
                  {tier.volume}+
                </div>
                <div className="jersey-20-regular text-gray-500 text-[10px]">
                  contribution
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="jersey-20-regular text-amber-400 text-xs">
            <strong>Lower fees with volume:</strong> The more quests you complete, the lower your claim fee becomes. 
            Fees fund the Treasury for sustainable reward distribution.
          </p>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#1a1a1a]/50 border border-white/10 rounded-xl">
          <h5 className="jersey-15-regular text-white font-bold text-sm mb-2">Max Reward Limits</h5>
          <ul className="space-y-1 text-gray-400 text-xs">
            <li className="flex items-center gap-2">
              <CheckIcon className="w-3 h-3 text-green-400" />
              Per quest: {CONTRACT_REWARD_INFO.maxRewardPerQuest}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-3 h-3 text-green-400" />
              Pending per user: {CONTRACT_REWARD_INFO.maxPendingPerUser}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-3 h-3 text-green-400" />
              Contract balance: {CONTRACT_REWARD_INFO.maxContractBalance}
            </li>
          </ul>
        </div>

        <div className="p-4 bg-[#1a1a1a]/50 border border-white/10 rounded-xl">
          <h5 className="jersey-15-regular text-white font-bold text-sm mb-2">Quest Types</h5>
          <ul className="space-y-1 text-gray-400 text-xs">
            <li className="flex items-center gap-2">
              <CheckIcon className="w-3 h-3 text-purple-400" />
              Technical (dev, security, testing)
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-3 h-3 text-pink-400" />
              Content (social, articles, videos)
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-3 h-3 text-blue-400" />
              Community (mod, events, support)
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-3 h-3 text-amber-400" />
              Business (partnerships, growth)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
