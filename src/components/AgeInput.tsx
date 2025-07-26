import React, { useState } from 'react';
import { StarIcon } from './icons';

interface AgeInputProps {
  onAgeSubmit: (age: number) => void;
}

const AgeInput: React.FC<AgeInputProps> = ({ onAgeSubmit }) => {
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 6 || ageNum > 17) {
      setError('Please enter an age between 6 and 17.');
      return;
    }
    setError('');
    onAgeSubmit(ageNum);
  };

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 animate-fade-in">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-[var(--color-text-accent)]">Welcome to Becom.AI!</h2>
            <p className="text-[var(--color-text-muted)] mt-2">To start your adventure, please tell us your age.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <label htmlFor="age-input" className="sr-only">Your Age</label>
            <input
                type="number"
                id="age-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="w-full text-center text-xl p-3 rounded-lg bg-white/10 border-2 border-transparent focus:ring-0 focus:outline-none transition-colors placeholder-white/50 focus:border-[var(--color-accent)]"
                required
                min="6"
                max="17"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
                type="submit"
                className="w-full mt-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] font-extrabold text-lg py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
                <StarIcon className="w-6 h-6" />
                Start My Journey
            </button>
        </form>
         <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
           /* Hide number input spinners */
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}</style>
    </div>
  );
};

export default AgeInput;