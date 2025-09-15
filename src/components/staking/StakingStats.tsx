import React, { memo, useState, useRef, useEffect } from 'react'
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
  const totalSlides = 3 // 6 cards / 2 cards per slide = 3 slides

  useEffect(() => {
    const carousel = carouselRef.current
    if (!isMobile || !carousel) return

    const handleScroll = () => {
      const slideWidth = carousel.offsetWidth
      const scrollLeft = carousel.scrollLeft
      const newSlide = Math.round(scrollLeft / slideWidth)
      setCurrentSlide(newSlide)
    }

    carousel.addEventListener('scroll', handleScroll)
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  const statsData = [
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
  ]

  if (isMobile) {
    return (
      <div className="mb-8">
        <div className="relative">
          <div 
             ref={carouselRef}
             className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
           >
             {Array.from({ length: totalSlides }).map((_, slideIndex) => (
               <div key={slideIndex} className="flex-none w-full snap-start">
                 <div className="grid grid-cols-2 gap-3 px-1">
                   {statsData.slice(slideIndex * 2, slideIndex * 2 + 2).map((stat, index) => (
                     <div key={slideIndex * 2 + index} className="card-stats p-4">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-white/60 font-medium truncate text-xs">
                           {stat.title}
                         </span>
                         <span className="text-base">{stat.emoji}</span>
                       </div>
                       <div className="mb-1">
                         <h3 className="font-bold text-white truncate text-lg">
                           {stat.value}
                         </h3>
                       </div>
                       <div className="text-white/40 truncate text-xs">
                         {stat.subtitle}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
         </div>
         {/* Indicadores de puntos */}
         <div className="flex justify-center mt-4 space-x-2">
           {Array.from({ length: totalSlides }).map((_, index) => (
             <button
               key={index}
               onClick={() => carouselRef.current?.scrollTo({
                 left: index * (carouselRef.current?.offsetWidth || 0),
                 behavior: 'smooth'
               })}
               className={`w-2 h-2 rounded-full transition-colors ${
                 currentSlide === index ? 'bg-white' : 'bg-white/30'
               }`}
             />
           ))}
         </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {statsData.map((stat, index) => (
        <div key={index} className="card-stats">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-medium truncate">{stat.title}</span>
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