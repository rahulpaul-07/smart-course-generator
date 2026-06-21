# Recruiter & Hiring Manager FAQ

**Q: Did you build this entire platform yourself?**
**A:** Yes. I designed the architecture, implemented the backend using Node.js and Express, integrated the LLM routing logic, built the frontend with React, and set up the automated CI/CD deployment pipelines.

**Q: Why did you use Node.js instead of Python for an AI app?**
**A:** Because the heavy AI lifting is done via external APIs (Gemini, OpenRouter), the backend's primary job is handling high-concurrency I/O, streaming Server-Sent Events, and managing database connections. Node.js's asynchronous, event-driven architecture is actually perfect for this highly I/O-bound workload, and it allows me to share types/logic with the React frontend if needed.

**Q: What was the hardest technical challenge you faced?**
**A:** Implementing the Server-Sent Events (SSE) streaming for AI lesson generation. Standard HTTP requests would time out or force the user to stare at a loading spinner for 30+ seconds. I had to architect a system that broke the lesson into semantic chunks, requested them iteratively, and streamed the JSON blocks in real-time to the frontend while simultaneously caching them to the database.

**Q: How do you handle AI hallucinations or bad formatting?**
**A:** I implemented strict JSON schema instructions in the system prompts and created a validation layer. If the AI returns malformed JSON or markdown instead of the requested `contentBlocks` array, the system catches the parsing error and either retries or falls back to a different, more reliable model.

**Q: How does this scale if you get 10,000 users tomorrow?**
**A:** The bottleneck wouldn't be the backend itself, but rather the LLM API rate limits. To handle this, the AI Router automatically shifts load between providers. The database is hosted on MongoDB Atlas, which can scale horizontally. Heavy read endpoints (like the public marketplace and leaderboards) are protected by a server-side caching layer (`node-cache`) with a 60-second TTL, bypassing the database entirely for 99% of requests during traffic spikes.
