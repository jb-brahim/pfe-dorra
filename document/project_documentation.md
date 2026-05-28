# RH Assistant: Comprehensive Folder & File Documentation

This document provides a highly detailed file-by-file and folder-by-folder analysis of the **RH Assistant** (Smart HR Recruitment Platform). It covers both the **Backend** and the **Frontend**, detailing the structural architecture, functional purposes, code mechanics, API endpoints, database schemas, and state management logic. It is structured to serve directly as a reference for your graduation thesis (Rapport de PFE).

---

# PART A: THE BACKEND ARCHITECTURE (`rh-assistant-backend`)

The backend is built with **Node.js, Express.js, and MongoDB** (integrated via the Mongoose ODM). It coordinates CV uploading, runs automatic keyword parsing, handles scoring criteria rules, processes webhooks from the n8n automation server, and sends SMTP emails for interview setups and rejections.

## 1. Root Files
Located in the root of the `/rh-assistant-backend` directory.

* ### `server.js`
  * **Role**: Entry point of the Express application.
  * **Details**: Loads system environment variables from the `.env` file using the `dotenv` package, initializes the MongoDB connection by calling `connectDB()`, and configures global Express middlewares (CORS support for cross-origin requests, JSON body parsing for payload ingestion, and static file serving for candidate CV uploads stored in the `/uploads` directory). It imports all system route modules and mounts them under specific endpoint prefixes:
    * `/api/auth` $\rightarrow$ Authentication
    * `/api/jobs` $\rightarrow$ Job posting board
    * `/api/candidates` $\rightarrow$ Candidate profiles
    * `/api/webhooks` $\rightarrow$ n8n pipeline ingestion
    * `/api/emails` $\rightarrow$ Smart Inbox management
    * `/api/dashboard` $\rightarrow$ HR overview statistics
    * `/api/events` $\rightarrow$ Interview scheduler
  * **Code Mechanics**: Initiates the HTTP server listening on the configured `PORT` (defaults to `5000`).
* ### `.env`
  * **Role**: Application environment configuration.
  * **Details**: Contains sensitive keys, database URIs, and credentials:
    * `PORT`: Server port (e.g., `5000`).
    * `MONGO_URI`: Connection string to MongoDB database instance.
    * `JWT_SECRET`: Secret key used to sign and verify JSON Web Tokens (JWT) for authentication.
    * `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`: SMTP credentials to send automated responses.
    * `FROM_NAME`, `FROM_EMAIL`: Sender details displayed on automated emails.
* ### `package.json`
  * **Role**: Project dependencies and scripts definition.
  * **Details**: Defines Node.js dependencies: `express` (routing framework), `mongoose` (ODM for MongoDB), `bcryptjs` (password hashing), `jsonwebtoken` (auth tokens), `multer` (multipart/form-data parser for CV file uploads), `nodemailer` (SMTP email clients), `pdf-parse` (pdf parsing engine), and development scripts (e.g., `npm run dev` to start server using `nodemon`).
* ### `error.log`
  * **Role**: Crash-reporting log file.
  * **Details**: Stores application errors, stack traces, and request details for debugging database validation failures or webhook schema mismatches.
* ### `diagram.mmd`
  * **Role**: Mermaid diagram source file.
  * **Details**: Defines the system architecture and database relationships.
* ### `uml_diagram.png`
  * **Role**: Generated UML image file.
  * **Details**: Visual representation of database models and backend route logic.

---

## 2. Configuration Folder (`/config`)
Manages external resource connections.

* ### `config/db.js`
  * **Role**: MongoDB database connection manager.
  * **Details**: Exports an asynchronous function `connectDB` that uses `mongoose.connect(process.env.MONGO_URI)` to establish a connection to the MongoDB cluster. It handles connection success (logging the connected database host) and failure states (logging the error and exiting the process).

---

## 3. Database Models Folder (`/models`)
Defines the Mongoose database schemas, object shapes, validations, and hooks.

* ### `models/User.js`
  * **Role**: HR Operator and Admin user schema.
  * **Fields**:
    * `name` (String, required): User's display name.
    * `email` (String, required, unique): Login email (validated via regular expression).
    * `password` (String, required, hidden by default): Hashed login credentials.
    * `role` (String, enum: `['HR', 'Admin']`): Role determining access permissions.
  * **Hooks**: A pre-save mongoose middleware checks if the password was modified and hashes it using `bcryptjs` (10 salt rounds) before storing it.
  * **Methods**: Implements `matchPassword` to compare plain text passwords (entered during login) against the stored hash.
