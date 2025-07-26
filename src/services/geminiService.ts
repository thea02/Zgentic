import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, CareerPath, StoryStep, MultiRoundMission, SimulationConclusion, GameRound, GameObject, RealWorldPlan, GrowthMapNode, PlanSuggestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getAgeGroupContext = (age: number): string => {
    if (age >= 6 && age <= 10) {
        return `The user is in the 6-10 age group. Your response must be very simple, using kid-friendly language, be highly visual, and minimize text. Focus on imagination and fun. Explain concepts using simple analogies. Career descriptions should be 1 simple sentence.`;
    }
    if (age >= 11 && age <= 13) {
        return `The user is in the 11-13 age group. Your response should be informative but not overly complicated. Balance fun with real-world connections. Use a slightly more mature but still engaging tone.`;
    }
    if (age >= 14 && age <= 17) {
        return `The user is in the 14-17 age group. Your response can be detailed and informative. Use a mature tone suitable for a teenager. Focus on concrete steps, skills, and real-world career information. Provide practical advice.`;
    }
    return `The user is a child/teenager aged ${age}. Tailor your response to be age-appropriate.`; // Fallback
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    feedback: {
      type: Type.STRING,
      description: "A short, encouraging, and reflective paragraph (2-3 sentences) directly addressing the user, adapted for their age. Connect their drawing and text to their potential interests. Address the user as 'you'."
    },
    traits: {
      type: Type.ARRAY,
      description: "An array of 3-5 single-word personality traits or skills observed (e.g., 'Creative', 'Curious', 'Nature-Lover').",
      items: { type: Type.STRING }
    },
    careerPaths: {
      type: Type.ARRAY,
      description: "An array of 2-3 potential career paths. For each path, provide a 'name' and a short 'description' tailored to the user's age.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the career." },
          description: { type: Type.STRING, description: "A one-sentence description of the career, explained in terms appropriate for the user's age." }
        },
        required: ["name", "description"]
      }
    }
  },
  required: ["feedback", "traits", "careerPaths"]
};

const startSimulationSchema = {
    type: Type.OBJECT,
    properties: {
        text: { 
            type: Type.STRING, 
            description: "A single, engaging sentence setting a scene for a choice, specific to the career and tailored to the user's age."
        },
        choices: {
            type: Type.ARRAY,
            description: "An array of exactly two choices for the user. Each choice is a short action phrase, simple enough for the user's age.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "The text for the choice." }
                },
                required: ["text"]
            }
        }
    },
    required: ["text", "choices"]
};

const multiRoundMissionSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A short, exciting title for the overall mission."
        },
        rounds: {
            type: Type.ARRAY,
            description: "An array of exactly 2 game rounds. The complexity should be suitable for the user's age.",
            minItems: 2,
            maxItems: 2,
            items: {
                type: Type.OBJECT,
                properties: {
                    instructions: {
                        type: Type.STRING,
                        description: "Simple, clear instructions for this specific round's objective."
                    },
                    skillToTest: {
                        type: Type.STRING,
                        description: "The primary skill being tested in this round (e.g., 'Attention to Detail', 'Categorization', 'Logic')."
                    },
                    gameMode: {
                        type: Type.STRING,
                        description: "The mode for this round. 'SELECT_ALL_CORRECT' for finding all matching items. 'SELECT_THE_DIFFERENCE' for finding the odd-one-out."
                    },
                    objectTypes: {
                        type: Type.ARRAY,
                        description: "A list of object types for the grid. Each 'type' MUST be a single, simple, drawable object name (e.g., 'apple', 'star', 'blue crayon'). AVOID complex descriptions, unsafe actions, or long phrases.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                count: { type: Type.INTEGER }
                            },
                            required: ["type", "count"]
                        }
                    },
                    correctObjectType: {
                        type: Type.STRING,
                        description: "The 'type' of the correct object. It MUST be a single, simple, drawable object name and must match one of the types in objectTypes."
                    }
                },
                required: ["instructions", "skillToTest", "gameMode", "objectTypes", "correctObjectType"]
            }
        }
    },
    required: ["title", "rounds"]
};

