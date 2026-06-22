const gemini = require("./geminiService");
const groq = require("./groqService");
const openrouter = require("./openrouterService");
const AiTelemetry = require("../models/AiTelemetry");

function logTelemetry(data) {
  try {
    AiTelemetry.create(data).catch(err => {
      console.warn("[Telemetry] Failed to save log:", err.message);
    });
  } catch (e) {
    // Ignore synchronous errors so it never blocks the main thread
  }
}

gemini.name = "gemini";
groq.name = "groq";
openrouter.name = "openrouter";

const fallbackChain = [
  // Tier 1: Ultra-fast / Speed Optimized (Highest Priority)
  { provider: groq, model: "llama-3.1-8b-instant", key: "GROQ_API_KEY" },
  { provider: gemini, model: "gemini-2.5-flash", key: "GEMINI_API_KEY" },
  { provider: groq, model: "llama-3.3-70b-versatile", key: "GROQ_API_KEY" },
  
  // Tier 2: Heavyweight / High Intelligence Fallbacks
  { provider: groq, model: "openai/gpt-oss-120b", key: "GROQ_API_KEY" },
  { provider: openrouter, model: "openai/gpt-4o-mini", key: "OPENROUTER_API_KEY" },
  { provider: openrouter, model: "openai/gpt-4o", key: "OPENROUTER_API_KEY" },
  
  // Tier 3: General Fallbacks
  { provider: openrouter, model: "mistralai/mixtral-8x7b-instruct", key: "OPENROUTER_API_KEY" },
  { provider: openrouter, model: "meta-llama/llama-3-8b-instruct", key: "OPENROUTER_API_KEY" },
];

function getProviderChain() {
  return fallbackChain.filter(item => !!process.env[item.key]);
}

