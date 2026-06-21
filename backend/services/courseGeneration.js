const { generateJson } = require("./aiRouter");

function formatCourse(result) {
  const sourceModules = Array.isArray(result.modules) ? result.modules : [];
  const modules = sourceModules.slice(0, 10).map((module) => {
    if (!module || typeof module !== "object") return null;

    const lessons = (Array.isArray(module.lessons) ? module.lessons : [])
      .slice(0, 10)
      .map((lesson) => ({
        title: String(typeof lesson === "string" ? lesson : lesson?.title || "")
          .trim()
          .slice(0, 160),
      }))
      .filter((lesson) => lesson.title);

    return {
      title: String(module.title || "").trim().slice(0, 160),
      lessons,
    };
  }).filter((module) => module?.title && module.lessons.length);

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
Create a practical course outline.
Return JSON with "title", "description", and "modules".
Create 5-10 modules depending on the course topic. Each module needs a "title" and a "lessons" array.
Each lesson must be an object with a "title".
Do not include lesson content, quizzes, or videos.
The entire course outline MUST be generated completely in this language: ${language}.
  `.trim();

  const result = await generateJson(instructions, prompt, 8192);
  return formatCourse(result);
}

module.exports = { createCourseOutline };
