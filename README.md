<div align="center">

<h1><sup>💼</sup>Project Management System<sub>📊</sub> </h1>

Modern Full-Stack Project Management System with Real-time Collaboration & Automated Notifications

![Version](https://img.shields.io/badge/version-2.0.0-success?style=flat-square)

**Built with cutting-edge technologies for modern team collaboration:**

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.4.1-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🏗️ Project Structure](#-project-structure)
- [⚡ Getting Started](#-getting-started)
- [🗄️ Database Schema](#-database-schema)
- [📡 API Endpoints](#-api-endpoints)
- [🔄 Real-time & Services](#-real-time--services)
- [🎨 UI/UX Features](#-uiux-features)
- [🚀 Deployment](#-deployment)

---

## ✨ Features

### 🔐 Authentication & Security
- Custom JWT-based authentication system
- Secure password hashing with bcryptjs
- Profile avatar uploads via Cloudinary

### 🏢 Workspace Management
- Create multiple workspaces
- Invite and manage team members
- Role-based access control (Admin/Member)
- Easy workspace switching

### 📋 Project & Task Management
- Create and manage projects with timelines and priorities
- Create tasks with assignees, due dates, and types (Bug, Feature, etc.)
- Kanban-style task status updates

### 🔔 Smart Notifications & Collaboration
- **Real-time Updates:** Instant task and project updates via Socket.io
- **Live Comments:** Real-time task discussions
- **Email Notifications:** Automated emails for task assignments via Nodemailer

---

## 🛠 Tech Stack

### Frontend
- **React.js (Vite)**
- **Redux Toolkit** (State Management)
- **Tailwind CSS v4** (Styling & Dark Mode)
- **Socket.io-client** (Real-time updates)
- **Axios** (API requests with JWT Interceptors)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Database & ORM)
- **Socket.io** (WebSocket Server)
- **JSON Web Tokens (JWT)** (Authentication)

### Services & Integrations
- **Cloudinary** (Media/Avatar storage)
- **Nodemailer** (SMTP Email delivery)

---

## 🏗️ Project Structure

```groovy
project-management-system/
├── 📁 client/                    # React Frontend
│   ├── src/
│   │   ├── app/                 # Redux store
│   │   ├── components/          # Reusable UI components
│   │   ├── configs/             # Axios API config
│   │   ├── context/             # Custom AuthContext
│   │   ├── features/            # Redux slices (workspace, etc.)
│   │   ├── pages/               # Application routes
│   │   ├── App.jsx              # Main App component
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Frontend env variables
│   └── vite.config.js           # Vite configuration
│
├── 📁 server/                   # Express Backend
│   ├── configs/                 # DB, Cloudinary, Nodemailer config
│   ├── controllers/             # Route controllers
│   ├── middlewares/             # Auth & Upload middlewares
│   ├── models/                  # Mongoose Schemas
│   ├── routes/                  # API route definitions
│   ├── .env                     # Backend env variables
│   └── server.js                # Server & Socket.io entry point
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Cloudinary Account (for image uploads)
- SMTP Credentials (e.g., Gmail App Password)


### Backend Setup

```console
cd server
npm install
# Create a .env file and configure variables (see below)
npm start
```

### Frontend Setup

```console
cd client
npm install
# Create a .env file and configure variables (see below)
npm run dev
```

### Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
DATABASE_URL="mongodb://127.0.0.1:27017/project-management-system"
JWT_SECRET="your_super_secret_jwt_key"

# Cloudinary Config
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# SMTP Mail Config (Default: Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
SENDER_EMAIL="your_email@gmail.com"
```



## 🗄️ Database Schema (Mongoose Models)

- **User:** Authentication details, profile image, role.
- **Workspace:** Contains projects and workspace-level settings.
- **WorkspaceMember:** Maps Users to Workspaces with specific roles.
- **Project:** Timelines, status, priority. Contains ProjectMembers.
- **Task:** Types (Bug, Feature), status (ToDo, Done), due dates, assignee.
- **Comment:** Real-time task discussions linked to users and tasks.

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and receive JWT

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace
- `POST /api/workspaces/:id/invite` - Invite members

### Projects & Tasks
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task status/details

### Comments (Real-time)
- `POST /api/comments` - Add task comment
- `GET /api/comments/:taskId` - Fetch task comments

---

## 🔄 Real-time & Services

- **Socket.io:** Handles live synchronization. When a task is updated or a comment is posted, the server emits events (`task_updated`, `comment_added`) to connected clients in the same project room.
- **Nodemailer:** Automatically sends an email notification to the `assignee` whenever a new task is created.
- **Cloudinary & Multer:** Handles secure multipart/form-data image uploads for user profiles.

---

## 🎨 UI/UX Features

- **Glassmorphism Design:** Modern, premium aesthetic with subtle blurs and gradients.
- **Dark Mode Optimized:** Beautiful dark theme using Tailwind CSS `dark:` modifiers.
- **Responsive Layouts:** Fully functional on mobile, tablet, and desktop viewports.
