const { generateJson } = require("./aiRouter");

const VALID_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

function normalizeDifficulty(value) {
  const raw = String(value || "").trim();
  const match = VALID_DIFFICULTIES.find((d) => d.toLowerCase() === raw.toLowerCase());
  return match || "Intermediate";
}

function normalizeSkills(value) {
  const list = Array.isArray(value) ? value : [];
  const seen = new Set();
  return list
    .map((skill) => String(skill || "").trim().slice(0, 60))
    .filter((skill) => {
      if (!skill) return false;
      const lower = skill.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    })
    .slice(0, 6);
}

function formatCourse(result) {
  const sourceModules = Array.isArray(result.modules) ? result.modules : [];
  const seenModuleTitles = new Set();
  const modules = sourceModules.slice(0, 10).map((module) => {
    if (!module || typeof module !== "object") return null;

    const seenLessonTitles = new Set();
    const lessons = (Array.isArray(module.lessons) ? module.lessons : [])
      .slice(0, 10)
      .map((lesson) => ({
        title: String(typeof lesson === "string" ? lesson : lesson?.title || "")
          .trim()
          .slice(0, 160),
      }))
      .filter((lesson) => {
        if (!lesson.title) return false;
        const lower = lesson.title.toLowerCase();
        if (seenLessonTitles.has(lower)) return false;
        seenLessonTitles.add(lower);
        return true;
      });

    const moduleTitle = String(module.title || "").trim().slice(0, 160);
    if (!moduleTitle || !lessons.length) return null;
    
    const lowerMod = moduleTitle.toLowerCase();
    if (seenModuleTitles.has(lowerMod)) return null;
    seenModuleTitles.add(lowerMod);

    return {
      title: moduleTitle,
      lessons,
    };
  }).filter(Boolean);

  const course = {
    title: String(result.title || "").trim().slice(0, 160),
    description: String(result.description || "").trim().slice(0, 600),
    difficulty: normalizeDifficulty(result.difficulty),
    skills: normalizeSkills(result.skills),
    modules,
  };

  if (!course.title || !course.modules.length) {
    const error = new Error("AI returned an incomplete course outline. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  return course;
}

async function createCourseOutline(prompt, language = "English", onStage = null) {
  const instructions = `
Create a professional course outline.
Return MINIFIED JSON with ONLY "title", "description", "difficulty", "skills", and "modules".
"difficulty" MUST always be written in English and be exactly one of: "Beginner", "Intermediate", "Advanced" — pick whichever genuinely matches how advanced this course's content is.
"skills" MUST be an array of 3 to 6 short (2-4 word) skill phrases a learner will genuinely walk away with, derived specifically from this course's topic and modules.
Create exactly 5-8 modules. Each module needs a "title" and a "lessons" array.
Each lesson must be an object with ONLY a "title".
No explanations, no markdown, no extra text.
The entire course outline MUST be generated completely in this language: ${language}.
  `.trim();

  if (onStage) onStage("designing_curriculum");
  const result = await generateJson(instructions, prompt, 8192);
  return formatCourse(result);
}

module.exports = { createCourseOutline };
