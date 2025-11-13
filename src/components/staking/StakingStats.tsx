import React, { memo, useState, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatEther } from 'viem'
import { useIsMobile } from '../../hooks/mobile'
import { getOptimizedSpacing } from '../../utils/mobile/performanceOptimization'

interface StakingStatsProps {
  totalPoolBalance: bigint
  uniqueUsersCount: bigint
  totalDeposit: bigint
  pendingRewards: bigint
  contractVersion: bigint | undefined
  contractBalance: bigint | undefined
}

const StakingStats: React.FC<StakingStatsProps> = memo(({
  totalPoolBalance,
  uniqueUsersCount,
  totalDeposit,
  pendingRewards,
  contractVersion,
  contractBalance,
}) => {
  const isMobile = useIsMobile()
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // ✅ Espaciado adaptativo
  const spacing = useMemo(() => getOptimizedSpacing(16, isMobile), [isMobile])

  const statsData = useMemo(() => [
    {
      title: 'Total Pool',
      value: totalPoolBalance ? parseFloat(formatEther(totalPoolBalance)).toFixed(2) : '0',
      subtitle: 'POL staked',
      emoji: '💰'
    },
    {
      title: 'Users',
      value: uniqueUsersCount ? uniqueUsersCount.toString() : '0',
      subtitle: isMobile ? 'Participants' : 'Staking participants',
      emoji: '👥'
    },
    {
      title: 'Your Stake',
      value: totalDeposit ? parseFloat(formatEther(totalDeposit)).toFixed(4) : '0',
      subtitle: 'POL deposited',
      emoji: '📈'
    },
    {
      title: 'Rewards',
      value: pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(6) : '0',
      subtitle: isMobile ? 'Pending' : 'Pending rewards',
      emoji: '🎁'
    },
    {
      title: 'Contract Version',
      value: contractVersion ? `v${contractVersion.toString()}` : 'v2',
      subtitle: 'Smart contract',
      emoji: '📄'
    },
    {
      title: 'Contract Balance',
      value: contractBalance ? parseFloat(formatEther(contractBalance)).toFixed(4) : '0',
      subtitle: 'Available funds',
      emoji: '🏦'
    }
  ], [totalPoolBalance, uniqueUsersCount, totalDeposit, pendingRewards, contractVersion, contractBalance, isMobile])

  const totalSlides = Math.ceil(statsData.length / 2)
  const itemsPerSlide = 2

  // Optimized scroll handler with debouncing
  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    const container = carouselRef.current
    const scrollLeft = container.scrollLeft
    const itemWidth = container.offsetWidth
    const newSlide = Math.round(scrollLeft / itemWidth)
    
    setCurrentSlide(Math.min(newSlide, totalSlides - 1))
  }, [totalSlides])

  // Scroll to specific slide with smooth animation
  const scrollToSlide = useCallback((index: number) => {
    if (!carouselRef.current) return

    const container = carouselRef.current
    const itemWidth = container.offsetWidth

    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    })
    setCurrentSlide(index)
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    const timeoutId = scrollTimeoutRef.current

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  if (isMobile) {
    return (
      <motion.div 
        className="mb-8 w-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide gap-0"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              gap: `${spacing}px` // ✅ Espaciado adaptativo
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <motion.div
                key={slideIndex}
                className="snap-start flex-none w-full px-1"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: slideIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="grid grid-cols-2 gap-3" style={{ gap: `${spacing * 0.75}px` }}>
                  {statsData
                    .slice(slideIndex * itemsPerSlide, slideIndex * itemsPerSlide + itemsPerSlide)
                    .map((stat, index) => (
                      <motion.div
                        key={slideIndex * itemsPerSlide + index}
                        className="card-stats p-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: slideIndex * 0.1 + index * 0.08 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.08, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/60 font-medium truncate text-xs uppercase tracking-wide">
                            {stat.title}
                          </span>
                          <motion.span 
                            className="text-xl"
                            whileHover={{ scale: 1.2, rotate: 5 }}
                          >
                            {stat.emoji}
                          </motion.span>
                        </div>
                        <div className="mb-2">
                          <h3 className="font-bold text-white truncate text-lg md:text-xl">
                            {stat.value}
                          </h3>
                        </div>
                        <div className="text-white/50 truncate text-xs">
                          {stat.subtitle}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Gradient Fade Effect - Left */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          />

          {/* Gradient Fade Effect - Right */}
          <motion.div 
            className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          />
        </div>

        {/* Progress Indicators - Animated */}
        <motion.div 
          className="flex justify-center items-center gap-2 mt-6 py-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {Array.from({ length: totalSlides }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => scrollToSlide(index)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === index
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 w-6 h-2 shadow-lg shadow-purple-500/50'
                  : 'bg-gray-600 hover:bg-gray-500 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              layout
            />
          ))}
        </motion.div>

        {/* Slide Counter removed as per user request */}
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          className="card-stats bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 transform hover:scale-105"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.08, borderColor: 'rgba(168, 85, 247, 0.5)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-medium truncate uppercase tracking-wide">{stat.title}</span>
            <motion.span 
              className="text-lg"
              whileHover={{ scale: 1.2, rotate: 5 }}
            >
              {stat.emoji}
            </motion.span>
          </div>
          <div className="mb-1">
            <motion.h3 
              className="text-xl font-bold text-white truncate"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.08 + 0.2 }}
              viewport={{ once: true }}
            >
              {stat.value}
            </motion.h3>
          </div>
          <div className="text-white/40 text-xs truncate">
            {stat.subtitle}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
})

StakingStats.displayName = 'StakingStats'

export default StakingStats