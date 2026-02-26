# Smart Learning Management System

Welcome to the **Smart Learning Management System**. This is a powerful, AI-driven educational platform built to facilitate seamless course creation, student engagement, and robust administrative control.

---

## 🏗️ Project Architecture

The system is split into two primary segments: a robust Node.js/Express backend and a responsive React frontend.

### 1. Backend (`/backend`)
Handles business logic, database management, authentication, and external AI integrations.
- **`/controllers`**: Core business logic.
  - `adminController.js`: Manages system-wide stats, user controls, reporting, and broadcast functionalities.
  - `authController.js`: JWT-based user authentication, login, and registration.
  - `courseController.js`: Course CRUD operations and content fetching.
  - `quizController.js`: AI-generated and custom quiz evaluations.
  - `studentController.js`: Student enrollment, progress tracking, and activity logging.
  - `webhookController.js`: Third-party system webhooks.
- **`/routes`**: Express route definitions mapping endpoints to controller logic.
- **`/middleware`**: Security layer, predominantly authentication verification (`authMiddleware.js`).
- **`server.js`**: Application entry point spinning up the Express server.
- **`db.js`**: Database connection pool setup (PostgreSQL).

### 2. Frontend (`/smart-learn-muse-main/src`)
A modern, component-driven UI leveraging React, TypeScript, Tailwind CSS, and Framer Motion.
- **`/pages`**: Role-based views.
  - **`/admin`**: Dashboards, User Management, Reports, Course Management, and Notifications.
  - **`/instructor`**: Course creation pipelines, student analytics, performance grading.
  - **`/student`**: Learning environments, course catalog, profile settings, dynamic quiz taker.
- **`/components`**: Reusable UI blocks forming the design system.
  - **`/layout`**: Structural components like `AppSidebar.tsx` and `DashboardLayout.tsx`.
  - **`/ui`**: Micro-components such as buttons, dialogs, inputs, progress bars.
  - **`/courses`** & **`/features`**: Specialized interactive modules (e.g., PerformanceCharts, TimeTracker).
- **`/services`**: Network call handlers (`api.ts`).
- **`/context`**: Global states (`AuthContext.tsx`).
- **`/hooks`**: Custom React hooks (`use-toast.ts`, etc.).
- **`App.tsx`**: React Router navigation wrapper.
- **`main.tsx`**: Core mount point into `index.html`.

---

## 🚀 Getting Started

To launch the project locally, run both the backend server and frontend application.

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Start the Backend
```bash
cd backend
npm install
npm run dev
```

### Start the Frontend
```bash
cd smart-learn-muse-main
npm install
npm run dev
```

### Environment Variables (.env)
You will need an `.env` file in the `/backend` folder. Required keys:
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `JWT_SECRET`
- `AI_API_KEY` (if utilizing AI generation services)

---

## 🛠️ Tech Stack Ecosystem
- **Core Frontend**: React, TypeScript, Vite
- **Styling & UI**: Tailwind CSS, shadcn/ui, Radix UI, Framer Motion
- **Data Fetching/State**: Axios, React Query
- **Charting**: Recharts
- **Icons**: Lucide React
- **Backend API**: Node.js, Express
- **Database**: PostgreSQL (pg)

---

> Highly scalable, role-segmented architecture built for long-term expandability!
