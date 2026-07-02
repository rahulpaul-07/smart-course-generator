const { generateJson, generateJsonStream } = require("./aiRouter");

const LESSON_DEPTHS = {
  brief: { words: "700-1000", blocks: 5, characters: 2000, maxTokens: 3000 },
  standard: { words: "1100-1600", blocks: 6, characters: 3500, maxTokens: 5000 },
  deep: { words: "1800-2600", blocks: 8, characters: 6000, maxTokens: 7000 },
};

function lessonText(lesson, maxLength = 3000) {
  return (lesson.content || [])
    .filter((block) => block?.type === "heading" || block?.type === "paragraph")
    .map((block) => String(block.text || "").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, maxLength);
}

function formatBlock(block) {
  if (!block || typeof block !== "object") return null;

  switch (block.type) {
    case "heading":
      return {
        type: "heading",
        level: block.level === 3 ? 3 : 2,
        text: String(block.text || "").trim().slice(0, 300),
      };

    case "paragraph":
      return {
        type: "paragraph",
        text: String(block.text || "").trim().slice(0, 5000),
      };

    case "code":
      return {
        type: "code",
        codes: {
          python: String(block.codes?.python || block.code || "").trim().slice(0, 10000),
          cpp: String(block.codes?.cpp || "").trim().slice(0, 10000),
          java: String(block.codes?.java || "").trim().slice(0, 10000),
        }
      };

    case "list": {
      const items = (Array.isArray(block.items) ? block.items : [])
        .map((item) => String(item || "").trim().slice(0, 1000))
        .filter(Boolean);
      if (!items.length) return null;
      return {
        type: "list",
        style: block.style === "numbered" ? "numbered" : "bullet",
        items,
      };
    }

    case "callout":
      return {
        type: "callout",
        emoji: String(block.emoji || "💡").trim().slice(0, 4),
        title: String(block.title || "").trim().slice(0, 200),
        text: String(block.text || "").trim().slice(0, 2000),
      };

    default:
      return null;
  }
}

function formatBlocks(result) {
  const blocks = result.contentBlocks || result.blocks;
  if (!Array.isArray(blocks)) return [];

  return blocks.map(formatBlock).filter((block) => {
    if (!block) return false;
    if (block.type === "list") return block.items.length > 0;
    if (block.type === "code") return Object.values(block.codes).some(Boolean);
    return block.text;
  });
}

function isCompleteLesson(blocks, depth) {
  const characters = blocks.reduce(
    (total, block) => {
      if (block.type === "list") return total + block.items.join("").length;
      return total + String(block.text || block.code || "").length;
    },
    0,
  );

  return blocks.length >= depth.blocks && characters >= depth.characters;
}

const RICH_CONTENT_INSTRUCTIONS = `
Return ONLY valid JSON with a "contentBlocks" array containing your blocks.
Allowed block types: "heading", "paragraph", "code", "list", "callout".
- heading: { "type": "heading", "level": 2 or 3, "text": "..." }
- paragraph: { "type": "paragraph", "text": "..." }
- code: { "type": "code", "codes": { "python": "...", "cpp": "...", "java": "..." } }
- list: { "type": "list", "style": "bullet" or "numbered", "items": ["item1", "item2"] }
- callout: { "type": "callout", "emoji": "💡", "title": "Key Insight", "text": "..." }
Use a rich mix of these types for an engaging lesson. 
CRITICAL RULE: DO NOT include "code" blocks UNLESS the course is specifically about Computer Science, Programming, or Software Engineering. If the course is about Physics, Mathematics, Biology, History, or general topics, ABSOLUTELY DO NOT generate code blocks. If you do generate code for a programming topic, use the requested language, or default to Python, C++, and Java.
Use callouts for key insights. Use lists for steps.
`.trim();

async function createLessonContent({ lesson, moduleDoc, course, depth, language }) {
  const size = LESSON_DEPTHS[depth] || LESSON_DEPTHS.standard;
  const instructions = `
Write a complete standalone lesson as JSON with a "contentBlocks" array.
${RICH_CONTENT_INSTRUCTIONS}
Write roughly ${size.words} words using substantial paragraphs and useful examples.
Teach the topic fully and end with a practical conclusion.
Write in ${language}. Do not include quizzes, markdown, or videos.
  `.trim();
  const context = `
Lesson: ${lesson.title}
Module: ${moduleDoc.title}
Course: ${course.title}
Course description: ${course.description || "Not provided"}
  `.trim();

  const validator = (result) => {
    const parsedBlocks = formatBlocks(result);
    if (!isCompleteLesson(parsedBlocks, size)) {
      const error = new Error("AI returned incomplete lesson content.");
      error.statusCode = 502;
      throw error;
    }
  };

  const blocks = formatBlocks(await generateJson(instructions, context, size.maxTokens, validator));

  return blocks;
}

