import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface WelcomeTutorialProps {
  onClose: () => void;
}

const AIAnalysisWelcome: React.FC<WelcomeTutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isMobile = useIsMobile();
  
  const steps = [
    {
      title: 'Advanced AI Analysis 🤖',
      description: 'Multi-dimensional staking intelligence system',
      icon: '🎯',
      content: 'Experience the next generation of staking analysis! Our AI evaluates your performance across Skills, Gamification, Portfolio metrics, and more to provide comprehensive insights and actionable recommendations.'
    },
    {
      title: 'Your Staking Score',
      description: 'Comprehensive 0-100 performance rating',
      icon: '📊',
      content: 'Your score combines 5 key metrics: Amount Staked (25pts), Consistency (20pts), Rewards Generation (25pts), Diversification (15pts), and Engagement (15pts). Track your progress to Master level!'
    },
    {
      title: 'NFT Skills Analysis ⚡',
      description: 'Maximize your boost potential',
      icon: '💎',
      content: 'Our AI analyzes your active NFT skills, evaluates their rarity and level, calculates total APY boost, and provides strategic recommendations for optimizing your skill portfolio.'
    },
    {
      title: 'Gamification Progress 🎮',
      description: 'Track XP, levels & achievements',
      icon: '🏆',
      content: 'Monitor your level progression, XP accumulation, quest completion rate, and engagement score. Unlock special rewards by reaching key milestones and maintaining high activity levels.'
    },
    {
      title: 'Portfolio Intelligence 💼',
      description: 'Risk analysis & diversification',
      icon: '💡',
      content: 'Get insights into your portfolio diversification, liquidity ratio, risk levels, and growth projections. Receive personalized rebalancing suggestions to optimize your returns.'
    },
    {
      title: 'Smart Recommendations',
      description: 'AI-powered action items',
      icon: '🎯',
      content: 'Receive prioritized, actionable recommendations across Skills, Gamification, and Portfolio optimization. Each suggestion includes estimated impact and category for easy decision-making.'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('ai-analysis-tutorial-seen', 'true');
    onClose();
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className={`card-unified ${isMobile ? 'w-full mx-4 my-8' : 'max-w-2xl w-full'} relative overflow-hidden`}>
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Close button */}
        <button
          onClick={handleSkip}
          className={`absolute ${isMobile ? 'top-3 right-3' : 'top-4 right-4'} text-gray-400 hover:text-white transition-colors z-10 p-1 hover:bg-white/10 rounded-full`}
          aria-label="Close tutorial"
        >
          <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className={`relative ${isMobile ? 'p-6' : 'p-8'}`}>
          {/* Icon with animation */}
          <div className="flex justify-center mb-6 animate-bounce-slow">
            <div className={`${isMobile ? 'w-20 h-20' : 'w-28 h-28'} rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-2xl relative group`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <span className={`relative ${isMobile ? 'text-5xl' : 'text-6xl'}`}>
                {currentStepData.icon}
              </span>
            </div>
          </div>

          {/* Title with gradient */}
          <h2 className={`font-bold jersey-15-regular text-center mb-2 text-gradient ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className={`text-purple-400 text-center mb-6 font-medium jersey-20-regular ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {currentStepData.description}
          </p>

          {/* Content Card */}
          <div className={`relative bg-white/5 border border-white/10 rounded-xl ${isMobile ? 'p-4 mb-6' : 'p-6 mb-8'} hover:border-purple-500/30 transition-all group`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <p className={`relative text-gray-300 leading-relaxed text-center ${isMobile ? 'text-sm' : 'text-base'}`}>
              {currentStepData.content}
            </p>
          </div>

          {/* Progress indicators */}
          <div className={`flex justify-center items-center gap-3 ${isMobile ? 'mb-6' : 'mb-8'}`}>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full transition-all ${
                    index === currentStep
                      ? `bg-gradient-to-r from-purple-500 to-pink-500 ${isMobile ? 'w-6' : 'w-10'} shadow-lg`
                      : index < currentStep
                      ? 'bg-purple-500/50 hover:bg-purple-500/70'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to step ${index + 1}: ${step.title}`}
                />
                {index < steps.length - 1 && (
                  <div className={`${isMobile ? 'w-2' : 'w-3'} h-0.5 ${index < currentStep ? 'bg-purple-500/50' : 'bg-gray-700'} transition-colors`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Step counter */}
          <div className="text-center mb-6">
            <span className="text-gray-400 text-sm">
              Step <span className="text-white font-bold">{currentStep + 1}</span> of <span className="text-white font-bold">{steps.length}</span>
            </span>
          </div>

          {/* Navigation buttons */}
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center gap-4'}`}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`${isMobile ? 'w-full py-3 text-sm' : 'px-8 py-3'} rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/20'
              }`}
            >
              ← Previous
            </button>

            {!isMobile && (
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-xl"
              >
                Skip Tutorial
              </button>
            )}

            <button
              onClick={handleNext}
              className={`${isMobile ? 'w-full py-3 text-sm' : 'px-8 py-3'} bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-xl shadow-purple-500/25`}
            >
              {currentStep === steps.length - 1 ? '🚀 Get Started' : 'Next →'}
            </button>

            {isMobile && (
              <button
                onClick={handleSkip}
                className="w-full py-3 text-sm text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-xl"
              >
                Skip Tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisWelcome;