function getMockResponse(systemPrompt, userPrompt) {
  const sys = String(systemPrompt || "").toLowerCase();
  const usr = String(userPrompt || "").toLowerCase();

  if (sys.includes("course reviewer agent")) {
    return {
      rating: 8.5,
      strengths: ["Clear explanation of fundamental concepts", "Good flow"],
      weaknesses: ["Lacks practical examples", "Too theoretical"],
      suggestedImprovements: ["Add a quiz", "Include more real-world scenarios"]
    };
  }

  if (sys.includes("learning coach agent")) {
    return {
      greeting: "Hey there! Great job keeping up the streak.",
      analysis: "I noticed you're doing well but could spend more time on complex topics.",
      actionableAdvice: ["Review the last module", "Try a practice test"],
      encouragement: "You're making solid progress, keep it up!"
    };
  }

  if (sys.includes("revision planner agent")) {
    return {
      planName: "Weekly Deep Dive",
      schedule: [
        { day: "Monday", topic: "Core Concepts", method: "Flashcards" },
        { day: "Wednesday", topic: "Advanced Scenarios", method: "Practice Lab" }
      ]
    };
  }

  if (sys.includes("recommendation agent")) {
    return {
      recommendations: [
        { topic: "Advanced System Design", reason: "Builds on your backend basics." },
        { topic: "GraphQL Integration", reason: "A natural next step after REST." }
      ]
    };
  }

  if (sys.includes("roadmap")) {
    return {
      summary: "This roadmap will guide you through the essentials of backend engineering.",
      weeks: [
        {
          weekNumber: 1,
          title: "Introduction to Backend Development",
          topics: ["Node.js Basics", "Express Framework", "REST APIs"],
          milestones: ["Build a simple HTTP server", "Create REST endpoints"],
          project: {
            title: "Simple Task API",
            description: "A basic CRUD API for managing tasks."
          }
        }
      ]
    };
  }

  if (sys.includes("interview preparation package")) {
    return {
      mcqs: [
        {
          question: "What does ACID stand for in DBMS?",
          options: ["Atomicity, Consistency, Isolation, Durability", "Atomicity, Concurrency, Isolation, Durability", "Atomicity, Consistency, Integrity, Durability", "Atomicity, Concurrency, Integrity, Durability"],
          correctAnswer: 0,
          explanation: "ACID properties ensure reliable processing of database transactions."
        }
      ],
      theoryQuestions: [
        {
          question: "Explain the difference between a clustered and non-clustered index.",
          idealAnswer: "A clustered index determines the physical order of data in a table, whereas a non-clustered index maintains a separate logical structure to point to the data."
        }
      ],
      codingQuestions: [
        {
          title: "Find Duplicate Emails",
          problemStatement: "Write a SQL query to find all duplicate emails in a table named Person.",
          constraints: "Table has Id and Email columns.",
          starterCode: "SELECT Email FROM Person;",
          solutionHint: "Use GROUP BY and HAVING count(Email) > 1."
        }
      ],
      mockQuestions: [
        "Tell me about a challenging database problem you solved.",
        "How do you approach query optimization?"
      ]
    };
  }

  if (sys.includes("evaluate these interview answers")) {
    return [
      {
        index: 0,
        score: 8,
        feedback: "Good explanation, but could mention B-Trees."
      }
    ];
  }

  if (sys.includes("outline") || usr.includes("outline")) {
    if (sys.includes("structural outline for the lesson") || usr.includes("structural outline for the lesson") || sys.includes("heading") || usr.includes("heading")) {
      return {
        outline: [
          "1. Overview and Core Philosophy",
          "2. Detailed Syntax and Rules",
          "3. Common Pitfalls and Solutions",
          "4. Practical Application and Next Steps"
        ]
      };
    }
    return {
      title: "Introduction to JSON Basics",
      description: "Learn JavaScript Object Notation (JSON) syntax, data types, and applications.",
      modules: [
        {
          title: "Module 1: Foundations of JSON",
          lessons: [
            { title: "What is JSON?" },
            { title: "JSON Syntax Rules" }
          ]
        },
        {
          title: "Module 2: Real-world JSON Applications",
          lessons: [
            { title: "Parsing JSON in JavaScript" },
            { title: "Common JSON Errors" }
          ]
        }
      ]
    };
  }

  if (sys.includes("flashcard") || usr.includes("flashcard")) {
    return {
      flashcards: [
        { front: "What does JSON stand for?", back: "JavaScript Object Notation." },
        { front: "Is JSON language-independent?", back: "Yes, it is supported by almost all programming languages." },
        { front: "Which quotes are allowed in JSON?", back: "Only double quotes (\") are allowed." },
        { front: "Can a JSON object contain a function?", back: "No, functions are not valid JSON values." },
        { front: "What is JSON.parse() used for?", back: "Converting a JSON string into a JavaScript object." },
        { front: "What is JSON.stringify() used for?", back: "Converting a JavaScript object into a JSON string." }
      ]
    };
  }

  if (sys.includes("mini-project") || sys.includes("lab") || usr.includes("lab")) {
    return {
      title: "JSON Configuration Builder",
      brief: "Construct a valid JSON configuration file for a web application and parse it in JavaScript.",
      steps: [
        "Create config.json",
        "Add keys for appName, port, and debugMode",
        "Save and validate the JSON format"
      ],
      checks: [
        "Keys must be double-quoted strings",
        "port must be a number",
        "debugMode must be a boolean"
      ],
      hint: "Avoid trailing commas after the last element."
    };
  }

  if (sys.includes("multiple-choice questions") && (sys.includes("average score") || sys.includes("averagehealth") || sys.includes("claim") || sys.includes("educator") || usr.includes("mcqs") || usr.includes("generate exactly"))) {
    return [
      {
        question: "Which of the following is a valid JSON data type?",
        options: ["Function", "Undefined", "String", "Symbol"],
        correctAnswer: 2,
        explanation: "JSON supports strings, numbers, objects, arrays, booleans, and null."
      },
      {
        question: "What wraps JSON keys?",
        options: ["Single quotes", "Double quotes", "Backticks", "No quotes"],
        correctAnswer: 1,
        explanation: "JSON keys must always be enclosed in double quotes."
      },
      {
        question: "Is JSON case-sensitive?",
        options: ["Yes", "No", "Only for keys", "Only for values"],
        correctAnswer: 0,
        explanation: "Yes, JSON keys and string values are case-sensitive."
      },
      {
        question: "Which method validates JSON string?",
        options: ["JSON.stringify()", "JSON.validate()", "JSON.parse()", "JSON.check()"],
        correctAnswer: 2,
        explanation: "JSON.parse() will throw an error if the JSON string is invalid."
      },
      {
        question: "Are comments allowed in JSON?",
        options: ["Yes, using //", "Yes, using /* */", "No comments allowed", "Yes, using #"],
        correctAnswer: 2,
        explanation: "The JSON specification does not support comments."
      }
    ];
  }

  if (sys.includes("questions") || usr.includes("quiz")) {
    return {
      questions: [
        {
          question: "What is the correct syntax for a JSON key-value pair?",
          options: ["'key': 'value'", "\"key\": \"value\"", "key = 'value'", "key: 'value'"],
          correctAnswer: 1,
          explanation: "JSON keys and string values must be enclosed in double quotes, separated by a colon."
        },
        {
          question: "Which of the following is true about JSON?",
          options: ["It is language dependent", "It supports comments", "It is text-only", "It allows functions"],
          correctAnswer: 2,
          explanation: "JSON is a language-independent, text-only format that does not support comments or functions."
        },
        {
          question: "What data type is [1, 2, 3] in JSON?",
          options: ["Object", "Array", "List", "Tuple"],
          correctAnswer: 1,
          explanation: "[1, 2, 3] represents an array in JSON."
        },
        {
          question: "How are key-value pairs separated in a JSON object?",
          options: ["Semicolons", "Colons", "Commas", "Periods"],
          correctAnswer: 2,
          explanation: "Key-value pairs in a JSON object are separated by commas."
        },
        {
          question: "Which value is valid in JSON?",
          options: ["undefined", "NaN", "null", "function() {}"],
          correctAnswer: 2,
          explanation: "null is a valid JSON value, whereas undefined, NaN, and functions are not."
        }
      ]
    };
  }

  if (sys.includes("contentblocks") || usr.includes("contentblocks")) {
    return {
      contentBlocks: [
        { type: "heading", level: 2, text: "Introduction to JSON Basics" },
        { type: "paragraph", text: "JavaScript Object Notation (JSON) is a lightweight data-interchange format. It is easy for humans to read and write and easy for machines to parse and generate." },
        { type: "callout", emoji: "💡", title: "Important Rule", text: "Always remember that JSON requires double quotes around both property names (keys) and string values!" },
        { type: "list", style: "bullet", items: ["Key-value pairs are separated by colons", "Objects are wrapped in curly braces", "Arrays are wrapped in square brackets"] }
      ]
    };
  }

  return {
    contentBlocks: [
      { type: "heading", level: 2, text: "Lesson Overview" },
      { type: "paragraph", text: "This section introduces the core concepts and workflows. Make sure you practice these concepts in code." }
    ]
  };
}