async function createLessonContentLegacy(context) {
  // Keeping this for backwards compatibility if needed, but not actively used for new flow
  const { generateJson } = require("./aiRouter");
  const prompt = `Create a complete lesson. Use these blocks: ${JSON.stringify(LESSON_DEPTHS[context.depth])}`;
  
  const result = await generateJson(RICH_CONTENT_INSTRUCTIONS + "\n\n" + prompt, context.lesson.title, context.depth.maxTokens);
  return formatBlocks(result);
}

async function createLessonOutline(context) {
  const { generateJson } = require("./aiRouter");
  const prompt = `
Generate a structural outline for the lesson "${context.lesson.title}" in the module "${context.moduleDoc.title}" for the course "${context.course.title}".
Other lessons in this module include: ${context.otherLessons && context.otherLessons.length > 0 ? context.otherLessons.map(l => l.title).join(", ") : "None"}.
Make sure the outline is specifically tailored to THIS lesson and DOES NOT overlap with the other lessons in the module.
Return exactly a JSON object with an "outline" array containing 3 to 5 strings. 
Each string should be a logical heading for a section of the lesson.
The first string should be an introductory heading. The last string should be a concluding or summary heading.
Do not include quizzes in the outline.
Write the outline entirely in the language: ${context.language || context.course?.language || "English"}.
  `.trim();

  const result = await generateJson(
    "Return JSON like: { \"outline\": [\"Heading 1\", \"Heading 2\"] }",
    prompt,
    1000
  );
  return Array.isArray(result?.outline) ? result.outline : [];
}

async function createLessonChunk(context, heading, previousContext, language) {
  const { generateJson } = require("./aiRouter");
  
  const prompt = `
Write the main body content for the section titled "${heading}" in the lesson "${context.lesson.title}".
${previousContext ? `The student just read the previous section:\n"""\n${previousContext}\n"""\nContinue smoothly from there, but DO NOT repeat it.` : "This is the first section of the lesson. Write an engaging introduction."}
Use a rich mix of heading, paragraph, code, list, and callout blocks.
Start with a heading block for "${heading}".
Write in ${language || "English"}.
CRITICAL RULE: DO NOT include code blocks UNLESS the course is specifically about Computer Science or Programming. For Mathematics, Physics, Chemistry, etc., NEVER use code blocks.
  `.trim();

  const result = await generateJson(
    RICH_CONTENT_INSTRUCTIONS + "\n\n" + prompt,
    context.lesson.title,
    4500
  );
  return formatBlocks(result);
}

/**
 * Incrementally parse a JSON response looking for objects inside the
 * "contentBlocks" array. Calls \`onBlock(block)\` each time a complete
 * block object is extracted from the streaming text.
 *
 * Returns the full array of formatted blocks when the stream finishes.
 */
async function streamLessonContent({ lesson, moduleDoc, course, depth, language, onBlock, otherLessons }) {

  
  let outline = await createLessonOutline({ lesson, moduleDoc, course, otherLessons });
  
  if (!outline || outline.length === 0) {
    outline = ["Introduction", "Main Concepts", "Summary"];
  }

  // Deduplicate outline headings
  outline = [...new Set(outline.map(h => String(h).trim()))].filter(Boolean);

  let previousContextText = "";
  const allBlocks = [];
  
  for (const heading of outline) {
    const chunkBlocks = await createLessonChunk({ lesson }, heading, previousContextText, language);
    
    previousContextText = chunkBlocks
      .filter(b => b.type === "paragraph" || b.type === "heading")
      .map(b => b.text || "")
      .join(" ")
      .slice(-1500); 
      
    for (const block of chunkBlocks) {
      allBlocks.push(block);
      if (onBlock) onBlock(block);
    }
  }
  
  return allBlocks;
}


async function answerLessonQuestion({ lesson, moduleDoc, course, message, history }) {
  const { generateText } = require("./aiRouter");
  const recentHistory = (Array.isArray(history) ? history : []).slice(-6).map((item) => ({
    role: item?.role === "user" ? "user" : "assistant",
    content: String(item?.content || "").trim().slice(0, 1000),
  })).filter((item) => item.content);

  return generateText([
    {
      role: "system",
      content: `
You are a tutor for "${lesson.title}" in "${moduleDoc.title}" from "${course.title}".
Use this lesson when answering:
${lessonText(lesson, 2000) || "No detailed lesson content is available yet."}
Answer clearly and in the language of the course: ${course?.language || "English"}.
Lead with a direct answer, then add only the detail needed to teach it well.
Format longer answers with short Markdown paragraphs, bullets, or numbered steps.
Use fenced code blocks for code. Avoid oversized headings and long walls of text.
      `.trim(),
    },
    ...recentHistory,
    { role: "user", content: message },
  ]);
}

