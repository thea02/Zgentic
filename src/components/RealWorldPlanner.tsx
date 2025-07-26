import React from 'react';
import { RealWorldPlan, PlanSuggestion } from '../types';
import { 
    RocketIcon, ArrowUturnLeftIcon, ClipboardDocumentCheckIcon, 
    CalendarDaysIcon, EnvelopeIcon, VideoCameraIcon, BookOpenIcon, PaperAirplaneIcon
} from './icons';

interface RealWorldPlannerProps {
  plan: RealWorldPlan;
  onReset: () => void;
}

const PlannerSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-black/20 p-5 rounded-xl border border-white/20 h-full flex flex-col">
        <h3 className="text-xl font-bold text-[var(--color-text-accent)] flex items-center gap-3 mb-4">
            {icon}
            {title}
        </h3>
        <div className="flex flex-col gap-3 flex-grow">{children}</div>
    </div>
);

const getLinkText = (suggestion: PlanSuggestion): string => {
    if (suggestion.url.includes('calendar.google.com')) return 'Add to Calendar';
    if (suggestion.url.includes('youtube.com')) return 'Watch on YouTube';
    if (suggestion.platform?.toLowerCase().includes('khan')) return `Search on Khan Academy`;
    if (suggestion.platform) return `Find on ${suggestion.platform}`;
    return 'Learn More';
};

