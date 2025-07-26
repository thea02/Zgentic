import React, { useState, useCallback } from 'react';
import { AnalysisResult, AppState, CareerPath, StoryStep, StoryChoice, MultiRoundMission, SimulationConclusion, RealWorldPlan } from './types';
import AgeInput from './components/AgeInput';
import DreamMirror from './components/DreamMirror';
import AnalysisDisplay from './components/AnalysisDisplay';
import Loader from './components/Loader';
import CareerSimulation from './components/CareerSimulation';
import MultiRoundMissionComponent from './components/MiniMission';
import SimulationConclusionComponent from './components/SimulationConclusion';
import RealWorldPlanner from './components/RealWorldPlanner';
import { analyzeDream, startSimulation, generateMiniMission, getMissionFeedback, generateRealWorldPlan } from './services/geminiService';
import { StarIcon } from './components/icons';

const getThemeClass = (age: number | null): string => {
  if (!age) return 'theme-default';
  if (age >= 6 && age <= 10) return 'theme-younger';
  if (age >= 11 && age <= 13) return 'theme-middle';
  if (age >= 14 && age <= 17) return 'theme-older';
  return 'theme-default';
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AGE_INPUT);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);
  const [userChoice, setUserChoice] = useState<StoryChoice | null>(null);
  const [currentStoryStep, setCurrentStoryStep] = useState<StoryStep | null>(null);
  const [currentMiniMission, setCurrentMiniMission] = useState<MultiRoundMission | null>(null);
  const [simulationConclusion, setSimulationConclusion] = useState<SimulationConclusion | null>(null);
  const [realWorldPlan, setRealWorldPlan] = useState<RealWorldPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const themeClass = getThemeClass(userAge);

  const handleError = (err: unknown, defaultMessage: string) => {
    console.error(defaultMessage, err);
    setError(err instanceof Error ? err.message : defaultMessage);
    setAppState(AppState.ERROR);
  };

  const handleAgeSubmit = (age: number) => {
    setUserAge(age);
    setAppState(AppState.DREAM_INPUT);
  };

  const handleAnalysis = useCallback(async (dream: string, drawingDataUrl: string) => {
    if (!userAge) return handleError(new Error("Age not set"), "Please start over and provide an age.");
    setAppState(AppState.ANALYSIS_IN_PROGRESS);
    setError(null);
    try {
      // drawingDataUrl can be blank if the user didn't draw.
      // The service expects just the base64 part, or an empty string.
      const base64Drawing = drawingDataUrl ? drawingDataUrl.split(',')[1] : '';
      
      const result = await analyzeDream(dream, base64Drawing || '', userAge);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS_DISPLAY);
    } catch (err) {
      handleError(err, "Analysis failed.");
    }
  }, [userAge]);

  const handleSelectPath = useCallback(async (path: CareerPath) => {
    if (!userAge) return handleError(new Error("Age not set"), "Please start over and provide an age.");
    setAppState(AppState.CAREER_SIMULATION_IN_PROGRESS);
    setSelectedCareer(path);
    setError(null);
    try {
      const step = await startSimulation(path.name, userAge);
      setCurrentStoryStep(step);
      setAppState(AppState.CAREER_SIMULATION);
    } catch (err) {
      handleError(err, "Could not start the simulation.");
    }
  }, [userAge]);
  
  const handleStartMission = useCallback(async (choice: StoryChoice) => {
    if (!selectedCareer || !userAge) return;
    setUserChoice(choice);
    setAppState(AppState.MINI_MISSION_IN_PROGRESS);
    setError(null);
    try {
      const mission = await generateMiniMission(selectedCareer.name, choice.text, userAge);
      setCurrentMiniMission(mission);
      setAppState(AppState.MINI_MISSION);
    } catch (err) {
      handleError(err, "Could not create a mini-mission.");
    }
  }, [selectedCareer, userAge]);

  const handleMissionComplete = useCallback(async (roundResults: { skill: string; success: boolean }[]) => {
    if (!selectedCareer || !userChoice || !userAge) return;
    setAppState(AppState.CAREER_SIMULATION_IN_PROGRESS); // Re-use loader
    setError(null);
    try {
      const conclusion = await getMissionFeedback(selectedCareer.name, userChoice.text, roundResults, userAge);
      setSimulationConclusion(conclusion);

      if (conclusion.unlockedSkills.length > 0) {
        setAnalysisResult(prevResult => {
            if (!prevResult) return null;
            const newTraits = new Set([...prevResult.traits, ...conclusion.unlockedSkills]);
            return {
                ...prevResult,
                traits: Array.from(newTraits)
            };
        });
      }

      setAppState(AppState.SIMULATION_CONCLUSION);
    } catch (err) {
      handleError(err, "Could not get the simulation conclusion.");
    }
  }, [selectedCareer, userChoice, userAge]);

  const handleGeneratePlan = useCallback(async () => {
    if (!selectedCareer || !analysisResult || !userAge) return;
    setAppState(AppState.PLANNER_IN_PROGRESS);
    setError(null);
    try {
        const plan = await generateRealWorldPlan(selectedCareer.name, analysisResult.traits, userAge);
        setRealWorldPlan(plan);
        setAppState(AppState.PLANNER_DISPLAY);
    } catch (err) {
        handleError(err, "Could not generate your action plan.");
    }
  }, [selectedCareer, analysisResult, userAge]);


  const handleResetSimulation = () => {
    setCurrentStoryStep(null);
    setSelectedCareer(null);
    setUserChoice(null);
    setCurrentMiniMission(null);
    setSimulationConclusion(null);
    setRealWorldPlan(null);
    setAppState(AppState.RESULTS_DISPLAY);
  };

  const handleResetApp = () => {
    setAnalysisResult(null);
    handleResetSimulation();
    setError(null);
    setUserAge(null);
    setAppState(AppState.AGE_INPUT);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.AGE_INPUT:
        return <AgeInput onAgeSubmit={handleAgeSubmit} />;
      case AppState.DREAM_INPUT:
        return <DreamMirror onAnalyze={handleAnalysis} />;
      case AppState.ANALYSIS_IN_PROGRESS:
        return <Loader message="Analyzing your brilliant dream..." />;
      case AppState.RESULTS_DISPLAY:
        return analysisResult && <AnalysisDisplay result={analysisResult} onReset={handleResetApp} onSelectPath={handleSelectPath} />;
      case AppState.CAREER_SIMULATION_IN_PROGRESS:
        return <Loader message="Building your next adventure..." />;
      case AppState.CAREER_SIMULATION:
        return currentStoryStep && <CareerSimulation step={currentStoryStep} onChoice={handleStartMission} />;
      case AppState.MINI_MISSION_IN_PROGRESS:
        return <Loader message="Preparing your mission..." />;
      case AppState.MINI_MISSION:
        return currentMiniMission && <MultiRoundMissionComponent mission={currentMiniMission} onComplete={handleMissionComplete} />;
      case AppState.SIMULATION_CONCLUSION:
        return simulationConclusion && <SimulationConclusionComponent conclusion={simulationConclusion} onReset={handleResetSimulation} onGeneratePlan={handleGeneratePlan} />;
      case AppState.PLANNER_IN_PROGRESS:
        return <Loader message="Building your real-world plan..." />;
      case AppState.PLANNER_DISPLAY:
        return realWorldPlan && <RealWorldPlanner plan={realWorldPlan} onReset={handleResetSimulation} />;
      case AppState.ERROR:
        return (
          <div className="text-center text-white bg-red-500/20 border border-red-500 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={handleResetApp}
              className="px-6 py-3 bg-white text-purple-700 font-bold rounded-full shadow-lg hover:bg-gray-200 transition-colors"
            >
              Start Over
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[var(--bg-gradient-from)] via-[var(--bg-gradient-via)] to-[var(--bg-gradient-to)] text-[var(--color-text-base)] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center transition-all duration-500 ${themeClass}`}>
      <header className="w-full max-w-5xl mx-auto flex items-center justify-center sm:justify-start mb-8">
        <div className="flex items-center space-x-3">
          <StarIcon className="w-10 h-10 text-[var(--color-text-accent)]" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Becom.AI</h1>
        </div>
      </header>
      <main className="w-full max-w-5xl mx-auto flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
