# Becom.AI: Career Exploration System

# Overview

Becom.AI is an AI-powered career exploration application for children and teenagers (ages 6-17). The system uses Google's Gemini AI to analyze user dreams and drawings, provide personalized career guidance, and create interactive learning experiences through career simulations and mini-missions.

<br>

# 1. Agent Workflow

### 1. Multi-Modal Analysis Pipeline

The agent employs a reasoning process that combines:

- **Text Analysis**: Processing user dream descriptions and narrative content
- **Visual Analysis**: Interpreting hand-drawn images using Gemini's vision capabilities
- **Audio/Voice Analysis**: Processing spoken dream descriptions and user interactions
- **Age-Appropriate Contextualization**: Adapting responses based on developmental stages (6-10, 11-13, 14-17)

### 2. Structured Decision Making

The agent follows a hierarchical decision tree:

1. **Input Validation**: Ensures age and dream data are properly formatted
2. **Content Analysis**: Extracts personality traits, interests, and potential career paths
3. **Response Generation**: Creates age-appropriate feedback and career suggestions
4. **Interactive Simulation**: Generates branching storylines and skill-testing missions
5. **Real-World Planning**: Provides actionable next steps and resources

### 3. Contextual Adaptation

The agent dynamically adjusts its reasoning based on:

- **Age Group**: Uses different language complexity and concept explanations
- **User Engagement**: Tracks interaction patterns to maintain engagement
- **Skill Development**: Progressively introduces more complex career concepts


## Memory Usage 

### 1. Session-Based Memory

- **User Age**: Maintained throughout the session for consistent age-appropriate responses
- **Career Selection**: Remembers chosen career path for simulation continuity
- **Mission Progress**: Tracks completed rounds and skill assessments
- **User Choices**: Stores narrative decisions for coherent story progression

### 2. State Management

The application uses React state management to maintain:

- **AppState Enum**: Tracks current application phase (AGE_INPUT, DREAM_INPUT, ANALYSIS_IN_PROGRESS, etc.)
- **User Data**: Age, dream text, drawing data, analysis results
- **Simulation State**: Career path, story steps, mission progress, conclusions
- **Error Handling**: Captures and displays error states appropriately

### 3. Memory Limitations

- **No Persistent Storage**: User data is not saved between sessions (session-based only)
- **Single-Session Focus**: Each interaction starts fresh with no data retention
- **Stateless API Calls**: Each Gemini API call is independent and stateless
- **Privacy-First**: No user data is stored, ensuring privacy compliance for children

## Planning Style

### 1. Progressive Disclosure

The agent employs a step-by-step approach:

1. **Age Collection**: Establishes baseline for all subsequent interactions
2. **Dream Analysis**: Creates foundation for career exploration
3. **Career Presentation**: Offers 2-3 relevant career paths
4. **Interactive Simulation**: Engages user in career-specific scenarios
5. **Skill Assessment**: Tests relevant abilities through mini-missions
6. **Real-World Planning**: Provides actionable next steps

### 2. Adaptive Planning

- **Dynamic Content Generation**: Each response is freshly generated based on current context
- **Branching Narratives**: Story paths adapt based on user choices
- **Skill-Based Missions**: Mission complexity adjusts to user performance
- **Personalized Recommendations**: Plans are tailored to individual traits and interests

### 3. Error Recovery

- **Graceful Degradation**: Handles API failures with user-friendly error messages
- **Retry Logic**: Implements retry mechanisms for image generation
- **State Recovery**: Allows users to restart from various points in the flow

<br>

# 2. Key Modules:

The "agent" logic is not a continuous loop but is distributed between the UI controller and a dedicated service module.

*   **Planner**: The `App.tsx` component serves as the planner. It determines the sequence of operations based on user input and the current `appState`. For example, after the user submits their age, it transitions the state to `DREAM_INPUT`. After analysis, it transitions to `RESULTS_DISPLAY`. It plans the user's journey through the application's features.
*   **Executor**: The `services/geminiService.ts` module is the primary executor. It contains all the logic for interacting with the Gemini API.
    *   It constructs detailed system instructions and user prompts tailored to the user's age.
    *   It defines rigid **JSON schemas** (`responseSchema`) to enforce structured, reliable output from the `gemini-2.5-flash` model for analysis, game generation, and planning.
    *   It calls the `imagen-3.0-generate-002` model to generate all visual assets dynamically, from career path illustrations to icons for the growth map.
*   **Memory**: The application uses short-term, session-based memory. All user data (`userAge`, `dreamText`, `analysisResult`, `unlockedSkills`, etc.) is stored in the React state within the `App.tsx` component. This memory is cleared when the user resets the app or refreshes the page. There is no long-term persistence or vector database.

<br>

# 3. Tool Integration

### 1. Google Workspace Integration

