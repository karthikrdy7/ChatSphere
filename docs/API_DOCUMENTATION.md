# ChatSphere API and real-time events

Default base URL: `http://localhost:5002/api`. JSON responses use the top-level `message` property for errors. Protected HTTP routes use the `chatsphere_session` HttpOnly cookie set by login/register; browser clients must send requests with credentials enabled. The health routes and register/login do not require an existing session. Database-dependent routes return 503 when MongoDB is unavailable.

## Health

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Backend liveness and MongoDB `connected`/`unavailable` status; HTTP 200 also when database is unavailable (`status: degraded`) |
| GET | `/health/database` | Public | Database readiness; HTTP 200 when connected, otherwise 503 |

## Authentication and profiles

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create account; sets the session cookie and returns the public user |
| POST | `/auth/login` | Authenticate; sets the session cookie and returns the public user |
| GET | `/auth/me` | Read current public user |
| GET | `/auth/users?search=alex` | Search up to 100 other registered users |
| PUT | `/auth/profile` | Update `name`, `status`, or `avatar` |
| POST | `/auth/logout` | Clear the session cookie |

Example registration:

```json
{
  "name": "Alex Carter",
  "email": "alex@example.com",
  "password": "use-a-unique-password"
}
```

Names are 2–80 characters, passwords are at least 8 characters and at most 72 UTF-8 bytes for bcrypt, and email addresses are normalized to lowercase. Duplicate email addresses return 409. Password hashes are not included in public user responses. Login attempts are limited to 5 per IP per 15 minutes; registration attempts are limited to 5 per IP per hour. Limits use Redis when `REDIS_URL` is configured and available, otherwise they fall back to per-process memory with a warning.

## Conversations and messages

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/conversations` | List member conversations with unread counts |
| POST | `/conversations` | Find/create a direct chat using `participantId`; group creation is also supported |
| GET | `/conversations/:id/messages?limit=30&before=<ISO-date>&beforeId=<message-id>` | Load the latest 30 messages or a cursor page of older messages (`hasOlder` indicates more); `beforeId` disambiguates messages with equal timestamps |
| GET | `/conversations/:id/messages?search=invoice` | Search message text and attachment file names in this conversation |
| POST | `/conversations/:id/messages` | Send text/sticker, optional `replyTo` and `clientMessageId` |
| PATCH | `/conversations/:id/messages/:messageId` | Edit own message |
| DELETE | `/conversations/:id/messages/:messageId` | Delete own message |
| POST | `/conversations/:id/messages/:messageId/reactions` | Toggle `thumbsUp`, `heart`, `laugh`, or `surprise` |
| POST | `/conversations/:id/read` | Mark supplied message IDs, or all incoming messages, as read |

Example message:

```json
{
  "text": "See you at 3 PM.",
  "messageType": "text",
  "replyTo": null,
  "clientMessageId": "a-client-generated-uuid"
}
```

Message text is limited to 5,000 characters. A unique index scoped to conversation/sender/client ID prevents duplicate persisted sends during HTTP retries. Conversation membership is checked before history, send, edit, delete, reaction, read-receipt, and socket-room access.

## Groups

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/groups/create` | Create a group; creator becomes first admin |
| GET | `/groups/:id` | Read group details (members only) |
| PATCH | `/groups/:id/details` | Update name/image URL (admins only) |
| PATCH | `/groups/:id/members` | Add/remove members (admins only) |
| PATCH | `/groups/:id/admins` | Promote/demote a member (admins only; always retain an admin) |
| POST | `/groups/:id/leave` | Leave the group; sole admin is transferred when needed |

The group image field is a URL, not an uploaded image workflow. Membership changes evict removed members' sockets and notify remaining members.

## Uploads

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/uploads` | Upload multipart fields `file`, `conversationId`, `messageType` (`image`, `document`, `voice`), optional `replyTo` |
| GET | `/uploads/:storedName` | Download only when authenticated and still a conversation member |

The server allows signature-verified JPEG/PNG/WebP/GIF/AVIF/BMP/TIFF images, PDFs, and supported audio, up to 5 MB. Files receive random stored names and are stored in `UPLOAD_DIR`, outside MongoDB. Format validation is not malware scanning; use private durable object storage and malware scanning for production. Uploads are limited to 30 per IP per 15 minutes.

## Payments (simulated only)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/payments` | List transactions sent or received by current user |
| POST | `/payments/demo` | Create a pending simulated transaction |
| GET | `/payments/:id` | Read a transaction owned by current user |
| POST | `/payments/:id/verify` | Server changes sender-owned pending demo record to success |

Only USD is currently accepted; amount must be positive, at most 1,000,000, and have at most two decimal places. Notes are limited to 200 characters. A demo reference is generated server-side. The verify route only accepts pending demo transactions and returns an explicit simulation notice; **it is not connected to a payment provider and does not transfer money**. The UI's “Download PDF” action opens the browser print dialog, where the user can choose “Save as PDF”.

## Socket.IO

Connect to `http://localhost:5002` with Socket.IO `withCredentials: true`. The browser sends the same `chatsphere_session` cookie used by protected HTTP routes. `join-room(conversationId, ack)` checks MongoDB membership before joining; acknowledgement is `{ ok: true, roomId }` or `{ ok: false, message }`.

Client events:

- `join-room(conversationId, ack)`, `leave-room(conversationId)`
- `typing({ roomId, isTyping })`; relayed only to peers in an authorized joined room

Server events:

- `new-message({ conversationId, message })` to joined conversation-room clients
- `conversation-message({ conversationId, message })` to authenticated user rooms for list/unread synchronization
- `message-updated`, `message-deleted`, `read-receipt`
- `conversation-added`, `conversation-removed`, `group-updated`
- `typing({ conversationId, isTyping, userId })`

The frontend merges HTTP responses and socket events by database message ID/client ID to avoid showing duplicate sends. Authenticated clients receive `user-presence({ userId, online, lastSeen })` updates for members of shared conversations. The backend marks users online on connect and stores `lastSeen` on their final disconnect. Offline socket state is surfaced; HTTP message sending remains available.

## Limits and configuration

Set `PORT`, `CLIENT_URL`, `COOKIE_SAME_SITE`, `MONGODB_URI`, `JWT_SECRET` (at least 32 random characters), `JWT_EXPIRES_IN`, `UPLOAD_DIR`, and `NODE_ENV` in `backend/.env`. Set optional `REDIS_URL` to use a shared Redis rate-limit store. `CLIENT_URL` is the one allowed frontend origin; `COOKIE_SAME_SITE` defaults to `lax` and can be `none` for cross-site HTTPS deployments. In-memory fallback throttling is per process and is not suitable as the only protection for a multi-instance production deployment. Logout clears the browser cookie, but copied stateless JWTs are not revoked before expiry.
