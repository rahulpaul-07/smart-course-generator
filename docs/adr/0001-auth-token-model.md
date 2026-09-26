# ADR 0001 — Authentication token model

**Status:** Accepted — backend implemented; access-token-in-memory pending · **Date:** 2026-07 · **Owner:** Rahul Paul

## Context

The API currently authenticates with a JWT that is issued **both** as an
httpOnly cookie **and** in the JSON login/register response body. The frontend
sends it as an `Authorization: Bearer` header, which implies the token is also
held in JavaScript-accessible storage. Tokens are long-lived (30 days) with no
refresh token, no rotation, and no server-side revocation. Logout clears the
cookie only.

## Problem

1. **Dual delivery defeats the httpOnly cookie.** If the token also lives in JS
   storage for the Bearer header, an XSS bug can exfiltrate it — the exact risk
   httpOnly was meant to remove.
2. **No revocation.** A leaked 30-day token is valid for a month; a copied
   Bearer token still works after "logout".
3. **CSRF.** The cookie path relies on `sameSite: "lax"` alone, which is not a
   complete mitigation for all cross-site state-changing requests.

## Decision (recommended)

Adopt a short-lived access token + rotating refresh token:

- **Access token:** JWT, 15–60 min TTL, sent as `Authorization: Bearer`, kept
  in memory only (not localStorage).
- **Refresh token:** opaque, httpOnly + `secure` + `sameSite:strict` cookie,
  7–30 day TTL, **rotated on every use**, stored server-side (hashed) so it can
  be revoked. Reuse of a rotated token invalidates the family (theft detection).
- **CSRF:** double-submit token for any cookie-authenticated mutation, or keep
  mutations Bearer-only.
- **Logout:** delete the server-side refresh record, not just the cookie.

## Alternatives considered

- **Cookie-only sessions + CSRF tokens.** Simpler, no Bearer; good if we drop
  cross-origin API access. Rejected for now because the SPA and API deploy to
  different origins (Vercel/Render).
- **Status quo.** Rejected: the dual-delivery + no-revocation combination is the
  weakest link in an otherwise solid security posture.

## Consequences

- Frontend must handle silent access-token refresh (interceptor on 401).
- Adds a `RefreshToken` collection and rotation logic.
- Meaningfully reduces blast radius of token theft and enables real logout.

## Implementation status

**Shipped:**
- Short-lived access JWT (`ACCESS_TOKEN_TTL`, default 30m) + opaque **rotating**
  refresh token stored only as a SHA-256 hash (`RefreshToken` model, TTL-indexed).
- `POST /api/auth/refresh` rotates the refresh token (httpOnly, `sameSite:strict`,
  `path:/api/auth`) with **reuse detection** (a revoked token invalidates its
  whole family). `logout` revokes the refresh record. `tokenService` + unit tests.
- Frontend: transparent 401 → `/auth/refresh` → retry interceptor; concurrent
  401s share one in-flight refresh.
- `JWT_SECRET` min-length enforced at boot in production; `trust proxy` set.

**Shipped (2026-09, submission audit):**
- **Same-origin API.** The SPA and API were on different sites (`*.vercel.app`,
  `*.onrender.com`), so the `SameSite=Strict` refresh cookie was never sent and
  every session ended when the access token expired; CI missed it because
  `localhost` ports are same-site. The SPA now calls `/api` on its own origin:
  Vercel rewrites it to Render in production and Vite proxies it locally and in
  E2E. `TRUST_PROXY_HOPS` tells Express how many proxies sit in front of it.
- **Bearer-only requests.** The access-token cookie is no longer issued and
  the auth middleware no longer reads cookies, so no request is authenticated
  by a cookie alone (this ADR's CSRF option "keep mutations Bearer-only").
- **Atomic rotation.** A refresh token is claimed with a conditional update,
  so two concurrent requests cannot both rotate it. A value rotated less than
  10 s ago is accepted from a parallel request (two tabs waking together);
  after that it triggers family revocation as before.
- Expired or forged local tokens are rejected without an outbound call to
  Auth0.

**Remaining (follow-up):**
- Move the access token out of `localStorage` into memory only. It is now
  short-lived (30m), which shrinks the XSS theft window from 30 days to 30
  minutes; memory-only storage closes it further but requires refactoring the
  ~8 streaming/call sites that currently read `localStorage.getItem('token')`.
  Do this only after the same-origin refresh is verified in production: with
  memory-only storage every page load depends on a working refresh.
