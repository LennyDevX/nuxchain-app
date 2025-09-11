import { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/mobile';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function TimeCounter() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    // Set target date to 30 days from now
    const targetDate = new Date('2025-10-30T23:59:59').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-black/30 backdrop-blur-sm rounded-2xl ${isMobile ? 'p-4' : 'p-8'} border border-purple-500/30 shadow-2xl`}>
      <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4`}>
        Registration Countdown
      </h3>
      <p className={`text-center text-gray-300 ${isMobile ? 'mb-4 text-xs' : 'mb-6 text-sm'} leading-relaxed`}>
        Don't miss your chance to participate in our exclusive NFT airdrop! 
        Register now before the deadline and be part of the future of digital assets.
        This limited-time opportunity offers premium NFTs from verified projects.
      </p>
      
      <div className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg ${isMobile ? 'p-3 mb-4' : 'p-4 mb-6'} border border-purple-500/20`}>
        <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-purple-300 mb-2`}>🎁 What You'll Get:</h4>
        <ul className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 space-y-1`}>
          <li>• Exclusive NFTs from top-tier projects</li>
          <li>• Early access to future drops</li>
          <li>• Community membership benefits</li>
          <li>• Potential high-value collectibles</li>
        </ul>
      </div>
      
      <div className={`grid grid-cols-4 ${isMobile ? 'gap-2 mb-4' : 'gap-3 mb-6'}`}>
        <div className="text-center">
          <div className={`bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-xl ${isMobile ? 'p-2' : 'p-4'} mb-2 shadow-lg border border-purple-400/20`}>
            <span className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white drop-shadow-lg`}>{timeLeft.days.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-gray-300 font-medium">Days</span>
        </div>
        <div className="text-center">
          <div className={`bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-xl ${isMobile ? 'p-2' : 'p-4'} mb-2 shadow-lg border border-purple-400/20`}>
            <span className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white drop-shadow-lg`}>{timeLeft.hours.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-gray-300 font-medium">Hours</span>
        </div>
        <div className="text-center">
          <div className={`bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-xl ${isMobile ? 'p-2' : 'p-4'} mb-2 shadow-lg border border-purple-400/20`}>
            <span className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white drop-shadow-lg`}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-gray-300 font-medium">Minutes</span>
        </div>
        <div className="text-center">
          <div className={`bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-xl ${isMobile ? 'p-2' : 'p-4'} mb-2 shadow-lg border border-purple-400/20`}>
            <span className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white drop-shadow-lg`}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-gray-300 font-medium">Seconds</span>
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <div className="bg-black/20 rounded-lg p-3 border border-purple-500/20">
          <p className="text-gray-300 text-sm">
            <span className="font-semibold text-purple-400">Registration Deadline:</span> October 30, 2025
          </p>
          <p className="text-gray-300 text-sm">
            <span className="font-semibold text-pink-400">Token Distribution:</span> November 5, 2025
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-3 border border-blue-500/20">
          <p className="text-xs text-gray-300 mb-2">
            <span className="font-semibold text-blue-400">🚀 Join Our Community:</span> Connect with fellow NFT enthusiasts and stay updated!
          </p>
          <a 
            href="https://t.me/nuvoNFT" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
          >
            📱 Join us on Telegram →
          </a>
        </div>
      </div>
    </div>
  );
}

export default TimeCounter;