const conclusionSchema = {
    type: Type.OBJECT,
    properties: {
        text: {
            type: Type.STRING,
            description: "A single, positive concluding sentence for the story, describing the outcome. Language should be age-appropriate."
        },
        feedbackTitle: {
            type: Type.STRING,
            description: "An exciting title for the feedback section, like 'Mission Accomplished!' or 'Your Explorer Skills!'."
        },
        unlockedSkills: {
            type: Type.ARRAY,
            description: "An array of all the unique skills the user successfully demonstrated. This array MUST ONLY contain skills from rounds where the user succeeded. If they succeeded in zero rounds, this MUST be an empty array.",
            items: { type: Type.STRING }
        },
        coachingFeedback: {
            type: Type.ARRAY,
            description: "An array of 2-3 short, reflective coaching points in age-appropriate language. Each is a single, encouraging sentence. If the user failed, the feedback should be realistic and focus on effort (e.g., 'That was tricky, but you showed great persistence!').",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "The single sentence feedback point." },
                    icon: { type: Type.STRING, description: "A single keyword for an icon representing the feedback. Choose from: 'Adventure', 'ProblemSolving', 'Focus', 'Creativity', 'Teamwork', 'Curiosity'." }
                },
                required: ["text", "icon"]
            }
        }
    },
    required: ["text", "feedbackTitle", "unlockedSkills", "coachingFeedback"]
}

const realWorldPlanSchema = {
    type: Type.OBJECT,
    properties: {
        planTitle: { type: Type.STRING, description: "An exciting title for the action plan, e.g., 'Your Marine Biologist Adventure Plan!'"},
        youtubeSuggestions: {
            type: Type.ARRAY,
            description: "An array of 2 kid-friendly YouTube video ideas suitable for the user's age. Provide a full YouTube search URL for each.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A search-friendly title of a video, e.g., 'Coolest Deep Sea Creatures for Kids'." },
                    description: { type: Type.STRING, description: "A short description of the video content." },
                    url: { type: Type.STRING, description: "The full YouTube search URL. Example: 'https://www.youtube.com/results?search_query=Coolest+Deep+Sea+Creatures'" }
                },
                required: ["title", "description", "url"]
            }
        },
        onlineCourseSuggestions: {
            type: Type.ARRAY,
            description: "An array of 1-2 online course ideas suitable for the user's age. Provide a full Khan Academy search URL for each.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    platform: { type: Type.STRING, description: "e.g., 'Khan Academy', 'Outschool'" },
                    description: { type: Type.STRING, description: "A short description of the course." },
                    url: { type: Type.STRING, description: "The full Khan Academy search URL. Example: 'https://www.khanacademy.org/search?page_search_query=marine+biology'" }
                },
                required: ["title", "platform", "description", "url"]
            }
        },
        localActivitySuggestions: {
            type: Type.ARRAY,
            description: "An array of 2 generic local activity ideas suitable for the user's age. Do not assume location. For each, generate a Google Calendar link to create an event. The link should be formatted as 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=EVENT_TITLE&details=EVENT_DETAILS'. Replace EVENT_TITLE and EVENT_DETAILS with URL-encoded text.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the activity, e.g., 'Visit a local aquarium'." },
                    description: { type: Type.STRING, description: "A short description." },
                    url: { type: Type.STRING, description: "The Google Calendar event creation URL." }
                },
                required: ["title", "description", "url"]
            }
        },
        growthMap: {
            type: Type.OBJECT,
            description: "A vision board/mind map structure. It must have a central career node and several trait nodes based on the user's traits.",
            properties: {
                centralCareer: {
                    type: Type.OBJECT,
                    description: "The central node of the mind map, representing the explored career.",
                    properties: {
                        title: { type: Type.STRING, description: "The career name." },
                        imagePrompt: { type: Type.STRING, description: "A simple prompt for a cute cartoon icon representing this career, e.g., 'A magnifying glass over a leaf for a Biologist'." }
                    },
                    required: ["title", "imagePrompt"]
                },
                traitNodes: {
                    type: Type.ARRAY,
                    description: "An array of nodes representing the user's traits that connect to the career.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "The trait name." },
                            imagePrompt: { type: Type.STRING, description: "A simple prompt for a cute cartoon icon representing this trait, e.g., 'A lightbulb for Creativity'." }
                        },
                        required: ["title", "imagePrompt"]
                    }
                }
            },
            required: ["centralCareer", "traitNodes"]
        },
        parentEmail: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING, description: "A subject line for an email to the child's parents." },
                body: { type: Type.STRING, description: "The body of the email in Markdown, summarizing progress and how to support their child's interests, with advice tailored to the child's age. This should include the key suggestions from the plan." }
            },
            required: ["subject", "body"]
        }
    },
    required: ["planTitle", "youtubeSuggestions", "onlineCourseSuggestions", "localActivitySuggestions", "growthMap", "parentEmail"]
};


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const generateImage = async (prompt: string, aspectRatio: '16:9' | '1:1' = '16:9', maxRetries = 3): Promise<string> => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio,
                },
            });
            const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } catch (error) {
            attempt++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Attempt ${attempt} failed to generate image for prompt "${prompt}":`, error);

            if (attempt >= maxRetries || !(errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED'))) {
                console.warn(`Final attempt failed or non-retriable error for prompt: "${prompt}". Returning empty string.`);
                return '';
            }

            const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
            console.log(`Rate limit hit. Retrying in ${Math.round(waitTime / 1000)} seconds...`);
            await delay(waitTime);
        }
    }
    console.error(`All retries failed for image prompt: "${prompt}".`);
    return '';
};

const generateObjectImage = (objectType: string) => {
    const prompt = `A single, cute cartoon ${objectType} on a plain white background, sticker style, no shadows. Simple, vibrant, and clear for a child's game.`;
    return generateImage(prompt, '1:1');
}

