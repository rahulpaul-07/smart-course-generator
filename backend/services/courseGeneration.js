const { generateJson } = require("./aiRouter");

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
    modules,
  };

  if (!course.title || !course.modules.length) {
    const error = new Error("AI returned an incomplete course outline. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  return course;
}

async function createCourseOutline(prompt, language = "English") {
  const instructions = `
Create a professional course outline.
Return MINIFIED JSON with ONLY "title", "description", and "modules".
Create exactly 5-8 modules. Each module needs a "title" and a "lessons" array.
Each lesson must be an object with ONLY a "title".
No explanations, no markdown, no extra text.
The entire course outline MUST be generated completely in this language: ${language}.
  `.trim();

  const result = await generateJson(instructions, prompt, 8192);
  return formatCourse(result);
}

module.exports = { createCourseOutline };
