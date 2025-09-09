
interface ContractInfoProps {
  contractAddress: string
  isPaused: boolean
}

function ContractInfo({ contractAddress, isPaused }: ContractInfoProps) {
  const polygonScanUrl = `https://polygonscan.com/address/${contractAddress}`
  
  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="card-unified rounded-xl p-4 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-3">Contract Info</h3>
      
      <div className="space-y-3">
        {/* Smart Staking Version Badge */}
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Version:</span>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            Smart Staking v2
          </span>
        </div>

        {/* Contract Address */}
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Contract:</span>
          <div className="flex items-center space-x-2">
            <span className="bg-white/10 text-white px-2 py-1 rounded-lg text-xs font-mono">
              {truncateAddress(contractAddress)}
            </span>
            <a
              href={polygonScanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="View on PolygonScan"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Contract Status */}
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Status:</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`text-xs font-medium ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
              {isPaused ? 'Paused' : 'Active'}
            </span>
          </div>
        </div>

        {/* Network Badge */}
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Network:</span>
          <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium border border-purple-500/30">
            Polygon
          </span>
        </div>
      </div>
    </div>
  )
}

export default ContractInfo