import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'

import PoolInfo from './PoolInfo'
import ContractInfo from './ContractInfo'



interface StakingInfoCarouselProps {
  totalPoolBalance: bigint | undefined
  uniqueUsersCount: bigint | undefined
  contractAddress: string
  isPaused: boolean
}

const StakingInfoCarousel: React.FC<StakingInfoCarouselProps> = ({
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

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // ✅ Auto-scroll active slide into view (same as StakingForm tabs)
  useEffect(() => {
    if (isMobile && carouselRef.current) {
      setTimeout(() => {
        if (carouselRef.current) {
          const slideWidth = carouselRef.current.offsetWidth
          carouselRef.current.scrollTo({
            left: currentSlide * slideWidth,
            behavior: 'smooth'
          })
        }
      }, 50)
    }
  }, [currentSlide, isMobile])

  // Touch/Mouse handlers for swipe functionality
  const handleStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setTranslateX(0)
  }

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return
    const diff = clientX - startX
    setTranslateX(diff)
  }, [isDragging, startX])

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    
    const threshold = 50
    if (translateX > threshold) {
      prevSlide()
    } else if (translateX < -threshold) {
      nextSlide()
    }
    setTranslateX(0)
  }, [isDragging, translateX, prevSlide, nextSlide])

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
  }, [isDragging, handleEnd, handleMove])

  if (!isMobile) {
    // Desktop: Show all components in a grid
    return (
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {slides.map((slide, index) => (
          <motion.div 
            key={slide.id} 
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            {slide.component}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // Mobile: Carousel view
  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl">
        <motion.div
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
          layout
        >
          {slides.map((slide) => (
            <motion.div
              key={slide.id}
              className="w-full flex-shrink-0 px-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full">
                {slide.component}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      <motion.div 
        className="flex justify-center mt-4 space-x-2"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? 'bg-blue-400 w-6'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            layout
          />
        ))}
      </motion.div>

      {/* Slide Title */}
      <motion.div 
        className="text-center mt-3"
        key={currentSlide}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white">
          {slides[currentSlide].title}
        </h3>
      </motion.div>
    </motion.div>
  )
}

export default StakingInfoCarousel