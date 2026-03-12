import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Nuxbee AI",
    icon: <span className="text-4xl">✨</span>,
    description: "Your personal assistant powered by the Gemini 3.1 Pro model, specifically designed for the Nuxchain ecosystem.",
    details: [
      "Fast and accurate responses",
      "Next-generation language model",
      "Multilanguage support"
    ]
  },
  {
    title: "Unlimited Interaction",
    icon: <span className="text-4xl">💬</span>,
    description: "Send messages, share research links, and upload images for Nuxbee to analyze in real-time.",
    details: [
      "Upload images using the clip icon",
      "Paste research links for analysis",
      "Integrated web search capabilities"
    ]
  },
  {
    title: "Blockchain Power",
    icon: <span className="text-4xl">🛡️</span>,
    description: "Nuxbee can access your activity on Nuxchain. Check your balances, transactions, and NFTs easily.",
    details: [
      "On-chain data reading",
      "Portfolio analysis",
      "Active personalized context"
    ]
  }
];

export const ChatTutorialModal: React.FC<ChatTutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl">
                  <div className="text-5xl">{tutorialSteps[currentStep].icon}</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-jersey">
                    Nuxbee Tutorial
                  </h3>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors w-10 h-10 flex items-center justify-center text-zinc-500 text-xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-8 md:px-10">
              <h4 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-5">
                {tutorialSteps[currentStep].title}
              </h4>
              <p className="text-white text-lg md:text-xl leading-relaxed mb-8 font-medium">
                {tutorialSteps[currentStep].description}
              </p>

              <div className="space-y-4">
                {tutorialSteps[currentStep].details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-zinc-300 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-cyan-400 flex-shrink-0 text-xl font-bold">✓</span>
                    <span className="text-sm md:text-base font-medium">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 flex items-center justify-between">
              <div className="flex gap-2">
                {tutorialSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep ? 'w-8 bg-cyan-400' : 'w-2 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="px-5 py-2.5 rounded-xl text-zinc-400 text-base font-medium hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all font-jersey"
                >
                  {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep !== tutorialSteps.length - 1 && <span className="text-xl">→</span>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
