# AI Campus Copilot - Web Application

A modern, grounded AI assistant and student dashboard for university campuses, built with HTML5, Tailwind CSS, and Vanilla JavaScript.

## Features & Routes

1. **Dashboard** (`#dashboard`):
   - Academic greeting banner with enrolled semester status
   - Quick metrics: next session, attendance, pending tasks, and CGPA from connected student data
   - Today's live schedule timeline with route and AI syllabus actions
   - Instant grounded query shortcuts & recent urgent circulars
   - To-do deadlines checklist & upcoming academic milestones

2. **AI Assistant** (`#ai-assistant`):
   - Pixel-perfect implementation of the Stitch design prototype
   - Left conversation history sidebar (Pinned, Today, Yesterday, Previous 7 Days)
   - Interactive prompt composer with file attachment preview & voice mic toggle
   - Contextual follow-up query chips
   - Grounded responses with syllabus citations, room directions, and attendance calculations
   - Right context dock with downloadable resources & academic calendar

3. **Timetable** (`#timetable`):
   - Weekly interactive schedule (Monday through Friday)
   - Type filtering: All, Lectures, Labs, Tutorials
   - Live ongoing session indicator
   - "View Route" and "Syllabus & Notes" instant action buttons

4. **Notices** (`#notices`):
   - Categorized bulletin board (Examinations, Academic, Facilities, Placements)
   - Search filter and "Mark all as read" capability
   - Downloadable official PDF circular attachments
   - Instant "Ask Copilot to explain" button for every notice

5. **Study Assistant** (`#study-assistant`):
   - Enrolled courses hub (CS-204 DSA, CS-206 DBMS, CS-208 OS)
   - Curriculum unit progress tracker
   - Interactive AVL Tree Single Right Rotation visualizer
   - Interactive 3-question practice quiz modal with instant scoring
   - Downloadable syllabus & formula cheat sheet PDFs

6. **Campus Guide** (`#campus-guide`):
   - Campus venues directory populated from connected campus location data
   - Live shuttle bus schedule and GPS arrival tracker (Routes 1–4)
   - Building operating hours, amenities, and contact info

7. **Events** (`#events`):
   - Campus hackathons, tech talks, cultural fest, and career drives
   - Interactive "Register Now" / "Cancel" state toggle
   - Calendar sync action and attendee count telemetry

8. **My Tasks** (`#my-tasks`):
   - Task manager with status filtering (All, To Do, In Progress, Completed)
   - Priority badges and due date countdowns
   - "Create New Task" modal form
   - Checkboxes that dynamically update sidebar task badges

9. **Settings** (`#settings`):
   - Student profile information editor
   - AI Copilot RAG grounding preferences
   - Academic alert notifications settings
   - Local conversation cache management

10. **Admin Panel** (`#admin-panel`):
    - Authoritative RAG Knowledge Base table (CS-204 syllabus, Student Handbook, Exam Datesheet)
    - Simulated "Sync Vector Database" re-indexing action
    - Query volume telemetry & latency metrics
    - Broadcast circular publisher

## Global Enhancements

- **⌘K Command Palette**: Press `⌘K` or `Ctrl+K` or click the search bar to search across routes, documents, and run AI queries.
- **Mobile Responsive Drawer**: Accessible slide-in menu for small screens with backdrop overlay.
- **Toast Notifications**: Feedback for user actions (task completion, event registration, downloads).
- **Zero External Dependencies**: Self-contained SVG avatars and icons that load reliably offline.

## How to Run

1. Open a terminal in this directory:
   ```bash
   cd "C:\Users\Dell\.gemini\antigravity\scratch\ai-campus-copilot"
   ```

2. Start a local HTTP server:
   ```bash
   python -m http.server 3000
   ```

3. Open in your browser:
   [http://localhost:3000](http://localhost:3000)