* ### `models/JobPosting.js`
  * **Role**: Job advertisement and scoring weights schema.
  * **Fields**:
    * `title` (String, required): Job title.
    * `description` (String, required): Detailed job description.
    * `location` (String): e.g., "Tunis, Tunisia (Hybrid)".
    * `type` (String, enum: `['Full-time', 'Part-time', 'Contract', 'Internship']`).
    * `department` (String): e.g., "Engineering".
    * `experience` (String): Recommended experience range.
    * `priority` (String, enum: `['Low', 'Medium', 'High']`).
    * `scoringCriteria` (Array of sub-documents): Defines `{ skill: String, points: Number }`. Used for matching CV parser outputs.
    * `status` (String, enum: `['Active', 'Closed', 'Open']`): Hiring status of the opening.
    * `createdBy` (ObjectId): Links the job posting to the HR `User` who created it.
* ### `models/Candidate.js`
  * **Role**: Extracted CV details and hiring status schema.
  * **Fields**:
    * `jobPostingId` (ObjectId): Links the candidate to the target `JobPosting`.
    * `personalInfo`: Sub-document containing `fullName`, `email`, `phone`, and `cvUrl` (path to PDF storage).
    * `aiAnalysis`: Complex nested object storing AI analysis results:
      * `summary` (String): Generated profile description.
      * `extractedSkills` (Array of Strings): Key technical qualifications parsed from the CV.
      * `education` (Mixed): Parsed degrees.
      * `experienceYears` (Number): Deduced duration of industry experience.
      * `certifications` / `languages` / `portfolioLinks` (Mixed): Extracted metadata.
      * `missingSkills` (Array of Strings): Skills present in the job posting's scoring criteria but missing from the candidate's CV.
      * `recommendationLevel` (String, enum: `['Highly Recommended', 'Recommended', 'Not Recommended']`).
    * `matchScore` (Number): Evaluated match score percentage.
    * `status` (String, enum: `['Pending', 'Screening', 'Interviewing', 'Interview', 'Offered', 'Hired', 'Rejected']`).
    * `notes` (String): Notes logged by HR.
    * `workExperience` (Mixed): Array of parsed positions, company names, durations, and description bullets.
* ### `models/Email.js`
  * **Role**: Archive of incoming applications and system emails.
  * **Fields**:
    * `senderName` / `senderEmail` (String): Sender details.
    * `subject` / `body` (String): Text content of the email.
    * `category` (String, enum: `['Applications', 'Job Interview', 'Important', 'Others']`): Classified by AI.
    * `priority` (String, enum: `['High', 'Medium', 'Low']`).
    * `isRead` / `isStarred` / `isArchived` / `isDeleted` (Boolean): HR email client settings.
    * `candidateId` (ObjectId): Link to `Candidate` profile.
    * `cvUrl` (String): Attached CV.
* ### `models/Event.js`
  * **Role**: Calendar scheduler appointments.
  * **Fields**:
    * `title` (String, required): Event title (e.g. "Interview with Dorra").
    * `description` (String): Meeting agenda.
    * `type` (String, enum: `['Interview', 'Meeting', 'Task', 'Deadline']`).
    * `date` (Date, required): Scheduled timestamp.
    * `candidateId` (ObjectId): Link to candidate.
    * `organizer` (ObjectId): Link to User.
    * `attendees` (Array of Strings): Email list of invitees.
    * `status` (String, enum: `['Scheduled', 'Completed', 'Cancelled']`).

---

## 4. API Controllers Folder (`/controllers`)
Contains the application logic for incoming requests.

* ### `controllers/authController.js`
  * **Role**: User authentication controller.
  * **API Methods**:
    * `register()`: Extracts user data, checks for existing registration, hashes passwords via schema hooks, saves the new `User`, and returns a JWT token.
    * `login()`: Queries `User` by email, fetches hidden password hash, validates using `matchPassword`, and returns user profile alongside signed token.
    * `getMe()`: Returns current user information (`req.user`) populated by auth middleware.
