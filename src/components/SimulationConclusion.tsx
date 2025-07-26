import React from 'react';
import { SimulationConclusion } from '../types';
import { 
    LightbulbIcon, ArrowUturnLeftIcon, SparklesIcon, BrainIcon, 
    MapIcon, UserGroupIcon, QuestionMarkCircleIcon, EyeIcon, RocketIcon 
} from './icons';

interface SimulationConclusionProps {
  conclusion: SimulationConclusion;
  onReset: () => void;
  onGeneratePlan: () => void;
}

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  Adventure: MapIcon,
  ProblemSolving: BrainIcon,
  Focus: EyeIcon,
  Creativity: LightbulbIcon,
  Teamwork: UserGroupIcon,
  Curiosity: QuestionMarkCircleIcon,
  Default: SparklesIcon,
};

const getIcon = (iconKey: string) => {
    const IconComponent = iconMap[iconKey.replace(/\s+/g, '')] || iconMap.Default;
    return <IconComponent className="w-10 h-10 mr-4 shrink-0 text-[var(--color-text-accent)]" />;
};


const SimulationConclusionComponent: React.FC<SimulationConclusionProps> = ({ conclusion, onReset, onGeneratePlan }) => {
  return (
    <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 animate-fade-in flex flex-col gap-6">
      
      <div className="w-full rounded-lg overflow-hidden shadow-lg border border-white/20">
        {conclusion.imageUrl ? (
          <img src={conclusion.imageUrl} alt="The conclusion of the story" className="w-full h-auto object-cover aspect-video" />
        ) : (
          <div className="w-full h-auto aspect-video bg-white/5 flex items-center justify-center text-white/50">
            <p>Loading visual...</p>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed">{conclusion.text}</p>
      </div>

      <div className="w-full p-5 rounded-xl border" style={{ backgroundColor: 'var(--color-card-bg-1)', borderColor: 'var(--color-card-border-1)' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-accent)] flex items-center justify-center gap-2 mb-4">
              <LightbulbIcon className="w-7 h-7"/>
              {conclusion.feedbackTitle}
          </h3>
          <div className="flex flex-col gap-4">
            {conclusion.coachingFeedback.map((fb, index) => (
                <div key={index} className="flex items-center text-left p-4 bg-black/20 rounded-lg">
                    {getIcon(fb.icon)}
                    <p className="text-[var(--color-text-base)] leading-relaxed text-base sm:text-lg">{fb.text}</p>
                </div>
            ))}
          </div>
          
          {conclusion.unlockedSkills && conclusion.unlockedSkills.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/20">
              <h4 className="font-bold mb-3">New Strengths Unlocked!</h4>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {conclusion.unlockedSkills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-2 bg-[var(--color-unlocked-skill-bg)] text-[var(--color-unlocked-skill-text)] font-bold px-4 py-2 rounded-full text-sm border border-[var(--color-unlocked-skill-border)]">
                    <SparklesIcon className="w-5 h-5"/>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
          <button
              onClick={onReset}
              className="w-full sm:w-auto bg-white/20 hover:bg-white/30 border border-white/30 text-[var(--color-text-base)] font-bold text-base py-3 px-5 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
              <ArrowUturnLeftIcon className="w-5 h-5" />
              See Other Paths
          </button>
          <button
              onClick={onGeneratePlan}
              className="w-full sm:w-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] font-extrabold text-lg py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
          >
              <RocketIcon className="w-6 h-6" />
              Create Action Plan!
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

export default SimulationConclusionComponent;