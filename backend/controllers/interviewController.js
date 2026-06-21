const InterviewPrep = require("../models/InterviewPrep");
const aiRouter = require("../services/aiRouter");

/**
 * POST /api/interviews/generate
 * Generates a complete interview preparation package.
 */
async function generateInterview(req, res) {
  try {
    const { topic, courseId } = req.body;

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

    const result = await aiRouter.generateJson(systemPrompt, userPrompt, 8192);

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
        console.warn("Theory evaluation failed, using basic scoring:", evalErr.message);
        for (const q of prep.theoryQuestions) {
          if (q.userAnswer) {
            q.score = q.userAnswer.length > 50 ? 6 : 4;
            q.feedback = "AI evaluation unavailable. Basic score assigned based on response length.";
          }
        }
      }
    }

    // Calculate overall score
    const mcqScore = prep.mcqs.length > 0 ? (mcqCorrect / prep.mcqs.length) * 100 : 0;
    const theoryScore = prep.theoryQuestions.length > 0
      ? (prep.theoryQuestions.reduce((s, q) => s + q.score, 0) / (prep.theoryQuestions.length * 10)) * 100
      : 0;

    prep.overallScore = Math.round((mcqScore * 0.4) + (theoryScore * 0.6));
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
    const prep = await InterviewPrep.findOne({ _id: req.params.id, user: req.user._id });
    if (!prep) return res.status(404).json({ error: "Interview prep not found" });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Add candidate message
    prep.mockChat.push({ role: "candidate", content: String(message) });

    // Generate interviewer response
    const chatHistory = prep.mockChat.map(m => ({
      role: m.role === "interviewer" ? "system" : "user",
      content: m.content,
    }));

    const systemMsg = `You are a senior technical interviewer conducting a mock interview about "${prep.topic}".
Be professional but challenging. Ask follow-up questions based on the candidate's answers.
Probe for depth of understanding. Keep responses concise (2-4 sentences).
If the candidate has answered enough questions, provide brief feedback on their performance.`;

    const reply = await aiRouter.generateText([
      { role: "system", content: systemMsg },
      ...chatHistory,
    ], 512);

    prep.mockChat.push({ role: "interviewer", content: reply });
    await prep.save();

    return res.json({ reply, chatHistory: prep.mockChat });
  } catch (error) {
    console.error("Interview chat error:", error);
    return res.status(500).json({ error: "Failed to process interview chat" });
  }
}

/**
 * DELETE /api/interviews/:id
 */
async function deleteInterview(req, res) {
  try {
    const result = await InterviewPrep.deleteOne({ _id: req.params.id, user: req.user._id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Interview prep not found" });
    return res.json({ message: "Interview prep deleted" });
  } catch (error) {
    console.error("Delete interview error:", error);
    return res.status(500).json({ error: "Failed to delete interview prep" });
  }
}

module.exports = { generateInterview, getMyInterviews, getInterviewById, submitInterview, chatInterview, deleteInterview };
