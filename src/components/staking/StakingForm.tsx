import { useState } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { polygon } from 'wagmi/chains'
import SmartStakingABI from '../../abi/SmartStaking.json'
import { showContractError, validateDepositAmount, validateLockupDuration } from '../../utils/contractErrors'

interface StakingFormProps {
  stakingContractAddress: string
  pendingRewards: bigint | undefined
  isPaused: boolean
  totalDeposit: bigint | undefined
}

function StakingForm({ stakingContractAddress, pendingRewards, isPaused, totalDeposit }: StakingFormProps) {
  const { address } = useAccount()
  const [depositAmount, setDepositAmount] = useState('')
  const [lockupDuration, setLockupDuration] = useState('30') // days
  const [compoundLockupDuration, setCompoundLockupDuration] = useState('30') // days for compound
  const [activeTab, setActiveTab] = useState('stake')

  const { data: balance } = useBalance({
    address: address,
    chainId: polygon.id,
  })

  // Write to contract
  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleDeposit = async () => {
    if (!depositAmount || !address) return
    
    // Validate deposit amount
    const amountValidation = validateDepositAmount(depositAmount, balance?.value)
    if (!amountValidation.isValid) {
      alert(amountValidation.error)
      return
    }
    
    // Validate lockup duration
    const lockupValidation = validateLockupDuration(lockupDuration)
    if (!lockupValidation.isValid) {
      alert(lockupValidation.error)
      return
    }
    
    try {
      const lockupInDays = BigInt(parseInt(lockupDuration))
      
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: SmartStakingABI.abi,
        functionName: 'deposit',
        args: [lockupInDays],
        value: parseEther(depositAmount),
      })
    } catch (error) {
      showContractError(error, 'Error al realizar el depósito')
    }
  }



  const handleWithdrawAll = async () => {
    if (!address) return
    
    try {
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: SmartStakingABI.abi,
        functionName: 'withdrawAll',
      })
    } catch (error) {
      showContractError(error, 'Error withdrawing all')
    }
  }

  const handleCompound = async () => {
    if (!address) return
    
    // Validate lockup duration for compound
    const lockupValidation = validateLockupDuration(compoundLockupDuration)
    if (!lockupValidation.isValid) {
      alert(lockupValidation.error)
      return
    }
    
    try {
      const lockupInDays = BigInt(parseInt(compoundLockupDuration))
      
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: SmartStakingABI.abi,
        functionName: 'compound',
        args: [lockupInDays],
      })
    } catch (error) {
      showContractError(error, 'Error al hacer compound')
    }
  }

  const handleClaimRewards = async () => {
    if (!address) return
    
    try {
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: SmartStakingABI.abi,
        functionName: 'withdraw',
      })
    } catch (error) {
      showContractError(error, 'Error claiming rewards')
    }
  }

  const handleEmergencyWithdraw = async () => {
    if (!address) return
    
    const confirmed = window.confirm(
      '⚠️ RETIRO DE EMERGENCIA ⚠️\n\n' +
      'This action will withdraw ALL your deposited funds immediately, ' +
      'regardless of the lockup period.\n\n' +
      'WARNINGS:\n' +
      '• You will lose ALL pending rewards\n' +
      '• You cannot recover lost rewards\n' +
      '• This action is IRREVERSIBLE\n\n' +
      'Are you sure you want to continue?'
    )
    
    if (!confirmed) return
    
    try {
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: SmartStakingABI.abi,
        functionName: 'emergencyUserWithdraw',
      })
    } catch (error) {
      showContractError(error, 'Error in emergency withdrawal')
    }
  }

  return (
    <div className="card-unified overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/20">
        <button
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'stake'
              ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Stake
        </button>
        <button
          onClick={() => setActiveTab('claim')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'claim'
              ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Claim Rewards
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'withdraw'
              ? 'bg-red-500/20 text-red-400 border-b-2 border-red-400'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Withdraw All
        </button>
        <button
          onClick={() => setActiveTab('compound')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'compound'
              ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Compound
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'emergency'
              ? 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-400'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Emergency
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'stake' && (
          <div className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Amount to deposit (POL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
                {depositAmount && (
                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm">
                    💡 6% Commission: {(parseFloat(depositAmount) * 0.06).toFixed(4)} POL
                  </p>
                  <p className="text-white/60 text-xs">
                    Effective deposit amount: {(parseFloat(depositAmount) * 0.94).toFixed(4)} POL
                  </p>
                  </div>
                )}
                <div className="absolute right-3 top-3 text-white/60 text-sm">
                  POL
                </div>
              </div>
              <div className="mt-2 text-sm text-white/60">
                Balance: {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 POL'}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Lockup period (days)
              </label>
              <select
                value={lockupDuration}
                onChange={(e) => setLockupDuration(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                style={{ color: 'white' }}
              >
                <option value="0" style={{ color: 'black' }}>Flexible (0.01% per hour)</option>
                <option value="30" style={{ color: 'black' }}>30 days (0.012% per hour)</option>
                <option value="90" style={{ color: 'black' }}>90 days (0.016% per hour)</option>
                <option value="180" style={{ color: 'black' }}>180 days (0.02% per hour)</option>
                <option value="365" style={{ color: 'black' }}>365 days (0.03% per hour)</option>
              </select>
              <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm font-medium mb-1">
                  📈 Estimated ROI:
                </p>
                <p className="text-white/80 text-sm">
                  {lockupDuration === '0' && 'Daily: ~0.24% | Monthly: ~7.2% | Annual: ~87.6%'}
                  {lockupDuration === '30' && 'Daily: ~0.29% | Monthly: ~8.6% | Annual: ~105.1%'}
                  {lockupDuration === '90' && 'Daily: ~0.38% | Monthly: ~11.5% | Annual: ~140.2%'}
                  {lockupDuration === '180' && 'Daily: ~0.48% | Monthly: ~14.4% | Annual: ~175.2%'}
                  {lockupDuration === '365' && 'Daily: ~0.72% | Monthly: ~21.6% | Annual: ~262.8%'}
                </p>
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠️ Longer periods = Higher ROI but funds locked
                </p>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={!depositAmount || isPending || isConfirming || isPaused}
              className="w-full bg-gradient-to-r from-red-400 to-purple-500 hover:from-red-700 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPaused ? 'Contract Paused' : isPending || isConfirming ? 'Processing...' : 'Stake Now'}
            </button>
          </div>
        )}

        {activeTab === 'claim' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Claim your available rewards without affecting your staked amount
              </p>
              <p className="text-2xl font-bold text-white mb-6">
                {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
              </p>
            </div>
            
            <button
              onClick={handleClaimRewards}
              disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPending || isConfirming ? 'Processing...' : 'Claim Rewards'}
            </button>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Withdraw all your staked amount and accumulated rewards
              </p>
              <p className="text-2xl font-bold text-white mb-6">
                Total: {totalDeposit ? `${parseFloat(formatEther(totalDeposit)).toFixed(6)} POL` : '0 POL'} (Staked)
              </p>
              <p className="text-lg text-yellow-400 mb-6">
                + {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'} (Rewards)
              </p>
            </div>
            
            <button
              onClick={handleWithdrawAll}
              disabled={isPending || isConfirming}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPending || isConfirming ? 'Processing...' : 'Withdraw All (Stake + Rewards)'}
            </button>
          </div>
        )}

        {activeTab === 'compound' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Automatically reinvest your rewards to maximize earnings
              </p>
              <p className="text-2xl font-bold text-white mb-6">
                {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
              </p>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Lockup period for compounded rewards (days)
              </label>
              <select
                value={compoundLockupDuration}
                onChange={(e) => setCompoundLockupDuration(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 mb-4"
                style={{ color: 'white' }}
              >
                <option value="0" style={{ color: 'black' }}>Flexible (0.01% per hour)</option>
                <option value="30" style={{ color: 'black' }}>30 days (0.012% per hour)</option>
                <option value="90" style={{ color: 'black' }}>90 days (0.016% per hour)</option>
                <option value="180" style={{ color: 'black' }}>180 days (0.02% per hour)</option>
                <option value="365" style={{ color: 'black' }}>365 days (0.03% per hour)</option>
              </select>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                <p className="text-green-400 text-sm font-medium mb-1">
                  📈 Compound ROI:
                </p>
                <p className="text-white/80 text-sm">
                  {compoundLockupDuration === '0' && 'Daily: ~0.24% | Monthly: ~7.2% | Annual: ~87.6%'}
                  {compoundLockupDuration === '30' && 'Daily: ~0.29% | Monthly: ~8.6% | Annual: ~105.1%'}
                  {compoundLockupDuration === '90' && 'Daily: ~0.38% | Monthly: ~11.5% | Annual: ~140.2%'}
                  {compoundLockupDuration === '180' && 'Daily: ~0.48% | Monthly: ~14.4% | Annual: ~175.2%'}
                  {compoundLockupDuration === '365' && 'Daily: ~0.72% | Monthly: ~21.6% | Annual: ~262.8%'}
                </p>
                <p className="text-yellow-400 text-xs mt-1">
                  💡 Compounded rewards are reinvested with the selected period
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCompound}
              disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPending || isConfirming ? 'Processing...' : 'Compound Now'}
            </button>
          </div>
        )}

        {activeTab === 'emergency' && (
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
                {totalDeposit ? `${parseFloat(formatEther(totalDeposit)).toFixed(6)} POL` : '0 POL'}
              </p>
              <p className="text-red-400 text-sm mb-6">
                Rewards that will be lost: {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
              </p>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
              <p className="text-orange-400 text-sm font-medium mb-2">🚨 BEFORE CONTINUING:</p>
              <p className="text-white/80 text-sm">
                Consider using "Withdraw All" instead, which allows you to withdraw both your funds and rewards, 
                respecting lockup periods when necessary.
              </p>
            </div>
            
            <button
              onClick={handleEmergencyWithdraw}
              disabled={isPending || isConfirming || !totalDeposit || totalDeposit === 0n || !isPaused}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 border-2 border-red-500 hover:border-red-400 shadow-lg"
            >
              {!isPaused ? 'Only available when contract is paused' : isPending || isConfirming ? 'Processing...' : '🚨 EMERGENCY WITHDRAWAL 🚨'}
            </button>
            
            <p className="text-center text-white/60 text-xs">
              {isPaused ? 'By clicking you confirm that you understand the irreversible consequences of this action' : 'Emergency withdrawal is only available when the contract owner has paused the contract'}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Success Message */}
      {isConfirmed && (
        <div className="mx-6 mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-400 font-medium">Transaction completed successfully</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default StakingForm