export const analyzeDream = async (dreamText: string, drawingBase64: string, age: number): Promise<AnalysisResult> => {
  const ageContext = getAgeGroupContext(age);
  const systemInstruction = `You are 'Becom.AI', an AI guide. ${ageContext} Your goal is to help users discover interests based on their creative expressions. Your tone is positive, curious, and simple. Analyze the user's creative input (text, drawing, or both) to identify themes and suggest future paths.`;

  const parts: ({text: string} | {inlineData: {mimeType: string, data: string}})[] = [];
  let promptText = "";

  const hasText = dreamText.trim().length > 0;
  const hasDrawing = drawingBase64 && drawingBase64.length > 0;

  if (!hasText && !hasDrawing) {
      throw new Error("No input provided for analysis.");
  }
  
  if (hasDrawing) {
      parts.push({ inlineData: { mimeType: 'image/png', data: drawingBase64 } });
  }

  if (hasText && hasDrawing) {
      promptText = `My dream is: "${dreamText}". Based on my drawing and this text, what do you see?`;
  } else if (hasText) {
      promptText = `My dream is: "${dreamText}". Based on this, what do you see?`;
  } else if (hasDrawing) {
      promptText = `This is a drawing of my dream. Based on this image, what do you see?`;
  } 

  parts.push({ text: promptText });
  
  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.7
      }
    });

    if (!textResponse?.text) {
        console.error("Gemini response was empty or did not contain text.", textResponse);
        throw new Error("The AI guide was unable to provide an analysis for this dream. Please try a different dream or drawing.");
    }

    const parsedJson = JSON.parse(textResponse.text.trim());

    const careerImagePromptAddition = age <= 11 ? ', simple, clear, for a child' : '';
    const careerPathsWithImages: CareerPath[] = [];
    for (const path of parsedJson.careerPaths as Omit<CareerPath, 'imageUrl'>[]) {
        const imagePrompt = `A vibrant and friendly cartoon illustration of a ${path.name}${careerImagePromptAddition}. No text in the image.`;
        const imageUrl = await generateImage(imagePrompt, '16:9');
        careerPathsWithImages.push({ ...path, imageUrl });
        await delay(500); // Add a small delay between requests to be safe
    }
    
    return { ...parsedJson, careerPaths: careerPathsWithImages };
    
  } catch (error) {
    console.error('Error in analyzeDream:', error);
    throw new Error('Failed to get analysis from Becom.AI.');
  }
};


