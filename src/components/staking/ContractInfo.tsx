
import React, { memo } from 'react'
import { motion } from 'framer-motion'

interface ContractInfoProps {
  contractAddress: string
  isPaused: boolean
}

const ContractInfo: React.FC<ContractInfoProps> = memo(({ contractAddress, isPaused }) => {
  const polygonScanUrl = `https://polygonscan.com/address/${contractAddress}`
  
  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <motion.div 
      className="card-unified rounded-xl p-4 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <motion.h3 
        className="text-lg font-bold text-white mb-3"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        viewport={{ once: true }}
      >
        Contract Info
      </motion.h3>
      
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        viewport={{ once: true }}
      >
        {/* Smart Staking Version Badge */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          viewport={{ once: true }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60 text-sm">Version:</span>
          <motion.span 
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium"
            whileHover={{ scale: 1.05 }}
          >
            Smart Staking v2
          </motion.span>
        </motion.div>

        {/* Contract Address */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          viewport={{ once: true }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60 text-sm">Contract:</span>
          <div className="flex items-center space-x-2">
            <motion.span 
              className="bg-white/10 text-white px-2 py-1 rounded-lg text-xs font-mono"
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              {truncateAddress(contractAddress)}
            </motion.span>
            <motion.a
              href={polygonScanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="View on PolygonScan"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
          </div>
        </motion.div>

        {/* Contract Status */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          viewport={{ once: true }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60 text-sm">Status:</span>
          <div className="flex items-center space-x-2">
            <motion.div 
              className={`w-2 h-2 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500'}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
            <motion.span 
              className={`text-xs font-medium ${isPaused ? 'text-red-400' : 'text-green-400'}`}
              whileHover={{ scale: 1.1 }}
            >
              {isPaused ? 'Paused' : 'Active'}
            </motion.span>
          </div>
        </motion.div>

        {/* Network Badge */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          viewport={{ once: true }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60 text-sm">Network:</span>
          <motion.span 
            className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium border border-purple-500/30"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(126, 34, 206, 0.3)' }}
          >
            Polygon
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
})

ContractInfo.displayName = 'ContractInfo'

export default ContractInfo