💬 ChatSphere — Real-Time Chat Application

A full-stack, real-time messaging application built with React, Node.js, Express, MongoDB, and Socket.IO. ChatSphere provides a modern communication experience with direct messaging, group conversations, message reactions, voice notes, file sharing, and a clean dark-themed interface.

Designed to deliver a smooth, responsive, and interactive chatting experience with real-time communication and user authentication.

🌐 Live Demo: Add your deployed application URL here.

⸻

📸 Screenshots

Showcase the application’s user interface and key features.

Landing Page	Login Page
	<img width="1453" height="830" alt="image" src="https://github.com/user-attachments/assets/6bf90090-8a84-45b1-842d-f0b935ac82c2" />

Dashboard	Chat Interface
	

Add screenshots to docs/screenshots/ using the filenames shown above.

⸻

✨ Features

🔐 Authentication & Profiles

* User registration and login.
* JWT-based authentication.
* Password hashing with bcrypt.
* User profile management.
* Protected routes and authenticated API access.

💬 Real-Time Messaging

* One-to-one conversations.
* Group conversations.
* Instant message delivery using Socket.IO.
* Message replies.
* Message editing and deletion.
* Emoji reactions.
* Read receipts.
* Typing indicators.

📎 Media & File Sharing

* File uploads and sharing.
* Audio messages and voice notes.
* Media support within conversations.

👥 Group Management

* Create and manage group conversations.
* Group administrator controls.
* Add and manage group members.

🔔 Additional Features

* Notifications.
* Conversation search.
* Archived chats.
* Persistent theme preferences.
* Responsive dark-themed interface.
* Demo payment flow with simulated receipts.

⚡ Real-Time Infrastructure

* Persistent message storage with MongoDB.
* WebSocket communication through Socket.IO.
* RESTful APIs for application operations.
* Configurable frontend and backend environments.

⸻

🏗️ System Architecture

flowchart TD
    A["User 1<br/>React + Vite"]
    B["User 2<br/>React + Vite"]
    C["Express Backend<br/>REST API"]
    D["Socket.IO Server<br/>Real-Time Events"]
    E[("MongoDB<br/>Mongoose")]
    F["File Upload Storage"]
    A -->|"HTTP Requests"| C
    B -->|"HTTP Requests"| C
    A <-->|"WebSocket Events"| D
    B <-->|"WebSocket Events"| D
    C --> E
    D --> E
    C --> F

How It Works

1. Users register or log in to access the application.
2. The React frontend communicates with the Express backend through REST APIs.
3. Socket.IO manages real-time events between connected clients.
4. The backend authenticates requests and processes messages.
5. Messages are stored in MongoDB for persistence.
6. Socket.IO delivers new messages and conversation events to authorized recipients.
7. Uploaded files are handled by the backend and stored according to the configured storage system.

Note: The diagram represents the intended architecture. Actual event handling, authorization, message persistence, and upload behavior depend on the implementation in the repository.

⸻

🛠️ Tech Stack

Technology	Purpose
React 18	Frontend user interface
Vite	Frontend development server and build tool
React Router	Client-side navigation
JavaScript	Frontend application logic
CSS	Styling and responsive layouts
Node.js	Backend JavaScript runtime
Express.js	REST API and server-side routing
MongoDB	Database for application data
Mongoose	MongoDB object modeling
Socket.IO	Real-time messaging and events
JWT	Authentication tokens
bcryptjs	Password hashing
Multer	File upload handling
dotenv	Environment variable management
CORS	Cross-origin request configuration
lucide-react	Interface icons

⸻

📡 Protocols & Technologies Used

Protocol / Technology	Purpose
HTTP / HTTPS	Communication between frontend and backend
WebSocket	Persistent, bidirectional communication
Socket.IO	Real-time messaging and event management
REST	API communication
TCP/IP	Underlying network communication
JSON	Data exchange between client and server
JWT	Token-based authentication
TLS	Encryption of network traffic when deployed over HTTPS

Important: Socket.IO can use WebSocket or fall back to HTTP long-polling. HTTPS/TLS protection depends on the deployed network configuration.

⸻

📋 Requirements

Software Requirements

* Node.js 18 or later.
* npm.
* MongoDB local installation or a MongoDB Atlas database.
* Git.
* A modern web browser.

Recommended Development Environment

Component	Recommendation
Operating System	Windows, macOS, or Linux
Frontend	React + Vite
Backend	Node.js + Express
Database	MongoDB
Editor	Visual Studio Code
API Testing	Postman or an equivalent HTTP client
Version Control	Git and GitHub

⸻

🚀 Getting Started

Follow these steps to run ChatSphere locally.

1. Clone the Repository

git clone https://github.com/karthikrdy7/ChatSphere.git
cd ChatSphere

Replace the repository URL with your actual GitHub repository URL if the repository has a different name.

2. Install Frontend Dependencies

From the project root:

npm install

3. Install Backend Dependencies

cd backend
npm install
cd ..

4. Configure Environment Variables

Create a .env file in the backend directory if your backend loads its environment variables from there.

Example:

PORT=5002
MONGODB_URI=mongodb://127.0.0.1:27017/chatsphere
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173

Update the values to match your application’s configuration.

If you use MongoDB Atlas, replace the local MongoDB URI with your Atlas connection string.

Security: Never commit real credentials, database passwords, or production secrets to GitHub. Use .env.example to document required variables without exposing sensitive values.

5. Start the Backend

Open a terminal:

cd backend
npm start

If your backend does not define a start script, use:

node server.js

The backend should start on the port configured in your environment variables.

For example:

http://localhost:5002

