import { useAccount, useReadContract } from 'wagmi'
import SmartStakingABI from '../abi/SmartStaking.json'
import GlobalBackground from '../ui/gradientBackground'
import StakingForm from '../components/staking/StakingForm'
import UserInfo from '../components/staking/UserInfo'
import PoolInfo from '../components/staking/PoolInfo'
import StakingBonds from '../components/staking/StakingBonds'
import StakingStats from '../components/staking/StakingStats'
import ContractInfo from '../components/staking/ContractInfo'
import ConnectWallet from '../ui/ConnectWallet'

// Interfaces
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

// Contract address from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS_V2 

function Staking() {
  const { address, isConnected } = useAccount()

  // Read contract data
  const { data: userInfo } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'getUserInfo',
    args: [address],
    query: { enabled: !!address }
  })

  const { data: userDeposits } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'getUserDeposits',
    args: [address],
    query: { enabled: !!address }
  })

  const { data: totalPoolBalance } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'totalPoolBalance',
  })

  const { data: uniqueUsersCount } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'uniqueUsersCount',
  })

  const { data: pendingRewards } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'calculateRewards',
    args: [address],
    query: { enabled: !!address }
  })

  const { data: totalDeposit, error: totalDepositError } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'getTotalDeposit',
    args: [address],
    query: { enabled: !!address }
  })

  const { data: contractVersion } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'getContractVersion',
  })

  const { data: contractBalance } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'getContractBalance',
  })

  // Debug logs
  console.log('Total Deposit:', totalDeposit)
  console.log('Total Deposit Error:', totalDepositError)
  console.log('Address:', address)

  const { data: isPaused } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'paused',
  })



  if (!isConnected) {
    return <ConnectWallet pageName="Staking" />;
  }

  return (
    <GlobalBackground>
      <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Staking <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Earn automatic rewards by staking your POL tokens
          </p>
        </div>


        <StakingStats
          totalPoolBalance={totalPoolBalance as bigint}
          uniqueUsersCount={uniqueUsersCount as bigint}
          totalDeposit={totalDeposit as bigint}
          pendingRewards={pendingRewards as bigint}
          contractVersion={contractVersion as bigint}
          contractBalance={contractBalance as bigint}
        />

        {/* Contract Paused Alert */}
        {Boolean(isPaused) && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-400 font-medium">⚠️ The staking contract is temporarily paused. Deposits cannot be made at this time.</span>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Staking Form and Bonds */}
          <div className="space-y-8">
            <StakingForm 
              stakingContractAddress={STAKING_CONTRACT_ADDRESS}
              pendingRewards={(pendingRewards as bigint) || 0n}
              isPaused={(isPaused as boolean) || false}
              totalDeposit={(totalDeposit as bigint) || 0n}
            />
            {/* Staking Bonds Section */}
            <StakingBonds />
          </div>

          {/* Right Column - User Info and Pool Info */}
          <div className="space-y-6">
            <UserInfo 
              userInfo={userInfo as UserInfoData | undefined}
              pendingRewards={(pendingRewards as bigint) || 0n}
              userDeposits={userDeposits as DepositData[] | undefined}
              totalDeposit={(totalDeposit as bigint) || 0n}
            />
            <PoolInfo 
              totalPoolBalance={(totalPoolBalance as bigint) || 0n}
              uniqueUsersCount={(uniqueUsersCount as bigint) || 0n}
            />
            <ContractInfo 
              contractAddress={STAKING_CONTRACT_ADDRESS}
              isPaused={(isPaused as boolean) || false}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        {/* Assuming isConfirmed is a boolean state or prop, defaulting to false if not defined */}
        {(false) && (
          <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 font-medium">Transaction completed successfully</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </GlobalBackground>
  )
}

export default Staking