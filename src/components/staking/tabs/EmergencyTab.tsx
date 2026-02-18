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
            <h3 className="text-red-400 font-bold text-lg mb-2">EMERGENCY WITHDRAWAL</h3>
            <p className="text-white/80 text-sm mb-2">
              This function is designed ONLY for extreme emergency situations.
            </p>
            <ul className="text-red-300 text-sm space-y-1">
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
        <p className="text-white/80 mb-4">
          Deposited funds that will be withdrawn:
        </p>
        <p className="text-2xl font-bold text-white mb-2">
          {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(6)} POL` : '0 POL'}
        </p>
        <p className="text-red-400 text-sm mb-6">
          Rewards that will be lost: {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
        </p>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
        <p className="text-orange-400 text-sm font-medium mb-2">🚨 BEFORE CONTINUING:</p>
        <p className="text-white/80 text-sm">
          Consider using &quot;Withdraw All&quot; instead, which allows you to withdraw both your funds and rewards,
          respecting lockup periods when necessary.
        </p>
      </div>

      <button
        onClick={onEmergencyWithdraw}
        disabled={isPending || isConfirming || !userStaked || userStaked === 0n || !isPaused}
        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 border-2 border-red-500 hover:border-red-400 shadow-lg"
      >
        {!isPaused ? 'Only available when contract is paused' : isPending || isConfirming ? 'Processing...' : '🚨 EMERGENCY WITHDRAWAL 🚨'}
      </button>

      <p className="text-center text-white/60 text-xs">
        {isPaused ? 'By clicking you confirm that you understand the irreversible consequences of this action' : 'Emergency withdrawal is only available when the contract owner has paused the contract'}
      </p>
    </div>
  );
});

EmergencyTab.displayName = 'EmergencyTab';
export default EmergencyTab;
