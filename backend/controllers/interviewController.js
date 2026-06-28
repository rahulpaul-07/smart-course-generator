const mongoose = require("mongoose");
const InterviewPrep = require("../models/InterviewPrep");
const aiRouter = require("../services/aiRouter");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateInterviewPack = async (result) => {
  if (!result || typeof result !== 'object') throw new Error("Invalid object");
  
  if (!Array.isArray(result.mcqs) || result.mcqs.length === 0) throw new Error("Missing MCQs");
  if (!Array.isArray(result.theoryQuestions) || result.theoryQuestions.length === 0) throw new Error("Missing theory questions");
  if (!Array.isArray(result.codingQuestions) || result.codingQuestions.length === 0) throw new Error("Missing coding questions");
  
  const questions = new Set();
  
  for (const q of result.mcqs) {
    if (!q.question || !Array.isArray(q.options) || q.options.length < 2) throw new Error("Malformed MCQ");
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) throw new Error("Invalid correct answer");
    for (const opt of q.options) {
      if (!opt || typeof opt !== 'string') throw new Error("Missing options");
    }
    if (questions.has(q.question)) throw new Error("Duplicate question");
    questions.add(q.question);
  }
  
  for (const q of result.theoryQuestions) {
    if (!q.question || !q.idealAnswer) throw new Error("Malformed theory question");
    if (questions.has(q.question)) throw new Error("Duplicate question");
    questions.add(q.question);
  }
  
  for (const q of result.codingQuestions) {
    if (!q.title || !q.problemStatement) throw new Error("Malformed coding question");
    if (questions.has(q.title)) throw new Error("Duplicate question");
    questions.add(q.title);
  }
};

/**
 * POST /api/interviews/generate
 * Generates a complete interview preparation package.
 */
async function generateInterview(req, res) {
  try {
    const rawTopic = String(req.body.topic || "");
    const topic = rawTopic.replace(/[^\w\s.,+-]/gi, '').trim().slice(0, 300);

    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const systemPrompt = `You are a senior technical interviewer. Generate a complete interview preparation package as JSON.
The response must be valid JSON matching this exact schema:
{
  "mcqs": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ],
  "theoryQuestions": [
    {
      "question": "Explain concept X",
      "idealAnswer": "A comprehensive answer..."
    }
  ],
  "codingQuestions": [
    {
      "title": "Problem title",
      "problemStatement": "Write a function that...",
      "constraints": "Input constraints",
      "starterCode": "function solve(input) {\\n  // your code\\n}",
      "solutionHint": "Consider using..."
    }
  ],
  "mockQuestions": [
    "Tell me about your experience with X",
    "How would you design Y?"
  ]
}
Rules:
- Generate exactly 5 MCQs covering breadth of the topic.
- Generate exactly 3 theory questions requiring deep understanding.
- Generate exactly 2 coding challenges of increasing difficulty.
- Generate exactly 3 mock interview behavioral/system design questions.
- All questions should be interview-grade difficulty.`;

    const userPrompt = `Generate a complete interview preparation package for the topic: "${topic}"

Include:
- 5 multiple-choice questions
- 3 theory/explanation questions  
- 2 coding challenges
- 3 mock interview questions

Make questions progressively harder.`;

    const courseId = req.body.courseId || null;

    let result;
    try {
      result = await aiRouter.generateJson(systemPrompt, userPrompt, 8192, validateInterviewPack);
    } catch (error) {
      console.error("AI Generation Error:", error);
      return res.status(502).json({ error: "The AI generated an invalid interview pack. Please try again." });
    }

    // Normalize MCQs
    const mcqs = (Array.isArray(result.mcqs) ? result.mcqs : []).map(q => ({
      question: String(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctAnswer: Number(q.correctAnswer) || 0,
      explanation: String(q.explanation || ""),
      userAnswer: -1,
    })).filter(q => q.question && q.options.length >= 2);

    // Normalize theory questions
    const theoryQuestions = (Array.isArray(result.theoryQuestions) ? result.theoryQuestions : []).map(q => ({
      question: String(q.question || ""),
      idealAnswer: String(q.idealAnswer || ""),
      userAnswer: "",
      feedback: "",
      score: 0,
    })).filter(q => q.question);

    // Normalize coding questions
    const codingQuestions = (Array.isArray(result.codingQuestions) ? result.codingQuestions : []).map(q => ({
      title: String(q.title || ""),
      problemStatement: String(q.problemStatement || ""),
      constraints: String(q.constraints || ""),
      starterCode: String(q.starterCode || ""),
      solutionHint: String(q.solutionHint || ""),
      userSolution: "",
      feedback: "",
      passed: false,
    })).filter(q => q.title && q.problemStatement);

    // Save mock questions as initial interviewer chat messages
    const mockChat = (Array.isArray(result.mockQuestions) ? result.mockQuestions : []).map(q => ({
      role: "interviewer",
      content: String(q),
    }));

    const prep = await InterviewPrep.create({
      user: req.user._id,
      course: courseId || null,
      topic,
      mcqs,
      theoryQuestions,
      codingQuestions,
      mockChat,
      status: "pending",
    });

    return res.status(201).json(prep);
  } catch (error) {
    console.error("Generate interview error:", error);
    return res.status(500).json({ error: "Failed to generate interview pack. Please try again." });
  }
}

/**
 * GET /api/interviews/mine
 */
async function getMyInterviews(req, res) {
  try {
    const preps = await InterviewPrep.find({ user: req.user._id })
      .select("topic status overallScore createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json(preps);
  } catch (error) {
    console.error("Get interviews error:", error);
    return res.status(500).json({ error: "Failed to load interview preps" });
  }
}

/**
 * GET /api/interviews/:id
 */
async function getInterviewById(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid interview id." });
    }
    const prep = await InterviewPrep.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!prep) return res.status(404).json({ error: "Interview prep not found" });
    return res.json(prep);
  } catch (error) {
    console.error("Get interview error:", error);
    return res.status(500).json({ error: "Failed to load interview prep" });
  }
}

