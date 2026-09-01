# Site Blueprint Manager

Construction SOP Management — Lovable Build Prompt

Paste the Master Prompt first to scaffold the app, then paste each Page Prompt in sequence (Lovable handles iterative page-by-page prompts well). Everything below is written to be pasted directly into Lovable.

🎨 Design System (reference this in every prompt)

Theme name: "Site Blueprint" — a construction-industry theme that feels modern and professional, not like a generic SaaS dashboard.

Primary: Deep Safety Orange #E85D25 (CTAs, active states, key actions)

Secondary: Steel Blue #2C3E50 (headers, nav, primary text)

Accent: Safety Yellow #F5B700 (warnings, in-progress states, highlights)

Success: Construction Green #2E7D32 (completed states)

Danger: #C0392B (issues, high priority, overdue)

Neutral/Background: Concrete Gray scale #F7F7F5, #E8E8E4, #B0B0A8 (backgrounds, borders, dividers)

Surface: White #FFFFFF cards on light concrete-gray background

Typography: A clean geometric sans-serif for headings (e.g. Inter/Sora feel — bold, technical, blueprint-like), regular Inter for body text

Iconography: Line icons with a slightly industrial feel (hard hats, blueprints, checklists, hex-bolt accents) — avoid overly playful/rounded icon sets

Visual motif: Subtle blueprint grid-line texture or dotted grid in empty states/backgrounds (very low opacity) to reinforce the construction/technical feel without being noisy

Corners: Slightly squared cards (8px radius, not fully rounded/bubbly) to feel structural rather than "app-like"

Status badges: Pill-shaped, color-coded:

Not Started → gray

In Progress → yellow/amber

Completed → green

Open (issue) → red

Resolved (issue) → green

Blocked/Overdue → dark red with icon

Use this palette and tone consistently across every screen below. Avoid animation-heavy transitions — keep it snappy, minimal, and functional, like a site-management tool a supervisor would trust.

🧩 Master Prompt (paste first)

Build a project-centric Construction SOP (Standard Operating Procedure) Management prototype web app.

CORE CONCEPT
The app manages construction Projects, and each Project has multiple department-wise SOPs (Standard Operating Procedures). Each SOP has multiple ordered Steps that site engineers execute and mark as Not Started / In Progress / Completed. Steps can have supporting Documents attached, and issues encountered during execution are logged into a central Issue Tracker. Projects also have their own top-level Document Checklist, separate from step-level documents.

Hierarchy: Projects → SOPs → SOP Steps → Documents → Issues

NAVIGATION
Left sidebar (collapsible on tablet) with:
- Dashboard
- Projects (primary/default view)
- SOP Library
- Issue Tracker
- Documents (optional, can just deep-link into project docs)

Top bar: app logo/name "SiteFlow" or similar construction-themed name, search bar, user avatar/role badge (e.g. "Project Admin", "Site Engineer").

DESIGN
Use the "Site Blueprint" theme:
- Primary Deep Safety Orange #E85D25, Secondary Steel Blue #2C3E50, Accent Safety Yellow #F5B700, Success Green #2E7D32, Danger Red #C0392B, Concrete Gray backgrounds #F7F7F5/#E8E8E4.
- Clean geometric sans-serif headings, Inter body text.
- Slightly squared cards (8px radius), pill-shaped color-coded status badges, subtle blueprint-grid texture in backgrounds/empty states.
- Desktop and tablet friendly, minimal clicks, clear status indicators, no heavy animation.

DATA MODEL (use mock/sample data seeded in-app, no real backend needed initially, but structure state so it could map to a real DB later)
- Project: id, name, code, location, lat/lng, area, floors, flats, amenities[], start_date, end_date, admin, status
- SOP: id, name, department, description, status (as a library item)
- SOPStep: id, sop_id, step_number, title, description, instructions
- ProjectSOP: id, project_id, sop_id, status, assigned_to (links a library SOP to a project with its own execution status)
- StepExecution: id, project_sop_id, step_id, status, completed_by, completed_at, comments
- Document: id, project_id, sop_id (nullable), step_id (nullable), document_name, file_name, uploaded_by, uploaded_at, required (bool)
- Issue: id, project_id, sop_id, step_id, title, description, priority, assigned_to, status, attachment, created_by, created_at, resolved_at

