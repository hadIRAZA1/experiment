import React, { useState, useEffect } from 'react'; // Fixed: Changed '=>' to 'from'
import { ChevronRight, ChevronLeft, RefreshCw, School, BookOpen, FlaskConical, Beaker, TestTube2, CheckCircle, Lightbulb, TrendingUp, ScatterChart } from 'lucide-react';
import './App.css'; // Make sure this is linked for the theme

// --- HARDCODED EXPERIMENT DATA ---
// Each experiment has a title, scenario, result, and grade level(s) it applies to.
// Grades 1-4 now use 'observation_prompts' for guided reasoning.
// Grades 5-8 have more complex scenarios and results.
const experiments = [
    // Grade 1: Basic Observation / Simple Prediction (Enhanced with multi-stage observation)
    {
        id: 1,
        title: "Melting Ice Cube",
        scenario: "You place a solid ice cube on a plate and leave it in a warm, sunny spot. Observe it over some time.",
        observation_prompts: [ // New structure for G1-4 detailed observation
            {
                prompt: "What does the ice cube look like right now? Describe its shape and how it feels (if you could touch it).",
                key: "initial_observation"
            },
            {
                prompt: "After a little while, what changes do you start to notice around and on the ice cube?",
                key: "mid_observation"
            },
            {
                prompt: "After a much longer time, what is left on the plate? Where did the ice cube go?",
                key: "final_observation"
            },
            {
                prompt: "What do you think caused the ice cube to change from a solid block to what's on the plate now?",
                key: "reasoning_cause"
            }
        ],
        result: "The solid ice cube slowly turns into a puddle of liquid water because the sun's heat melts it. This process is called melting, where a solid changes into a liquid due to an increase in temperature.",
        gradeLevels: [1],
        fillBlank: "The solid ice cube turned into liquid ___."
    },
    // Grade 2: Properties of Materials / Observation (Enhanced with multi-stage observation)
    {
        id: 2,
        title: "Float or Sink?",
        scenario: "You have a small plastic toy and a small stone. You will gently place each one into a bowl full of water.",
        observation_prompts: [
            {
                prompt: "Before putting them in water, how do the plastic toy and the stone feel? Are they light or heavy for their size?",
                key: "initial_comparison"
            },
            {
                prompt: "First, gently place the plastic toy in the water. What happens?",
                key: "toy_observation"
            },
            {
                prompt: "Next, gently place the stone in the water. What happens?",
                key: "stone_observation"
            },
            {
                prompt: "Why do you think one floated and the other sank?",
                key: "reasoning_prediction"
            }
        ],
        result: "The light plastic toy floats on the surface, while the heavy stone sinks to the bottom. This happens because of their density compared to water. Objects less dense than water float, and objects more dense than water sink.",
        gradeLevels: [2],
        fillBlank: "The object that sank was the ___."
    },
    // Grade 3: Magnetism / Simple Interaction (Enhanced with multi-stage observation)
    {
        id: 3,
        title: "Magic Magnets",
        scenario: "You have a magnet and three different items: a metal paperclip, a wooden block, and a plastic coin. You will try to touch the magnet to each item.",
        observation_prompts: [
            {
                prompt: "What do you already know about magnets? What kind of things do they usually stick to?",
                key: "prior_knowledge"
            },
            {
                prompt: "First, touch the magnet to the metal paperclip. What happens?",
                key: "paperclip_observation"
            },
            {
                prompt: "Next, touch the magnet to the wooden block. What happens?",
                key: "wood_observation"
            },
            {
                prompt: "Finally, touch the magnet to the plastic coin. What happens?",
                key: "plastic_observation"
            },
            {
                prompt: "Based on what you saw, what kind of materials do magnets stick to?",
                key: "reasoning_conclusion"
            }
        ],
        result: "The magnet attracts and picks up the metal paperclip, but it does not attract the wooden block or the plastic coin. Magnets are only attracted to certain metals, like iron, nickel, and cobalt.",
        gradeLevels: [3],
        fillBlank: "The magnet stuck to the ___."
    },
    // Grade 4: Simple Chemical Reactions / Change (Enhanced with multi-stage observation)
    {
        id: 4,
        title: "Baking Soda Volcano",
        scenario: "You are preparing to mix baking soda and vinegar together in a small bottle. Watch closely as they combine!",
        observation_prompts: [
            {
                prompt: "What does baking soda look like? How about vinegar? Describe each before mixing.",
                key: "initial_appearance"
            },
            {
                prompt: "When you start mixing them, what is the first thing you notice happening?",
                key: "immediate_reaction"
            },
            {
                prompt: "As they continue mixing, what kind of sounds or visuals do you observe? (e.g., fizzing, bubbling, foaming)",
                key: "ongoing_reaction"
            },
            {
                prompt: "Where do you think all the bubbles came from? What do you think they are?",
                key: "reasoning_gas"
            }
        ],
        result: "The baking soda (a base) and vinegar (an acid) react chemically to produce carbon dioxide gas, which causes the rapid fizzing and bubbling, making it look like a small volcano. This is an example of a chemical change, where new substances are formed.",
        gradeLevels: [4],
        fillBlank: "The mixing of baking soda and vinegar made a lot of ___."
    },
    // Grade 5: Plant Growth / Basic Biology (More detailed prediction and result)
    {
        id: 5,
        title: "The Mystery of Plant Growth",
        scenario: "You have three identical small bean seeds and three identical pots with soil. You want to see how different conditions affect their growth. \n\nPot A is watered daily and placed near a sunny window. \nPot B is watered daily but placed in a dark closet. \nPot C is placed near a sunny window but is *not* watered.\n\nAfter two weeks, you observe the growth in each pot. What do you expect to see, and why?",
        result: "Pot A, with light and water, will show healthy growth. Pot B, lacking light, will likely sprout but be pale and spindly (etiolated) as it tries to reach for light, and eventually die. Pot C, lacking water, will not germinate or grow at all. This demonstrates that plants require specific environmental factors—including sufficient light and water—for photosynthesis and overall survival. Different conditions act as limiting factors, preventing optimal growth.",
        gradeLevels: [5],
    },
    // Grade 6: States of Matter / Energy Transfer (Deeper explanation of evaporation)
    {
        id: 6,
        title: "Evaporation Race!",
        scenario: "You spill the same amount of water (e.g., 50ml) onto three different surfaces: \n\nSurface 1: A small, shallow saucer. \nSurface 2: A wide, flat tray. \nSurface 3: The same wide, flat tray, but you aim a small fan at it. \n\nAll surfaces are left in the same room conditions. Predict which puddle will dry fastest and slowest, and explain your reasoning. What factors do you think are most important here?",
        result: "The puddle on Surface 3 (wide tray with a fan) will evaporate fastest because it has both a large surface area and increased air movement (wind), which carries away water vapor molecules more quickly. Surface 2 (wide tray) will evaporate faster than Surface 1 (small saucer) because of its larger surface area exposed to the air. This experiment highlights how surface area and air circulation significantly influence the rate of evaporation, by affecting how quickly water molecules can escape into the atmosphere.",
        gradeLevels: [6],
    },
    // Grade 7: Simple Machines / Physics (Focus on force, distance, and work)
    {
        id: 7,
        title: "The Balancing Act: Ruler Lever Challenge",
        scenario: "You have a 30cm ruler, a small eraser, and a heavy textbook. Your goal is to balance the textbook using the eraser as a fulcrum and pressing down with one finger on the ruler. \n\nTask 1: Place the eraser exactly in the middle (15cm mark). Can you lift the book easily? \nTask 2: Move the eraser closer to the book (e.g., 5cm from the book's edge). Where do you now need to press on the ruler to lift the book, and how much effort does it feel like you're using compared to Task 1? \nTask 3: If you move the eraser even closer to the book (e.g., 2cm from the book's edge), what changes about the effort and the distance your finger moves?",
        result: "When the fulcrum is in the middle (Task 1), it's harder to lift a heavy book with a light finger press, requiring more force but a smaller movement. When the fulcrum is closer to the book (Task 2 & 3), it acts as a force multiplier. You'll exert less force, but your finger will have to move a greater distance. This demonstrates the inverse relationship between force and distance in a lever system (principle of moments). The further the effort is from the ful fulcrum (the effort arm), the less force is needed to lift a heavier load on the load arm, but the greater the distance the effort arm must travel. This shows how levers can trade force for distance.",
        gradeLevels: [7],
    },
    // Grade 8: Basic Electricity / Physics (Quantitative thinking, circuit types hinted)
    {
        id: 8,
        title: "Illuminating the House: Circuit Design Challenge",
        scenario: "Imagine you're designing a simple lighting circuit for a small dollhouse with two identical light bulbs. You have a single battery (power source) and connecting wires.\n\nChallenge 1: Design a circuit so that if one bulb breaks, the other *also* goes out. Draw or describe how you'd connect them, and explain why this happens.\nChallenge 2: Now, design a circuit so that if one bulb breaks, the other *stays lit*. Draw or describe how you'd connect them, and explain the difference. \n\nConsider how the brightness of the bulbs might differ in each challenge.",
        result: "Challenge 1 describes a **series circuit**: the bulbs are connected one after another, forming a single path for the current. If one bulb breaks (creating an open circuit), the entire path is broken, and current stops flowing to both. The bulbs in a series circuit also share the voltage, so they might be dimmer. Challenge 2 describes a **parallel circuit**: each bulb is connected directly to the battery, creating independent paths for the current. If one bulb breaks, current can still flow through the other path, keeping the second bulb lit. Bulbs in a parallel circuit typically receive the full voltage from the source and thus appear brighter. This demonstrates fundamental differences between series and parallel circuits concerning current path, component independence, and voltage distribution.",
        gradeLevels: [8],
    }
];

