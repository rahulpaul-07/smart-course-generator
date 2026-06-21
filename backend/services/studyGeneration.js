const { generateJson } = require("./aiRouter");

function lessonText(lesson) {
  return (lesson.content || [])
    .filter((block) => block?.type === "heading" || block?.type === "paragraph")
    .map((block) => String(block.text || "").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 5000);
}

function requireLessonText(lesson) {
  const text = lessonText(lesson);

  if (!text) {
    const error = new Error("Generate the lesson before creating study material.");
    error.statusCode = 400;
    throw error;
  }

  return text;
}

function formatQuiz(result) {
  const questions = Array.isArray(result.questions) ? result.questions : [];

  return questions.map((item) => {
    if (!item || typeof item !== "object") return null;

    const options = (Array.isArray(item.options) ? item.options : [])
      .map((option) => String(option || "").trim().slice(0, 250))
      .filter(Boolean);
    const correctAnswer = Number(item.correctAnswer);

    if (!item.question || options.length !== 4 || !Number.isInteger(correctAnswer)
      || correctAnswer < 0 || correctAnswer > 3) {
      return null;
    }

    return {
      question: String(item.question).trim().slice(0, 500),
      options,
      correctAnswer,
      explanation: String(item.explanation || "").trim().slice(0, 700),
    };
  }).filter(Boolean).slice(0, 10);
}

async function createLessonQuiz(lesson) {
const instructions = `
Create 5 to 10 multiple-choice questions from the lesson, depending on the depth and difficulty of the lesson.
You MUST return ONLY a JSON object containing a "questions" array.
Do not include any explanation or markdown wrapping before or after the JSON.
Each question object MUST strictly have:
- "question" (string)
- "options" (array of exactly 4 strings)
- "correctAnswer" (number, 0-3)
- "explanation" (string)
  `.trim();
  const questions = formatQuiz(await generateJson(instructions, requireLessonText(lesson), 2048));

  if (questions.length < 5) {
    const error = new Error("AI could not generate enough valid quiz questions. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  return questions;
}

async function createLessonFlashcards(lesson) {
  const instructions = `
Create 8 useful study flashcards from the lesson.
Return JSON with a "flashcards" array.
Each flashcard needs a short "front" question or concept and a clear "back" answer.
Focus on understanding and application, not trivia.
  `.trim();
  const result = await generateJson(instructions, requireLessonText(lesson), 2400);
  const sourceCards = Array.isArray(result.flashcards) ? result.flashcards : [];
  const flashcards = sourceCards.map((card) => {
    if (!card || typeof card !== "object") return null;

    return {
      front: String(card.front || "").trim().slice(0, 400),
      back: String(card.back || "").trim().slice(0, 800),
    };
  }).filter((card) => card?.front && card.back).slice(0, 8);

  if (flashcards.length < 6) {
    const error = new Error("AI could not create enough flashcards. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  return flashcards;
}

async function createPracticeLab({ lesson, moduleDoc, course }) {
  const instructions = `
Create one practical mini-project that applies this lesson.
Return JSON with exactly "title", "brief", "steps", "checks", and "hint".
"steps" and "checks" must be arrays of short strings.
The lab should take 20-40 minutes without paid tools. Do not give the full solution.
  `.trim();
  const context = `
Course: ${course.title}
Module: ${moduleDoc.title}
Lesson: ${lesson.title}

${requireLessonText(lesson)}
  `.trim();
  const result = await generateJson(instructions, context, 2600);
  const lab = {
    title: String(result.title || "").trim().slice(0, 200),
    brief: String(result.brief || "").trim().slice(0, 1500),
    steps: (Array.isArray(result.steps) ? result.steps : [])
      .map((step) => String(step || "").trim().slice(0, 500))
      .filter(Boolean)
      .slice(0, 8),
    successCriteria: (Array.isArray(result.checks) ? result.checks : [])
      .map((check) => String(check || "").trim().slice(0, 500))
      .filter(Boolean)
      .slice(0, 6),
    hint: String(result.hint || "").trim().slice(0, 800),
  };

  if (!lab.title || !lab.brief || !lab.steps.length || !lab.successCriteria.length) {
    const error = new Error("AI could not create a complete practice lab. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  return lab;
}

module.exports = {
  createLessonFlashcards,
  createLessonQuiz,
  createPracticeLab,
};