/**
 * POST /api/interviews/:id/submit
 * Evaluates user answers and generates scorecard.
 */
async function submitInterview(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid interview id." });
    }
    const prep = await InterviewPrep.findOne({ _id: req.params.id, user: req.user._id });
    if (!prep) return res.status(404).json({ error: "Interview prep not found" });

    const { mcqAnswers, theoryAnswers, codingSolutions } = req.body;

    // Score MCQs
    let mcqCorrect = 0;
    if (Array.isArray(mcqAnswers)) {
      for (let i = 0; i < prep.mcqs.length; i++) {
        if (mcqAnswers[i] !== undefined) {
          prep.mcqs[i].userAnswer = Number(mcqAnswers[i]);
          if (prep.mcqs[i].userAnswer === prep.mcqs[i].correctAnswer) {
            mcqCorrect++;
          }
        }
      }
    }

    // Save theory answers
    if (Array.isArray(theoryAnswers)) {
      for (let i = 0; i < prep.theoryQuestions.length; i++) {
        if (theoryAnswers[i]) {
          prep.theoryQuestions[i].userAnswer = String(theoryAnswers[i]);
        }
      }
    }

    // Save coding solutions
    if (Array.isArray(codingSolutions)) {
      for (let i = 0; i < prep.codingQuestions.length; i++) {
        if (codingSolutions[i]) {
          prep.codingQuestions[i].userSolution = String(codingSolutions[i]);
        }
      }
    }

    // Use AI to evaluate theory answers
    const answeredTheory = prep.theoryQuestions.filter(q => q.userAnswer);
    if (answeredTheory.length > 0) {
      try {
        const evalPrompt = `Evaluate these interview answers. Return a JSON array.
Each element: { "index": 0, "score": 7, "feedback": "Good explanation but..." }
Score is 1-10.

Questions and Answers:
${answeredTheory.map((q, i) => `Q${i+1}: ${q.question}\nAnswer: ${q.userAnswer}\nIdeal: ${q.idealAnswer}`).join("\n\n")}`;

        const evalResult = await aiRouter.generateJson(
          "You are an interview evaluator. Return only a JSON array of evaluations.",
          evalPrompt,
          2048
        );

        const evals = Array.isArray(evalResult) ? evalResult : (evalResult.evaluations || []);
        for (const ev of evals) {
          const idx = Number(ev.index);
          if (idx >= 0 && idx < prep.theoryQuestions.length) {
            prep.theoryQuestions[idx].score = Math.min(10, Math.max(0, Number(ev.score) || 0));
            prep.theoryQuestions[idx].feedback = String(ev.feedback || "");
          }
        }
      } catch (evalErr) {
        console.warn("Theory evaluation failed:", evalErr.message);
        for (const q of prep.theoryQuestions) {
          if (q.userAnswer && !q.feedback) {
            q.score = 0;
            q.feedback = "Not Evaluated";
          }
        }
      }
    }

    // Use AI to evaluate coding solutions
    const answeredCoding = prep.codingQuestions.filter(q => q.userSolution);
    if (answeredCoding.length > 0) {
      try {
        const codingEvalPrompt = `Evaluate these coding solutions for an interview. Return a JSON array.
Each element MUST match this EXACT schema:
{ "index": 0, "score": 8, "correctness": "Good", "timeComplexityFeedback": "O(N)", "spaceComplexityFeedback": "O(1)", "codeQualityFeedback": "Clean", "improvements": "Extract function" }
Score is 1-10.

Questions and Solutions:
${answeredCoding.map((q, i) => `Q${i+1}: ${q.problemStatement}\nConstraints: ${q.constraints}\nSolution: ${q.userSolution}`).join("\n\n")}`;

        const codingEvalResult = await aiRouter.generateJson(
          "You are a technical interviewer evaluating code. Return only a JSON array of evaluations.",
          codingEvalPrompt,
          2048
        );

        const evals = Array.isArray(codingEvalResult) ? codingEvalResult : (codingEvalResult.evaluations || []);
        for (const ev of evals) {
          const idx = Number(ev.index);
          if (idx >= 0 && idx < prep.codingQuestions.length) {
            prep.codingQuestions[idx].score = Math.min(10, Math.max(0, Number(ev.score) || 0));
            prep.codingQuestions[idx].feedback = `Correctness: ${ev.correctness || ""}\nTime Complexity: ${ev.timeComplexityFeedback || ""}\nSpace Complexity: ${ev.spaceComplexityFeedback || ""}\nCode Quality: ${ev.codeQualityFeedback || ""}\nImprovements: ${ev.improvements || ""}`;
            prep.codingQuestions[idx].passed = prep.codingQuestions[idx].score >= 7;
          }
        }
      } catch (evalErr) {
        console.warn("Coding evaluation failed:", evalErr.message);
        for (const q of prep.codingQuestions) {
          if (q.userSolution && !q.feedback) {
            q.score = 0;
            q.feedback = "Not Evaluated";
            q.passed = false;
          }
        }
      }
    }

    // Calculate overall score
    const mcqScore = prep.mcqs.length > 0 ? (mcqCorrect / prep.mcqs.length) * 100 : 0;
    const theoryScore = prep.theoryQuestions.length > 0
      ? (prep.theoryQuestions.reduce((s, q) => s + (q.score || 0), 0) / (prep.theoryQuestions.length * 10)) * 100
      : 0;
    const codingScore = prep.codingQuestions.length > 0
      ? (prep.codingQuestions.reduce((s, q) => s + (q.score || 0), 0) / (prep.codingQuestions.length * 10)) * 100
      : 0;

    prep.overallScore = Math.round((mcqScore * 0.3) + (theoryScore * 0.4) + (codingScore * 0.3));

    // Generate overall evaluation
    try {
      const overallPrompt = `Evaluate this complete interview performance and return ONLY a JSON object.
Schema:
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendedTopics": ["string"],
  "readiness": "Interview Ready | Almost Ready | Needs More Practice",
  "summary": "string",
  "communicationFeedback": "string",
  "technicalFeedback": "string",
  "problemSolvingFeedback": "string",
  "nextSteps": ["string"]
}

Topic: ${prep.topic}
MCQ Score: ${Math.round(mcqScore)}%
Theory Score: ${Math.round(theoryScore)}%
Coding Score: ${Math.round(codingScore)}%

Analyze: correctness, communication, technical depth, optimization, edge cases, confidence, explanation quality, code quality.`;

      const evalResult = await aiRouter.generateJson(
        "You are an expert technical interviewer. Return ONLY valid JSON.",
        overallPrompt,
        2048
      );

      if (!evalResult.strengths || !evalResult.weaknesses || !evalResult.recommendedTopics || !evalResult.readiness || !evalResult.summary) {
        return res.status(502).json({ error: "The AI generated an invalid interview evaluation." });
      }

      prep.strengths = evalResult.strengths;
      prep.weaknesses = evalResult.weaknesses;
      prep.recommendedTopics = evalResult.recommendedTopics;
      prep.readiness = evalResult.readiness;
      prep.summary = evalResult.summary;
      prep.communicationFeedback = evalResult.communicationFeedback || "Not Evaluated";
      prep.technicalFeedback = evalResult.technicalFeedback || "Not Evaluated";
      prep.problemSolvingFeedback = evalResult.problemSolvingFeedback || "Not Evaluated";
      prep.nextSteps = evalResult.nextSteps || [];
    } catch (err) {
      console.error("Overall evaluation failed:", err.message);
      return res.status(502).json({ error: "The AI generated an invalid interview evaluation." });
    }

    prep.status = "completed";
    await prep.save();

    return res.json({
      overallScore: prep.overallScore,
      mcqScore: Math.round(mcqScore),
      mcqCorrect,
      mcqTotal: prep.mcqs.length,
      theoryScore: Math.round(theoryScore),
      theoryQuestions: prep.theoryQuestions,
      mcqs: prep.mcqs,
      codingQuestions: prep.codingQuestions,
      strengths: prep.strengths,
      weaknesses: prep.weaknesses,
      recommendedTopics: prep.recommendedTopics,
      readiness: prep.readiness,
      summary: prep.summary,
      communicationFeedback: prep.communicationFeedback,
      technicalFeedback: prep.technicalFeedback,
      problemSolvingFeedback: prep.problemSolvingFeedback,
      nextSteps: prep.nextSteps
    });
  } catch (error) {
    console.error("Submit interview error:", error);
    return res.status(500).json({ error: "Failed to evaluate interview" });
  }
}

