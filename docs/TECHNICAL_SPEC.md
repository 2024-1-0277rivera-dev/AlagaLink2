# AlagaLink: Full Technical Specification & System Documentation

## 🏗 System Architecture
- **Framework**: React 19 (ES6 Modules)
- **State Management**: Context API (`AppContext.tsx`) utilizing a unified provider for global persistence.
- **Intelligence Layer**: Google Generative AI (Gemini 3.0 Flash) - *Targeted for Grok migration*.
- **Styling**: Tailwind CSS 3.x with custom 3D "Inflated Card" utility classes.
- **Iconography**: FontAwesome 6.4 (Pro/Solid/Brands).

## 🗺 Page Documentation & Routing
The application uses a "Single Page State-Based Routing" managed in `App.tsx`.

### 1. Home (`pages/Home.tsx`)
- **Functions**: Aggregates all system activity into a "Municipal Gazette" (Newspaper layout).
- **Sub-components**: `HomeHero` (Carousel), `HomeStats` (Live counters), `HomeNews` (Editorial feed).
- **Logic**: Filters global `reports`, `users`, and `programRequests` into a unified timestamped news feed.

### 2. Programs (`pages/Programs.tsx`)
- **Functions**: Core service delivery portal.
- **Sub-components**: `PhilHealthPortal`, `InventoryPortal`, `AdminEvaluationOverlay`.
- **Logic**: Handles 4 types of applications: ID Issuance, Assistive Devices, Medical Aid, and Livelihood Workshops. Supports inventory management for Admins.

### 3. Lost & Found (`pages/LostFound.tsx`)
- **Functions**: Community safety and missing person recovery.
- **Sub-components**: `LostFoundGrid`, `CaseDetailModal`, `ReportMissingWizard`.
- **Logic**: Strict verification logic linking missing reports to existing registry profiles.

### 4. Members (`pages/Members.tsx`)
- **Functions**: Master Database Management.
- **Sub-components**: `MemberTable`, `RegistrationWorkflow`.
- **Logic**: Supports multi-tab filtering (Active/Pending/Suspended). Implements SuperAdmin-only staff management.

### 5. Profile (`pages/Profile.tsx`)
- **Functions**: User self-service and historical log.
- **Sub-components**: `DigitalIdCard` (3D Flip), `ProfileHistory`.
- **Logic**: Displays personal registry metadata and a chronological activity log of notifications and service updates.

## 👥 User Roles & Relations
- **SuperAdmin**: Full system authority. Can promote/demote Staff. Owns the Registry structure.
- **Admin**: Operational authority. Manages inventory, evaluates applications, and files incident reports.
- **User**: The community member. Applies for aid, views their digital ID, and receives real-time alerts.

## 🎨 Design Philosophy: "Alaga-Touch"
- **3D Inflation**: Cards use complex shadows and `translate-y` hover effects to simulate physical tactile depth.
- **Viewport Guard**: Floating components (Chat/Buttons) utilize coordinate clamping to prevent screen-edge cutoff.
- **Accessibility**: High-contrast dark mode and large tactile touch targets for mobility-impaired users.