async function* answerLessonQuestionStream({ lesson, moduleDoc, course, message, history }) {
  const { generateTextStream } = require("./aiRouter");
  const recentHistory = (Array.isArray(history) ? history : []).slice(-6).map((item) => ({
    role: item?.role === "user" ? "user" : "assistant",
    content: String(item?.content || "").trim().slice(0, 1000),
  })).filter((item) => item.content);

  const stream = await generateTextStream([
    {
      role: "system",
      content: `
You are a tutor for "${lesson.title}" in "${moduleDoc.title}" from "${course.title}".
Use this lesson when answering:
${lessonText(lesson, 2000) || "No detailed lesson content is available yet."}
Answer clearly and in the language of the course: ${course?.language || "English"}.
Lead with a direct answer, then add only the detail needed to teach it well.
Format longer answers with short Markdown paragraphs, bullets, or numbered steps.
Use fenced code blocks for code. Avoid oversized headings and long walls of text.
      `.trim(),
    },
    ...recentHistory,
    { role: "user", content: message },
  ]);

  for await (const chunk of stream) {
    yield chunk;
  }
}

async function answerCourseQuestion({ course, message, currentLessonId, history }) {
  const { generateText } = require("./aiRouter");
  const recentHistory = (Array.isArray(history) ? history : []).slice(-6).map((item) => ({
    role: item?.role === "user" ? "user" : "assistant",
    content: String(item?.content || "").trim().slice(0, 1000),
  })).filter((item) => item.content);

  // Build the full course context
  let courseContext = `Course Title: ${course.title}\nDescription: ${course.description}\n\n`;
  course.modules.forEach((mod, mIdx) => {
    courseContext += `Module ${mIdx + 1}: ${mod.title}\n`;
    mod.lessons.forEach((l, lIdx) => {
      courseContext += `  Lesson ${lIdx + 1}: ${l.title}`;
      if (String(l._id) === String(currentLessonId)) {
        courseContext += ` (*** STUDENT IS CURRENTLY VIEWING THIS LESSON ***)`;
      }
      courseContext += `\n`;
      if (l.content && l.content.length > 0) {
        let lessonTextContent = '';
        l.content.forEach(block => {
           if (block.type === 'paragraph') lessonTextContent += block.text + '\n';
           else if (block.type === 'code') lessonTextContent += 'Code:\n' + (block.codes?.python || block.codes?.cpp || block.codes?.java || '') + '\n';
           else if (block.type === 'quiz' && Array.isArray(block.questions)) {
              lessonTextContent += `Knowledge Check Questions:\n`;
              block.questions.forEach((q, qIdx) => {
                 lessonTextContent += `Q${qIdx+1}: ${q.question}\nOptions:\n`;
                 q.options.forEach((opt, oIdx) => {
                   lessonTextContent += `  - ${opt}\n`;
                 });
                 lessonTextContent += `Correct Answer: ${q.options[q.correctAnswer]}\n`;
              });
           }
        });
        if (lessonTextContent) {
           if (String(l._id) === String(currentLessonId)) {
             courseContext += `    Content:\n    ${lessonTextContent.replace(/\n/g, '\n    ')}\n`;
           } else {
             courseContext += `    Content:\n    ${lessonTextContent.substring(0, 1500).replace(/\n/g, '\n    ')}...\n`;
           }
        }
      }
    });
  });

  // truncate overall context if it gets absurdly huge
  courseContext = courseContext.substring(0, 40000);

  return generateText([
    {
      role: "system",
      content: `
You are an expert AI tutor for the course "${course.title}".
You have access to the full course curriculum and the content of generated lessons below.
If the student asks a question, use this context to answer accurately. 
DO NOT regurgitate or output raw course content or markdown blocks. Be highly conversational, encouraging, and act like a human tutor. Provide concise, direct answers.
IMPORTANT: You MUST answer strictly in the following language: ${course.language || "English"}.
If the student just says "hello" or greets you, greet them back warmly and ask how you can help them with the course.

Course Context:
${courseContext}
      `.trim(),
    },
    ...recentHistory,
    { role: "user", content: message },
  ]);
}

module.exports = {
  createLessonContent,
  streamLessonContent,
  createLessonOutline,
  createLessonChunk,
  answerLessonQuestion,
  answerLessonQuestionStream,
  answerCourseQuestion,
  lessonText,
};
