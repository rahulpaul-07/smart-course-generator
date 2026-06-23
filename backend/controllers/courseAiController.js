const Course = require("../models/Course");
const { createCourseOutline } = require("../services/courseGeneration");
const { streamLessonContent, createLessonContent, answerLessonQuestion, createLessonIntro, createLessonMainContent } = require("../services/lessonGeneration");
const { saveGeneratedCourse } = require("../services/coursePersistence");
const { getOwnedLesson } = require("../services/lessonAccessService");
const { findLessonVideos } = require("../services/youtubeService");
const { createLessonFlashcards, createPracticeLab, createLessonQuiz } = require("../services/studyGeneration");
const { recordActivity } = require("../services/achievementsService");

const VALID_DEPTHS = new Set(["brief", "standard", "deep"]);

async function generateCourseContent(req, res) {
  try {
    const prompt = String(req.body?.prompt || "").trim().slice(0, 2000);
    const language = String(req.body?.language || "English").trim().slice(0, 80);

    if (prompt.length < 10) {
      return res.status(400).json({ error: "Describe the course in at least 10 characters" });
    }

    const outline = await createCourseOutline(prompt, language);
    const course = await saveGeneratedCourse(outline, req.user._id, language);

    return res.status(201).json(course);
  } catch (error) {
    console.error("Generate Course Error:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Failed to generate course" });
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

    if (videosResult.status === "fulfilled" && videosResult.value) {
      blocks.splice(Math.floor(blocks.length / 2), 0, ...videosResult.value);
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
    return res.status(error.statusCode || 500).json({ error: error.message || "Failed to enrich lesson" });
  }
}

async function enrichLessonStream(req, res) {
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

  let closed = false;
  res.on("close", () => { closed = true; });

  function sendEvent(event, data) {
    if (closed) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  try {
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

    const questionsResult = await createLessonQuiz(context.lesson);

    if (Array.isArray(questionsResult) && questionsResult.length > 0) {
      const quizBlock = {
        type: 'quiz',
        title: 'Knowledge Check',
        questions: questionsResult
      };
      blocks.push(quizBlock);
      sendEvent("block", quizBlock);
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
    sendEvent("error", {
      error: error.message || "Failed to generate lesson content.",
    });
  } finally {
    if (!closed) res.end();
  }
}

async function generateFlashcards(req, res) {
  try {
    const { lesson } = await getOwnedLesson(req.params.lessonId, req.user._id);
    const flashcards = await createLessonFlashcards(lesson);

    await recordActivity(req.user._id, "GENERATED_FLASHCARDS", "Lesson", lesson._id, { title: lesson.title });

    return res.json({ flashcards });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || "Failed to generate flashcards" });
  }
}

async function generatePracticeLab(req, res) {
  try {
    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    const lab = await createPracticeLab(context);

    return res.json({ lab });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || "Failed to generate lab" });
  }
}

async function chatAboutLesson(req, res) {
  try {
    const message = String(req.body?.message || "").trim().slice(0, 2000);
    if (!message) return res.status(400).json({ error: "Message is required." });

    const context = await getOwnedLesson(req.params.lessonId, req.user._id);
    const reply = await answerLessonQuestion({
      ...context,
      message,
      history: Array.isArray(req.body?.history) ? req.body.history : [],
    });

    return res.json({ reply });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || "Failed to chat" });
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

    const course = await Course.findById(req.params.courseId).populate({
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
      // Append videos to the end of the content array
      if (!context.lesson.content) context.lesson.content = [];
      context.lesson.content.push(...videos);
      
      await context.course.save();
    }
    
    return res.json({ lesson: context.lesson, videos });
  } catch (error) {
    console.error("Add Videos Error:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Failed to add videos" });
  }
}

module.exports = {
  generateCourseContent,
  enrichLesson,
  enrichLessonStream,
  generateFlashcards,
  generatePracticeLab,
  chatAboutLesson,
  chatAboutCourse,
  generateLessonOutline,
  generateLessonChunk,
  generateLessonQuizChunk,
  addVideosToLesson
};
