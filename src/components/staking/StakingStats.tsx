import React, { memo, useState, useRef, useCallback, useMemo } from 'react'
import { formatEther } from 'viem'
import { useIsMobile } from '../../hooks/mobile'

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
      value: contractVersion ? `v${contractVersion.toString()}` : 'v0',
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
      <div className="mb-8 w-full">
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
              msOverflowStyle: 'none'
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div
                key={slideIndex}
                className="snap-start flex-none w-full px-1"
              >
                <div className="grid grid-cols-2 gap-3">
                  {statsData
                    .slice(slideIndex * itemsPerSlide, slideIndex * itemsPerSlide + itemsPerSlide)
                    .map((stat, index) => (
                      <div
                        key={slideIndex * itemsPerSlide + index}
                        className="card-stats p-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/60 font-medium truncate text-xs uppercase tracking-wide">
                            {stat.title}
                          </span>
                          <span className="text-xl">{stat.emoji}</span>
                        </div>
                        <div className="mb-2">
                          <h3 className="font-bold text-white truncate text-lg md:text-xl">
                            {stat.value}
                          </h3>
                        </div>
                        <div className="text-white/50 truncate text-xs">
                          {stat.subtitle}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Gradient Fade Effect - Left */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-10" />

          {/* Gradient Fade Effect - Right */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-10" />
        </div>

        {/* Progress Indicators - Animated */}
        <div className="flex justify-center items-center gap-2 mt-6 py-3">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSlide(index)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === index
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 w-6 h-2 shadow-lg shadow-purple-500/50'
                  : 'bg-gray-600 hover:bg-gray-500 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index}
            />
          ))}
        </div>

        {/* Slide Counter removed as per user request */}
      </div>
    )
  }

  return (
    <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="card-stats bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-medium truncate uppercase tracking-wide">{stat.title}</span>
            <span className="text-lg">{stat.emoji}</span>
          </div>
          <div className="mb-1">
            <h3 className="text-xl font-bold text-white truncate">
              {stat.value}
            </h3>
          </div>
          <div className="text-white/40 text-xs truncate">
            {stat.subtitle}
          </div>
        </div>
      ))}
    </div>
  )
})

StakingStats.displayName = 'StakingStats'

export default StakingStats