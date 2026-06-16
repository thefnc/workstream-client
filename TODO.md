# TODO.md

# Workstream Frontend Trial TODO

Enterprise Workflow Management System

Mode:

* Frontend trial-ready
* Static data already started
* Backend integration next
* Multi-user login
* Individual task ownership
* Each designer updates their own assigned tasks

Stack:

* React 19
* Vite
* TypeScript
* Tailwind CSS v4
* Shadcn UI
* React Router
* Zustand
* TanStack Query
* Axios
* DnD Kit
* Recharts
* Lucide React

Version 1.1

---

# 1. Project Setup

* [x] Create React Vite project
* [x] Setup TypeScript
* [x] Setup Tailwind CSS v4
* [x] Setup path alias
* [x] Setup Shadcn UI
* [x] Install React Router
* [x] Install Zustand
* [x] Install DnD Kit
* [x] Install Recharts
* [x] Install Lucide React
* [x] Install date-fns
* [x] Install sonner
* [x] Install TanStack Query
* [x] Install Axios
* [x] Install React Hook Form
* [x] Install Zod

---

# 2. Folder Structure

* [x] Create `src/app`
* [x] Create `src/components/layout`
* [x] Create `src/components/ui`
* [x] Create `src/components/board`
* [x] Create `src/components/task`
* [x] Create `src/components/workload`
* [x] Create `src/components/activity`
* [x] Create `src/components/charts`
* [x] Create `src/data`
* [x] Create `src/types`
* [x] Create `src/lib`
* [x] Create `src/stores`
* [x] Create `src/pages`
* [x] Create `src/services`
* [x] Create `src/features/auth`
* [x] Create `src/features/tasks`
* [x] Create `src/features/dashboard`
* [x] Create `src/features/workload`
* [x] Create `src/features/users`
* [x] Create `src/features/activity`
* [x] Create `src/features/settings`

---

# 3. Static Data

Create static data files:

* [x] `src/data/users.ts`
* [x] `src/data/tasks.ts`
* [x] `src/data/categories.ts`
* [x] `src/data/priorities.ts`
* [x] `src/data/activity.ts`
* [x] `src/data/notifications.ts`

Integration direction:

* [x] Delete all static data files in `src/data/` entirely
* [x] Replace all static data imports with React Query hooks fetching from backend API

---

# 4. Static User Data

Create demo users:

* [x] Super Admin (SEBAGAI SUVERVISOR YANG BISA MENGUBAH SEMUANYA DAN MEMBUAT USER DAN MENGHAPUS USER)
* [x] Designer 1 ( BISA UBAH PROGRESS KERJAAN NYA SENDIRI, NGASIH COMMENT, DAN UPLOAD )
* [x] Designer 2 ( BISA UBAH PROGRESS KERJAAN NYA SENDIRI, NGASIH COMMENT, DAN UPLOAD )
* [x] Viewer (HANYA BISA MELIHAT TASK DAN COMMENT)

Roles:

```text
SUPER_ADMIN
DESIGNER
VIEWER
```

Fix needed:

* [x] Remove unused `ADMIN` role from frontend types if not used
* [x] Rename Supervisor UI label to Super Admin or Koordinator
* [x] Make role display readable in Indonesian

Role labels:

```text
SUPER_ADMIN = Koordinator
DESIGNER    = Designer
VIEWER      = Viewer
```

---

# 5. Static Task Data

Create 20-30 dummy tasks.

Task examples:

* [x] Resize Pattern XXL
* [x] Tracing Artwork A-1245
* [x] Color Adjustment Motif Floral
* [x] Repeat Pattern Check
* [x] Revisi Warna Navy
* [x] Layout Motif Rotary
* [x] Cleanup File Design
* [x] Cek Ukuran Pola L-XL

Each task should have:

* [x] id
* [x] referenceNumber
* [x] title
* [x] category
* [x] status
* [x] progress
* [x] priority
* [x] assignedTo
* [x] dueDate
* [x] fileReference
* [x] description
* [x] comments
* [x] revisionNotes
* [x] progressLogs
* [x] activityLogs

Integration direction:

* [x] Add pattern size field to `Task` interface
* [x] Fetch realistic tasks and assigned tasks directly from the backend API

---

# 6. Status System

Use Indonesian status labels.

Internal enum:

```text
QUEUE
WORKING
CHECKING
REVISION
READY_UPLOAD
DONE
```

UI labels:

```text
Antrian
Dikerjakan
Dicek
Revisi
Siap Upload
Selesai
```

Tasks:

* [x] Create centralized status label helper
* [x] Create centralized status color helper
* [x] Use helper across Board, Tasks, Detail, Workload, Activity

---

# 7. Progress Rules

Manual progress demo.

Rules:

```text
Antrian      0%
Dikerjakan   15-80%
Dicek        80-90%
Revisi       50-85%
Siap Upload  90-99%
Selesai      100%
```

For demo:

* [x] Slider works locally
* [x] Progress note can be added locally
* [x] Progress history updates locally
* [x] No API needed

Trial direction:

* [x] Connect progress update to backend endpoint
* [x] Keep local optimistic update
* [x] Rollback if backend rejects progress range
* [x] Show backend validation message
* [x] Disable progress update for non-assigned designer
* [x] Disable progress update for Viewer

---

# 8. Design Tokens

Add colors from design.md.

Core palette:

```css
--navy-900: #0C2B4E;
--navy-800: #1A3D64;
--blue-700: #1D546C;
--neutral-100: #F4F4F4;
```

Status colors:

```css
--queue: #94A3B8;
--working: #4DA8DA;
--checking: #F59E0B;
--revision: #EF4444;
--ready-upload: #22C55E;
--done: #0C2B4E;
```

Tasks:

* [x] Move color tokens to one theme file
* [x] Ensure badges use consistent colors
* [x] Ensure progress bar contrast is readable
* [x] Ensure overdue badge is visually clear

---

# 9. Routing

Create routes:

* [x] `/`
* [x] `/dashboard`
* [x] `/board`
* [x] `/tasks`
* [x] `/tasks/:id`
* [x] `/workload`
* [x] `/workload/:designerId`
* [x] `/activity`
* [x] `/users`
* [x] `/settings`

For demo:

* [x] Redirect `/` to `/dashboard`
* [x] No real login required

Trial revision:

* [x] Add `/login`
* [x] Add protected route wrapper
* [x] Redirect `/` based on auth state
* [x] Redirect unauthenticated user to `/login`
* [x] Redirect authenticated user to `/dashboard`
* [x] Restrict `/users` to SUPER_ADMIN
* [x] Restrict `/settings` to SUPER_ADMIN or hide for trial
* [x] Allow DESIGNER to access own workload only
* [x] Keep VIEWER read-only

---

# 10. Layout

Build app shell:

* [x] Sidebar
* [x] Topbar
* [x] Page header
* [x] Main content area

Sidebar navigation:

```text
Dashboard
Board
Tasks
Workload
Activity
Users
Settings
```

Trial sidebar recommendation:

```text
Dashboard
Board
Tasks
Tim
Riwayat
Users
```

Tasks:

* [x] Rename Workload label to Tim
* [x] Rename Activity label to Riwayat
* [x] Hide Settings from sidebar for trial
* [x] Hide Users from Designer and Viewer
* [x] Show current logged-in user in Topbar
* [x] Add logout button
* [x] Add role badge in Topbar

---

# 11. Dashboard Page

Build sections:

* [x] Metric cards
* [x] My Tasks
* [x] Due Today
* [x] Workload Overview
* [x] Recent Activity

Metrics:

* [x] Total Tasks
* [x] Dikerjakan
* [x] Revisi
* [x] Siap Upload
* [x] Overdue

Data source:

* [x] Static tasks array

Trial direction:

* [x] Connect dashboard to backend `/dashboard/summary`
* [x] Show different dashboard for SUPER_ADMIN
* [x] Show different dashboard for DESIGNER
* [x] SUPER_ADMIN sees all task summary
* [x] DESIGNER sees own task summary
* [x] VIEWER sees read-only summary
* [x] Add loading state
* [x] Add error state

Designer dashboard priority:

* [x] Tugas Saya
* [x] Deadline Hari Ini
* [x] Progress Saya
* [x] Aktivitas Saya