IMPORTANT BUSINESS RULE: SOPs are reusable master records (SOP Library). A single SOP (e.g. "RCC Work SOP") can be assigned to multiple projects, but each project tracks its own execution status independently via ProjectSOP + StepExecution. Never mutate the master SOP's steps when tracking per-project progress — only the ProjectSOP/StepExecution records change per project.

SEED DATA
Create 3 sample projects (e.g. "Green Valley Residency", "Sunrise Towers", "ABC Heights") each with 4-8 SOPs assigned from a shared SOP Library (Excavation, RCC Work, Brickwork, Plastering, Waterproofing, Electrical, PPE Safety), each SOP with 4-7 realistic construction steps, a mix of step statuses, a handful of uploaded documents, and 3-5 sample issues across projects with varying priority/status.

Do NOT build payroll, accounting, procurement, inventory, complex RBAC, notifications, or analytics. Keep this strictly to: Projects + SOP Library + SOP Execution + Documents + Issues.


📄 Page Prompts

1. Dashboard

Build the Dashboard page for the SiteFlow construction app.

Show a top row of 4 summary stat cards with icons, using the Site Blueprint theme colors:
- Total Projects (with count, steel blue accent)
- SOPs In Progress (amber/yellow accent)
- Open Issues (red accent, with a small "X high priority" sub-label)
- Documents Pending Upload (gray/orange accent)

Below that, a two-column layout:
LEFT (wider): "Active Projects" — a compact list/card view of projects with a mini progress bar showing SOP completion % per project, and status badge. Clicking a project navigates to its Project Details page.
RIGHT (narrower): "Recent Issues" — a compact feed of the 5 most recent issues across all projects, each showing title, project name, priority badge, and status badge. Clicking navigates to Issue Tracker/Issue Detail.

Keep the dashboard simple — no complex charts, just clean cards, progress bars, and status badges consistent with the theme. Add a subtle blueprint-grid texture to the page background.


2. Projects List

Build the Projects List page — this is the primary/home view of the app.

Header: "Projects" title, with a prominent "+ Add Project" button (Deep Safety Orange) top-right, and a search/filter bar (filter by status: Planning / In Progress / Completed).

Body: Grid of project cards (2-3 per row on desktop, 1 per row on tablet). Each card shows:
- Project name (bold, steel blue)
- Location with a small map-pin icon
- Key stats row: Area | Floors | Flats
- Status badge (Planning/In Progress/Completed) top-right of card
- A thin SOP-completion progress bar at the bottom of the card
- "Open Project →" as the card's click affordance (whole card clickable)

Use the concrete-gray page background with white cards, subtle shadow, 8px radius corners. Empty state (no projects) should show a friendly illustration/icon with "Create your first project" CTA.


3. Create/Edit Project (form or modal)

Build a Create/Edit Project form for the SiteFlow app, either as a full page or a slide-over drawer (prefer a right-side drawer for speed).

Fields, grouped into clear sections:
SECTION - Basic Info: Project Name, Project Code, Project Status (dropdown: Planning/In Progress/Completed), Project Admin (dropdown/select of users)
SECTION - Location: Location (text), Google Map Location (a field that stores lat/lng or an address, plus a "Preview on Map" link/button that would open Google Maps)
SECTION - Scale: Total Area in Acres (number), Number of Floors (number), Number of Flats (number)
SECTION - Amenities: multi-select tag input (Swimming Pool, Gym, Club House, Children's Play Area, Parking, etc. — allow adding custom tags)
SECTION - Timeline: Project Start Date, Expected Completion Date (date pickers)

Bottom actions: "Cancel" (ghost button) and "Save Project" (Deep Safety Orange primary button).

Validate required fields (Name, Code, Location, Start Date) with inline error states. Use the Site Blueprint theme styling throughout — steel blue section labels, clean spacing, no clutter.


4. Project Details Page

Build the Project Details page — this is the most important page in the app, opened when a user clicks a project.

LAYOUT: Three clearly separated sections stacked vertically (or as tabs on smaller screens): 
1) Project Details, 2) SOP List, 3) Document Checklist.

