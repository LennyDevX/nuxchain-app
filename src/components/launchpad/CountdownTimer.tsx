import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  onExpire?: () => void;
}

export default function CountdownTimer({ targetDate, label, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    function calculate() {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        onExpire?.();
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }
    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [targetDate, onExpire]);

  if (!timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <p className="jersey-20-regular text-slate-400 text-2xl uppercase tracking-widest">{label}</p>}
      <div className="flex items-center gap-1">
        {[
          { v: timeLeft.days, u: 'd' },
          { v: timeLeft.hours, u: 'h' },
          { v: timeLeft.minutes, u: 'm' },
          { v: timeLeft.seconds, u: 's' },
        ].map(({ v, u }, i) => (
          <div key={u} className="flex items-center gap-1">
            <div className="bg-black/40 border border-white/10 rounded px-2 py-1 min-w-[36px] text-center">
              <span className="jersey-15-regular text-white text-xl md:text-3xl tabular-nums">{pad(v)}</span>
            </div>
            <span className="jersey-20-regular text-slate-500 text-xl md:text-3xl">{u}</span>
            {i < 3 && <span className="jersey-15-regular text-slate-600 text-xl md:text-3xl">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