// Helper function to get the correct experiment for a grade
const getExperimentForGrade = (grade) => {
    // Finds the first experiment that includes the selected grade level
    return experiments.find(exp => exp.gradeLevels.includes(grade)) || null;
};

// --- GENERAL COMPONENTS ---

// Card wrapper for consistent styling
const Card = ({ children, className = "" }) => (
    <div className={`card ${className}`}>
        {children}
    </div>
);

// Generic Button component
const Button = ({ onClick, children, className = "", disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`button ${className}`}
    >
        <span className="button-content">{children}</span>
    </button>
);

// --- PROGRESS BAR COMPONENT ---
const ProgressBar = ({ currentStep, totalSteps, grade }) => {
    const progress = (currentStep / totalSteps) * 100;
    let displaySteps = [];

    // Define step labels based on grade range
    if (grade >=1 && grade <= 4) displaySteps = ["Scenario", "Observe/Predict", "Result"]; // Updated for G1-4
    else if (grade >= 5 && grade <= 6) displaySteps = ["Scenario", "Hypothesis", "Variables", "Prediction", "Result"];
    else if (grade >= 7 && grade <= 8) displaySteps = ["Scenario", "Hypothesis", "Variables", "Prediction", "Analysis", "Conclusion"];
    else displaySteps = ["Start"]; // Fallback

    return (
        <div className="progress-bar-container">
            <ol className="progress-bar-steps">
                {displaySteps.map((step, index) => (
                    // currentStep is 1-indexed, so `index + 1` matches `currentStep`
                    <li
                        key={step}
                        className={`progress-bar-step ${index < currentStep -1 ? 'completed' : ''} ${index + 1 === currentStep ? 'active' : ''}`}
                    >
                        {step}
                    </li>
                ))}
            </ol>
            <div className="progress-bar-track">
                <div style={{ width: `${progress}%` }} className="progress-bar-fill"></div>
            </div>
        </div>
    );
};