export const startSimulation = async (careerName: string, age: number): Promise<StoryStep> => {
    const ageContext = getAgeGroupContext(age);
    const systemInstruction = `You are a creative storyteller. ${ageContext} Create the first part of a 'day-in-the-life' story for a ${careerName}. The story must be one sentence, visual, exciting, and present a clear choice between two different but simple actions.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Start a one-sentence story about my day as a ${careerName}.`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: startSimulationSchema,
                temperature: 0.8
            }
        });

        const storyData = JSON.parse(response.text.trim());
        const imagePrompt = `A vibrant, kid-friendly cartoon illustration for a story about a ${careerName}, suitable for a ${age}-year-old. The scene depicts: ${storyData.text}. No text in the image.`;
        const imageUrl = await generateImage(imagePrompt, '16:9');

        return { ...storyData, imageUrl };
    } catch(error) {
        console.error("Error in startSimulation:", error);
        throw new Error(`Failed to start a story about being a ${careerName}.`);
    }
}

export const generateMiniMission = async (careerName: string, choice: string, age: number): Promise<MultiRoundMission> => {
    const ageContext = getAgeGroupContext(age);
    const systemInstruction = `You are a game designer. ${ageContext} The user is playing as a ${careerName} and just chose to '${choice}'. Create a job-specific, visual, multi-round mini-game. The game must have 2 rounds. The difficulty and theme should be appropriate for the user's age. For each round, decide on an appropriate game mode to test a relevant skill:
- 'SELECT_ALL_CORRECT': An 'I-Spy' style game.
- 'SELECT_THE_DIFFERENCE': An 'odd-one-out' game.
The objectives, objects, and game modes must be thematically appropriate for the career and the user's choice.`;
    
    try {
        const missionDesignResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a 2-round mission based on my choice to '${choice}' as a ${careerName}.`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: multiRoundMissionSchema,
                temperature: 0.8
            }
        });
        
        const missionDesign = JSON.parse(missionDesignResponse.text.trim());

        const allUniqueObjectTypes = new Set<string>();
        missionDesign.rounds.forEach((round: any) => {
            round.objectTypes.forEach((ot: any) => allUniqueObjectTypes.add(ot.type));
        });

        const imageUrlsCache: { [key: string]: string } = {};
        for (const type of allUniqueObjectTypes) {
            imageUrlsCache[type] = await generateObjectImage(type);
            await delay(500); // Add a small delay between requests
        }

        const populatedRounds = missionDesign.rounds.map((round: any, index: number): GameRound => {
            const gridObjects: GameObject[] = [];
            round.objectTypes.forEach((ot: any) => {
                for(let i=0; i<ot.count; i++) {
                    gridObjects.push({
                        id: `${ot.type}-${i}`,
                        type: ot.type,
                        imageUrl: imageUrlsCache[ot.type] || '',
                    });
                }
            });

            // Fisher-Yates shuffle
            for (let i = gridObjects.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gridObjects[i], gridObjects[j]] = [gridObjects[j], gridObjects[i]];
            }

            const correctObjectIds = gridObjects
                .filter(obj => obj.type === round.correctObjectType)
                .map(obj => obj.id);

            return {
                roundNumber: index + 1,
                instructions: round.instructions,
                skillToTest: round.skillToTest,
                gameMode: round.gameMode,
                gridObjects,
                correctObjectIds
            };
        });

        return {
            title: missionDesign.title,
            rounds: populatedRounds
        };
        
    } catch(error) {
        console.error("Error in generateMiniMission:", error);
        throw new Error(`Failed to create a mini-mission for a ${careerName}.`);
    }
}

export const getMissionFeedback = async (careerName: string, choice: string, roundResults: {skill: string, success: boolean}[], age: number): Promise<SimulationConclusion> => {
    const ageContext = getAgeGroupContext(age);
    const systemInstruction = `You are an AI career coach. ${ageContext} The user played as a ${careerName}, made a choice, and completed a 2-round mission. Provide a final, encouraging debrief. IMPORTANT: Your feedback must be accurate, honest, and use age-appropriate language.`;
    
    const resultsSummary = roundResults.map((r, i) => `In round ${i+1}, they were tested on '${r.skill}' and they ${r.success ? 'succeeded' : 'failed'}.`).join(' ');

    const prompt = `The user is playing as a ${careerName}.
    Their initial choice was to: '${choice}'.
    Their mission performance was: ${resultsSummary}

    Based on all of this, give me a final debrief.
    1.  The 'unlockedSkills' array MUST ONLY contain the names of skills from rounds where the user 'succeeded'. If they failed all rounds, this array MUST be empty. Do not invent skills or include failed ones.
    2.  The 'coachingFeedback' should be encouraging but realistic, and tailored to the user's age. If they failed a round, acknowledge the challenge and praise their effort (e.g., "That was tricky, but you kept trying! That shows persistence.") instead of pretending they succeeded.
    3.  For each feedback point, provide an icon keyword.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: conclusionSchema,
                temperature: 0.7
            }
        });

        const conclusionData = JSON.parse(response.text.trim());
        const imagePrompt = `A vibrant, cartoon illustration for a story about a ${careerName}, suitable for a ${age}-year-old. The scene depicts the successful outcome: ${conclusionData.text}. No text in the image.`;
        const imageUrl = await generateImage(imagePrompt, '16:9');
        
        return {
            ...conclusionData,
            imageUrl
        };

    } catch(error) {
        console.error("Error in getMissionFeedback:", error);
        throw new Error(`Failed to conclude the story for a ${careerName}.`);
    }
}