---

# 12. Board Page

Build Kanban board.

Columns:

* [x] Antrian
* [x] Dikerjakan
* [x] Dicek
* [x] Revisi
* [x] Siap Upload
* [x] Selesai

Features:

* [x] Render task cards by status
* [x] Drag task between columns
* [x] Update status locally
* [x] Keep progress unchanged when status changes
* [x] Add toast after move
* [x] Add horizontal scroll
* [x] Add search
* [x] Add filter by designer
* [x] Add filter by category
* [x] Add filter by priority

Trial direction:

* [x] Connect board to backend `/tasks/board`
* [x] Update task status through backend
* [x] Add optimistic update for DnD
* [x] Rollback DnD if request fails
* [x] Disable DnD for Viewer
* [x] Disable DnD for Designer on other people's tasks
* [x] Add toggle "Tugas Saya"
* [x] Add filter by pattern size
* [x] Invalidate dashboard after status update
* [x] Invalidate workload after status update

---

# 13. Task Card

Task card content:

* [x] Priority badge
* [x] Task title
* [x] Reference number
* [x] Category
* [x] Progress bar
* [x] Assigned designer
* [x] Due date
* [x] Overdue badge

Interactions:

* [x] Click card opens task detail
* [x] Drag card on board
* [x] Hover state
* [x] Compact but readable layout

Trial improvement:

* [x] Show pattern size
* [x] Show ownership state
* [x] Show disabled state if user cannot update task
* [x] Make overdue badge more obvious
* [x] Make assigned designer clearer

---

# 14. Tasks Page

Build table view.

Columns:

* [x] Reference Number
* [x] Task
* [x] Category
* [x] Status
* [x] Progress
* [x] Designer
* [x] Priority
* [x] Due Date
* [x] Pattern Size

Features:

* [x] Search
* [x] Filter by status
* [ ] Filter by designer
* [ ] Filter by category
* [ ] Filter by priority
* [ ] Filter by pattern size
* [ ] Sort by due date
* [x] Click row opens detail

Backend integration:

* [x] Fetch `/tasks`
* [x] Support pagination
* [x] Support backend query params
* [x] Show loading state
* [x] Show error state
* [x] Hide create/edit/delete from non SUPER_ADMIN
* [x] Designers only see assigned tasks from backend

---

# 15. Task Detail Page

Build document-style detail page.

Sections:

* [x] Overview
* [x] Instructions
* [x] Progress Update
* [x] Progress History
* [x] File Reference
* [x] Attachments Preview
* [x] Revision Notes
* [x] Comments
* [x] Activity Timeline

Backend integration:

* [x] Create `TaskDetail.tsx` (using Sheet side-drawer as suggested)
* [x] Display Overview (Ref No, Title, Priority, Description, Assignments)
* [x] Add Progress update slider section (if role permits)
* [x] Add History tab (fetching progress logs)
* [x] Add File Reference / Link attachments section
* [x] Add Revision Notes / Comments section
* [x] Fetch `/tasks/:id`
* [x] Update progress through backend
* [ ] Update status through backend
* [ ] Add comment through backend
* [ ] Add revision note through backend
* [ ] Upload preview attachment through backend
* [x] Disable mutations for Viewer
* [x] Disable mutations for Designer if task is not assigned to them
* [x] Show task not found state
* [x] Show forbidden state

---

# 16. Progress Update UI

Build progress component:

* [ ] Slider
* [ ] Current percentage
* [ ] Allowed range helper
* [ ] Note textarea
* [ ] Update button
* [ ] Validation based on status
* [ ] Error message for invalid range

Example helper:

```text
Status Dikerjakan hanya menerima progress 15% sampai 80%.
```

Trial behavior:

* [ ] Use backend validation as source of truth
* [ ] Show allowed range from frontend helper
* [ ] Prevent invalid submit before API call
* [ ] Show backend error if rejected
* [ ] Add optimistic UI update
* [ ] Add progress log item after success
* [ ] Disable form for Viewer
* [ ] Disable form for non-assigned Designer

---

# 17. Workload / Tim Page

Build workload overview grouped by designer.

