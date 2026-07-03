const Course = require("../models/Course");
const { createCourseOutline } = require("../services/courseGeneration");
const { streamLessonContent, createLessonContent, answerLessonQuestion, answerLessonQuestionStream, createLessonIntro, createLessonMainContent } = require("../services/lessonGeneration");
const { saveGeneratedCourse } = require("../services/coursePersistence");
const { getOwnedLesson } = require("../services/lessonAccessService");
const { findLessonVideos } = require("../services/youtubeService");
const { createLessonFlashcards, createPracticeLab, createLessonQuiz } = require("../services/studyGeneration");
const { recordActivity } = require("../services/achievementsService");

const VALID_DEPTHS = new Set(["brief", "standard", "deep"]);

// Deliberately-thrown errors (statusCode < 500) carry a safe, user-facing
// message. Anything that surfaces as an unclassified 500 is an unexpected
// exception (DB driver, AI provider SDK, network) whose raw text shouldn't
// reach the client in production.
function safeErrorMessage(error, fallback) {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    return fallback;
  }
  return error.message || fallback;
}

async function generateCourseContent(req, res) {
  try {
    const prompt = String(req.body?.prompt || "").trim().slice(0, 2000);
    const language = String(req.body?.language || "English").trim().slice(0, 80);

    if (prompt.length < 10) {
      return res.status(400).json({ error: "Describe the course in at least 10 characters" });
    }

    const outline = await createCourseOutline(prompt, language);
    const course = await saveGeneratedCourse(outline, req.user._id, language);
    course.difficulty = outline.difficulty;
    course.skills = outline.skills;
    await course.save();

    return res.status(201).json(course);
  } catch (error) {
    console.error("Generate Course Error:", error);
    return res.status(error.statusCode || 500).json({ error: safeErrorMessage(error, "Failed to generate course") });
  }
}

