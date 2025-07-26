
import React from 'react';
import { StarIcon } from './icons';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center p-8">
      <div className="relative w-24 h-24">
        <StarIcon className="w-24 h-24 text-[var(--color-accent)] animate-ping-slow opacity-50" />
        <StarIcon className="absolute top-0 left-0 w-24 h-24 text-[var(--color-accent)] animate-spin-slow" />
      </div>
      <p className="text-xl font-bold text-[var(--color-text-muted)]">{message}</p>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;