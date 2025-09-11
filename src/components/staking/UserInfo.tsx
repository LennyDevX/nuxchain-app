import React, { memo } from 'react'
import { formatEther } from 'viem'

interface DepositData {
  amount: bigint
  timestamp: bigint
  lastClaimTime: bigint
  lockupDuration: bigint
}

interface UserInfoData {
  totalDeposited: bigint
  pendingRewards: bigint
  lastWithdraw: bigint
}

interface UserInfoProps {
  userInfo: UserInfoData | undefined
  pendingRewards: bigint | undefined
  userDeposits: DepositData[] | undefined
  totalDeposit: bigint
}

// Helper function to calculate lockup end time
function calculateLockupEndTime(timestamp: bigint, lockupDuration: bigint): Date {
  const depositTime = Number(timestamp) * 1000
  const lockupMs = Number(lockupDuration) * 1000
  return new Date(depositTime + lockupMs)
}

// Helper function to check if funds are still locked
function isFundsLocked(timestamp: bigint, lockupDuration: bigint): boolean {
  if (lockupDuration === 0n) return false
  const lockupEndTime = calculateLockupEndTime(timestamp, lockupDuration)
  return new Date() < lockupEndTime
}

// Helper function to get ROI rate based on lockup duration
function getROIRate(lockupDuration: bigint): string {
  const days = Number(lockupDuration) / (24 * 60 * 60)
  switch (days) {
    case 0: return '0.01%/hora'
    case 30: return '0.012%/hora'
    case 90: return '0.016%/hora'
    case 180: return '0.02%/hora'
    case 365: return '0.03%/hora'
    default: return '0.01%/hora'
  }
}

const UserInfo: React.FC<UserInfoProps> = memo(({ userInfo, pendingRewards, userDeposits, totalDeposit }: UserInfoProps) => {
  return (
    <div className="space-y-6">
      {/* User Information */}
      <div className="card-unified rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Your Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/60">Total Deposited:</span>
            <span className="text-white font-medium">
              {totalDeposit ? `${parseFloat(formatEther(totalDeposit)).toFixed(4)} POL` : '0 POL'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Pending Rewards:</span>
            <span className="text-green-400 font-medium">
              {pendingRewards && pendingRewards > 0n ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Last Withdrawal:</span>
            <span className="text-white/60 text-sm">
              {userInfo && userInfo.lastWithdraw ? new Date(Number(userInfo.lastWithdraw) * 1000).toLocaleDateString() : 'Never'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Daily Withdrawal Limit:</span>
            <span className="text-yellow-400 font-medium text-sm">
              1,000 POL / 24h
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Active Deposits:</span>
            <span className="text-blue-400 font-medium">
              {userDeposits ? userDeposits.length : 0} / 300
            </span>
          </div>
        </div>
      </div>

      {/* My Deposits */}
      <div className="card-unified rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">My Deposits</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {userDeposits && userDeposits.length > 0 ? (
            userDeposits.map((deposit, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-medium text-lg">
                      {deposit.amount ? parseFloat(formatEther(deposit.amount)).toFixed(4) : '0'} POL
                    </p>
                    <p className="text-white/60 text-sm">
                      Deposited: {new Date(Number(deposit.timestamp) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-sm">
                      ROI: {getROIRate(deposit.lockupDuration)}
                    </p>
                    <div className="mt-1">
                      {Number(deposit.lockupDuration) === 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Flexible
                        </span>
                      ) : isFundsLocked(deposit.timestamp, deposit.lockupDuration) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          🔒 Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          ✅ Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Lockup Information */}
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Lockup period:</span>
                    <span className="text-white">
                      {Math.floor(Number(deposit.lockupDuration) / (24 * 60 * 60))} days
                    </span>
                  </div>
                  
                  {Number(deposit.lockupDuration) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Available from:</span>
                      <span className={`${isFundsLocked(deposit.timestamp, deposit.lockupDuration) ? 'text-red-400' : 'text-green-400'}`}>
                        {calculateLockupEndTime(deposit.timestamp, deposit.lockupDuration).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Last claim:</span>
                    <span className="text-white/80">
                      {deposit.lastClaimTime && deposit.lastClaimTime > 0n 
                        ? new Date(Number(deposit.lastClaimTime) * 1000).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-white/60 text-center">You have no active deposits</p>
              <p className="text-white/40 text-sm text-center mt-1">Start staking to see your deposits here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

UserInfo.displayName = 'UserInfo'

export default UserInfo