async function generateCourseContentStream(req, res) {
  let closed = false;
  let headersWritten = false;

  function sendEvent(event, data) {
    if (closed) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  try {
    const prompt = String(req.body?.prompt || "").trim().slice(0, 2000);
    const language = String(req.body?.language || "English").trim().slice(0, 80);

    if (prompt.length < 10) {
      return res.status(400).json({ error: "Describe the course in at least 10 characters" });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    headersWritten = true;

    res.on("close", () => { closed = true; });

    sendEvent("stage", { stage: "analyzing_topic" });

    const outline = await createCourseOutline(prompt, language, (stage) => sendEvent("stage", { stage }));

    sendEvent("stage", { stage: "saving_course" });

    const course = await saveGeneratedCourse(outline, req.user._id, language);
    course.difficulty = outline.difficulty;
    course.skills = outline.skills;
    await course.save();

    sendEvent("stage", { stage: "ready" });
    sendEvent("done", course);
  } catch (error) {
    console.error("Generate Course Stream Error:", error);
    const message = safeErrorMessage(error, "Failed to generate course");
    if (!headersWritten) {
      return res.status(error.statusCode || 500).json({ error: message });
    }
    sendEvent("error", { error: message });
  } finally {
    if (!closed) res.end();
  }
}

async function enrichLesson(req, res) {
  try {
    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    const requestedDepth = String(req.body?.depth || "").trim().slice(0, 20);
    let depth = VALID_DEPTHS.has(requestedDepth) ? requestedDepth : "standard";
    const language = context.course.language || "English";

    // Adaptive Difficulty mechanic
    let adaptiveDifficulty = "Standard approach.";
    try {
      const User = require("../models/User");
      const user = await User.findById(req.user._id).select("activityHistory totalStudyMinutes").lean();
      if (user && user.totalStudyMinutes > 120) {
        adaptiveDifficulty = "User is experienced; increase technical depth and use advanced terminology.";
      } else {
        adaptiveDifficulty = "User is a beginner; use analogies and simplify complex concepts.";
      }
    } catch(e) { console.error(e) }

    const blocks = await createLessonContent({ ...context, depth, language, adaptiveDifficulty });
    
    context.lesson.content = blocks;

    // Fetch videos and quiz in parallel
    const [videosResult, questionsResult] = await Promise.allSettled([
      findLessonVideos(context),
      createLessonQuiz(context.lesson)
    ]);

    if (videosResult.status === "fulfilled" && videosResult.value && videosResult.value.length > 0) {
      context.lesson.videos = videosResult.value;
    }

    if (questionsResult.status === "fulfilled" && questionsResult.value) {
      blocks.push({
        type: 'quiz',
        title: 'Knowledge Check',
        questions: questionsResult.value
      });
    }

    if (!blocks || blocks.length === 0) {
      const error = new Error("AI failed to generate any lesson content.");
      error.statusCode = 502;
      throw error;
    }

    context.lesson.content = blocks;
    context.lesson.language = language;
    context.lesson.isEnriched = true;
    await context.lesson.save();

    return res.json(context.lesson.toObject({ depopulate: true }));
  } catch (error) {
    console.error("Enrich Lesson Error:", error);
    return res.status(error.statusCode || 500).json({ error: safeErrorMessage(error, "Failed to enrich lesson") });
  }
}

async function enrichLessonStream(req, res) {
  let closed = false;
  let headersWritten = false;

  function sendEvent(event, data) {
    if (closed) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  try {
    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    const requestedDepth = String(req.body?.depth || "").trim().slice(0, 20);
    const depth = VALID_DEPTHS.has(requestedDepth) ? requestedDepth : "standard";
    const language = context.course.language || "English";

    // Set up SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    headersWritten = true;

    res.on("close", () => { closed = true; });

    const Lesson = require("../models/Lesson");
    const siblingLessons = await Lesson.find({ 
      module: context.moduleDoc._id, 
      _id: { $ne: context.lesson._id } 
    }).select('title');

    // Adaptive Difficulty mechanic
    let adaptiveDifficulty = "Standard approach.";
    try {
      const User = require("../models/User");
      const user = await User.findById(req.user._id).select("activityHistory totalStudyMinutes").lean();
      if (user && user.totalStudyMinutes > 120) {
        adaptiveDifficulty = "User is experienced; increase technical depth and use advanced terminology.";
      } else {
        adaptiveDifficulty = "User is a beginner; use analogies and simplify complex concepts.";
      }
    } catch(e) { console.error(e) }

    const blocks = await streamLessonContent({
      ...context,
      otherLessons: siblingLessons,
      depth,
      language,
      adaptiveDifficulty,
      onToken: (token) => sendEvent("token", token),
      onBlock(block) {
        sendEvent("block", block);
      },
    });

    // Temporarily save text blocks to allow quiz generation to use them
    context.lesson.content = blocks;

    const [questionsResult, videosResult] = await Promise.allSettled([
      createLessonQuiz(context.lesson),
      findLessonVideos(context)
    ]);

    if (questionsResult.status === "fulfilled" && Array.isArray(questionsResult.value) && questionsResult.value.length > 0) {
      const quizBlock = {
        type: 'quiz',
        title: 'Knowledge Check',
        questions: questionsResult.value
      };
      blocks.push(quizBlock);
      sendEvent("block", quizBlock);
    }

    if (videosResult.status === "fulfilled" && videosResult.value && videosResult.value.length > 0) {
      context.lesson.videos = videosResult.value;
      sendEvent("videos", context.lesson.videos);
    }

    if (!blocks || blocks.length === 0) {
      const error = new Error("AI failed to generate any lesson content.");
      error.statusCode = 502;
      throw error;
    }

    // Save final enriched content to database
    context.lesson.content = blocks;
    context.lesson.language = language;
    context.lesson.isEnriched = true;
    await context.lesson.save();

    sendEvent("done", context.lesson.toObject({ depopulate: true }));
  } catch (error) {
    console.error("Enrich Lesson Stream Error:", error);
    const message = safeErrorMessage(error, "Failed to generate lesson content.");
    if (!headersWritten) {
      return res.status(error.statusCode || 500).json({ error: message });
    }
    sendEvent("error", { error: message });
  } finally {
    if (!closed) res.end();
  }
}

async function generateFlashcards(req, res) {
  try {
    const { lesson } = await getOwnedLesson(req.params.lessonId, req.user._id);
    const force = req.query.force === "true";

    if (!force && lesson.flashcards && lesson.flashcards.length > 0) {
      return res.json({ flashcards: lesson.flashcards });
    }

    const flashcards = await createLessonFlashcards(lesson);

    lesson.flashcards = flashcards;
    await lesson.save();

    await recordActivity(req.user._id, "GENERATED_FLASHCARDS", "Lesson", lesson._id, { title: lesson.title });

    return res.json({ flashcards });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: safeErrorMessage(error, "Failed to generate flashcards") });
  }
}

async function generatePracticeLab(req, res) {
  try {
    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    const force = req.query.force === "true";

    if (!force && context.lesson.practiceLab && context.lesson.practiceLab.title) {
      return res.json({ lab: context.lesson.practiceLab });
    }

    const lab = await createPracticeLab(context);

    context.lesson.practiceLab = lab;
    await context.lesson.save();

    return res.json({ lab });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: safeErrorMessage(error, "Failed to generate lab") });
  }
}

