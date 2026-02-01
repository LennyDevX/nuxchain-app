import React from 'react';
import { motion } from 'framer-motion';

export const SkillsCTA: React.FC = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        className="relative overflow-hidden rounded-2xl p-12 md:p-16 bg-gradient-to-r from-purple-900/40 via-gray-900/50 to-blue-900/40 border border-purple-500/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background animation */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3), transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Ready to Amplify Your Earnings?
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Start your journey with our exclusive Skills NFTs and multiply your rewards in the Nuxchain ecosystem.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg transition-all"
            >
              Go to Marketplace
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, borderColor: '#A78BFA' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent border-2 border-purple-500 text-purple-300 font-bold rounded-lg hover:text-white transition-all"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