* ### `controllers/jobController.js`
  * **Role**: Job posting management logic.
  * **API Methods**:
    * `getJobs()`: Retrieves job postings. Uses `Promise.all` to query `Candidate` collection and dynamically count the number of total applications and new candidates (`Pending`) for each job position.
    * `createJob()`: Saves a new job advertisement, assigning `req.user.id` as the publisher. Log details are written to `error.log` in case of failure.
    * `getJob()`, `updateJob()`, `deleteJob()`: Retrieval, update, and deletion operations for specific job IDs.
* ### `controllers/candidateController.js`
  * **Role**: Candidate profile actions, manual CV uploads, and automated mail alerts.
  * **API Methods**:
    * `getCandidates()`: Queries candidate list, filtering by `jobId` if provided. Populates linked job posting titles.
    * `getCandidate()`: Fetches a single candidate record by ID.
    * `createCandidate()`: Registers candidate details manually from the dashboard form.
    * `updateCandidateStatus()`: Updates candidate status (e.g., to `Rejected` or `Interviewing`). If set to `Rejected`, it triggers an automated rejection email. If set to `Interviewing`, it schedules the date and sends an email invitation.
    * `uploadCvAndEvaluate()`: Endpoint for manual CV uploads (utilizing `multer` middleware). It:
      1. Saves the CV PDF to the `/uploads` folder.
      2. Calls local utility `extractTextFromPDF` to parse PDF text, and `extractWorkExperience` to extract experience details.
      3. Performs an upsert operation for the `Candidate` record.
      4. Forwards the uploaded PDF CV as an attachment to a designated inbox to trigger the n8n automation pipeline.
* ### `controllers/webhookController.js`
  * **Role**: Processes structured data sent by n8n.
  * **API Methods**:
    * `receiveEmailData()`: Endpoint that receives extracted data from n8n. It performs matching score calculations, updates candidate records, files email logs, and schedules interviews:
      * Extracted candidate email is resolved from payload parameters or body regex parsing.
      * **Smart Job Link**: If no `jobId` is provided, it links the candidate to an open job matching the email subject or body text.
      * **Match Rating**: Iterates through the job posting's scoring criteria (skills and points). Compares them to `extractedSkills`. Matches sum points over total possible score. Log missing skills.
      * **Experience Parsing**: Parses text from PDF via regex matching.
      * **Candidate Profile Ingestion**: Creates a new candidate or updates an existing one, updating match score, skills, summary, and recommendation level.
      * **Email Cataloging**: Stores the email under the parsed category.
      * **Auto-Scheduling**: If a meeting date is found or category is `Job Interview`, it schedules an `Event` automatically.
* ### `controllers/emailController.js`
  * **Role**: Inbox actions.
  * **API Methods**:
    * `getEmails()`: Fetches all stored emails sorted by date.
    * `updateEmail()`: Updates states like `isRead`, `isStarred`, `isArchived`, or `isDeleted`.
    * `sendReply()`: Sends a custom reply email to a candidate using HTML body formatting.
* ### `controllers/eventController.js`
  * **Role**: Calendar scheduler manager.
  * **API Methods**:
    * `getEvents()`: Returns scheduled events.
    * `createEvent()`: Creates a meeting. If `type === 'Interview'`, it automatically updates the candidate's status to `Interview` and sends an invitation email.
    * `deleteEvent()`: Removes a calendar event.
    * `deleteEventByCandidate()`: Deletes calendar entries associated with a deleted candidate profile.
* ### `controllers/dashboardController.js`
  * **Role**: Computes dashboard analytics.
  * **API Methods**:
    * `getDashboardStats()`: Returns summary stats (total candidates, pending, interviewing, offered, rejected), upcoming reminders, top-ranked candidates sorted by matching scores, and a list of the 4 most recent emails.

---

## 5. Middleware Folder (`/middleware`)
Intercepts HTTP requests for processing.

* ### `middleware/authMiddleware.js`
  * **Role**: Authentication and authorization guard.
  * **Details**: Provides a `protect` middleware that parses the `Bearer` token from the `Authorization` request header. It decodes the user ID using `jsonwebtoken` and appends user information (`req.user`) to the request.
  * **Development Fallback**: In development mode, if no token is found, it automatically retrieves or creates a default user profile ("Sarah Johnson", Role: "HR") so frontend features continue working without disruption.
  * **Authorization Guard**: The `authorize(...roles)` function checks the user's role and restricts access if they lack authorization.