async function chatAboutLesson(req, res) {
  try {
    const message = String(req.body?.message || "").trim().slice(0, 2000);
    if (!message) return res.status(400).json({ error: "Message is required." });

    const context = await getOwnedLesson(req.params.lessonId, req.user._id);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    let closed = false;
    res.on("close", () => { closed = true; });

    function sendEvent(event, data) {
      if (closed) return;
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }

    if (!context.lesson.aiConversation) {
      context.lesson.aiConversation = [];
    }

    const historyForAi = [...context.lesson.aiConversation];

    const stream = await answerLessonQuestionStream({
      ...context,
      message,
      history: historyForAi,
    });

    let fullReply = "";

    for await (const chunk of stream) {
      if (closed) break; // Client disconnected
      if (chunk) {
        fullReply += chunk;
        sendEvent("token", chunk);
      }
    }

    if (closed) {
      // If the client disconnected, do not save partial response
      return;
    }

    if (!fullReply.trim()) {
      sendEvent("error", { error: "Invalid AI response." });
      res.end();
      return;
    }

    // Accumulate the full response on the server and save it
    context.lesson.aiConversation.push({
      role: 'user',
      content: message,
    });

    context.lesson.aiConversation.push({
      role: 'assistant',
      content: fullReply.trim(),
    });

    await context.lesson.save();
    
    sendEvent("done", { status: "complete" });
    res.end();

  } catch (error) {
    const message = safeErrorMessage(error, "Failed to chat");
    if (!res.headersSent) {
      return res.status(error.statusCode || 500).json({ error: message });
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
}

async function clearLessonChat(req, res) {
  try {
    const { lesson } = await getOwnedLesson(req.params.lessonId, req.user._id);

    lesson.aiConversation = [];
    await lesson.save();

    return res.json({ success: true });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: safeErrorMessage(error, "Failed to clear chat") });
  }
}

const { createLessonOutline, createLessonChunk, lessonText } = require("../services/lessonGeneration");

async function generateLessonOutline(req, res) {
  try {
    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    
    // Backward compatibility: If it's an old lesson that already has content, mark it as complete
    if (context.lesson.generationStatus === 'none' && context.lesson.content && context.lesson.content.length > 0) {
      context.lesson.generationStatus = 'complete';
      await context.lesson.save();
      return res.json(context.lesson.toObject({ depopulate: true }));
    }

    if (context.lesson.generationStatus !== 'none') {
       return res.json(context.lesson.toObject({ depopulate: true }));
    }

    const requestedDepth = String(req.body?.depth || "").trim().slice(0, 20);
    const depth = VALID_DEPTHS.has(requestedDepth) ? requestedDepth : "standard";
    const language = context.course.language || "English";
    
    const outline = await createLessonOutline({ ...context, depth, language });
    context.lesson.outline = outline.length > 0 ? outline : ["Introduction", "Main Concepts", "Conclusion"];
    context.lesson.currentChunkIndex = 0;
    context.lesson.language = language;
    context.lesson.generationStatus = 'outline';
    await context.lesson.save();
    return res.json(context.lesson.toObject({ depopulate: true }));
  } catch (err) {
    console.error("Outline generation error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate outline" });
  }
}