HEADER: Project name as page title (large, steel blue), status badge next to it, "Edit Project" icon-button top-right.

SECTION 1 — Project Details:
A clean info card/grid showing Location, Area, Floors, Total Flats, Start Date, Expected Completion, and Amenities as small tags. Include a "View Location" button that visually implies opening Google Maps (orange outline button with map-pin icon).

SECTION 2 — SOP List:
Show a header "SOPs" with an "+ Assign SOP" button (opens a picker sourced from the SOP Library, see Section 4 below) and a summary line like "8 SOPs · 3 Completed · 2 In Progress · 3 Not Started".
Below, render each assigned SOP as a clickable row/card: SOP number, SOP name, department tag, status badge (Not Started/In Progress/Completed), a mini progress indicator (e.g. "4/7 steps"), and a chevron "→". Clicking a row navigates to the SOP Detail/Execution page for that project+SOP.

SECTION 3 — Document Checklist:
A table (or stacked cards on tablet) with columns: Document Name | Required (Yes/No) | Attachment | Status.
Status badges: "Uploaded" (green) / "Pending" (gray/amber). Each row has an "Attach" button if pending, or "View" + "Replace" if uploaded. Clicking "View" opens a simple document preview modal.

Also include a small "Project Overview" strip near the top (or integrate into Section 1) showing: Total SOPs, Completed, In Progress, Not Started, Documents X/Y uploaded, Issues Open/In Progress/Resolved counts — as small stat chips, not a heavy dashboard.

Keep the whole page scannable — a site engineer should understand project status in under 10 seconds.


5. SOP Library

Build the SOP Library page — the master/reusable list of SOPs, independent of any single project.

Header: "SOP Library" title, "+ Create SOP" button (orange, top-right), and department filter tabs/pills (All, Civil, Electrical, Safety, Plumbing, etc.).

Body: Group SOPs by department using section headers (e.g. "Civil", "Safety", "Electrical"). Under each department header, show SOPs as compact rows/cards: SOP name, short description snippet, number of steps (e.g. "6 steps"), and a "View / Assign" action.

Clicking a SOP opens the SOP Detail (read-only master view, editable by SOP Admin) showing its steps in order. Include a subtle note/tooltip explaining "This SOP is a reusable template — assigning it to a project creates an independent execution copy for that project."

Use card styling consistent with the rest of the app; department section headers in steel blue with a thin accent underline.


6. Create/Edit SOP

Build a Create/Edit SOP form/page for the SOP Library.

Top fields: SOP Name, Department (dropdown: Civil/Electrical/Safety/Plumbing/+Add new), Description (textarea).

Below, a "Steps" section with a dynamic, reorderable list:
- Each step row shows: drag handle icon, step number (auto), Step Title (text input), Instructions (textarea, collapsible/expandable per step), and a delete/trash icon.
- "+ Add Step" button (dashed-border ghost button) at the bottom of the steps list to add a new blank step.
- Support drag-to-reorder of steps (or up/down arrow buttons as a simpler alternative).

Bottom actions: "Cancel" and "Save SOP" (orange primary). Make it feel like building a checklist/procedure document — clean, numbered, structured, blueprint-like.


7. SOP Detail / Execution Page

Build the SOP Detail / Execution page — opened when a user clicks an SOP inside a specific project. This is the core day-to-day working screen for site engineers.

HEADER: SOP name as title, department tag, back-link to the project, and an overall progress bar/badge (e.g. "4 of 7 steps completed").

