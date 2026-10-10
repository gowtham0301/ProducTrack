# ProducTrack — Task Management Application

A full-stack task management application built with React, Node.js, Express, and MongoDB. ProducTrack helps users organize tasks, update their progress, and track completed work through a simple, responsive interface.

## Features

- **Create tasks** — Add tasks with title validation.
- **Edit tasks** — Update existing task titles.
- **Track progress** — Change task status between To Do, In Progress, and Completed.
- **Delete tasks** — Remove tasks when they are no longer needed.
- **Search and filter** — Find tasks by title and filter them by status.
- **Dashboard statistics** — View task counts and completion progress.
- **Persistent storage** — Store tasks in MongoDB.
- **Responsive interface** — Use the application on desktop and mobile screens.
- **API validation and error handling** — Handle invalid input and API errors.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development and build tool |
| Bootstrap / CSS | Styling and responsive layout |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| Git and GitHub | Version control |

## Project Structure

```text
ProducTrack/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── server.js
│   ├── package.json
│   └── .gitignore
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB Atlas account or MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/gowtham0301/ProducTrack.git
cd ProducTrack
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
```

Replace the placeholder with your own MongoDB connection string. Never commit your `.env` file or expose database credentials.

Start the backend using the development script configured in `server/package.json`. If the script is named `dev`, run:

```bash
npm run dev
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

**Note:** The frontend API configuration currently uses `http://localhost:5001/api/tasks`. For deployment, configure the frontend to use your hosted backend URL.

## API Endpoints

Base URL: `http://localhost:5001`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Retrieve all tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/` | Check backend health |

### Task Statuses

- `To Do`
- `In Progress`
- `Completed`

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |

Keep credentials private. Use environment variables for secrets and configure them through your hosting provider when deploying.

## Future Improvements

- User authentication and individual task ownership
- Due dates, priorities, and reminders
- Team collaboration
- Automated testing
- Production deployment and live demo

## Author

**Gowtham Petta**

GitHub: [@gowtham0301](https://github.com/gowtham0301)

---

Built as a full-stack web development project to practice React, REST APIs, Express, and MongoDB integration.