- **Gemini API**: Primary AI service for text generation, image analysis, image generation, and speech-to-text processing
- **Text Generation**: Creates personalized career analysis and feedback
- **Image Analysis**: Interprets user drawings for personality insights using Gemini's vision capabilities
- **Audio Processing**: Converts voice input to text for dream analysis and user interactions
- **Image Generation**: Creates custom illustrations for career paths and scenarios
- **Structured Output**: Uses JSON schemas for consistent data formatting
- **Google Services**: Leverages Google's AI infrastructure for reliable, scalable performance

### 2. React Component Architecture

- **Modular Design**: Separate components for each application phase
- **State Management**: Centralized state handling with React hooks
- **Error Boundaries**: Graceful error handling throughout the component tree
- **Responsive Design**: Adapts to different screen sizes and age groups

### 3. External Service Integration

- **YouTube API**: Suggests relevant educational content
- **Online Learning Platforms**: Recommends age-appropriate courses
- **Local Activity Discovery**: Suggests community-based learning opportunities

<br>

# 4. Observability & Testing

*   **Logging**: `console.error` and `console.warn` are used within `catch` blocks in both `App.tsx` and `geminiService.ts` to log detailed errors during API calls or data processing.
*   **Error Handling & Retries**:
    *   **UI-Level**: The `App.tsx` component has a centralized `handleError` function that catches errors from services, sets a user-friendly error message in the state, and switches the UI to a dedicated `AppState.ERROR` view.
    *   **API-Level**: The `generateImage` function in `geminiService.ts` implements a robust retry mechanism with **exponential backoff and jitter** to gracefully handle rate-limiting errors (e.g., 429) from the Gemini API, improving the reliability of image generation.

<br>

# 5. Known Limitations

### 1. AI Model Limitations

- **Context Window**: Limited by Gemini's context length for complex conversations
- **Image Quality**: Generated images may not always match expected quality
- **Audio Processing**: Speech-to-text accuracy varies based on accent, background noise, and speech patterns
- **Cultural Bias**: May reflect biases present in training data
- **Age Appropriateness**: Requires careful prompt engineering for different age groups

### 2. Technical Limitations

- **No Persistent Storage**: User progress is lost between sessions
- **Single User Focus**: Designed for individual use, not collaborative learning
- **Internet Dependency**: Requires stable internet connection for AI services
- **API Rate Limits**: Subject to Google Gemini API usage restrictions

### 3. Educational Limitations

- **Career Scope**: Limited to careers that can be effectively visualized and simulated
- **Skill Assessment**: Mini-missions provide basic skill testing but not comprehensive evaluation
- **Cultural Context**: May not account for local career opportunities and cultural factors
- **Parent Involvement**: Limited guidance for parental involvement in career exploration

### 4. User Experience Limitations

- **Accessibility**: May not fully accommodate users with disabilities
- **Language Support**: Currently limited to English
- **Audio Input**: Requires quiet environment and clear speech for optimal voice recognition
- **Age Range**: Optimized for 6-17, may not work well for other age groups
- **Engagement**: Relies heavily on user motivation and interest

## Future Improvements

### 1. Enhanced Memory

- **Persistent User Profiles**: Save progress and preferences across sessions
- **Learning Analytics**: Track user engagement and skill development over time
- **Personalized Recommendations**: Use historical data to improve suggestions

### 2. Expanded Capabilities

- **Multi-Language Support**: Add support for additional languages
- **Accessibility Features**: Implement screen readers and keyboard navigation
- **Parent Dashboard**: Provide insights and guidance for parents
- **Collaborative Features**: Allow peer learning and sharing of similar interests

### 3. Advanced AI Integration

- **Conversational Memory**: Maintain context across longer interactions
- **Adaptive Difficulty**: Automatically adjust content complexity based on user performance
- **Real-Time Feedback**: Provide immediate guidance during interactions
- **Predictive Analytics**: Anticipate user needs and interests

<br>

# Conclusion

Becom.AI pioneers a novel approach to career exploration by combining multimodal AI analysis, age-sensitive personalization, and interactive storytelling — all powered by Google's Gemini API. Designed specifically for children and teens aged 6–17, it transforms self-expression (dreams, drawings, voice) into meaningful guidance through personalized career pathways and simulations.

What sets Becom.AI apart is not just its use of cutting-edge AI, but its thoughtful agentic design: it doesn’t just respond to inputs — it interprets, adapts, and guides. The system dynamically analyzes user-submitted content, creates age-appropriate missions, and empowers users to explore potential futures in a safe, imaginative environment.

Though it currently operates with session-based memory and single-user focus, Becom.AI lays a strong foundation for scalable, persistent, and deeply personalized educational AI. 

In a world where AI is reshaping education, Becom.AI offers more than career suggestions — it helps young minds discover who they might become.