Show each designer:

* [ ] Active task count
* [ ] Average progress
* [ ] Dikerjakan task count
* [ ] Revisi task count
* [ ] Overdue task count
* [ ] Small progress bar
* [ ] Link to designer detail

Trial direction:

* [ ] Rename page title to Tim
* [ ] Fetch `/workload`
* [ ] SUPER_ADMIN sees all designers
* [ ] DESIGNER sees only own card or redirects to own detail
* [ ] VIEWER sees read-only workload
* [ ] Add loading state
* [ ] Add empty state
* [ ] Add error state

---

# 18. Workload Detail Page

Route:

```text
/workload/:designerId
```

Show:

* [ ] Designer profile summary
* [ ] Active task count
* [ ] Average progress
* [ ] Overdue count
* [ ] Revision count
* [ ] Task list grouped by status

Groups:

* [ ] Antrian
* [ ] Dikerjakan
* [ ] Dicek
* [ ] Revisi
* [ ] Siap Upload
* [ ] Selesai

Features:

* [ ] Filter by status
* [ ] Sort by due date
* [ ] Click task to detail

Backend integration:

* [ ] Fetch `/workload/:designerId`
* [ ] Prevent Designer opening other designer detail
* [ ] Show forbidden state if needed
* [ ] Add loading state
* [ ] Add error state

---

# 19. Activity / Riwayat Page

Build audit log page.

Show:

* [ ] Timestamp
* [ ] Actor
* [ ] Action
* [ ] Task reference
* [ ] Old value
* [ ] New value

Features:

* [ ] Filter by action
* [ ] Filter by user
* [ ] Filter by task
* [ ] Static activity data

Trial direction:

* [ ] Rename page title to Riwayat
* [ ] Fetch `/activity`
* [ ] SUPER_ADMIN sees all activity
* [ ] DESIGNER sees own related activity
* [ ] VIEWER sees read-only activity
* [ ] Add pagination
* [ ] Add loading state
* [ ] Add error state

---

# 20. Users Page

For demo only.

Show table:

* [ ] Name
* [ ] Username
* [ ] Role
* [ ] Status

Actions:

* [ ] View only
* [ ] No real create/edit needed for demo

Trial direction:

* [ ] Fetch `/users`
* [ ] Create user modal
* [ ] Edit user modal
* [ ] Deactivate user action
* [ ] Hide page from Designer
* [ ] Hide page from Viewer
* [ ] Use username, not email
* [ ] Show role label in Indonesian

---

# 21. Settings Page

For demo only.

Show static settings:

* [ ] Categories
* [ ] Priorities
* [ ] Statuses
* [ ] Pattern Sizes

No real CRUD needed.

Trial direction:

* [ ] Hide settings page from sidebar for trial
* [ ] Fetch categories from backend
* [ ] Fetch priorities from backend
* [ ] Fetch pattern sizes from backend
* [ ] Use settings API only for select options

---

# 22. Components

Build reusable components:

* [ ] AppShell
* [ ] Sidebar
* [ ] Topbar
* [ ] PageHeader
* [ ] MetricCard
* [ ] KanbanBoard
* [ ] KanbanColumn
* [ ] TaskCard
* [ ] ProgressBar
* [ ] StatusBadge
* [ ] PriorityBadge
* [ ] TaskDetailPanel
* [ ] DataTable
* [ ] WorkloadCard
* [ ] ActivityTimeline
* [ ] CommentBox
* [ ] EmptyState
* [ ] Toast

Trial additions:

* [x] ProtectedRoute
* [x] RoleGuard
* [x] LoginForm
* [x] LogoutButton
* [x] UserRoleBadge
* [ ] ForbiddenState
* [ ] LoadingState
* [ ] ErrorState
* [ ] PatternSizeBadge
* [ ] PermissionTooltip

---

# 23. Zustand Store

Use Zustand for demo state.

Stores:

* [ ] `useTaskStore`
* [ ] `useFilterStore`
* [ ] `useUiStore`

Task store features:

* [ ] Store static tasks
* [ ] Update task status
* [ ] Update task progress
* [ ] Add progress log
* [ ] Add comment
* [ ] Add revision note

