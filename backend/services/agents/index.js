const aiRouter = require("../aiRouter");

/**
 * Custom Multi-Agent AI Framework
 * Lightweight framework utilizing aiRouter to orchestrate distinct AI personas.
 */

// Course Reviewer Agent: Reviews course outlines or content for quality, bias, and technical accuracy.
async function courseReviewerAgent(courseContent, userContext) {
  const systemPrompt = `You are the Course Reviewer Agent. Your goal is to evaluate course content for technical accuracy, pedagogy, and engagement. Return a JSON object:
{
  "rating": 8.5,
  "strengths": ["Clear explanation of X", "Good examples"],
  "weaknesses": ["Lacks depth on Y"],
  "suggestedImprovements": ["Add a quiz on Z"]
}`;
  const userPrompt = `Review this course content for user context [${JSON.stringify(userContext)}]:\n\n${JSON.stringify(courseContent)}`;
  
  return await aiRouter.generateJson(systemPrompt, userPrompt, 1024);
}

// Learning Coach Agent: Provides motivational and strategic advice to the learner.
async function learningCoachAgent(userActivity, recentScores) {
  const systemPrompt = `You are the Learning Coach Agent. Provide personalized, motivational coaching based on the user's activity and scores. Return a JSON object:
{
  "greeting": "Hey there! Great job keeping up the streak.",
  "analysis": "I noticed you struggled with closures.",
  "actionableAdvice": ["Review module 3", "Try the practice lab on scopes"],
  "encouragement": "You're making solid progress, keep it up!"
}`;
  const userPrompt = `Activity: ${JSON.stringify(userActivity)}\nRecent Scores: ${JSON.stringify(recentScores)}`;

  return await aiRouter.generateJson(systemPrompt, userPrompt, 512);
}

// Revision Planner Agent: Generates a spaced repetition schedule.
async function revisionPlannerAgent(weakTopics, upcomingGoals) {
  const systemPrompt = `You are the Revision Planner Agent. Based on weak topics and goals, create a structured revision plan. Return a JSON object:
{
  "planName": "Weekly Deep Dive",
  "schedule": [
    { "day": "Monday", "topic": "Closures", "method": "Flashcards" },
    { "day": "Wednesday", "topic": "Promises", "method": "Practice Lab" }
  ]
}`;
  const userPrompt = `Weak Topics: ${JSON.stringify(weakTopics)}\nUpcoming Goals: ${JSON.stringify(upcomingGoals)}`;

  return await aiRouter.generateJson(systemPrompt, userPrompt, 1024);
}

// Recommendation Agent: Suggests new courses or topics based on history.
async function recommendationAgent(completedCourses, interests) {
  const systemPrompt = `You are the Recommendation Agent. Suggest 3 highly relevant topics or course concepts the user should learn next. Return a JSON object:
{
  "recommendations": [
    { "topic": "Advanced React Patterns", "reason": "Builds on your React basics course." }
  ]
}`;
  const userPrompt = `Completed: ${JSON.stringify(completedCourses)}\nInterests: ${JSON.stringify(interests)}`;

  return await aiRouter.generateJson(systemPrompt, userPrompt, 512);
}

module.exports = {
  courseReviewerAgent,
  learningCoachAgent,
  revisionPlannerAgent,
  recommendationAgent
};