// --- GRADE SELECTION COMPONENT ---
const GradeSelector = ({ onSelect }) => (
    <Card className="text-center">
        <School className="icon-large" />
        <h1 className="title">Virtual Science Lab</h1>
        <p className="subtitle">Please select your grade to begin an experiment.</p>
        <div className="grade-selector-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <Button key={g} onClick={() => onSelect(g)}>
                    Grade {g}
                </Button>
            ))}
        </div>
    </Card>
);

// --- EXPERIMENT STAGE COMPONENTS ---

const StepHeader = ({ icon, text }) => (
    <div className="step-header">
        {icon}
        <h3>{text}</h3>
    </div>
);

const ScenarioStep = ({ experiment, onNext, onBack }) => (
    <div>
        <StepHeader icon={<BookOpen />} text="Scenario" />
        <p className="paragraph scenario-text">{experiment.scenario}</p> {/* Added class for potential styling */}
        <div className="button-group">
            <Button onClick={onBack} className="button-secondary">
                <ChevronLeft /> Change Grade
            </Button>
            <Button onClick={() => onNext({})}>
                I understand <ChevronRight />
            </Button>
        </div>
    </div>
);

// New component for Grade 1-4 observations and predictions
const ObservationAndPredictionStep = ({ onNext, onBack, experiment, responses, setResponses }) => { // Added setResponses prop
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState(responses[experiment.observation_prompts[currentPromptIndex]?.key] || '');

    // Update userAnswer when prompt index or responses change (e.g., navigating back)
    useEffect(() => {
        if (experiment.observation_prompts[currentPromptIndex]) {
            setUserAnswer(responses[experiment.observation_prompts[currentPromptIndex].key] || '');
        }
    }, [currentPromptIndex, experiment.observation_prompts, responses]);

    const currentPrompt = experiment.observation_prompts[currentPromptIndex];
    if (!currentPrompt) return null; // Should not happen if data is structured correctly

    const handleNextPrompt = () => {
        if (!userAnswer.trim()) {
            // Using a simple alert, as per general instructions, for quick feedback
            // For production, consider a custom modal.
            alert("Please provide an answer before moving on.");
            return;
        }

        const newResponses = { ...responses, [currentPrompt.key]: userAnswer.trim() };
        setResponses(newResponses); // Update responses in parent state via setResponses directly

        if (currentPromptIndex < experiment.observation_prompts.length - 1) {
            setCurrentPromptIndex(currentPromptIndex + 1);
        } else {
            // All prompts answered, move to the next main step
            onNext(newResponses);
        }
    };

    const handleBackPrompt = () => {
        if (currentPromptIndex > 0) {
            setCurrentPromptIndex(currentPromptIndex - 1);
        } else {
            // If on the first prompt, go back to the previous main step
            onBack();
        }
    };

    return (
        <div>
            <StepHeader icon={<Lightbulb />} text="Observe and Predict" />
            <p className="paragraph question-text">{currentPrompt.prompt}</p>
            <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="textarea-field"
                placeholder="Type your observations or thoughts here..."
                rows="5"
            />
            <div className="button-group">
                <Button onClick={handleBackPrompt} className="button-secondary">
                    <ChevronLeft /> {currentPromptIndex === 0 ? "Previous Step" : "Previous Prompt"}
                </Button>
                <Button onClick={handleNextPrompt} disabled={!userAnswer.trim()}>
                    {currentPromptIndex < experiment.observation_prompts.length - 1 ? "Next Prompt" : "See Results"} <ChevronRight />
                </Button>
            </div>
        </div>
    );
};


