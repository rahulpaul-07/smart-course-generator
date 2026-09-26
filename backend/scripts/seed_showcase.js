/**
 * Idempotent showcase data: one public creator and a few featured community
 * courses with real, hand-written lesson content. Used by `npm run dev:memory`
 * and as the template that demo accounts are cloned from.
 *
 *   node scripts/seed_showcase.js      (uses MONGO_URI from .env)
 *
 * Counters (upvotes, clones) start at zero -- this seeds content, not fake
 * social proof.
 */
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

const SHOWCASE_EMAIL = "showcase@courseai.local";

const quiz = (questions) => ({ type: "quiz", title: "Knowledge Check", questions });

const COURSES = [
  {
    title: "Asynchronous JavaScript, From Callbacks to Async Iterators",
    description: "How the event loop actually schedules work, and how to write concurrent code that stays readable and correct.",
    difficulty: "Intermediate",
    skills: ["Event loop", "Promises", "async/await", "Concurrency control", "Error handling"],
    modules: [
      {
        title: "How JavaScript Schedules Work",
        lessons: [
          {
            title: "The Event Loop, Macrotasks and Microtasks",
            content: [
              { type: "paragraph", text: "JavaScript runs your code on a **single thread**, yet a browser tab can fetch data, animate, and respond to clicks at once. The trick is that the engine never waits: slow work is handed to the host (the browser or Node's libuv), and the *event loop* decides when the resulting callbacks run." },
              { type: "heading", level: 2, text: "Two queues, one rule" },
              { type: "paragraph", text: "Callbacks wait in one of two places. **Macrotasks** (timers, I/O, UI events) run one per loop turn. **Microtasks** (promise reactions, `queueMicrotask`) run *all at once*, immediately after the current task finishes and before the next macrotask starts." },
              { type: "code", language: "javascript", code: "console.log('1: sync');\n\nsetTimeout(() => console.log('4: macrotask'), 0);\n\nPromise.resolve().then(() => console.log('3: microtask'));\n\nconsole.log('2: sync');\n// 1: sync, 2: sync, 3: microtask, 4: macrotask" },
              { type: "callout", calloutType: "tip", title: "Why this matters", text: "A zero-delay setTimeout is not 'run next'. Every pending promise reaction goes first, so a long chain of microtasks can starve rendering and timers." },
              { type: "list", style: "numbered", items: ["Run the current script or task to completion.", "Drain the entire microtask queue, including microtasks queued along the way.", "Let the browser render if a frame is due.", "Take the next macrotask and repeat."] },
              quiz([
                { question: "What runs first after synchronous code finishes?", options: ["setTimeout(fn, 0)", "A resolved promise's .then callback", "requestAnimationFrame", "A click handler"], correctAnswer: 1, explanation: "Promise reactions are microtasks, and the microtask queue is drained before the next macrotask such as a timer." },
                { question: "Why can an endless chain of microtasks freeze the page?", options: ["Microtasks run on a separate thread", "The loop drains every microtask before rendering or running timers", "Browsers cap microtasks at 100", "Microtasks block network requests"], correctAnswer: 1, explanation: "The loop will not move on to rendering or macrotasks until the microtask queue is empty." },
                { question: "Which API queues a macrotask?", options: ["queueMicrotask", "Promise.then", "setTimeout", "await"], correctAnswer: 2, explanation: "Timers are macrotasks. The other three schedule microtasks." },
                { question: "Is JavaScript execution multi-threaded by default?", options: ["Yes, each callback gets a thread", "No, your code runs on one thread and the host does the waiting", "Only in Node.js", "Only inside async functions"], correctAnswer: 1, explanation: "Your code runs on one thread. I/O and timers are handled by the host, which queues callbacks." },
                { question: "In what order do these log: sync A, a timeout, a promise.then, sync B?", options: ["A, timeout, then, B", "A, B, then, timeout", "A, B, timeout, then", "then, A, B, timeout"], correctAnswer: 1, explanation: "Synchronous code first, then microtasks, then macrotasks." },
              ]),
            ],
          },
          {
            title: "Promises as State Machines",
            content: [
              { type: "paragraph", text: "A promise is a placeholder for a value that does not exist yet. It is always in exactly one of three states, **pending**, **fulfilled** or **rejected**, and once it settles it never changes again." },
              { type: "heading", level: 2, text: "Chaining returns new promises" },
              { type: "paragraph", text: "Every `.then()` returns a *new* promise that resolves with whatever the callback returns. Return a value to pass it along. Return a promise to wait for it. Throw to reject the rest of the chain." },
              { type: "code", language: "javascript", code: "fetchUser(id)\n  .then((user) => fetchOrders(user.id)) // returns a promise, so the chain waits\n  .then((orders) => orders.filter((o) => o.paid))\n  .catch((err) => report(err))          // handles a failure from any step above\n  .finally(() => setLoading(false));" },
              { type: "callout", calloutType: "warning", title: "The forgotten return", text: "Calling a promise-returning function inside .then without returning it breaks the chain: the next step runs immediately with undefined, and its errors go unhandled." },
            ],
          },
        ],
      },
      {
        title: "Writing Concurrent Code",
        lessons: [
          { title: "async/await Without Accidental Serialisation", content: [] },
          { title: "Limiting Concurrency and Cancelling Work", content: [] },
        ],
      },
    ],
  },
  {
    title: "System Design Fundamentals",
    description: "Load balancing, caching, replication and queues: the building blocks behind every large-scale system, and the trade-offs between them.",
    difficulty: "Intermediate",
    skills: ["Scalability", "Caching", "Replication", "Message queues", "CAP theorem"],
    modules: [
      { title: "Scaling a Single Service", lessons: [{ title: "Vertical vs Horizontal Scaling", content: [] }, { title: "Load Balancers and Health Checks", content: [] }] },
      { title: "Data at Scale", lessons: [{ title: "Caching Strategies and Invalidation", content: [] }, { title: "Replication, Partitioning and CAP", content: [] }] },
    ],
  },
  {
    title: "SQL for Product Analytics",
    description: "Answer real product questions with SQL: funnels, retention cohorts and window functions, from first SELECT to production queries.",
    difficulty: "Beginner",
    skills: ["SELECT & JOIN", "Aggregation", "Window functions", "Cohort analysis"],
    modules: [
      { title: "Querying Foundations", lessons: [{ title: "Filtering, Joining and Aggregating", content: [] }, { title: "NULLs and Other Sharp Edges", content: [] }] },
      { title: "Analytics Patterns", lessons: [{ title: "Funnels with Conditional Aggregation", content: [] }, { title: "Retention Cohorts with Window Functions", content: [] }] },
    ],
  },
];