/**
 * POST /api/interviews/:id/chat
 * Stateful mock interview conversation.
 */
async function chatInterview(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid interview id." });
    }
    const prep = await InterviewPrep.findOne({ _id: req.params.id, user: req.user._id });
    if (!prep) return res.status(404).json({ error: "Interview prep not found" });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    prep.mockChat.push({ role: "candidate", content: String(message) });

    const chatHistory = prep.mockChat.map(m => ({
      role: m.role === "interviewer" ? "assistant" : "user",
      content: m.content,
    }));

    const systemMsg = `You are a senior technical interviewer conducting a mock interview about "${prep.topic}".
Be professional but challenging. Ask follow-up questions based on the candidate's answers.
Probe for depth of understanding. Keep responses concise (2-4 sentences).
If the candidate has answered enough questions, provide brief feedback on their performance.`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let isAborted = false;
    req.on('close', () => {
      isAborted = true;
    });

    let fullReply = "";
    try {
      const stream = await aiRouter.generateTextStream([
        { role: "system", content: systemMsg },
        ...chatHistory,
      ], 512);

      for await (const chunk of stream) {
        if (isAborted) break;
        fullReply += chunk;
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    } catch (streamErr) {
      console.error("Stream generation failed:", streamErr);
      if (!isAborted) {
        res.write(`data: ${JSON.stringify({ error: streamErr.message || "Failed to generate response." })}\n\n`);
      }
      return res.end();
    }

    if (!isAborted && fullReply.trim()) {
      prep.mockChat.push({ role: "interviewer", content: fullReply.trim() });
      await prep.save();
    }

    if (!isAborted) {
      res.write(`data: [DONE]\n\n`);
    }
    res.end();
  } catch (error) {
    console.error("Interview chat error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to process interview chat" });
    }
    res.end();
  }
}

/**
 * DELETE /api/interviews/:id
 */
async function deleteInterview(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid interview id." });
    }
    const result = await InterviewPrep.deleteOne({ _id: req.params.id, user: req.user._id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Interview prep not found" });
    return res.json({ message: "Interview prep deleted" });
  } catch (error) {
    console.error("Delete interview error:", error);
    return res.status(500).json({ error: "Failed to delete interview prep" });
  }
}

module.exports = { generateInterview, getMyInterviews, getInterviewById, submitInterview, chatInterview, deleteInterview };
