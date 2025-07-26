import React, { useState, useEffect } from 'react';
import { MultiRoundMission, GameRound, GameObject } from '../types';
import { CheckCircleIcon, XCircleIcon } from './icons'; // Assuming you might add these icons

interface MultiRoundMissionProps {
  mission: MultiRoundMission;
  onComplete: (results: { skill: string; success: boolean }[]) => void;
}

const MultiRoundMissionComponent: React.FC<MultiRoundMissionProps> = ({ mission, onComplete }) => {
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [selections, setSelections] = useState<Set<string>>(new Set());
    const [roundResults, setRoundResults] = useState<{ skill: string; success: boolean }[]>([]);
    const [roundStatus, setRoundStatus] = useState<'playing' | 'feedback'>('playing');
    const [isCorrect, setIsCorrect] = useState(false);

    const currentRound = mission.rounds[currentRoundIndex];

    const handleObjectClick = (objectId: string) => {
        if (roundStatus !== 'playing') return;
        setSelections(prev => {
            const newSelections = new Set(prev);
            if (newSelections.has(objectId)) {
                newSelections.delete(objectId);
            } else {
                newSelections.add(objectId);
            }
            return newSelections;
        });
    };

    const handleSubmitRound = () => {
        const correctSelections = new Set(currentRound.correctObjectIds);
        const userSelections = selections;

        const success = correctSelections.size === userSelections.size &&
                      [...correctSelections].every(id => userSelections.has(id));

        setIsCorrect(success);
        setRoundResults(prev => [...prev, { skill: currentRound.skillToTest, success }]);
        setRoundStatus('feedback');
    };

    const handleNext = () => {
        setSelections(new Set());
        setRoundStatus('playing');
        if (currentRoundIndex < mission.rounds.length - 1) {
            setCurrentRoundIndex(prev => prev + 1);
        } else {
            onComplete(roundResults);
        }
    };
    
    // Effect to trigger final completion when the last round's feedback is processed
    useEffect(() => {
        if (roundStatus === 'feedback' && currentRoundIndex === mission.rounds.length - 1) {
             const finalTimeout = setTimeout(() => {
                // Ensure the final result is added before completing
                const finalResults = [...roundResults, { skill: currentRound.skillToTest, success: isCorrect }];
                // Deduplicate if already added
                const uniqueResults = Array.from(new Map(finalResults.map(item => [item.skill, item])).values());
                 onComplete(uniqueResults.length === mission.rounds.length ? uniqueResults : roundResults);
            }, 2000);
            return () => clearTimeout(finalTimeout);
        }
    }, [roundStatus, currentRoundIndex, mission.rounds.length, onComplete, roundResults, currentRound.skillToTest, isCorrect]);


    return (
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 animate-fade-in flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-center text-[var(--color-text-accent)]">{mission.title}</h2>
            
            <div className="text-center bg-black/20 p-4 rounded-xl border border-white/20">
                <p className="text-lg font-bold">Round {currentRound.roundNumber} / {mission.rounds.length}: <span className="text-[var(--color-text-muted)] font-normal">{currentRound.instructions}</span></p>
                <p className="text-[var(--color-text-accent)] font-semibold mt-1">Skill Test: {currentRound.skillToTest}</p>
            </div>
            
            <div className="relative flex-grow min-h-[300px] sm:min-h-[400px]">
                {/* Game Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-4 p-4 bg-black/20 rounded-lg border border-white/20">
                    {currentRound.gridObjects.map(obj => (
                        <button
                            key={obj.id}
                            onClick={() => handleObjectClick(obj.id)}
                            className={`relative aspect-square rounded-md transition-all duration-200 transform bg-white/10 hover:bg-white/20`}
                            disabled={roundStatus !== 'playing'}
                        >
                            <img src={obj.imageUrl} alt={obj.type} className="w-full h-full object-contain p-1 sm:p-2" />
                            {selections.has(obj.id) && (
                                <div className="absolute inset-0 border-4 rounded-md" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(255, 255, 255, 0.2)'}}></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Feedback Overlay */}
                {roundStatus === 'feedback' && (
                    <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center gap-4 animate-fade-in z-10">
                        {isCorrect ? (
                             <>
                                <CheckCircleIcon className="w-20 h-20 text-green-400" />
                                <h3 className="text-3xl font-bold text-green-400">Correct!</h3>
                             </>
                        ) : (
                            <>
                                <XCircleIcon className="w-20 h-20 text-red-400" />
                                <h3 className="text-3xl font-bold text-red-400">Good Try!</h3>
                            </>
                        )}
                         <button onClick={handleNext} className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] font-extrabold text-lg py-3 px-8 rounded-full shadow-lg transition-colors">
                            {currentRoundIndex < mission.rounds.length - 1 ? 'Next Round' : 'Finish Mission'}
                        </button>
                    </div>
                )}
            </div>
            
            {roundStatus === 'playing' && (
                 <button 
                    onClick={handleSubmitRound} 
                    className="w-full max-w-sm mx-auto bg-green-500 hover:bg-green-600 text-white font-extrabold text-lg py-3 px-6 rounded-full shadow-lg transition-colors"
                 >
                    Check My Answer
                </button>
            )}

             <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
              }
            `}</style>
        </div>
    );
};

export default MultiRoundMissionComponent;