---

## 6. API Routing Folder (`/routes`)
Maps HTTP paths to controller handlers.

* ### `routes/authRoutes.js` $\rightarrow$ Auth endpoints (`/register`, `/login`, `/me`).
* ### `routes/jobRoutes.js` $\rightarrow$ Job board actions (`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`).
* ### `routes/candidateRoutes.js` $\rightarrow$ Candidate endpoints (`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `/upload-cv`).
* ### `routes/webhookRoutes.js` $\rightarrow$ Receiver path for n8n payload (`POST /incoming-email`).
* ### `routes/emailRoutes.js` $\rightarrow$ Inbox actions (`GET /`, `PUT /:id`, `POST /reply`).
* ### `routes/eventRoutes.js` $\rightarrow$ Calendar actions (`GET /`, `POST /`, `DELETE /:id`).
* ### `routes/dashboardRoutes.js` $\rightarrow$ Stats entrypoint (`GET /`).

---

## 7. Services Folder (`/services`)
Contains external integrations.

* ### `services/emailService.js`
  * **Role**: Mock email sender service.
  * **Details**: Implements fallback log outputs and helper utilities (`sendRejectionEmail`, `sendInterviewInvite`) to simulate message dispatching.

---

## 8. Utilities Folder (`/utils`)
Helper utilities and parsing engines.

* ### `utils/emailService.js`
  * **Role**: SMTP Mail sender wrapper.
  * **Details**: Uses `nodemailer` to create an SMTP connection pool using environment credentials, builds formatting envelopes, and sends emails.
* ### `utils/resumeParser.js`
  * **Role**: Regular expression-based resume parsing engine.
  * **Details**:
    * `extractTextFromPDF()`: Reads PDF files and parses text content using `pdf-parse`.
    * `extractWorkExperience()`: Processes raw text using regular expressions to identify chronological positions, company names, timelines, and description bullet points.
    * **Test fallbacks**: Contains fallback profiles for test runs matching key terms (SOSOB/Tunisie Telecom for Dorra's MERN profile, and Gafsa/Swing for Brahim's Java profile).

---

## 9. Scripts Folder (`/scripts`)
Administrative batch scripts.

* ### `scripts/attachExistingCVs.js` $\rightarrow$ Links files in the `/uploads` directory to candidate database profiles.
* ### `scripts/cleanupEmpty.js` $\rightarrow$ Removes empty candidate entries.
* ### `scripts/clearDb.js` $\rightarrow$ Clears database collections for clean demo resets.

---

# PART B: THE FRONTEND ARCHITECTURE (`rh-assistant-frontend`)

The frontend is built with **Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS**. It features a modern dashboard UI with glassmorphism effects, data charts, and dynamic sliders.

```
/rh-assistant-frontend
├── app/                  # App Router views & layouts
├── components/           # UI components (Shadcn)
├── hooks/                # Custom React Hooks
├── lib/                  # API clients and Mock Data
├── public/               # Public assets and placeholders
├── styles/               # Global CSS files
└── types/                # TypeScript interface declarations
```

---

## 1. App Router Folder (`/app`)
Contains the application's page routes.

* ### `app/layout.tsx`
  * **Role**: Root application layout.
  * **Details**: Wraps the application with global font configurations (Inter/Outfit), initializes the light/dark theme provider, and loads styling configurations.
* ### `app/app-layout.tsx`
  * **Role**: Dashboard skeleton layout and navigation.
  * **Details**: Implements the layout featuring the sidebar, dynamic active state styling, a mobile menu, and user info. It polls `/api/emails` every 30 seconds to update the unread mail badge count in the navigation.
* ### `app/page.tsx`
  * **Role**: Root landing page router.
  * **Details**: Uses Next.js `redirect('/dashboard')` to forward users to the dashboard.
* ### `app/globals.css`
  * **Role**: Main styling sheet.
  * **Details**: Registers Tailwind CSS directives, defines theme variables, and sets glassmorphism styles (`.glass`).
* ### `app/dashboard/page.tsx`
  * **Role**: HR Home Dashboard page.
  * **Details**:
    * Displays stats cards with trend indicators.
    * Renders a circular donut chart of the recruitment pipeline using `recharts`.
    * Displays upcoming interview reminders and top candidates.