async function generateJson(systemPrompt, userPrompt, maxTokens = 4096, validator = null) {
  const chain = getProviderChain();
  
  if (chain.length === 0 && !process.env.GEMINI_API_KEY) {
    const mockResult = getMockResponse(systemPrompt, userPrompt);
    if (validator) {
      try {
        await validator(mockResult);
      } catch (err) {
        console.error("Mock validation failed:", err);
      }
    }
    return mockResult;
  }

  let lastError;
  const timeoutMs = 120000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const activeChain = chain.length > 0 ? chain : [{ provider: gemini, model: "gemini-1.5-flash" }];
    for (const { provider, model } of activeChain) {
      if (Date.now() - startTime >= timeoutMs) break;
      try {
        const result = await provider.generateJson(systemPrompt, userPrompt, maxTokens, model);
        
        if (validator) {
          await validator(result);
        }
        
        logTelemetry({ provider: provider.name, model, endpoint: 'generateJson', status: 'success' });
        return result;
      } catch (error) {
        logTelemetry({ provider: provider.name, model, endpoint: 'generateJson', status: 'failure', reason: error.message || String(error) });
        console.warn(`[AI Router] ${provider.name} (${model}) failed to generateJson. Switching to next...`);
        lastError = error;
      }
    }
    
    if (Date.now() - startTime < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw lastError || new Error("Our AI servers are currently experiencing high traffic. Please try again in a few moments.");
}

async function* generateJsonStream(systemPrompt, userPrompt, maxTokens = 4096) {
  const chain = getProviderChain();
  
  if (chain.length === 0 && !process.env.GEMINI_API_KEY) {
    const mockData = getMockResponse(systemPrompt, userPrompt);
    const blocks = mockData.contentBlocks || mockData.blocks || [];
    for (const block of blocks) {
      await new Promise(resolve => setTimeout(resolve, 500));
      yield block;
    }
    return;
  }

  let lastError;
  const timeoutMs = 120000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const activeChain = chain.length > 0 ? chain : [{ provider: gemini, model: "gemini-1.5-flash" }];
    for (let i = 0; i < activeChain.length; i++) {
      if (Date.now() - startTime >= timeoutMs) break;
      const { provider, model } = activeChain[i];
      let yieldedChunk = false;
      
      try {
        const stream = await provider.generateJsonStream(systemPrompt, userPrompt, maxTokens, model);
        for await (const chunk of stream) {
          yieldedChunk = true;
          yield chunk;
        }
        logTelemetry({ provider: provider.name, model, endpoint: 'generateJsonStream', status: 'success' });
        return;
      } catch (error) {
        logTelemetry({ provider: provider.name, model, endpoint: 'generateJsonStream', status: 'failure', reason: error.message || String(error) });
        if (yieldedChunk) {
          console.error(`[AI Router] ${provider.name} (${model}) stream failed midway. Cannot fallback.`);
          throw new Error("Our AI servers are currently experiencing high traffic. Please try again in a few moments.");
        }
        console.warn(`[AI Router] ${provider.name} (${model}) failed before sending data. Switching to next...`);
        lastError = error;
      }
    }
  }
  
  throw lastError || new Error("Our AI servers are currently experiencing high traffic. Please try again in a few moments.");
}

async function generateText(messages, maxTokens = 1024) {
  const chain = getProviderChain();
  
  if (chain.length === 0 && !process.env.GEMINI_API_KEY) {
    if (messages.some(m => m.content && m.content.toLowerCase().includes("mock interview"))) {
      return "That's an interesting approach. What are the trade-offs of your chosen design?";
    }
    return "This is a friendly response from your AI tutor! Let's continue working on this lesson together.";
  }

  let lastError;
  const timeoutMs = 30000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const activeChain = chain.length > 0 ? chain : [{ provider: gemini, model: "gemini-1.5-flash" }];
    for (const { provider, model } of activeChain) {
      if (Date.now() - startTime >= timeoutMs) break;
      try {
        return await provider.generateText(messages, maxTokens, model);
      } catch (error) {
        console.warn(`[AI Router] ${provider.name} (${model}) failed to generateText. Switching to next...`);
        lastError = error;
      }
    }
  }
  
  throw lastError || new Error("Our AI servers are currently experiencing high traffic. Please try again in a few moments.");
}

module.exports = { generateJson, generateJsonStream, generateText };
