# Engineering Decisions

## 1. Custom AI Router vs. LangChain
**Decision**: Built a custom `aiRouter.js` instead of importing LangChain.
**Rationale**: LangChain introduces significant bundle weight, dependency hell, and opaque abstractions. For this platform, we only required dynamic failovers, prompt templating, and JSON parsing. A custom implementation runs faster, uses fewer resources, and allows precise control over API fallbacks (e.g., catching 429s from Groq and instantly retrying on Gemini).

## 2. Server-Sent Events (SSE) over WebSockets
**Decision**: Used SSE for streaming LLM generations to the client.
**Rationale**: WebSockets are bidirectional and require stateful connection tracking. Since course generation is strictly unidirectional (Server -> Client), SSE is significantly lighter, natively supports HTTP/2 multiplexing, and works flawlessly through standard reverse proxies without complex configuration.

## 3. JWT Verification vs Session Cookies
**Decision**: Used Auth0 RS256 JWTs passed via Authorization Headers.
**Rationale**: Facilitates a completely stateless backend. This prevents the need for a Redis instance to track session states, allowing the Node server to immediately scale horizontally behind a load balancer without sticky sessions.

## 4. UI Library: Tailwind CSS over Component Libraries (MUI/Chakra)
**Decision**: Used raw Tailwind CSS combined with custom Lucide icons.
**Rationale**: Material UI often results in apps looking generic and "Googley". Tailwind allowed the construction of a unique, highly premium glassmorphism aesthetic tailored explicitly to this product's brand.
