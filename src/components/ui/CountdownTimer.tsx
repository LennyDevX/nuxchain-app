import { useState, useEffect, useMemo, useRef } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  onExpire?: () => void;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = targetDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

function CountdownTimer({ targetDate, onExpire, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const onExpireCalledRef = useRef(false);

  const isExpired = useMemo(() => {
    return timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  }, [timeLeft]);

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Handle expiration callback separately
  useEffect(() => {
    if (isExpired && !onExpireCalledRef.current && onExpire) {
      onExpireCalledRef.current = true;
      onExpire();
    }
  }, [isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-300 font-semibold text-lg">Airdrop Registration Closed</p>
      </div>
    );
  }

  // Compact mode for header
  if (compact) {
    return (
      <div className="flex gap-2 sm:gap-4 justify-center items-center">
        {[
          { label: 'd', value: timeLeft.days },
          { label: 'h', value: timeLeft.hours },
          { label: 'm', value: timeLeft.minutes },
          { label: 's', value: timeLeft.seconds },
        ].map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="bg-gray-900/60 backdrop-blur-md rounded-lg px-2 sm:px-3 py-1 border border-gray-700/50">
                <span className="text-lg sm:text-2xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="ml-1 text-[10px] sm:text-xs text-purple-400 font-bold uppercase">{unit.label}</span>
              </div>
            </div>
            {index < 3 && <span className="ml-2 sm:ml-4 text-gray-600 font-light opacity-50">:</span>}
          </div>
        ))}
      </div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
          Registration Ends In
        </h3>
        <p className="text-sm text-gray-400">Don't miss out on your airdrop allocation!</p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {timeUnits.map((unit, index) => (
          <div
            key={unit.label}
            className="relative group"
            style={{
              animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="bg-gray-900/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group-hover:scale-105">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-1 sm:mb-2 tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                {unit.label}
              </div>
            </div>

            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6 sm:mt-8">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-1000 relative overflow-hidden"
            style={{
              width: `${Math.max(0, Math.min(100, ((targetDate.getTime() - new Date().getTime()) / (targetDate.getTime() - new Date(2026, 0, 1).getTime())) * 100))}%`,
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountdownTimer;