BODY: Render each step as a numbered card/section in order, each showing:
- Step number + title (bold)
- Instructions text
- Status badge (Not Started / In Progress / Completed)
- If Completed: show "Completed By" and "Completed On" (date + time) in a small muted meta-row
- Action buttons depending on status:
  - Not Started → "Start Step" (orange)
  - In Progress → "Mark Complete" and "Update Status"
  - Completed → step card visually "checked off" (green left border or checkmark icon), still allow "View Documents"
  - Every step also has a "Report Issue" button (outline, red/orange) and a "View/Attach Documents" button

Clicking "Mark Complete" should open a small confirmation showing who's completing it and capturing the date/time automatically (simulate current user + timestamp).

Steps should visually read like a vertical checklist/timeline — use a connecting vertical line between step cards with a status-colored dot per step (gray/yellow/green) to reinforce progress at a glance, blueprint-style.

Include a right-side (or collapsible) "Documents for this SOP" panel listing required documents for this SOP with attach/preview/replace/download actions, matching the pattern from the Project Document Checklist but scoped to this SOP.


8. Report Issue (modal/drawer)

Build a "Report Issue" modal/drawer, triggered from any SOP step's "Report Issue" button.

Fields (pre-filled/read-only where contextual):
- Project (read-only, pre-filled from context)
- SOP (read-only, pre-filled)
- Step (read-only, pre-filled)
- Issue Description (textarea, required)
- Priority (dropdown: Low / Medium / High, with color-coded pills)
- Assign To (dropdown of roles/people, e.g. Quality Manager, Site Manager)
- Attachment (drag-and-drop photo upload with thumbnail preview)

Bottom: "Cancel" and "Create Issue" (red/orange primary button, since this is an alert-style action). On submit, show a success toast confirming the issue was added to the Issue Tracker, and visually reflect the new issue count on the step/SOP/project.


9. Issue Tracker

Build the Issue Tracker page — a central list of all issues across all projects.

Header: "Issue Tracker" title, filter bar with dropdowns for Project, Priority, Status, and a search box.

Body: A table (desktop) / card list (tablet) with columns: Issue Title, Project, SOP, Assigned To, Priority (color pill: Low gray / Medium amber / High red), Status (color pill: Open red / Assigned amber / In Progress blue-gray / Resolved green / Closed muted green), Created Date.

Rows are clickable and open the Issue Detail view. Include quick-status-change affordance directly in the row (small dropdown or kebab menu) for fast triage without opening full detail. Add sortable columns (by priority, by date).

Include a small summary strip at top: Open X · In Progress Y · Resolved Z · Closed W, as colored chips.


10. Issue Detail Page

Build the Issue Detail page, opened when clicking an issue from the Issue Tracker.

HEADER: Issue title, priority badge, status badge, with breadcrumb-style context line: "Green Valley Residency → RCC Work SOP → Concrete Quality Check".

BODY:
- Description block
- Meta info grid: Created By, Created Date, Assigned To, Resolved Date (if applicable)
- Attachment(s) preview (photo thumbnails, click to enlarge)
- Status timeline/stepper showing lifecycle: Open → Assigned → In Progress → Resolved → Closed, with the current stage highlighted (this should visually mirror the SOP step progress pattern for consistency)
- "Comments / Updates" section — a simple activity feed/timeline where users can add text updates with timestamp and author
- Action buttons to change status (e.g. "Assign", "Mark In Progress", "Resolve", "Close") appropriate to current status, using the theme's status colors

Keep this page focused and simple — it's a single issue's full record, not a complex ticketing system.


✅ Suggested Prompting Order in Lovable

Master Prompt (scaffolds theme, nav, data model, seed data)

Projects List

Create/Edit Project

Project Details Page

SOP Library

Create/Edit SOP

SOP Detail / Execution Page

Report Issue modal

Issue Tracker

Issue Detail Page

Dashboard (build last, since it references data/links from all other pages)

If Lovable pushes back on scope in one shot, feed prompts 2–4 first to get the core loop (Projects → SOP List → SOP Execution) working end-to-end before adding the Issue Tracker and Dashboard.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c2f52b64-923f-4162-9460-de5f85cf61c0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
