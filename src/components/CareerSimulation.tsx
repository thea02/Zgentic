import React from 'react';
import { StoryStep, StoryChoice } from '../types';

interface CareerSimulationProps {
  step: StoryStep;
  onChoice: (choice: StoryChoice) => void;
}

const CareerSimulation: React.FC<CareerSimulationProps> = ({ step, onChoice }) => {
  return (
    <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 animate-fade-in flex flex-col gap-6">
      
      {/* Visual */}
      <div className="w-full rounded-lg overflow-hidden shadow-lg border border-white/20">
        {step.imageUrl ? (
          <img src={step.imageUrl} alt="A scene from the story" className="w-full h-auto object-cover aspect-video" />
        ) : (
          <div className="w-full h-auto aspect-video bg-white/5 flex items-center justify-center text-white/50">
            <p>Loading visual...</p>
          </div>
        )}
      </div>
      
      {/* Story Text */}
      <div className="text-center">
        <p className="text-lg sm:text-xl text-white/90 leading-relaxed">{step.text}</p>
      </div>

      {/* Choices */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
        <h3 className="text-xl font-bold text-yellow-300 shrink-0">What do you do?</h3>
        {step.choices.map((choice, index) => (
            <button
                key={index}
                onClick={() => onChoice(choice)}
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-base py-3 px-5 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
            >
                {choice.text}
            </button>
        ))}
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

export default CareerSimulation;