async function generateLessonChunk(req, res) {
  try {
    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    if (context.lesson.generationStatus === 'none') {
      return res.status(400).json({ error: "Outline must be generated first" });
    }
    
    if (context.lesson.generationStatus !== 'outline' && context.lesson.generationStatus !== 'chunks') {
      return res.json(context.lesson.toObject({ depopulate: true }));
    }

    const requestedDepth = String(req.body?.depth || "").trim().slice(0, 20);
    const depth = VALID_DEPTHS.has(requestedDepth) ? requestedDepth : "standard";
    const language = context.lesson.language || context.course.language || "English";
    
    const currentIndex = context.lesson.currentChunkIndex || 0;
    const outline = context.lesson.outline || [];
    
    if (currentIndex >= outline.length) {
      context.lesson.generationStatus = 'quiz';
      await context.lesson.save();
      return res.json(context.lesson.toObject({ depopulate: true }));
    }

    const currentHeading = outline[currentIndex];
    
    // Extract the previous chunk's text for context, if this is not the first chunk
    let previousContext = "";
    if (currentIndex > 0 && context.lesson.content.length > 0) {
      // Find the start of the previous chunk by going backwards until we hit a heading that matches outline[currentIndex - 1]
      // Or just take the last 1500 chars
      previousContext = lessonText(context.lesson, 1500);
    }

    const blocks = await createLessonChunk({ ...context, depth }, currentHeading, previousContext, language);
    
    // For the first chunk, maybe add videos
    if (currentIndex === 0) {
      try {
        const videos = await findLessonVideos(context);
        if (videos && videos.length > 0) {
          blocks.splice(Math.floor(blocks.length / 2), 0, ...videos);
        }
      } catch (e) {
        console.warn("Failed to find videos", e);
      }
    }

    context.lesson.content.push(...blocks);
    context.lesson.markModified('content');
    context.lesson.currentChunkIndex = currentIndex + 1;
    
    if (context.lesson.currentChunkIndex >= outline.length) {
      context.lesson.generationStatus = 'quiz';
    } else {
      context.lesson.generationStatus = 'chunks';
    }
    
    await context.lesson.save();
    return res.json(context.lesson.toObject({ depopulate: true }));
  } catch (err) {
    console.error("Chunk generation error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate chunk" });
  }
}

async function generateLessonQuizChunk(req, res) {
  try {
    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    if (context.lesson.generationStatus !== 'quiz' && context.lesson.generationStatus !== 'content') {
       return res.status(400).json({ error: "Content must be generated first" });
    }
    if (context.lesson.generationStatus === 'complete' || context.lesson.isEnriched) {
       return res.json(context.lesson.toObject({ depopulate: true }));
    }

    const questions = await createLessonQuiz(context.lesson);
    if (questions && questions.length > 0) {
      context.lesson.content.push({
        type: 'quiz',
        title: 'Knowledge Check',
        questions: questions
      });
      context.lesson.markModified('content');
    }

    context.lesson.generationStatus = 'complete';
    context.lesson.isEnriched = true;
    await context.lesson.save();
    return res.json(context.lesson.toObject({ depopulate: true }));
  } catch (err) {
    console.error("Quiz generation error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate quiz" });
  }
}

async function chatAboutCourse(req, res) {
  try {
    const message = String(req.body?.message || "").trim().slice(0, 2000);
    const currentLessonId = req.body?.currentLessonId;
    if (!message) return res.status(400).json({ error: "Message is required." });

    const course = await Course.findOne({ _id: req.params.courseId, creator: req.user._id }).populate({
      path: "modules",
      populate: {
        path: "lessons"
      }
    });

    if (!course) return res.status(404).json({ error: "Course not found." });
    if (String(course.creator) !== String(req.user._id)) return res.status(403).json({ error: "Forbidden." });

    const { answerCourseQuestion } = require("../services/lessonGeneration");
    const reply = await answerCourseQuestion({
      course,
      message,
      currentLessonId,
      history: Array.isArray(req.body?.history) ? req.body.history : [],
    });

    return res.json({ reply });
  } catch (error) {
    console.error("Course chat error:", error);
    return res.status(500).json({ error: "Failed to process chat" });
  }
}

async function addVideosToLesson(req, res) {
  try {
    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    
    // Find videos using youtubeService
    const videos = await findLessonVideos(context);
    
    if (videos && videos.length > 0) {
      if (!context.lesson.videos) context.lesson.videos = [];
      const existingUrls = new Set(context.lesson.videos.map(v => v.url));
      
      const newVideos = videos.filter(v => !existingUrls.has(v.url));
      if (newVideos.length > 0) {
        context.lesson.videos.push(...newVideos);
        await context.lesson.save();
      }
    }
    
    return res.json({ lesson: context.lesson, videos });
  } catch (error) {
    console.error("Add Videos Error:", error);
    return res.status(error.statusCode || 500).json({ error: safeErrorMessage(error, "Failed to add videos") });
  }
}

module.exports = {
  generateCourseContent,
  generateCourseContentStream,
  enrichLesson,
  enrichLessonStream,
  generateFlashcards,
  generatePracticeLab,
  chatAboutLesson,
  clearLessonChat,
  chatAboutCourse,
  generateLessonOutline,
  generateLessonChunk,
  generateLessonQuizChunk,
  addVideosToLesson
};
