import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiBurstProps {
  trigger?: boolean;
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ trigger = true }) => {
  useEffect(() => {
    if (!trigger) return;

    // Fire celebratory burst with gold and violet theme
    const count = 180;
    const defaults = {
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#fbbf24', '#8b5cf6', '#c084fc', '#ffffff', '#ec4899'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, [trigger]);

  return null;
};
