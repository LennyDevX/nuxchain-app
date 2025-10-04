import React, { useState } from 'react';

interface WelcomeTutorialProps {
  onClose: () => void;
}

const AIAnalysisWelcome: React.FC<WelcomeTutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: 'Welcome to AI Analysis 🤖',
      description: 'Your personal staking performance intelligence system',
      icon: '🎯',
      content: 'AI Analysis uses advanced algorithms to evaluate your staking performance across 5 key metrics and provides personalized recommendations to optimize your returns.'
    },
    {
      title: 'Your Staking Score',
      description: 'Get a comprehensive 0-100 score',
      icon: '📊',
      content: 'Your score is calculated from: Amount Staked (25pts), Consistency (20pts), Rewards Generation (25pts), Diversification (15pts), and Engagement (15pts).'
    },
    {
      title: 'Score Levels',
      description: 'Progress through 5 achievement tiers',
      icon: '🏆',
      content: 'From Beginner (0-39) to Master (90-100). Each level unlocks insights and shows your percentile ranking among all stakers.'
    },
    {
      title: 'Smart Recommendations',
      description: 'Personalized action items',
      icon: '💡',
      content: 'Get AI-powered suggestions tailored to your current performance. Recommendations are prioritized and actionable, helping you improve your score strategically.'
    },
    {
      title: 'Real-time Updates',
      description: 'Always up-to-date insights',
      icon: '🔄',
      content: 'Your analysis automatically refreshes every 30 seconds. You can also manually refresh anytime to see immediate changes after staking actions.'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="card-unified max-w-2xl w-full relative">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-5xl shadow-2xl">
              {currentStepData.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gradient text-center mb-2">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-purple-400 text-center mb-6 text-lg">
            {currentStepData.description}
          </p>

          {/* Content */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <p className="text-gray-300 leading-relaxed text-center">
              {currentStepData.content}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-purple-500 w-8'
                    : index < currentStep
                    ? 'bg-purple-500/50'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleSkip}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all hover:scale-105"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisWelcome;
