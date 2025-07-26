export interface CareerPath {
  name: string;
  description: string;
  imageUrl: string;
}

export interface AnalysisResult {
  feedback: string;
  traits: string[];
  careerPaths: CareerPath[];
}

export interface StoryChoice {
  text: string;
}

export interface StoryStep {
  text: string;
  imageUrl: string;
  choices: StoryChoice[];
}

export interface GameObject {
  id: string; // e.g., "turtle-1"
  type: string; // e.g., "turtle"
  imageUrl: string;
}

export interface GameRound {
  roundNumber: number;
  instructions: string;
  skillToTest: string;
  gridObjects: GameObject[];
  correctObjectIds: string[];
  gameMode: 'SELECT_ALL_CORRECT' | 'SELECT_THE_DIFFERENCE';
}

export interface MultiRoundMission {
  title: string;
  rounds: GameRound[];
}

export interface CoachingFeedback {
    text: string;
    icon: string; // Keyword for icon e.g. 'Creativity'
}

export interface SimulationConclusion {
    text: string; 
    imageUrl: string;
    feedbackTitle: string; 
    coachingFeedback: CoachingFeedback[];
    unlockedSkills: string[]; // e.g., ["Attention to Detail", "Following Instructions"]
}

export interface PlanSuggestion {
    title: string;
    description: string;
    platform?: string;
    url: string;
}

export interface ParentEmail {
    subject: string;
    body: string;
}

export interface GrowthMapNode {
    title: string;
    imagePrompt: string;
    imageUrl?: string;
}

export interface GrowthMap {
    centralCareer: GrowthMapNode;
    traitNodes: GrowthMapNode[];
}

export interface RealWorldPlan {
    planTitle: string;
    youtubeSuggestions: PlanSuggestion[];
    onlineCourseSuggestions: PlanSuggestion[];
    localActivitySuggestions: PlanSuggestion[];
    growthMap: GrowthMap;
    parentEmail: ParentEmail;
}

export enum AppState {
  AGE_INPUT,
  DREAM_INPUT,
  ANALYSIS_IN_PROGRESS,
  RESULTS_DISPLAY,
  CAREER_SIMULATION_IN_PROGRESS,
  CAREER_SIMULATION,
  MINI_MISSION_IN_PROGRESS,
  MINI_MISSION,
  SIMULATION_CONCLUSION,
  PLANNER_IN_PROGRESS,
  PLANNER_DISPLAY,
  ERROR,
}