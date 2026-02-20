import { memo } from 'react';
import { formatEther } from 'viem';

interface EmergencyTabProps {
  userStaked: bigint | undefined;
  pendingRewards: bigint | undefined;
  isPaused: boolean;
  isPending: boolean;
  isConfirming: boolean;
  onEmergencyWithdraw: () => void;
}

const EmergencyTab = memo(({
  userStaked,
  pendingRewards,
  isPaused,
  isPending,
  isConfirming,
  onEmergencyWithdraw,
}: EmergencyTabProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-start">
          <div className="text-red-400 text-2xl mr-3">⚠️</div>
          <div>
            <h3 className="jersey-15-regular text-red-400 font-bold text-lg lg:text-xl mb-2">EMERGENCY WITHDRAWAL</h3>
            <p className="jersey-20-regular text-white/80 text-sm lg:text-base mb-2">
              This function is designed ONLY for extreme emergency situations.
            </p>
            <ul className="jersey-20-regular text-red-300 text-sm lg:text-base space-y-1">
              <li>• Withdraws ALL your deposited funds immediately</li>
              <li>• Completely ignores lockup periods</li>
              <li>• You LOSE ALL pending rewards</li>
              <li>• Lost rewards CANNOT be recovered</li>
              <li>• This action is IRREVERSIBLE</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="jersey-20-regular text-white/80 text-sm lg:text-base mb-4">
          Deposited funds that will be withdrawn:
        </p>
        <p className="jersey-20-regular text-2xl lg:text-3xl font-bold text-white mb-2">
          {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(6)} POL` : '0 POL'}
        </p>
        <p className="jersey-20-regular text-red-400 text-sm lg:text-base mb-6">
          Rewards that will be lost: {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
        </p>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
        <p className="jersey-15-regular text-orange-400 text-sm lg:text-base font-medium mb-2">🚨 BEFORE CONTINUING:</p>
        <p className="jersey-20-regular text-white/80 text-sm lg:text-base">
          Consider using &quot;Withdraw All&quot; instead, which allows you to withdraw both your funds and rewards,
          respecting lockup periods when necessary.
        </p>
      </div>

      <button
        onClick={onEmergencyWithdraw}
        disabled={isPending || isConfirming || !userStaked || userStaked === 0n || !isPaused}
        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 border-2 border-red-500 hover:border-red-400 shadow-lg jersey-20-regular text-lg lg:text-xl"
      >
        {!isPaused ? 'Only available when contract is paused' : isPending || isConfirming ? 'Processing...' : '🚨 EMERGENCY WITHDRAWAL 🚨'}
      </button>

      <p className="text-center jersey-20-regular text-white/60 text-xs lg:text-sm">
        {isPaused ? 'By clicking you confirm that you understand the irreversible consequences of this action' : 'Emergency withdrawal is only available when the contract owner has paused the contract'}
      </p>
    </div>
  );
});

EmergencyTab.displayName = 'EmergencyTab';
export default EmergencyTab;