const HypothesisStep = ({ onNext, onBack, responses, setResponses }) => {
    const [hypothesis, setHypothesis] = useState(responses?.hypothesis || ''); // Pre-fill from responses

    const handleNextStep = () => {
        setResponses(prev => ({ ...prev, hypothesis })); // Update parent responses
        onNext({ hypothesis });
    };

    return (
        <div>
            <StepHeader icon={<FlaskConical />} text="Write Your Hypothesis" />
            <p className="paragraph">A hypothesis is your best guess about what will happen, based on what you already know. It should be a testable statement, often in an "If..., then..., because..." format.</p>
            <textarea
                id="hypothesis"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                className="textarea-field"
                rows="4"
                placeholder="If I [do this independent variable change], then [this dependent variable outcome] will happen, because [reasoning]."
            />
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={handleNextStep} disabled={!hypothesis}>
                    Next: Identify Variables <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const VariablesStep = ({ onNext, onBack, grade, responses, setResponses }) => {
    const [iv, setIv] = useState(responses?.independent_variable || '');
    const [dv, setDv] = useState(responses?.dependent_variable || '');
    const [cv, setCv] = useState(responses?.controlled_variables || '');

    const handleNextStep = () => {
        setResponses(prev => ({ ...prev, independent_variable: iv, dependent_variable: dv, controlled_variables: cv }));
        onNext({ independent_variable: iv, dependent_variable: dv, controlled_variables: cv });
    };

    return (
        <div>
            <StepHeader icon={<Beaker />} text="Identify the Variables" />
            <p className="paragraph">Understanding variables helps ensure your experiment is fair and accurate.</p>
            <div className="variables-container">
                <div className="variable-item">
                    <label className="label" htmlFor="iv">
                        {grade >= 7 ? "Independent Variable (What I change)" : "What are you changing on purpose?"}
                        <p className="hint-text">The one thing you control or alter in the experiment.</p>
                    </label>
                    <input id="iv" type="text" value={iv} onChange={(e) => setIv(e.target.value)} className="input-field" />
                </div>
                <div className="variable-item">
                    <label className="label" htmlFor="dv">
                        {grade >= 7 ? "Dependent Variable (What I observe or measure)" : "What are you measuring or observing as a result?"}
                        <p className="hint-text">The thing that changes in response to your independent variable.</p>
                    </label>
                    <input id="dv" type="text" value={dv} onChange={(e) => setDv(e.target.value)} className="input-field" />
                </div>
                <div className="variable-item">
                    <label className="label" htmlFor="cv">
                        {grade >= 7 ? "Controlled Variables (What I keep the same)" : "What should stay the same to make it a fair test?"}
                        <p className="hint-text">Everything else you keep consistent so only the independent variable's effect is seen.</p>
                    </label>
                    <input id="cv" type="text" value={cv} onChange={(e) => setCv(e.target.value)} className="input-field" />
                </div>
            </div>
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={handleNextStep} disabled={!iv || !dv}>
                    Next: Make a Prediction <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const PredictionStep = ({ onNext, onBack, responses, setResponses }) => {
    const [prediction, setPrediction] = useState(responses?.prediction || '');

    const handleNextStep = () => {
        setResponses(prev => ({ ...prev, prediction }));
        onNext({ prediction });
    };

    return (
        <div>
            <StepHeader icon={<TestTube2 />} text="Predict the Outcome" />
            <p className="paragraph">Based on your hypothesis and understanding of the variables, what specific result do you expect to see? Be as detailed as possible!</p>
            <textarea
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                className="textarea-field"
                rows="4"
                placeholder="I predict that..."
            />
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={handleNextStep} disabled={!prediction}>
                    See the Results <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

// ResultStep now displays the user's previous answer for fill-in-the-blank
const ResultStep = ({ onNext, onBack, experiment, grade, responses, setResponses }) => {
    const [fillInAnswer, setFillInAnswer] = useState(responses?.fillBlankAnswer || ''); // Pre-fill if coming back

    // Determine if this is a grade 1-4 experiment with a fill-in-the-blank
    const isGrade1To4AndHasFillBlank = (grade >= 1 && grade <= 4 && experiment.fillBlank);

    const handleSubmit = () => {
        // Only require an answer if it's a fill-in-the-blank and the answer is empty
        if (isGrade1To4AndHasFillBlank && !fillInAnswer.trim()) {
            alert("Please fill in the blank before submitting.");
            return;
        }
        setResponses(prev => ({ ...prev, fillBlankAnswer: fillInAnswer.trim() }));
        // Pass the answer for fill-in-the-blank, or an empty string if not applicable
        onNext({ fillBlankAnswer: fillInAnswer.trim() });
    };

    const getFillBlankPrompt = (text) => {
        const parts = text.split('___');
        // Check if `responses.fillBlankAnswer` exists AND is not an empty string
        const hasSubmittedAnswer = responses.fillBlankAnswer !== undefined && responses.fillBlankAnswer.trim() !== '';

        return (
            <>
                {parts[0]}
                {hasSubmittedAnswer ? ( // If answer exists, display it as a span
                    <span className="user-fill-in-answer">{responses.fillBlankAnswer}</span>
                ) : ( // Otherwise, show the input field
                    <input
                        type="text"
                        className="fill-in-blank-input"
                        value={fillInAnswer}
                        onChange={(e) => setFillInAnswer(e.target.value)}
                        placeholder="your answer"
                    />
                )}
                {parts[1]}
            </>
        );
    };

    return (
        <div>
            <StepHeader icon={<BookOpen />} text="Results" />
            <p className="paragraph">Here's what happened in the experiment:</p>
            <div className="result-box">{experiment.result}</div>

            {isGrade1To4AndHasFillBlank && (
                <>
                    <label className="label fill-blank-label">Fill in the blank:</label>
                    <div className="fill-in-blank-container">
                        {getFillBlankPrompt(experiment.fillBlank)}
                    </div>
                </>
            )}

            {/* Display all G1-4 observations if they exist */}
            {(grade >= 1 && grade <= 4 && experiment.observation_prompts) && (
                <div className="user-prediction-display">
                    <strong>Your Observations & Reasoning:</strong>
                    {experiment.observation_prompts.map(p => responses[p.key] && (
                        <p key={p.key} className="user-response-item">
                            <span className="question-prompt-small">{p.prompt}</span><br />
                            <em>{responses[p.key]}</em>
                        </p>
                    ))}
                </div>
            )}

            {/* Display user's initial prediction for G5-8 if it exists */}
            {(grade >= 5 && grade <= 8 && responses.prediction) && (
                <div className="user-prediction-display">
                    <strong>Your Prediction:</strong>
                    <p>{responses.prediction}</p>
                </div>
            )}


            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={handleSubmit} disabled={isGrade1To4AndHasFillBlank && !fillInAnswer.trim() && !responses.fillBlankAnswer}>
                    {grade >= 5 ? "Next: Analyze Results" : "Finish Experiment"} <ChevronRight />
                </Button>
            </div>
        </div>
    );
};


const AnalysisStep = ({ onNext, onBack, responses, setResponses }) => {
    const [analysis, setAnalysis] = useState(responses?.analysis || '');

    const handleNextStep = () => {
        setResponses(prev => ({ ...prev, analysis }));
        onNext({ analysis });
    };

    return (
        <div>
            <StepHeader icon={<TrendingUp />} text="Analyze the Results" />
            <p className="paragraph">Compare the actual results to your prediction and hypothesis. Was your hypothesis supported by the evidence? Explain why or why not, and discuss any unexpected outcomes.</p>
            <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="textarea-field"
                rows="5"
                placeholder="My hypothesis was (supported/not supported) because the results showed... An unexpected observation was..."
            />
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={handleNextStep} disabled={!analysis}>
                    Next: Write Conclusion <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const ConclusionStep = ({ onNext, onBack, responses, setResponses }) => {
    const [conclusion, setConclusion] = useState(responses?.conclusion || '');

    const handleNextStep = () => {
        setResponses(prev => ({ ...prev, conclusion }));
        onNext({ conclusion });
    };

    return (
        <div>
            <StepHeader icon={<CheckCircle />} text="Write Your Conclusion" />
            <p className="paragraph">Summarize what you learned from this experiment. What are the key takeaways? How does this experiment relate to broader scientific principles or real-world applications?</p>
            <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="textarea-field"
                rows="5"
                placeholder="In conclusion, this experiment demonstrates that... This relates to [concept] by... I also learned that..."
            />
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={handleNextStep} disabled={!conclusion}>
                    Finish Experiment <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const Summary = ({ responses, experiment, onRestart, onNewGrade }) => {
    // Helper to format keys for display
    const formatKey = (key) => {
        // Handle special keys for display from observation_prompts
        if (key === 'initial_observation') return 'Initial Observation';
        if (key === 'mid_observation') return 'Mid-Experiment Observation';
        if (key === 'final_observation') return 'Final Observation';
        if (key === 'reasoning_cause') return 'Reasoning for Change';
        if (key === 'initial_comparison') return 'Initial Comparison';
        if (key === 'toy_observation') return 'Plastic Toy Observation';
        if (key === 'stone_observation') return 'Stone Observation';
        if (key === 'prior_knowledge') return 'Prior Knowledge';
        if (key === 'paperclip_observation') return 'Paperclip Observation';
        if (key === 'wood_observation') return 'Wood Observation';
        if (key === 'plastic_observation') return 'Plastic Coin Observation';
        if (key === 'reasoning_conclusion') return 'Reasoning/Conclusion';
        if (key === 'initial_appearance') return 'Initial Appearance';
        if (key === 'immediate_reaction') return 'Immediate Reaction';
        if (key === 'ongoing_reaction') return 'Ongoing Reaction';
        if (key === 'reasoning_gas') return 'Reasoning for Gas';


        return key.replace(/([A-Z])/g, ' $1') // Add space before capital letters
                  .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                  .replace(/_/g, ' '); // Replace underscores
    };

    return (
        <Card className="summary-card">
            <h2 className="card-title">Experiment Complete!</h2>
            <p className="subtitle">Great job, scientist! Here's a summary of your work on the "{experiment.title}" experiment.</p>
            <div className="summary-details">
                {/* Iterate through responses to display them */}
                {Object.entries(responses).map(([key, value]) => {
                    // Filter out internal keys like 'question' (which is the prompt)
                    // and ensure value is not empty/null before displaying
                    if (value && key !== 'question') {
                        let displayValue = String(value);
                        // For fillBlankAnswer, format it nicely within the sentence if experiment.fillBlank exists
                        if (key === 'fillBlankAnswer' && experiment.fillBlank) {
                             displayValue = experiment.fillBlank.replace('___', `**${value}**`);
                        }
                        return (
                            <div key={key} className="summary-item">
                                <h3 className="summary-item-title">{formatKey(key)}:</h3>
                                <p className="summary-item-value">{displayValue}</p>
                            </div>
                        );
                    }
                    return null;
                })}
                <div className="summary-item">
                    <h3 className="summary-item-title">Actual Experiment Result:</h3>
                    <p className="summary-item-value">{experiment.result}</p>
                </div>
            </div>
            <div className="navigation-buttons">
                <Button onClick={onNewGrade} className="button-secondary">
                    <School /> Choose New Grade
                </Button>
                <Button onClick={onRestart}>
                    <RefreshCw /> Redo Experiment
                </Button>
            </div>
        </Card>
    );
};


// --- EXPERIMENT FLOW ORCHESTRATOR COMPONENT ---
const ExperimentView = ({ grade, experiment, onComplete, onGoToGradeSelection }) => {
    // Define total steps based on grade
    const getStepsForGrade = (g) => {
        // For G1-4, the "Observe/Predict" step covers all individual observation prompts.
        // So, it's 3 main stages: Scenario, Observe/Predict (multi-prompt), Result.
        if (g >= 1 && g <= 4) return 3;
        if (g >= 5 && g <= 6) return 5; // Scenario, Hypothesis, Variables, Prediction, Result
        if (g >= 7 && g <= 8) return 6; // Scenario, Hypothesis, Variables, Prediction, Analysis, Conclusion
        return 0;
    };

    const totalSteps = getStepsForGrade(grade);
    const [currentStep, setCurrentStep] = useState(1);
    const [responses, setResponses] = useState({}); // Collects responses from each step

    const handleNext = (data) => {
        // The individual step components will now update `responses` directly via `setResponses` prop
        // We only advance the step here, and `data` might be empty or just a trigger.
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(responses); // Experiment finished, pass all collected responses from state
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            // When navigating back, we should ideally preserve the answers for the previous step.
            // The individual step components are now responsible for populating their state
            // from the `responses` prop if available.
        } else {
            onGoToGradeSelection(); // Back to grade selection if on first step
        }
    };

    // Effect to reset current step and responses when grade or experiment changes
    useEffect(() => {
        setCurrentStep(1);
        setResponses({});
    }, [grade, experiment]);


    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <ScenarioStep experiment={experiment} onNext={handleNext} onBack={handleBack} />;
            case 2:
                // Renamed and updated for G1-4 to handle multiple observation prompts
                if (grade >= 1 && grade <= 4) return <ObservationAndPredictionStep experiment={experiment} onNext={handleNext} onBack={handleBack} responses={responses} setResponses={setResponses} />;
                return <HypothesisStep onNext={handleNext} onBack={handleBack} responses={responses} setResponses={setResponses} />;
            case 3:
                // Pass current `responses` to ResultStep so it can display previous answer
                if (grade >= 1 && grade <= 4) return <ResultStep experiment={experiment} grade={grade} responses={responses} setResponses={setResponses} onNext={handleNext} onBack={handleBack} />;
                return <VariablesStep onNext={handleNext} onBack={handleBack} grade={grade} responses={responses} setResponses={setResponses} />;
            case 4:
                return <PredictionStep onNext={handleNext} onBack={handleBack} responses={responses} setResponses={setResponses} />;
            case 5:
                // Pass current `responses` to ResultStep
                if (grade >= 5 && grade <= 6) return <ResultStep experiment={experiment} grade={grade} responses={responses} setResponses={setResponses} onNext={handleNext} onBack={handleBack} />;
                return <AnalysisStep onNext={handleNext} onBack={handleBack} responses={responses} setResponses={setResponses} />;
            case 6:
                return <ConclusionStep onNext={handleNext} onBack={handleBack} responses={responses} setResponses={setResponses} />;
            default:
                return <p>Starting experiment...</p>;
        }
    };

    return (
        <Card>
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} grade={grade} />
            <h2 className="experiment-title">{experiment.title}</h2>
            <hr className="divider" />
            {renderStep()}
        </Card>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [grade, setGrade] = useState(null);
    const [experiment, setExperiment] = useState(null);
    const [completedExperiment, setCompletedExperiment] = useState(null);

    const handleGradeSelect = (selectedGrade) => {
        setGrade(selectedGrade);
        const anExperiment = getExperimentForGrade(selectedGrade);
        setExperiment(anExperiment);
        setCompletedExperiment(null); // Reset completed state for new grade
    };

    const handleGoToGradeSelection = () => {
        setGrade(null);
        setExperiment(null);
        setCompletedExperiment(null);
    };

    const handleExperimentComplete = (finalResponses) => {
        setCompletedExperiment(finalResponses);
    };

    const handleRestart = () => {
        // This will trigger ExperimentView's useEffect to reset its state
        setCompletedExperiment(null);
    };

    const renderContent = () => {
        if (!grade || !experiment) {
            return <GradeSelector onSelect={handleGradeSelect} />;
        }
        if (completedExperiment) {
            return (
                <Summary
                    responses={completedExperiment}
                    experiment={experiment}
                    onRestart={handleRestart}
                    onNewGrade={handleGoToGradeSelection}
                />
            );
        }
        return (
            <ExperimentView
                grade={grade}
                experiment={experiment}
                onComplete={handleExperimentComplete}
                onGoToGradeSelection={handleGoToGradeSelection}
            />
        );
    };

    return (
        <div className="app-background">
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}
