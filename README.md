# Voice AI Receptionist — Twilio + Claude ConversationRelay

A working, deployed voice AI agent that answers real phone calls and acts as a dental office receptionist — checking appointment availability, booking, and rescheduling appointments on a real Google Calendar, entirely through natural spoken conversation.

**Live number:** +1 (860) 962-6519
**Live code:** deployed on Render, auto-deploys from this repo's `main` branch

---

## What it does

A caller dials in and speaks naturally , no menus, no "press 1." The agent:
- Answers with a spoken greeting
- Understands requests like *"Do you have anything open on September 12th?"* or *"I'd like to reschedule my appointment"*
- Checks real availability against a live Google Calendar
- Books or reschedules appointments by name, confirming details back to the caller before acting
- Handles multi-turn conversation, remembering context (patient name, requested date) across the call

---

## Architecture

```
Caller's phone
      │
      ▼
Twilio Voice (phone number + ConversationRelay)
      │  (TwiML webhook: /twiml)
      ▼
Node.js server (Fastify) — hosted on Render
      │  (WebSocket: /ws)
      ▼
Claude (Anthropic API) — reasoning + tool use
      │
      ▼
Google Calendar API — real appointment data
```

**Stack:**
- **Telephony:** Twilio Voice + ConversationRelay (handles call connection, speech-to-text, and text-to-speech)
- **Server:** Node.js, Fastify, WebSockets
- **LLM:** Claude (Anthropic API), with tool use for calendar actions
- **Calendar:** Google Calendar API, authenticated via a service account
- **Hosting:** Render (free tier)
- **Timezone handling:** Luxon

**Code structure:**
```
server.js                     entry point
config.js                     env vars, constants, system prompt
routes/twimlRoute.js           the /twiml HTTP webhook
websocket/conversationHandler.js   the /ws WebSocket handler + session state
services/claudeService.js     Claude client + tool-use loop
services/calendarService.js   Google Calendar auth + calendar operations
tools/schemas.js              tool definitions (JSON schemas Claude sees)
tools/executor.js             routes a tool call to the right function
```

---

## Setup (to run this yourself)

1. Clone the repo, run `npm install`
2. Create a `.env` file with:
   ```
   ANTHROPIC_API_KEY=your-key
   GOOGLE_CALENDAR_ID=your-calendar-id
   GOOGLE_SERVICE_ACCOUNT_JSON={...paste full service account JSON as one line...}
   PUBLIC_DOMAIN=your-ngrok-or-render-hostname (no https://)
   ```
3. Set up a Google Cloud service account with Calendar API access, share your target calendar with it
4. Run locally with `node server.js` + `ngrok http 8080` for local testing, or deploy to Render for a persistent public URL
5. Point your Twilio phone number's Voice webhook at `https://your-url/twiml`

---

## Challenges hit and fixed along the way

Building this surfaced a real range of engineering issues : debugging these was as much the point of the project as the final result:

- **PowerShell execution policy** blocked `npm`/`node` commands repeatedly across fresh terminal sessions — fixed by setting the policy at the user scope so it persists.
- **Hidden file extensions**: a `.env` file was silently saved as `.env.txt` by Windows, causing environment variables to load as zero — caught by listing files with `Get-ChildItem -Force` rather than trusting the Explorer view.
- **Missing imports** (`fastify`, `Anthropic`) caused `ReferenceError`s that only surfaced one at a time, since execution stops at the first error — resolved by comparing the full import block against the tutorial rather than patching errors one-by-one.
- **Duplicate plugin registration** (`fastify.register(fastifyFormBody)` called twice) crashed the server with `FST_ERR_CTP_ALREADY_PRESENT`.
- **A doubled URL scheme** (`wss://https://...`) in the WebSocket URL, caused by an env var that still included `https://` — traced by inspecting the raw TwiML response via ngrok's request inspector rather than guessing.
- **A deprecated Claude model ID** (`claude-sonnet-4-20250514`, retired mid-2026) caused an unhandled promise rejection that silently killed the entire server process mid-call, with no error logged — fixed by updating the model string and adding `try/catch` around all tool-use API calls so future failures fail gracefully instead of crashing.
- **Lossy conversation history**: persisting only the final text of each assistant turn (not the full tool-use/tool-result blocks) caused Claude to lose track of a successful booking and attempt to re-book it — fixed by persisting the full structured message history.
- **A leaked service account credential**: a Google service account JSON key was briefly committed before being gitignored. GitHub's push protection blocked the leak before it went public; resolved by rewriting local git history and rotating the credential as a precaution.
- **Render's port-binding requirement**: the server bound to `localhost` by default, which Render's health checker can't detect , fixed by explicitly binding to `0.0.0.0`.
- **A silent 4-hour timezone bug**: appointments booked correctly when tested locally (Eastern time) but landed 4 hours early once deployed to Render (which runs in UTC) , fixed by using Luxon to explicitly anchor all appointment times to `America/New_York`, independent of the server's own system timezone.

---

## What I'd improve with more time

- **Real-time interruption handling** : the agent currently logs interruptions but doesn't yet cut off its own speech mid-sentence when a caller talks over it
- **Broader business logic** : office hours, insurance questions, and a clear human-escalation path for anything outside booking/rescheduling
- **Multi-provider calendar support** : real dental practice management systems, not just Google Calendar
- **HIPAA-appropriate handling** : required before this could touch real patient data in a genuine clinical setting
- **Always-on hosting** : Render's free tier sleeps after inactivity; a paid tier or alternative host would remove the ~30-60s cold-start delay on the first call after idle time
