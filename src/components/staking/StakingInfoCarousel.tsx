import React, { useState, useRef, useEffect } from 'react'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import UserInfo from './UserInfo'
import PoolInfo from './PoolInfo'
import ContractInfo from './ContractInfo'

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

interface StakingInfoCarouselProps {
  userInfo: UserInfoData | undefined
  pendingRewards: bigint | undefined
  userDeposits: DepositData[] | undefined
  totalDeposit: bigint
  totalPoolBalance: bigint | undefined
  uniqueUsersCount: bigint | undefined
  contractAddress: string
  isPaused: boolean
}

const StakingInfoCarousel: React.FC<StakingInfoCarouselProps> = ({
  userInfo,
  pendingRewards,
  userDeposits,
  totalDeposit,
  totalPoolBalance,
  uniqueUsersCount,
  contractAddress,
  isPaused
}) => {
  const isMobile = useIsMobile()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const slides = [
    {
      id: 'user-info',
      title: 'My Information',
      component: (
        <UserInfo
          userInfo={userInfo}
          pendingRewards={pendingRewards}
          userDeposits={userDeposits}
          totalDeposit={totalDeposit}
        />
      )
    },
    {
      id: 'pool-info',
      title: 'Pool Information',
      component: (
        <PoolInfo
          totalPoolBalance={totalPoolBalance}
          uniqueUsersCount={uniqueUsersCount}
        />
      )
    },
    {
      id: 'contract-info',
      title: 'Contract Details',
      component: (
        <ContractInfo
          contractAddress={contractAddress}
          isPaused={isPaused}
        />
      )
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Touch/Mouse handlers for swipe functionality
  const handleStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setTranslateX(0)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    const diff = clientX - startX
    setTranslateX(diff)
  }

  const handleEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const threshold = 50
    if (translateX > threshold) {
      prevSlide()
    } else if (translateX < -threshold) {
      nextSlide()
    }
    setTranslateX(0)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd()
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd()
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX)
      }
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, startX])

  if (!isMobile) {
    // Desktop: Show all components in a grid
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <div key={slide.id} className="w-full">
            {slide.component}
          </div>
        ))}
      </div>
    )
  }

  // Mobile: Carousel view
  return (
    <div className="w-full">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentSlide * 100}% + ${isDragging ? translateX : 0}px))`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 px-1"
            >
              <div className="w-full">
                {slide.component}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? 'bg-blue-400 w-6'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Title */}
      <div className="text-center mt-3">
        <h3 className="text-lg font-semibold text-white">
          {slides[currentSlide].title}
        </h3>
      </div>
    </div>
  )
}

export default StakingInfoCarousel