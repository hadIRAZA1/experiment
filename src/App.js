import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, RefreshCw, School, BookOpen, FlaskConical, Beaker, TestTube2, CheckCircle } from 'lucide-react';
import './App.css'; // Make sure this is linked for the theme

// --- HARDCODED EXPERIMENT DATA ---
// Each experiment has a title, scenario, result, and grade level(s) it applies to.
// Grades 1-4 might have a 'fillBlank' for a simple answer.
// 'question_prompt' is a specific hardcoded question for the DynamicQuestionStep for grades 1-4.
const experiments = [
    // Grade 1: Basic Observation / Simple Prediction
    {
        id: 1,
        title: "Melting Ice Cube",
        scenario: "You place a solid ice cube on a plate and leave it in a warm, sunny spot.",
        question_prompt: "What do you think will happen to the ice cube?", // Specific prompt for G1-4
        result: "The solid ice cube slowly turns into a puddle of liquid water because the sun's heat melts it.",
        gradeLevels: [1],
        fillBlank: "The ice cube turned into liquid ___."
    },
    // Grade 2: Properties of Materials / Observation
    {
        id: 2,
        title: "Float or Sink?",
        scenario: "You take a small plastic toy and a small stone and gently place them both in a bowl full of water.",
        question_prompt: "What do you observe? Will both objects sink?", // Specific prompt for G1-4
        result: "The light plastic toy floats on the surface, while the heavy stone sinks to the bottom.",
        gradeLevels: [2],
        fillBlank: "The heavy stone ___ to the bottom."
    },
    // Grade 3: Magnetism / Simple Interaction
    {
        id: 3,
        title: "Magic Magnets",
        scenario: "You have a magnet. You try to touch it to three different items: a metal paperclip, a wooden block, and a plastic coin.",
        question_prompt: "What do you think the magnet will stick to?", // Specific prompt for G1-4
        result: "The magnet attracts and picks up the metal paperclip, but it does not attract the wooden block or the plastic coin.",
        gradeLevels: [3],
    },
    // Grade 4: Simple Chemical Reactions / Change
    {
        id: 4,
        title: "Baking Soda Volcano",
        scenario: "You mix baking soda and vinegar together in a small bottle. There's a lot of fizzing and bubbling!",
        question_prompt: "What do you think will happen when you mix baking soda and vinegar?", // Specific prompt for G1-4
        result: "The baking soda and vinegar react to produce carbon dioxide gas, which causes the fizzing and bubbling, like a small volcano.",
        gradeLevels: [4],
        fillBlank: "The mixing of baking soda and vinegar made a lot of ___."
    },
    // Grade 5: Plant Growth / Basic Biology (Hypothesis, Simple Variables, Prediction, Result)
    {
        id: 5,
        title: "Planting a Seed",
        scenario: "You plant a small bean seed in a pot with soil and water it regularly. You place the pot near a sunny window.",
        result: "After a few days, a small green sprout emerges from the soil and begins to grow towards the light.",
        gradeLevels: [5],
    },
    // Grade 6: States of Matter / Energy Transfer (Hypothesis, Simple Variables, Prediction, Result)
    {
        id: 6,
        title: "Evaporating Puddle",
        scenario: "A puddle of water is left on the sidewalk on a hot, sunny day. After a few hours, the puddle is gone.",
        result: "The liquid water in the puddle absorbed energy from the sun and turned into water vapor, which is a gas that mixes with the air.",
        gradeLevels: [6],
    },
    // Grade 7: Simple Machines / Physics (Full Scientific Method)
    {
        id: 7,
        title: "Leverage with a Ruler",
        scenario: "You use a long ruler to try and lift a heavy book. You put a small block (fulcrum) under the ruler and press down on one end.",
        result: "By pressing down on the long end of the ruler, the heavy book on the other end is lifted with less effort due to the principle of leverage.",
        gradeLevels: [7],
    },
    // Grade 8: Basic Electricity / Physics (Full Scientific Method)
    {
        id: 8,
        title: "Simple Circuit",
        scenario: "You connect a battery, a light bulb, and wires together in a closed loop.",
        result: "The light bulb lights up because electricity flows from the battery, through the wires, and through the bulb in a complete circuit.",
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
    if (grade >=1 && grade <= 4) displaySteps = ["Scenario", "Question", "Result"];
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
        <p className="paragraph">{experiment.scenario}</p>
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

// This component is now fully hardcoded and does NOT use Gemini.
const DynamicQuestionStep = ({ onNext, onBack, experiment }) => {
    const [userAnswer, setUserAnswer] = useState('');

    // The question is now directly from the experiment object
    const questionText = experiment.question_prompt || "What do you think will happen?";

    const handleSubmit = () => {
        if (userAnswer.trim()) {
            // Pass the user's answer for the prediction/observation
            onNext({ question: questionText, prediction_or_observation: userAnswer });
        } else {
            alert("Please provide an answer before submitting.");
        }
    };

    return (
        <div>
            <StepHeader icon={<FlaskConical />} text="Prediction / Observation" />
            <p className="paragraph question-text">{questionText}</p>
            <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="textarea-field"
                placeholder="Type your answer here..."
                rows="5"
            />
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={handleSubmit} disabled={!userAnswer.trim()}>
                    Next <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const HypothesisStep = ({ onNext, onBack }) => {
    const [hypothesis, setHypothesis] = useState('');
    return (
        <div>
            <StepHeader icon={<FlaskConical />} text="Write Your Hypothesis" />
            <p className="paragraph">A hypothesis is your best guess about what will happen. Use an "If..., then..." statement.</p>
            <textarea
                id="hypothesis"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                className="textarea-field"
                rows="4"
                placeholder="If I [do this], then [this] will happen."
            />
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={() => onNext({ hypothesis })} disabled={!hypothesis}>
                    Next: Identify Variables <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const VariablesStep = ({ onNext, onBack, grade }) => {
    const [iv, setIv] = useState('');
    const [dv, setDv] = useState('');
    const [cv, setCv] = useState('');

    return (
        <div>
            <StepHeader icon={<Beaker />} text="Identify the Variables" />
            <div className="variables-container">
                <div className="variable-item">
                    <label className="label" htmlFor="iv">{grade >= 7 ? "Independent Variable (What I change)" : "What are you changing?"}</label>
                    <input id="iv" type="text" value={iv} onChange={(e) => setIv(e.target.value)} className="input-field" />
                </div>
                <div className="variable-item">
                    <label className="label" htmlFor="dv">{grade >= 7 ? "Dependent Variable (What I observe or measure)" : "What are you measuring?"}</label>
                    <input id="dv" type="text" value={dv} onChange={(e) => setDv(e.target.value)} className="input-field" />
                </div>
                <div className="variable-item">
                    <label className="label" htmlFor="cv">{grade >= 7 ? "Controlled Variables (What I keep the same)" : "What should stay the same?"}</label>
                    <input id="cv" type="text" value={cv} onChange={(e) => setCv(e.target.value)} className="input-field" />
                </div>
            </div>
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={() => onNext({ independent_variable: iv, dependent_variable: dv, controlled_variables: cv })} disabled={!iv || !dv}>
                    Next: Make a Prediction <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const PredictionStep = ({ onNext, onBack }) => {
    const [prediction, setPrediction] = useState('');
    return (
        <div>
            <StepHeader icon={<TestTube2 />} text="Predict the Outcome" />
            <p className="paragraph">Based on your hypothesis, what specific result do you expect to see?</p>
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
                <Button onClick={() => onNext({ prediction })} disabled={!prediction}>
                    See the Results <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

// ResultStep now displays the user's previous answer for fill-in-the-blank
const ResultStep = ({ onNext, onBack, experiment, grade, responses }) => {
    const [fillInAnswer, setFillInAnswer] = useState(responses?.fillBlankAnswer || ''); // Pre-fill if coming back

    // Determine if this is a grade 1-4 experiment with a fill-in-the-blank
    const isGrade1To4AndHasFillBlank = (grade >= 1 && grade <= 4 && experiment.fillBlank);

    const handleSubmit = () => {
        // Only require an answer if it's a fill-in-the-blank and the answer is empty
        if (isGrade1To4AndHasFillBlank && !fillInAnswer.trim()) {
            alert("Please fill in the blank before submitting.");
            return;
        }
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
                    {/* Display user's initial prediction/observation for G1-4 if it exists */}
                    {responses.prediction_or_observation && (
                        <div className="user-prediction-display">
                            <strong>Your Prediction/Observation:</strong>
                            <p>{responses.prediction_or_observation}</p>
                        </div>
                    )}
                </>
            )}

            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={handleSubmit} disabled={isGrade1To4AndHasFillBlank && !fillInAnswer.trim() && !responses.fillBlankAnswer}>
                    {grade >= 7 || (grade >= 5 && grade <= 6) ? "Next: Analyze Results" : "Finish Experiment"} <ChevronRight />
                </Button>
            </div>
        </div>
    );
};


const AnalysisStep = ({ onNext, onBack }) => {
    const [analysis, setAnalysis] = useState('');
    return (
        <div>
            <StepHeader icon={<Beaker />} text="Analyze the Results" />
            <p className="paragraph">Compare the results to your prediction. Was your hypothesis supported? Why or why not?</p>
            <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="textarea-field"
                rows="5"
                placeholder="My hypothesis was (supported/not supported) because the results showed..."
            />
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={() => onNext({ analysis })} disabled={!analysis}>
                    Next: Write Conclusion <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const ConclusionStep = ({ onNext, onBack }) => {
    const [conclusion, setConclusion] = useState('');
    return (
        <div>
            <StepHeader icon={<CheckCircle />} text="Write Your Conclusion" />
            <p className="paragraph">Summarize what you learned from this experiment. What are the key takeaways?</p>
            <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="textarea-field"
                rows="5"
                placeholder="In conclusion, this experiment demonstrates that..."
            />
            <div className="button-group">
                <Button onClick={onBack} className="button-secondary">
                    <ChevronLeft /> Previous
                </Button>
                <Button onClick={() => onNext({ conclusion })} disabled={!conclusion}>
                    Finish Experiment <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

const Summary = ({ responses, experiment, onRestart, onNewGrade }) => {
    // Helper to format keys for display
    const formatKey = (key) => {
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
        if (g >= 1 && g <= 4) return 3; // Scenario, DynamicQuestion, Result
        if (g >= 5 && g <= 6) return 5; // Scenario, Hypothesis, Variables, Prediction, Result
        if (g >= 7 && g <= 8) return 6; // Scenario, Hypothesis, Variables, Prediction, Analysis, Conclusion
        return 0;
    };

    const totalSteps = getStepsForGrade(grade);
    const [currentStep, setCurrentStep] = useState(1);
    const [responses, setResponses] = useState({}); // Collects responses from each step

    const handleNext = (data) => {
        const newResponses = { ...responses, ...data };
        setResponses(newResponses);

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(newResponses); // Experiment finished, pass all collected responses
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            // When going back, reset the answer for the current step (to allow re-editing)
            // This is a simplified approach; a more robust solution might manage answers for each step in a single state object.
            // For now, we clear the answer for the step being navigated to.
            // Note: If you want to *preserve* answers when navigating back,
            // the individual step components (e.g., DynamicQuestionStep, ResultStep)
            // would need to take their initial value from `responses` and update `responses` on change.
            // The current setup clears the answer for the step you are going *back to*
            // so you can re-enter it.
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
                if (grade >= 1 && grade <= 4) return <DynamicQuestionStep experiment={experiment} onNext={handleNext} onBack={handleBack} />;
                return <HypothesisStep onNext={handleNext} onBack={handleBack} />;
            case 3:
                // Pass current `responses` to ResultStep so it can display previous answer
                if (grade >= 1 && grade <= 4) return <ResultStep experiment={experiment} grade={grade} responses={responses} onNext={handleNext} onBack={handleBack} />;
                return <VariablesStep onNext={handleNext} onBack={handleBack} grade={grade} />;
            case 4:
                return <PredictionStep onNext={handleNext} onBack={handleBack} />;
            case 5:
                // Pass current `responses` to ResultStep
                if (grade >= 5 && grade <= 6) return <ResultStep experiment={experiment} grade={grade} responses={responses} onNext={handleNext} onBack={handleBack} />;
                return <AnalysisStep onNext={handleNext} onBack={handleBack} />;
            case 6:
                return <ConclusionStep onNext={handleNext} onBack={handleBack} />;
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