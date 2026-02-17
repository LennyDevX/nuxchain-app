import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwipeCarouselProps {
    children: React.ReactNode[];
    className?: string;
}

const SwipeCarousel: React.FC<SwipeCarouselProps> = ({ children, className = '' }) => {
    const [index, setIndex] = useState(0);

    const nextSlide = () => {
        setIndex((prev) => (prev + 1) % children.length);
    };

    const prevSlide = () => {
        setIndex((prev) => (prev - 1 + children.length) % children.length);
    };

    const dragEndHandler = (event: any, info: any) => {
        if (info.offset.x < -50) {
            nextSlide();
        } else if (info.offset.x > 50) {
            prevSlide();
        }
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <div className="relative h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={dragEndHandler}
                        className="h-full"
                    >
                        {children[index]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {children.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-white w-4' : 'bg-white/20'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default SwipeCarousel;