const SuggestionCard: React.FC<{ suggestion: PlanSuggestion, platformIcon?: React.ReactNode }> = ({ suggestion, platformIcon }) => (
    <div className="bg-white/10 p-4 rounded-lg text-left flex flex-col flex-grow">
        <h4 className="font-bold flex items-center gap-2">
            {platformIcon}
            {suggestion.title}
        </h4>
        <p className="text-sm text-[var(--color-text-muted)] mt-1 flex-grow">{suggestion.description}</p>
        {suggestion.url && (
            <a 
                href={suggestion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 bg-[var(--color-link-bg)] text-[var(--color-link-text)] font-bold px-3 py-1 rounded-full text-xs hover:opacity-80 transition-colors self-start"
            >
                {getLinkText(suggestion)}
            </a>
        )}
    </div>
);


const RealWorldPlanner: React.FC<RealWorldPlannerProps> = ({ plan, onReset }) => {
    const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(plan.parentEmail.subject)}&body=${encodeURIComponent(plan.parentEmail.body)}`;

    return (
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-8 border border-white/20 animate-fade-in flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-accent)] flex items-center justify-center gap-3">
                    <RocketIcon className="w-8 h-8"/>
                    {plan.planTitle}
                </h2>
                <p className="text-[var(--color-text-muted)] mt-2 max-w-2xl mx-auto">Turn your new skills into real adventures! Here's a plan to get you started.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-6">
                    <PlannerSection title="Watch & Learn" icon={<VideoCameraIcon className="w-6 h-6"/>}>
                        {plan.youtubeSuggestions.map((s, i) => <SuggestionCard key={i} suggestion={s}/>)}
                    </PlannerSection>
                    
                    <PlannerSection title="Courses & Fun" icon={<BookOpenIcon className="w-6 h-6"/>}>
                        {plan.onlineCourseSuggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} platformIcon={<span className="text-xs bg-purple-500/50 px-2 py-0.5 rounded-full">{s.platform}</span>} />)}
                    </PlannerSection>

                    <PlannerSection title="Real Adventures" icon={<CalendarDaysIcon className="w-6 h-6"/>}>
                        {plan.localActivitySuggestions.map((s, i) => <SuggestionCard key={i} suggestion={s}/>)}
                    </PlannerSection>
                </div>

                <div className="flex flex-col gap-6">
                     <PlannerSection title="Your Growth Vision Board" icon={<ClipboardDocumentCheckIcon className="w-6 h-6"/>}>
                        <div className="relative flex items-center justify-center w-full min-h-[300px] sm:min-h-[350px] bg-white/5 p-4 rounded-lg">
                           
                            {/* Lines connecting nodes */}
                             <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                                {plan.growthMap.traitNodes.map((_, index, arr) => {
                                    const angle = (index / arr.length) * 2 * Math.PI - (Math.PI / 2);
                                    const x2 = 50 + 38 * Math.cos(angle);
                                    const y2 = 50 + 42 * Math.sin(angle);
                                    return (
                                        <line
                                            key={index}
                                            x1="50%"
                                            y1="50%"
                                            x2={`${x2}%`}
                                            y2={`${y2}%`}
                                            stroke="rgba(255, 255, 255, 0.3)"
                                            strokeWidth="2"
                                            strokeDasharray="4 4"
                                        />
                                    );
                                })}
                            </svg>

                            {/* Trait Nodes */}
                            {plan.growthMap.traitNodes.map((node, index, arr) => {
                                const angle = (index / arr.length) * 2 * Math.PI - (Math.PI / 2); // Start from top
                                const x = 50 + 38 * Math.cos(angle);
                                const y = 50 + 42 * Math.sin(angle); // Slightly oval for wider layouts
                                const style: React.CSSProperties = {
                                    position: 'absolute',
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 10
                                };
                                return (
                                    <div key={index} style={style} className="flex flex-col items-center text-center w-24 animate-node-in">
                                        {node.imageUrl && <img src={node.imageUrl} alt={node.title} className="w-16 h-16 rounded-full bg-pink-400/30 p-1 border-2 border-white/40 shadow-lg"/>}
                                        <h5 className="font-semibold text-sm mt-1 bg-black/40 px-2 py-0.5 rounded">{node.title}</h5>
                                    </div>
                                );
                            })}
                            
                            {/* Central Node */}
                            <div className="z-20 flex flex-col items-center text-center animate-fade-in">
                                {plan.growthMap.centralCareer.imageUrl && <img src={plan.growthMap.centralCareer.imageUrl} alt={plan.growthMap.centralCareer.title} className="w-28 h-28 rounded-full bg-purple-400/30 p-2 border-4 border-[var(--color-accent)] shadow-2xl"/>}
                                <h4 className="font-extrabold text-lg mt-2 bg-black/50 px-3 py-1 rounded-lg">{plan.growthMap.centralCareer.title}</h4>
                            </div>
                        </div>
                    </PlannerSection>
                    
                    <PlannerSection title="Share with a Parent" icon={<EnvelopeIcon className="w-6 h-6"/>}>
                        <div className="bg-white/5 p-4 rounded-lg flex-grow">
                           <p className="text-sm font-bold text-[var(--color-text-muted)]">Subject:</p>
                           <p className="text-base font-semibold">{plan.parentEmail.subject}</p>
                           <p className="text-sm font-bold text-[var(--color-text-muted)] mt-3 border-t border-white/20 pt-2">Email Preview:</p>
                           <div className="text-sm text-[var(--color-text-muted)] max-h-32 overflow-y-auto mt-1">
                                <pre className="whitespace-pre-wrap font-sans">{plan.parentEmail.body}</pre>
                           </div>
                        </div>
                        <a href={gmailHref} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-green-600 font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors mt-2 text-lg">
                            <PaperAirplaneIcon className="w-6 h-6"/>
                            Open in Gmail
                        </a>
                    </PlannerSection>
                </div>
            </div>

            <button
              onClick={onReset}
              className="w-full max-w-xs mx-auto mt-6 bg-white/20 hover:bg-white/30 border border-white/30 font-bold text-base py-3 px-5 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
                <ArrowUturnLeftIcon className="w-5 h-5" />
                Back to my Growth Map
            </button>
            <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
             @keyframes node-in {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            .animate-node-in {
                animation: node-in 0.5s ease-out forwards;
            }
            `}</style>
        </div>
    );
}

export default RealWorldPlanner;