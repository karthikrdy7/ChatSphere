# ChatSphere system architecture

```mermaid
flowchart LR
UI[React/Vite UI] --> API[Frontend API service]
UI --> WS[Socket.IO client]
API --> REST[Express REST API]
WS --> Socket[Socket.IO server]
REST --> Auth[JWT middleware]
Socket --> Auth
REST --> Models[Mongoose models]
Socket --> Models
Models --> DB[(MongoDB)]
REST --> Files[Private local upload directory]
```

## Responsibilities and request flow

- **Frontend:** React routes preserve the original responsive ChatSphere interface; local theme/read-receipt preferences and the public profile use browser storage. `src/services/api.js` sends credentialed requests to `VITE_API_BASE_URL`; signed-out sample content stays local.
- **Authentication:** Register/login validate inputs, bcrypt-hash passwords, and set a signed JWT in a Secure, HttpOnly, SameSite cookie while returning public profile data. Protected APIs verify cookie claims and load the user; profile password hashes are excluded. Logout clears the cookie; server-side JWT revocation is not implemented.
- **REST API:** Express mounts auth, conversations/messages, groups, demo payments, and upload routes. Route handlers validate data and enforce membership/admin/ownership rules. Database-dependent routes fail clearly with 503 while MongoDB is disconnected.
- **Database:** Mongoose models persist users, conversations, messages, and demo transactions. See [database design](./DATABASE_DESIGN.md).
- **Real-time:** Socket.IO authenticates with the same browser cookie as HTTP. Each requested room join is checked against current conversation membership. Connect/disconnect events update online state and persist `lastSeen`; presence events are sent to contacts in shared conversations. The backend also emits persisted sends/mutations and typing/read/group events to room and authenticated user channels.
- **Message history:** The API returns the latest 30 messages, then pages older messages with a stable `createdAt`/message-ID cursor. The client prepends older messages while anchoring the visible message to preserve scroll position.
- **Attachments:** Multer writes signature-verified images, PDFs, and audio up to 5 MB to a private local directory using random stored names. Downloads require a valid session and current conversation membership.
- **Payments:** The API creates pending demo-only transaction records and exposes a separate sender-authorized simulated verification route. There is no payment provider, settlement, or money transfer.

## Configuration, deployment, and limitations

`backend/.env` controls backend port, exact frontend CORS origin, cookie SameSite mode, database URI, JWT signing secret/expiry, upload directory, optional Redis URL, and environment mode. Vite uses `VITE_API_BASE_URL`. During development, the backend can start without MongoDB; `/api/health` reports degraded and `/api/health/database` returns 503. API routes requiring persistence also return 503.

Rate limits use Redis when `REDIS_URL` is configured and available; otherwise the server logs a warning and falls back to process memory, which is not shared across instances. Before production, use a shared Redis service, HTTPS, CSP and XSS prevention, secure deployment secrets, least-privilege MongoDB, private durable object storage, malware scanning, monitoring, backup/recovery, and multi-instance Socket.IO infrastructure. Presence, cloud file storage, external identity/email providers, calling, and real provider-backed payments are not implemented.