* ### `app/mails/page.tsx`
  * **Role**: Smart Inbox mail client.
  * **Details**:
    * Implements a 40/60 split pane layout.
    * *Left column*: Lists emails with pagination and status filters.
    * *Right column*: Shows email body, attachment download triggers, and the **AI Extracted Information** section displaying candidates' contact info, skills badges, and matching scores.
    * Includes modals for scheduling interviews and reviewing AI-generated drafts.
* ### `app/candidates/page.tsx`
  * **Role**: Candidates directory list.
  * **Details**: Displays a table of applicants with search filters, match score progress bars, and status edit dropdowns.
* ### `app/candidates/[id]/page.tsx`
  * **Role**: Candidate profile page.
  * **Details**:
    * Displays candidate profile info and a matching score indicator.
    * Tabbed sections: Overview (Skills gap matching), CV preview (embedded PDF viewer), Timeline (experience), and Notes.
    * Includes a visual status stepper.
* ### `app/jobs/page.tsx`
  * **Role**: Hiring manager and jobs board.
  * **Details**:
    * Allows creating and editing jobs.
    * Provides a skill points allocator to set scoring weights for candidate CV matching.
* ### `app/interviews/page.tsx`
  * **Role**: List of candidates scheduled for interviews.
  * **Details**: A directory for tracking upcoming candidate evaluations.
* ### `app/calendar/page.tsx`
  * **Role**: Calendar view.
  * **Details**: Displays scheduled events and interviews on a monthly calendar grid.
* ### `app/email-templates/page.tsx`
  * **Role**: Automated email templates editor.
  * **Details**: Customizes templates for interview invites, rejection letters, and offers.
* ### `app/reports/page.tsx`
  * **Role**: Reports & analytics page.
  * **Details**: Analytics dashboard displaying hiring trends.
* ### `app/settings/page.tsx`
  * **Role**: Platform settings.
  * **Details**: Configures database limits, email parameters, and user profiles.

---

## 2. Shared Components Folder (`/components`)
Reusable UI modules.

* ### `components/theme-provider.tsx` $\rightarrow$ Context provider for light/dark mode states.
* ### `components/ui/` $\rightarrow$ Shadcn UI components wrapper:
  * Includes elements like `button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `toast.tsx`, `dialog.tsx`, and `dropdown-menu.tsx`.

---

## 3. Libraries & Utilities Folder (`/lib`)
Configuration clients and helper functions.

* ### `lib/api.ts`
  * **Role**: REST API communication client.
  * **Details**: Configures connection methods (GET, POST, PUT, DELETE) pointing to the backend API (`http://localhost:5000/api`).
* ### `lib/utils.ts` $\rightarrow$ Class merge helper for dynamic Tailwind styling.
* ### `lib/mock-data.ts` $\rightarrow$ Provides mock data for UI testing.

---

## 4. Custom Hooks (`/hooks`)
Abstracts React states.

* ### `hooks/use-toast.ts` $\rightarrow$ Coordinates notification toast banners.
* ### `hooks/use-mobile.ts` $\rightarrow$ Detects screen sizes for responsive layout adjustments.

---

## 5. Global Types (`/types`)
Type definitions for TypeScript.

* ### `types/index.ts` $\rightarrow$ Defines types for `Candidate`, `JobPosting`, `Email`, and `Event` objects.

---

## 6. Public Assets (`/public`)
Static assets, images, and placeholder icons.

---

# PART C: AUTOMATION PIPELINE (n8n & Groq AI)

The n8n automation pipeline handles email trigger extraction:

1. **IMAP Email Trigger**: Listens for incoming emails with PDF CV attachments.
2. **Extract From File**: Parses text content from the PDF attachment.
3. **Groq AI Node**: Passes the email text and parsed PDF to the Groq API (`llama3-8b-8192`) with a system prompt to extract name, phone, experience, and skills in JSON format.
4. **Format JavaScript Node**: Combines email metadata (sender name, subject, body text) with the Groq AI JSON object.
5. **Send to Backend Webhook**: Sends the JSON payload via HTTP POST to the backend's webhook endpoint `/api/webhooks/incoming-email`.