export const generateRealWorldPlan = async (careerName: string, traits: string[], age: number): Promise<RealWorldPlan> => {
    const ageContext = getAgeGroupContext(age);
    const systemInstruction = `You are 'Becom.AI', an AI guide helping users turn digital discoveries into real-world actions. ${ageContext} You are creating a concrete plan for a user interested in becoming a ${careerName}. All suggestions must be strictly appropriate for the user's age.`;

    const traitsList = traits.join(', ');
    const prompt = `The user is interested in being a ${careerName}. Their observed traits are: ${traitsList}. 
    Please create a real-world action plan for them.
    - For YouTube and online courses, provide functional search URLs ('https://www.youtube.com/results?search_query=...' or 'https://www.khanacademy.org/search?page_search_query=...'). The suggested content MUST be appropriate for a ${age}-year-old. For 6-10, think 'SciShow Kids' or 'Nat Geo Kids'. For 11-13, think 'Mark Rober' or 'SmarterEveryDay'. For 14-17, think 'Kurzgesagt', 'Veritasium', or introductory university-level content.
    - For local activities, generate Google Calendar links. Activities should be age-appropriate.
    - The Growth Map should be a visual mind map. The central node is the career, and the surrounding nodes are the user's traits. Provide a simple, descriptive 'imagePrompt' for each node to generate a cute icon.
    - The parent email should be supportive and informative, formatted in Markdown, and provide guidance on how to support a ${age}-year-old's interests, summarizing the key plan suggestions.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: realWorldPlanSchema,
                temperature: 0.7
            }
        });
        const plan = JSON.parse(response.text.trim());

        // Generate images for the growth map
        const allNodes: GrowthMapNode[] = [plan.growthMap.centralCareer, ...plan.growthMap.traitNodes];
        const imagePromises = allNodes.map(node => generateImage(
            `${node.imagePrompt}, cute cartoon icon, simple, sticker style, on a plain white background, no shadows`, 
            '1:1'
        ));

        const imageUrls = await Promise.all(imagePromises);

        plan.growthMap.centralCareer.imageUrl = imageUrls[0];
        plan.growthMap.traitNodes.forEach((node: GrowthMapNode, index: number) => {
            node.imageUrl = imageUrls[index + 1];
        });

        // Ensure Khan Academy links are valid search URLs
        plan.onlineCourseSuggestions.forEach((s: PlanSuggestion) => {
            if (s.platform && s.platform.toLowerCase().includes('khan') && !s.url.includes('search?page_search_query=')) {
                const query = encodeURIComponent(s.title);
                s.url = `https://www.khanacademy.org/search?page_search_query=${query}`;
            }
        });

        return plan;

    } catch(error) {
        console.error("Error in generateRealWorldPlan:", error);
        throw new Error(`Failed to create a real-world plan for a ${careerName}.`);
    }
}