Trial direction:

* [ ] Move server data to TanStack Query
* [ ] Keep Zustand only for UI state
* [ ] Keep filters in Zustand if needed
* [ ] Remove task mutation from Zustand after backend integration

---

# 24. API Client & Query Layer

New for trial.

* [x] Create Axios instance
* [x] Set `VITE_API_URL`
* [x] Enable `withCredentials`
* [ ] Create response interceptor
* [ ] Handle 401 globally
* [ ] Setup TanStack Query provider
* [ ] Create query keys
* [ ] Create auth service
* [ ] Create tasks service
* [ ] Create dashboard service
* [ ] Create workload service
* [ ] Create activity service
* [ ] Create users service
* [ ] Create settings service
* [ ] Create notifications service
* [ ] Create upload service

---

# 25. Login & Auth Flow

New for trial.

Routes:

```text
/login
```

Fields:

```text
username
password
```

Tasks:

* [ ] Build login page
* [ ] Build username input
* [ ] Build password input
* [ ] Add validation
* [ ] Add submit loading state
* [ ] Login via `/auth/login`
* [ ] Fetch current user via `/auth/me`
* [ ] Store current user in auth query/cache
* [ ] Redirect to dashboard after login
* [ ] Logout via `/auth/logout`
* [ ] Clear query cache on logout
* [ ] Show invalid login error

---

# 26. Charts

Use Recharts for simple charts.

Charts:

* [ ] Task by Status
* [ ] Task by Priority
* [ ] Workload by Designer
* [ ] Overdue by Designer

Keep charts simple.

Do not overbuild reports.

Trial decision:

* [ ] Charts are optional for trial
* [ ] Prioritize login, task update, workload, and activity first

---

# 27. Empty States

Create empty states for:

* [ ] Empty board column
* [ ] No task found
* [ ] No comments
* [ ] No revision notes
* [ ] No activity
* [ ] No workload data
* [ ] No users found
* [ ] Forbidden access

---

# 28. Loading States

For static demo, use minimal fake loading only if needed.

* [ ] Dashboard skeleton
* [ ] Board skeleton
* [ ] Table skeleton
* [ ] Task detail skeleton
* [ ] Workload skeleton
* [ ] Activity skeleton
* [ ] Users skeleton

Trial direction:

* [ ] Add real loading states for API data

---

# 29. Responsive

Desktop first.

Must support:

* [ ] Desktop sidebar
* [ ] Tablet sidebar collapse
* [ ] Mobile task list
* [ ] Mobile task detail
* [ ] Mobile progress update

Board on mobile:

* [ ] Horizontal scroll is enough

---

# 30. Trial Polish

Important for office trial:

* [ ] Use realistic textile/design task names
* [ ] Use realistic designer names
* [ ] Use clear Indonesian status labels
* [ ] Use username login
* [ ] Make Designer flow simple
* [ ] Make progress update obvious
* [ ] Make Tim page useful for coordinator
* [ ] Make Riwayat readable
* [ ] Hide unnecessary menu for non-admin
* [ ] Add empty and error states
* [ ] Avoid too many charts
* [ ] Avoid settings complexity

---

# 31. MVP Trial Cutline

Already finished:

* [x] App layout
* [x] Dashboard
* [x] Board with DnD
* [x] Task cards
* [x] Static data foundation
* [x] Local progress slider

Must finish next:

* [ ] Login page
* [ ] Auth API integration
* [ ] Protected routes
* [ ] Role-based sidebar
* [ ] Backend task integration
* [ ] Tasks table
* [ ] Task detail
* [ ] Manual progress update via backend
* [ ] Status update via backend
* [ ] Comments via backend
* [ ] Revision notes via backend
* [ ] Tim grouped by designer
* [ ] Tim detail per designer
* [ ] Riwayat from backend
* [ ] Users page for SUPER_ADMIN
* [ ] Upload preview if time allows

Can skip for first office trial:

* [ ] Reports page
* [ ] Advanced charts
* [ ] Settings CRUD
* [ ] Notification dropdown
* [ ] Dark mode
* [ ] Advanced permission UI
* [ ] Advanced responsive polish
