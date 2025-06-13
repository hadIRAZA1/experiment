// gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client with the key from your .env file
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

/**
 * Fetches a grade-appropriate question from Gemini based on an experiment.
 * @param {object} experiment - The experiment object with title and scenario.
 * @param {number} grade - The selected grade level.
 * @returns {Promise<string>} - The generated question.
 */
export async function fetchQuestionFromGemini(experiment, grade) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Determine the difficulty based on grade level
  let difficulty_prompt;
  switch (grade) {
    case 1:
      difficulty_prompt = "very simple and direct for a first grader. Ask a 'what do you think' question about a small experiment. Do not use complex words. The question should be one sentence.";
      break;
    case 2:
      difficulty_prompt = "simple and direct for a second grader. Ask a 'what do you think will happen' question about a small experiment. The question should be one sentence.";
      break;
    case 3:
      difficulty_prompt = "appropriate for a third grader. Ask a 'what do you observe' or 'what do you predict' question, keeping it straightforward for a small experiment. The question should be one to two sentences.";
      break;
    case 4:
      difficulty_prompt = "suitable for a fourth grader, encouraging a simple prediction or observation from a small experiment. The question should be one to two sentences.";
      break;
    case 5:
      difficulty_prompt = "for a fifth grader. Ask for a simple prediction and a brief reason why. The question should be one to two sentences.";
      break;
    case 6:
      difficulty_prompt = "for a sixth grader. Ask for a prediction, encouraging them to consider a simple scientific concept. The question should be one to two sentences.";
      break;
    case 7:
      difficulty_prompt = "for a seventh grader, encouraging them to think about the underlying scientific principle or a more detailed prediction. Ask for a detailed prediction or a 'why' question, possibly mentioning a scientific term.";
      break;
    case 8:
      difficulty_prompt = "for an eighth grader, encouraging a deeper understanding of the scientific principles involved, potential variables, or advanced predictions. Ask a 'why' or 'how' question that requires analytical thought.";
      break;
    default:
      difficulty_prompt = "for a general science student, asking for a basic prediction.";
  }

  const prompt = `
    Based on the following science experiment scenario, generate a single, open-ended question to ask a student.
    The question's difficulty should be ${difficulty_prompt}.

    Experiment Title: "${experiment.title}"
    Scenario: "${experiment.scenario}"

    Generate only the question text, and nothing else. Do not include labels like "Question:".
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error fetching question from Gemini:", error);
    // Provide a fallback question if the API fails
    return "What do you predict will happen next?";
  }
}