async function seedShowcase() {
  let creator = await User.findOne({ email: SHOWCASE_EMAIL });
  if (!creator) {
    creator = await User.create({
      name: "CourseAI Team",
      email: SHOWCASE_EMAIL,
      bio: "Curated starter courses for the community library.",
      isProfilePublic: false,
      onboardingCompleted: true,
    });
  }

  const created = [];
  for (const [index, spec] of COURSES.entries()) {
    const existing = await Course.findOne({ creator: creator._id, title: spec.title });
    if (existing) {
      created.push(existing);
      continue;
    }

    const course = await Course.create({
      title: spec.title,
      description: spec.description,
      difficulty: spec.difficulty,
      skills: spec.skills,
      creator: creator._id,
      isPublic: true,
      isFeatured: true,
      shareId: `showcase-${index + 1}`,
    });

    const moduleIds = [];
    for (const modSpec of spec.modules) {
      const mod = await Module.create({ course: course._id, title: modSpec.title });
      const lessons = await Lesson.insertMany(
        modSpec.lessons.map((l) => ({
          module: mod._id,
          title: l.title,
          content: l.content,
          isEnriched: l.content.length > 0,
          generationStatus: l.content.length > 0 ? "complete" : "none",
        }))
      );
      mod.lessons = lessons.map((l) => l._id);
      await mod.save();
      moduleIds.push(mod._id);
    }
    course.modules = moduleIds;
    await course.save();
    created.push(course);
  }
  return created;
}

module.exports = { seedShowcase, SHOWCASE_EMAIL };

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-course-gen");
    const courses = await seedShowcase();
    console.log(`Showcase ready: ${courses.length} featured courses.`);
    await mongoose.disconnect();
  })().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}
