import React from 'react';
import { AnalysisResult, CareerPath } from '../types';
import { BrainIcon, LightbulbIcon, MapIcon, RocketIcon } from './icons';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  onSelectPath: (path: CareerPath) => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onReset, onSelectPath }) => {
  return (
    <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 animate-fade-in">
      <div className="flex flex-col gap-8">
        
        <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-accent)] flex items-center justify-center gap-3 mb-2">
                <MapIcon className="w-8 h-8"/>
                Your Growth Map
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">This is your personal dashboard! See the strengths you've shown and pick a path to play and discover even more.</p>
        </div>

        {/* Top-level summary & traits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--color-card-bg-1)', borderColor: 'var(--color-card-border-1)' }}>
              <h3 className="text-xl font-bold text-[var(--color-text-accent)] flex items-center gap-2 mb-3">
                <LightbulbIcon className="w-6 h-6"/>
                A Spark of Insight
              </h3>
              <p className="text-[var(--color-text-base)] leading-relaxed">{result.feedback}</p>
            </div>
            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--color-card-bg-2)', borderColor: 'var(--color-card-border-2)' }}>
              <h3 className="text-xl font-bold text-[var(--color-text-accent)] flex items-center gap-2 mb-3">
                <BrainIcon className="w-6 h-6"/>
                Your Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.traits.map((trait, index) => (
                  <span key={index} className="bg-[var(--color-trait-bg)] text-[var(--color-trait-text)] font-bold px-3 py-1 rounded-full text-sm">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
        </div>
        
        {/* Career Paths */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
            <RocketIcon className="w-7 h-7"/>
            Click a Path to Play!
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.careerPaths.map((path, index) => (
              <button 
                key={index} 
                onClick={() => onSelectPath(path)}
                className="group bg-white/10 rounded-lg overflow-hidden flex flex-col shadow-md transition-all duration-300 hover:scale-105 text-left border border-transparent hover:border-[var(--color-accent)]"
              >
                {path.imageUrl ? (
                  <div className="w-full h-40 overflow-hidden">
                    <img src={path.imageUrl} alt={`Illustration of ${path.name}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-white/5 flex items-center justify-center text-white/50">
                    <p>No Image</p>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <p className="font-bold text-lg">{path.name}</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1 flex-grow">{path.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="w-full max-w-xs mx-auto mt-4 bg-white/20 hover:bg-white/30 text-[var(--color-text-base)] font-extrabold text-lg py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
        >
          Start a New Dream
        </button>
      </div>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default AnalysisDisplay;