The actual API base URL depends on your backend configuration.

6. Start the Frontend

Open a second terminal in the project root:

npm run dev

Open the Vite development URL:

http://localhost:5173

Register an account or log in to start using ChatSphere.

⸻

⚙️ Environment Configuration

A typical project configuration may look like this:

Backend Environment

PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
CLIENT_URL=http://localhost:5173

Frontend Environment

If your frontend uses environment variables for API configuration, a Vite variable might look like:

VITE_API_URL=http://localhost:5002

Only configure variables that your application actually uses.

Important: Vite exposes variables prefixed with VITE_ to browser-side code. Never place passwords, private keys, or server secrets in frontend environment variables.

⸻

📁 Project Structure

Chat Application/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── conversations.js
│   │   ├── messages.js
│   │   └── uploads.js
│   ├── tests/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── data/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── public/
├── docs/
│   └── screenshots/
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── README.md

This is a representative structure. Keep only the files and directories that actually exist in your repository, and update the names to match your implementation.

⸻

🔌 API Overview

The following table illustrates the typical endpoints for a chat application. Confirm the actual routes in your backend before publishing this section as API documentation.

Module	Method	Endpoint	Purpose
Authentication	POST	/api/auth/register	Register a user
Authentication	POST	/api/auth/login	Authenticate a user
Users	GET	/api/users	Retrieve users
Users	PUT	/api/users/profile	Update a profile
Conversations	GET	/api/conversations	Retrieve conversations
Conversations	POST	/api/conversations	Create a conversation
Messages	GET	/api/messages/:conversationId	Retrieve messages
Messages	POST	/api/messages	Create a message
Uploads	POST	/api/upload	Upload a file
Payments	POST	/api/payments	Execute the demo payment flow

Socket.IO Events

Depending on the implementation, real-time events may include:

* Joining a conversation room.
* Sending and receiving messages.
* Typing indicators.
* Message reactions.
* Read receipts.
* User connection and disconnection.
* Group conversation updates.

⸻

🧪 Testing

Run the backend test suite if it is configured:

cd backend
npm test

If automated tests are not yet implemented, test the following scenarios manually.

Authentication

* Register a new user.
* Log in with valid credentials.
* Verify that invalid credentials are rejected.
* Confirm that protected routes require authentication.

Messaging

* Send a message between two accounts.
* Confirm that the recipient receives it in real time.
* Reload the application and verify message persistence.
* Test message replies, edits, and deletion.

Group Conversations

* Create a group.
* Add participants.
* Test administrator and member permissions.

Media & Connectivity

* Upload and download permitted files.
* Test voice notes.
* Verify that unauthorized users cannot access private conversations.
* Test behavior when the database or network becomes unavailable.

⸻

🔐 Security

ChatSphere uses several technologies intended to protect user accounts and application data.

Security Features

* JWT-based authentication.
* Password hashing with bcrypt.
* Authenticated backend routes.
* Environment-based configuration.
* Configurable CORS policies.
* Server-side request validation.

Recommended Production Improvements

* Use secure, httpOnly cookies where appropriate for authentication.
* Enforce authorization on every private conversation and message operation.
* Validate file types, file sizes, and upload permissions.
* Apply rate limiting to authentication and sensitive endpoints.
* Serve production traffic exclusively over HTTPS.
* Store uploaded files in controlled storage with appropriate access restrictions.
* Avoid logging passwords, tokens, and sensitive message content.
* Add automated tests for authentication and authorization.

Privacy note: Authentication and HTTPS do not provide end-to-end encryption. Unless a separate end-to-end encryption system is implemented, the server may be able to access stored message content.

⸻

🌟 Advantages

* Real-time communication.
* Modern and responsive interface.
* Direct and group messaging.
* Persistent conversations.
* File and voice-message sharing.
* Modular full-stack architecture.
* Cross-platform browser access.
* Customizable user experience.
* Practical implementation of networking and database concepts.
* Suitable for demonstrating full-stack development skills.

⸻

⚠️ Known Limitations

Depending on the current implementation:

* MongoDB availability is required for persistent database-backed functionality.
* Local file storage is not suitable for many production deployments.
* In-memory rate limiting does not scale reliably across multiple server instances.
* Browser token storage requires careful security consideration.
* Real-time communication needs proper reconnection and error handling.
* Multiple-account behavior must be tested using separate sessions.
* The demo payment flow does not represent a real payment gateway.
* Production deployment requires environment-specific configuration.
* End-to-end encryption is not included unless separately implemented.

⸻

🔮 Future Improvements

* Secure cookie-based authentication.
* Online status and last-seen information.
* Message pagination and search highlighting.
* Cloud storage integration.
* Push notifications.
* Improved mobile responsiveness.
* Message delivery status.
* End-to-end encryption.
* Redis-based distributed rate limiting.
* Docker deployment.
* Continuous integration and automated testing.
* Progressive Web App support.
* Accessibility improvements.
* Production payment gateway integration.
* Monitoring, logging, and performance optimization.

⸻

🤝 Contributing

Contributions and suggestions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test your changes locally.
5. Commit your work.
6. Push the branch to your fork.
7. Open a Pull Request.

Please do not commit environment files containing secrets, private keys, user uploads, or other sensitive data.

⸻

📄 License

This project is intended to use the MIT License.

Add a LICENSE file containing the full MIT License text before distributing the project under this license.

⸻

👨‍💻 Author

B. Karthik Reddy

GitHub: https://github.com/karthikrdy7

⸻

⭐ If you like ChatSphere, consider giving the repository a star!

Chat. Connect. Communicate. — All in one place.
