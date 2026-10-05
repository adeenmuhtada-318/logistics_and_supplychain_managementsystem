# FleetCore Logistics & Supply Chain Management System
## Architectural Audit & Project Structure Document (v2.0)

**Document Version:** 2.0.0  
**Audit Date:** October 2026  
**Auditor Role:** Principal Software Architect  
**Repository:** `logistics_and_supplychain_managementsystem`  

---

## 1. Executive Summary & Architectural Evolution

FleetCore has evolved through two distinct architectural phases:
- **Phase 1 (V1 — Internal Fleet & Depot Management):** Built around a traditional internal enterprise operations model with roles (`Fleet_Manager`, `Dispatcher`, `Safety_Officer`, `Accountant`, `Driver`) managing physical fleet assets (`Vehicle`), manual trip sheets (`DispatchLog`), fixed highway corridors (`RouteMetric`), punch-clock timesheets (`DriverAttendance`), and driver payroll calculations (`Payroll`).
- **Phase 2 (V2 — On-Demand B2B Logistics Platform):** Pivoted to a marketplace and on-demand freight fulfillment model for Pakistan logistics. Built around a 3-role paradigm:
  1. **Client (B2B):** Self-serve portal registering corporate entities (NTN, verified addresses), generating automated distance and fare quotes via OpenRouteService/Haversine and custom weight-tier pricing, placing freight orders, and tracking multi-checkpoint shipments.
  2. **Driver (Rider):** Autonomous mobile-ready terminal receiving real-time broadcasted delivery orders within their city/province (`smartMatchService`), submitting trip consent (Accept/Decline), updating live progress (`Picked-Up`, `In-Transit`, `Delivered`).
  3. **Admin:** System administrator with oversight over platform operations, pricing configuration, and fleet KPIs.

### Key Audit Findings
1. **Orphaned V1 Codebase:** 5 pages, 8 modal/form components, 6 Redux slices, 4 server route files, and 4 controllers remain in the project despite being unmounted in `AppRoutes.jsx` and `server.js`.
2. **Binary Archive in Source Tree:** A 40 KB zip file (`client/src/pages.zip.zip`) is committed in `client/src`.
3. **Redux Store Gaps:** `store.js` only mounts `auth` and `orders`. `analyticsSlice` is consumed by `DashboardPage.jsx` but omitted from the store, and `locationSlice` is omitted while pages duplicate location dictionaries.
4. **Redundant Implementations:** `ProtectedRoute.jsx` exists as an independent component file while also being defined inline in `AppRoutes.jsx`. Multiple UI components (`BentoGrid`, `DataTable`, `DriverConsentCard`, `FareEstimatePanel`, `OrderTrackingTimeline`) were written as reusable components but bypassed in favor of monolithic inline page implementations.

---

## 2. Visual Architecture Directory Tree

```
logistics_and_supplychain_managementsystem/
├── .gitignore
├── package-lock.json                           [⚠️ ORPHANED ROOT LOCKFILE]
├── PROJECT_STRUCTURE.md                         [THIS FILE]
│
├── client/                                     [Vite + React 18 + Redux Toolkit + Tailwind CSS]
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                             [Core Application Root]
│       ├── index.css                           [Global Styles & CSS Custom Properties]
│       ├── main.jsx                            [Vite Entrypoint & Redux/Theme Providers]
│       ├── pages.zip.zip                       [🚨 ORPHANED ZIP ARCHIVE - 40KB]
│       │
│       ├── components/
│       │   ├── attendance/                     [V1 LEGACY / UNMOUNTED]
│       │   │   ├── ClockInCard.jsx             [⚠️ Tied only to unmounted AttendancePage]
│       │   │   └── VerifyTimesheetModal.jsx    [⚠️ Tied only to unmounted AttendancePage]
│       │   ├── dispatches/                     [V1 LEGACY / UNMOUNTED]
│       │   │   ├── CreateDispatchModal.jsx     [⚠️ Tied only to unmounted DispatchesPage]
│       │   │   ├── DispatchTimeline.jsx        [⚠️ Tied only to unmounted DispatchesPage]
│       │   │   └── UpdateDispatchStatusModal.jsx[⚠️ Tied only to unmounted DispatchesPage]
│       │   ├── layout/
│       │   │   ├── MainLayout.jsx              [⚠️ Disconnected layout wrapper with Outlet]
│       │   │   ├── Navbar.jsx                  [⚠️ Disconnected navigation bar]
│       │   │   └── Sidebar.jsx                 [⚠️ Disconnected sidebar referencing V1 routes/roles]
│       │   ├── payroll/                        [V1 LEGACY / UNMOUNTED]
│       │   │   ├── GeneratePayrollModal.jsx    [⚠️ Tied only to unmounted PayrollPage]
│       │   │   └── PayslipModal.jsx            [⚠️ Tied only to unmounted PayrollPage]
│       │   ├── routes/                         [V1 LEGACY / UNMOUNTED]
│       │   │   └── CreateRouteModal.jsx        [⚠️ Tied only to unmounted RoutesPage]
│       │   ├── ui/                             [Common UI Component Library]
│       │   │   ├── Badge.jsx                   [✅ Active]
│       │   │   ├── BentoGrid.jsx               [⚠️ Unused wrapper component]
│       │   │   ├── Button.jsx                  [✅ Active]
│       │   │   ├── Card.jsx                    [✅ Active]
│       │   │   ├── DataTable.jsx               [⚠️ Unused data table wrapper]
│       │   │   ├── DriverConsentCard.jsx       [⚠️ Bypassed by DriverConsent.jsx]
│       │   │   ├── FareEstimatePanel.jsx       [⚠️ Broken imports & bypassed by PlaceOrder.jsx]
│       │   │   ├── Input.jsx                   [✅ Active]
│       │   │   ├── Modal.jsx                   [✅ Active]
│       │   │   ├── OrderTrackingTimeline.jsx   [⚠️ Bypassed by ClientDashboard.jsx]
│       │   │   ├── Pagination.jsx              [⚠️ Used only by unmounted VehiclesPage]
│       │   │   ├── PakistanLocationDropdown.jsx[⚠️ Bypassed by hardcoded dictionaries]
│       │   │   ├── Select.jsx                  [✅ Active]
│       │   │   └── StatCard.jsx                [✅ Active]
│       │   └── vehicles/                       [V1 LEGACY / UNMOUNTED]
│       │       └── VehicleModal.jsx            [⚠️ Tied only to unmounted VehiclesPage]
│       │
│       ├── context/
│       │   └── ThemeContext.jsx                [✅ Active - Dark/Light Theme Provider]
│       │
│       ├── features/                           [Redux Toolkit State Slices]
│       │   ├── analytics/analyticsSlice.js     [⚠️ Used in DashboardPage but MISSING in store.js]
│       │   ├── attendance/attendanceSlice.js   [⚠️ Unused in V2 store]
│       │   ├── auth/authSlice.js               [✅ Active - User auth & profile state]
│       │   ├── dispatch/dispatchSlice.js       [⚠️ Unused in V2 store]
│       │   ├── fleet/vehicleSlice.js           [⚠️ Unused in V2 store]
│       │   ├── locations/locationSlice.js      [⚠️ Orphaned slice, not mounted in store]
│       │   ├── orders/orderSlice.js            [✅ Active - Order lifecycle & dispatch matching]
│       │   ├── payroll/payrollSlice.js         [⚠️ Unused in V2 store]
│       │   ├── pricing/pricingSlice.js         [⚠️ Orphaned slice, not mounted in store]
│       │   └── routes/routeSlice.js            [⚠️ Unused in V2 store]
│       │
│       ├── pages/
│       │   ├── client/                         [V2 B2B Client Portal Pages]
│       │   │   ├── ClientDashboard.jsx         [✅ Active: /client/dashboard]
│       │   │   ├── ClientRegister.jsx          [✅ Active: /client/register]
│       │   │   ├── FareReceipt.jsx             [✅ Active: /client/fare-receipt]
│       │   │   └── PlaceOrder.jsx              [✅ Active: /client/place-order]
│       │   ├── driver/                         [V2 Driver / Rider Terminal Pages]
│       │   │   └── DriverConsent.jsx           [✅ Active: /driver/terminal & /driver/consent]
│       │   ├── AttendancePage.jsx              [⚠️ V1 Legacy - Not routed in AppRoutes.jsx]
│       │   ├── DashboardPage.jsx               [✅ Active: /dashboard (Admin)]
│       │   ├── DispatchesPage.jsx              [⚠️ V1 Legacy - Not routed in AppRoutes.jsx]
│       │   ├── LoginPage.jsx                   [✅ Active: /login]
│       │   ├── PayrollPage.jsx                 [⚠️ V1 Legacy - Not routed in AppRoutes.jsx]
│       │   ├── RegisterPage.jsx                [✅ Active: /register (Driver)]
│       │   ├── RoutesPage.jsx                  [⚠️ V1 Legacy - Not routed in AppRoutes.jsx]
│       │   └── VehiclesPage.jsx                [⚠️ V1 Legacy - Not routed in AppRoutes.jsx]
│       │
│       ├── routes/
│       │   ├── AppRoutes.jsx                   [✅ Active - Top-level React Router 6 configuration]
│       │   └── ProtectedRoute.jsx              [⚠️ Redundant - AppRoutes has inline duplicate]
│       │
│       ├── services/
│       │   └── api.js                          [✅ Active - Axios interceptor with JWT handling]
│       │
│       └── store/
│           └── store.js                        [✅ Active - Redux store (mounts auth & orders)]
│
└── server/                                     [Express + MongoDB / Mongoose + Swagger + Node-Cron]
    ├── .env                                    [Active environment configuration]
    ├── .env.example                            [Template environment configuration]
    ├── package.json                            [Dependencies & lifecycle scripts]
    ├── package-lock.json                       [Server dependency lockfile]
    ├── server.js                               [Application entrypoint & Express pipeline]
    ├── test-api.js                             [⚠️ Outdated legacy integration test script]
    │
    ├── config/
    │   ├── db.js                               [✅ Active - Mongoose MongoDB connection & In-Memory fallback]
    │   └── swagger.js                          [✅ Active - OpenAPI / Swagger JSDoc specifications]
    │
    ├── controllers/
    │   ├── analyticsController.js              [✅ Active - Fleet KPI aggregation controller]
    │   ├── attendanceController.js             [⚠️ V1 Legacy - Not mounted in server.js]
    │   ├── authController.js                   [✅ Active - Login, registration, driver management]
    │   ├── dispatchController.js               [✅ Active - Manual dispatch management]
    │   ├── locationController.js               [✅ Active - Pakistan cascading location endpoints]
    │   ├── orderController.js                  [✅ Active - Order lifecycle, quoting, driver response]
    │   ├── payrollController.js                [⚠️ V1 Legacy - Not mounted in server.js]
    │   ├── pricingController.js                [✅ Active - Dynamic fare calculation & tier config]
    │   ├── routeController.js                  [⚠️ V1 Legacy - Not mounted in server.js]
    │   └── vehicleController.js                [⚠️ V1 Legacy - Not mounted in server.js]
    │
    ├── data/
    │   └── pakistanLocations.js                [✅ Active - Hierarchical dataset (Province -> City -> Area)]
    │
    ├── middleware/
    │   ├── authMiddleware.js                   [✅ Active - JWT verification & user attachment]
    │   ├── errorMiddleware.js                  [✅ Active - 404 handler & centralized error formatter]
    │   └── roleMiddleware.js                   [✅ Active - Role-based authorization guard]
    │
    ├── models/
    │   ├── DispatchLog.js                      [✅ Active - Trip manifest and checkpoint model]
    │   ├── DriverAttendance.js                 [⚠️ V1 Legacy - Aggregated by analytics only]
    │   ├── Order.js                            [✅ Active - Core V2 order entity with live pricing & checkpoints]
    │   ├── Payroll.js                          [⚠️ V1 Legacy - Aggregated by analytics only]
    │   ├── PricingConfig.js                    [✅ Active - Dynamic pricing tiers and multipliers]
    │   ├── RouteMetric.js                      [⚠️ V1 Legacy - Aggregated by analytics only]
    │   ├── User.js                             [✅ Active - Multi-role user model (Client, Driver, Admin)]
    │   └── Vehicle.js                          [⚠️ V1 Legacy - Aggregated by analytics only]
    │
    ├── routes/
    │   ├── analyticsRoutes.js                  [✅ Active: /api/analytics]
    │   ├── attendanceRoutes.js                 [⚠️ V1 Legacy - Not mounted in server.js]
    │   ├── authRoutes.js                       [✅ Active: /api/auth]
    │   ├── dispatchRoutes.js                   [✅ Active: /api/dispatches]
    │   ├── locationRoutes.js                   [✅ Active: /api/locations]
    │   ├── orderRoutes.js                      [✅ Active: /api/orders]
    │   ├── payrollRoutes.js                    [⚠️ V1 Legacy - Not mounted in server.js]
    │   ├── pricingRoutes.js                    [✅ Active: /api/pricing]
    │   ├── routeRoutes.js                      [⚠️ V1 Legacy - Not mounted in server.js]
    │   └── vehicleRoutes.js                    [⚠️ V1 Legacy - Not mounted in server.js]
    │
    ├── services/
    │   ├── mappingService.js                   [✅ Active - OpenRouteService API + Haversine fallback]
    │   ├── pricingService.js                   [✅ Active - Tiered fare calculation with fuel/surcharges]
    │   └── smartMatchService.js                [✅ Active - Geo/City driver broadcasting and lock engine]
    │
    └── utils/
        ├── codeGenerators.js                   [✅ Active - Human-readable sequence ID generators]
        ├── expiryJob.js                        [✅ Active - 72hr automated pending order expiry cron]
        ├── jwtHelper.js                        [✅ Active - JWT signing & verification helper]
        └── seedData.js                         [✅ Active - Database seeder for V2 Admin/Driver/Client]
```

---

## 3. Comprehensive File-by-File Breakdown

### 3.1 Root Files

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `.gitignore` | Config / Git | `ACTIVE` | Prevents `node_modules`, `.env`, logs, and build artifacts from being committed to Git. |
| `package-lock.json` | Package Management | `ORPHANED` | An empty, unused lockfile (121 bytes) at the root level; both `client` and `server` manage their own dependencies independently. |

---

### 3.2 Client: Configurations & Root

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `client/index.html` | Core Web | `ACTIVE` | Single Page Application (SPA) HTML container and DOM mounting point (`#root`). |
| `client/package.json` | Dependencies | `ACTIVE` | Declares client dependencies (`react`, `react-router-dom`, `@reduxjs/toolkit`, `lucide-react`, `recharts`, `tailwindcss`) and Vite scripts. |
| `client/package-lock.json` | Dependencies | `ACTIVE` | Deterministic dependency tree lockfile for the client application. |
| `client/postcss.config.js` | Build / Styling | `ACTIVE` | PostCSS configuration plugging `tailwindcss` and `autoprefixer` into the Vite build. |
| `client/tailwind.config.js` | Styling | `ACTIVE` | Configures Tailwind CSS design tokens, custom colors (`brand`, accent `#00E676`), and dark mode classes. |
| `client/vite.config.js` | Build Tool | `ACTIVE` | Configures the Vite development server, port, proxies, and `@vitejs/plugin-react`. |
| `client/src/App.jsx` | Core Component | `ACTIVE` | Root React component that mounts `AppRoutes` wrapped within standard application containers. |
| `client/src/index.css` | Styling | `ACTIVE` | CSS design system root defining CSS variables for light/dark themes, fonts, and scrollbars. |
| `client/src/main.jsx` | App Bootstrap | `ACTIVE` | Application entrypoint initializing the React DOM root, Redux Provider (`store`), and `ThemeProvider`. |
| `client/src/pages.zip.zip` | Archive | `ORPHANED` | A 40KB stale ZIP archive inadvertently left in the source code; contains no active production code. |

---

### 3.3 Client: Navigation & Routing

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `client/src/routes/AppRoutes.jsx` | Routing | `ACTIVE` | Defines all active React Router 6 routes, role-based redirects (`RoleRedirect`), and an inline `ProtectedRoute`. |
| `client/src/routes/ProtectedRoute.jsx` | Routing | `REDUNDANT` | Standalone route guard component checking authentication and allowed roles; currently duplicated inline within `AppRoutes.jsx`. |
| `client/src/services/api.js` | Networking | `ACTIVE` | Configured Axios HTTP client with automatic base URL detection, request token injection, and 401 error interceptors. |
| `client/src/store/store.js` | State Management | `ACTIVE` | Central Redux Toolkit store configuring active reducers (`auth` and `orders`). |
| `client/src/context/ThemeContext.jsx` | UI Context | `ACTIVE` | React Context providing dark/light theme state toggling, persisting theme preferences in `localStorage`. |

---

### 3.4 Client: Pages

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `client/src/pages/LoginPage.jsx` | Auth Page | `ACTIVE` | Provides the login interface for all roles, dispatching credentials to `authSlice` and redirecting per user role. |
| `client/src/pages/RegisterPage.jsx` | Auth Page | `ACTIVE` | Registration interface for individual Drivers/Riders with city and driving license capture. |
| `client/src/pages/client/ClientRegister.jsx` | Client Portal | `ACTIVE` | Comprehensive B2B onboarding form capturing company NTN, contact person, business sector, and registered address. |
| `client/src/pages/client/ClientDashboard.jsx` | Client Portal | `ACTIVE` | B2B customer command center displaying real-time shipment statuses, metric cards, order history, and cancellation controls. |
| `client/src/pages/client/PlaceOrder.jsx` | Client Portal | `ACTIVE` | Freight ordering wizard with cascading Pakistan pickup/dropoff selection, cargo specs, priority options, and order placement. |
| `client/src/pages/client/FareReceipt.jsx` | Client Portal | `ACTIVE` | Order invoice and payment confirmation screen displaying fare breakdown and dummy bank transfer details. |
| `client/src/pages/driver/DriverConsent.jsx` | Driver Terminal | `ACTIVE` | Driver mobile dispatch console showing incoming trip broadcasts, route summaries, and Accept/Decline action buttons. |
| `client/src/pages/DashboardPage.jsx` | Admin Portal | `ACTIVE` | Comprehensive operations overview with Recharts analytics, fleet status charts, operational expenses, and active dispatches. |
| `client/src/pages/VehiclesPage.jsx` | Fleet (V1) | `DISCONNECTED` | V1 fleet vehicle registry with status filters, maintenance toggles, and vehicle creation modal. Unmounted in V2 router. |
| `client/src/pages/DispatchesPage.jsx` | Dispatch (V1) | `DISCONNECTED` | V1 trip dispatch log management screen with checkpoint tracking. Unmounted in V2 router. |
| `client/src/pages/RoutesPage.jsx` | Routes (V1) | `DISCONNECTED` | V1 freight corridor management screen displaying distance, fuel cost, and toll metrics. Unmounted in V2 router. |
| `client/src/pages/AttendancePage.jsx` | Attendance (V1)| `DISCONNECTED` | V1 driver punch-clock timesheet and manager verification screen. Unmounted in V2 router. |
| `client/src/pages/PayrollPage.jsx` | Payroll (V1) | `DISCONNECTED` | V1 bi-weekly driver compensation generation and payslip inspection page. Unmounted in V2 router. |

---

### 3.5 Client: Redux State Slices

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `client/src/features/auth/authSlice.js` | Redux Slice | `ACTIVE` | Manages authentication state, user identity, JWT persistence in `localStorage`, and logout cleanup. |
| `client/src/features/orders/orderSlice.js` | Redux Slice | `ACTIVE` | Manages order creation, retrieval, payment confirmation, driver response submission, and status updates. |
| `client/src/features/analytics/analyticsSlice.js`| Redux Slice | `ORPHANED / BUG`| Dispatches `fetchFleetAnalytics` used by `DashboardPage.jsx`, but omitted from `store.js`, causing a runtime state error. |
| `client/src/features/locations/locationSlice.js` | Redux Slice | `ORPHANED` | Fetches provinces, cities, and areas from `/api/locations`; unused because pages hardcode location lists. |
| `client/src/features/pricing/pricingSlice.js` | Redux Slice | `ORPHANED` | Handles live fare estimates and pricing config CRUD; omitted from `store.js` and bypassed in pages. |
| `client/src/features/fleet/vehicleSlice.js` | Redux Slice | `DISCONNECTED` | Manages CRUD operations and status changes for V1 vehicles. Unused in V2 store. |
| `client/src/features/dispatch/dispatchSlice.js`| Redux Slice | `DISCONNECTED` | Manages V1 manual dispatch logs and checkpoint updates. Unused in V2 store. |
| `client/src/features/routes/routeSlice.js` | Redux Slice | `DISCONNECTED` | Manages V1 corridor definitions and distance calculations. Unused in V2 store. |
| `client/src/features/attendance/attendanceSlice.js`| Redux Slice | `DISCONNECTED` | Manages V1 driver clock-in/out and timesheet verifications. Unused in V2 store. |
| `client/src/features/payroll/payrollSlice.js` | Redux Slice | `DISCONNECTED` | Manages V1 automated driver compensation and payslips. Unused in V2 store. |

---

### 3.6 Client: UI & Domain Components

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `client/src/components/layout/MainLayout.jsx` | Layout | `DISCONNECTED` | Shell layout component with `Navbar`, `Sidebar`, and `<Outlet />`. Bypassed in V2 routing. |
| `client/src/components/layout/Navbar.jsx` | Layout | `DISCONNECTED` | Navigation header displaying user profile, role badge, and theme toggle. Bypassed in V2. |
| `client/src/components/layout/Sidebar.jsx` | Layout | `DISCONNECTED` | Collapsible sidebar linking to V1 routes (`/vehicles`, `/dispatches`, `/routes`, etc.) with obsolete V1 role checks. |
| `client/src/components/ui/Badge.jsx` | Core UI | `ACTIVE` | Reusable colored status chip component supporting variants (`primary`, `success`, `warning`, `danger`). |
| `client/src/components/ui/Button.jsx` | Core UI | `ACTIVE` | Reusable button component supporting loading spinners, variants (`primary`, `secondary`, `danger`), and sizes. |
| `client/src/components/ui/Card.jsx` | Core UI | `ACTIVE` | Structural surface component providing compound `CardHeader`, `CardTitle`, and `CardContent`. |
| `client/src/components/ui/Input.jsx` | Core UI | `ACTIVE` | Standardized text and numeric form input field with error messaging and label bindings. |
| `client/src/components/ui/Modal.jsx` | Core UI | `ACTIVE` | Accessible dialog backdrop and container component with escape-key and click-outside dismissal. |
| `client/src/components/ui/Select.jsx` | Core UI | `ACTIVE` | Standardized dropdown selection component supporting option lists and custom disabled states. |
| `client/src/components/ui/StatCard.jsx` | Core UI | `ACTIVE` | Dashboard metric widget displaying numeric metrics, trend percentages, and iconography. |
| `client/src/components/ui/Pagination.jsx` | Core UI | `DISCONNECTED` | Table pagination controls; only imported by unmounted `VehiclesPage.jsx`. |
| `client/src/components/ui/BentoGrid.jsx` | Core UI | `ORPHANED` | Unused grid layout helper intended for modern dashboard card arrangement. |
| `client/src/components/ui/DataTable.jsx` | Core UI | `ORPHANED` | Generic table component with sortable headers; unused across the codebase. |
| `client/src/components/ui/DriverConsentCard.jsx` | Driver UI | `ORPHANED` | Standalone trip acceptance card with countdown timer; bypassed by inline `TripCard` in `DriverConsent.jsx`. |
| `client/src/components/ui/FareEstimatePanel.jsx` | Order UI | `ORPHANED / BUG`| Fare preview panel with broken import (`estimateFare` from `orderSlice`); bypassed by `PlaceOrder.jsx`. |
| `client/src/components/ui/OrderTrackingTimeline.jsx`| Order UI | `ORPHANED` | Stepper timeline for shipment checkpoints; bypassed by custom inline rendering in `ClientDashboard.jsx`. |
| `client/src/components/ui/PakistanLocationDropdown.jsx`| Order UI | `ORPHANED` | Cascading province/city/area dropdown using `locationSlice`; bypassed by hardcoded arrays in pages. |
| `client/src/components/attendance/ClockInCard.jsx`| Attendance (V1)| `DISCONNECTED` | Driver shift start/stop interface; used only in unmounted `AttendancePage.jsx`. |
| `client/src/components/attendance/VerifyTimesheetModal.jsx`| Attendance (V1)| `DISCONNECTED` | Manager dialog for approving driver timesheets; used only in unmounted `AttendancePage.jsx`. |
| `client/src/components/dispatches/CreateDispatchModal.jsx`| Dispatch (V1) | `DISCONNECTED` | Modal for scheduling vehicle and driver to a route; used only in unmounted `DispatchesPage.jsx`. |
| `client/src/components/dispatches/DispatchTimeline.jsx`| Dispatch (V1) | `DISCONNECTED` | Vertical timeline component for dispatch checkpoint logs; used only in unmounted `DispatchesPage.jsx`. |
| `client/src/components/dispatches/UpdateDispatchStatusModal.jsx`| Dispatch (V1)| `DISCONNECTED` | Modal for updating vehicle status and adding checkpoint notes; used only in unmounted `DispatchesPage.jsx`. |
| `client/src/components/payroll/GeneratePayrollModal.jsx`| Payroll (V1) | `DISCONNECTED` | Dialog triggering payroll generation for a date range; used only in unmounted `PayrollPage.jsx`. |
| `client/src/components/payroll/PayslipModal.jsx`| Payroll (V1) | `DISCONNECTED` | Printable detailed driver payslip view; used only in unmounted `PayrollPage.jsx`. |
| `client/src/components/routes/CreateRouteModal.jsx`| Routes (V1) | `DISCONNECTED` | Form for creating fixed freight corridors with estimated tolls; used only in unmounted `RoutesPage.jsx`. |
| `client/src/components/vehicles/VehicleModal.jsx`| Fleet (V1) | `DISCONNECTED` | Dialog for registering or updating fleet vehicles; used only in unmounted `VehiclesPage.jsx`. |

---

### 3.7 Server: Configurations & Entrypoint

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `server/.env` | Config | `ACTIVE` | Local environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `ORS_API_KEY`, `CLIENT_URL`). |
| `server/.env.example` | Config | `ACTIVE` | Template demonstrating required environment configuration for deployment. |
| `server/package.json` | Dependencies | `ACTIVE` | Defines server runtime dependencies (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `node-cron`, `swagger-ui-express`) and startup scripts. |
| `server/package-lock.json` | Dependencies | `ACTIVE` | Deterministic lockfile for backend dependencies. |
| `server/server.js` | Server Core | `ACTIVE` | Express server bootstrap configuring security middleware, database connection, V2 route mounting, Swagger docs, and background jobs. |
| `server/test-api.js` | Testing / Dev | `OUTDATED` | Standalone script testing legacy V1 endpoints (`/api/vehicles`, `/api/routes`, etc.) using defunct `manager@logistics.local` credentials. |
| `server/config/db.js` | Database Config | `ACTIVE` | Mongoose connection manager with automated fallback to `mongodb-memory-server` if local MongoDB is offline. |
| `server/config/swagger.js` | API Docs Config | `ACTIVE` | Swagger JSDoc OpenAPI 3.0 specification definition scanning route and controller annotations. |

---

### 3.8 Server: Middlewares & Data

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `server/middleware/authMiddleware.js` | Security | `ACTIVE` | Validates incoming Bearer JWT tokens, extracts user IDs, and attaches hydrated user documents to `req.user`. |
| `server/middleware/roleMiddleware.js` | Security | `ACTIVE` | Restricts endpoint execution to specified user roles (e.g. `authorize('Client', 'Driver')`), returning 403 upon mismatch. |
| `server/middleware/errorMiddleware.js` | Utility | `ACTIVE` | Centralized catch-all handler converting unknown routes to 404s and formatting application errors into clean JSON responses. |
| `server/data/pakistanLocations.js` | Data Source | `ACTIVE` | Static dictionary of Pakistan provinces, major logistics cities, local areas, and approximate geographic centroids. |

---

### 3.9 Server: Models

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `server/models/User.js` | Domain Model | `ACTIVE` | Unified user model supporting `Client`, `Driver`, and `Admin` roles, with sub-schemas for corporate profiles and driver consent. |
| `server/models/Order.js` | Domain Model | `ACTIVE` | Core V2 logistics entity capturing pickup/dropoff, weight, cargo type, fare breakdown, driver offers, checkpoints, and payment. |
| `server/models/PricingConfig.js` | Domain Model | `ACTIVE` | Stores base rates, weight-bracket pricing tiers, priority multipliers, and hazardous cargo surcharges. |
| `server/models/DispatchLog.js` | Domain Model | `PARTIAL / V1` | Models manual vehicle-driver dispatch manifests. Mounted at `/api/dispatches`, but separate from V2 customer orders. |
| `server/models/Vehicle.js` | Domain Model | `PARTIAL / V1` | Schema for fleet trucks and vans. Only queried by `analyticsController` and `dispatchController`; no creation routes mounted. |
| `server/models/RouteMetric.js` | Domain Model | `PARTIAL / V1` | Schema for fixed inter-hub corridors. Only queried by `analyticsController` and `dispatchController`; no creation routes mounted. |
| `server/models/DriverAttendance.js` | Domain Model | `PARTIAL / V1` | Schema for driver punch-clocks. Only queried for analytics aggregation; attendance routes are unmounted. |
| `server/models/Payroll.js` | Domain Model | `PARTIAL / V1` | Schema for bi-weekly driver compensation statements. Only queried by analytics; payroll routes are unmounted. |

---

### 3.10 Server: Controllers & Routes

| Route File | Controller File | Mounted? | Core Purpose |
| :--- | :--- | :--- | :--- |
| `server/routes/authRoutes.js` | `server/controllers/authController.js` | `YES (/api/auth)` | User login, Driver registration, B2B Client corporate onboarding, session check (`/me`), and driver status toggling. |
| `server/routes/orderRoutes.js` | `server/controllers/orderController.js` | `YES (/api/orders)` | Client order placement, payment confirmation, order retrieval, driver response submission, and status updates. |
| `server/routes/pricingRoutes.js` | `server/controllers/pricingController.js`| `YES (/api/pricing)` | Live distance/fare calculation and administrator pricing tier retrieval/updates. |
| `server/routes/locationRoutes.js` | `server/controllers/locationController.js`| `YES (/api/locations)` | Cascading geographic endpoints serving Pakistan provinces, cities, and local areas. |
| `server/routes/analyticsRoutes.js`| `server/controllers/analyticsController.js`| `YES (/api/analytics)`| System-wide KPI aggregation (total vehicles, active dispatches, fuel/toll/payroll expenses, and fleet utilization). |
| `server/routes/dispatchRoutes.js` | `server/controllers/dispatchController.js`| `YES (/api/dispatches)`| Legacy manual dispatch operations (creating trip manifests, logging incidents, and recording checkpoints). |
| `server/routes/vehicleRoutes.js` | `server/controllers/vehicleController.js` | `NO (Unmounted)` | V1 fleet vehicle CRUD operations. Uses defunct `Fleet_Manager` authorization. |
| `server/routes/routeRoutes.js` | `server/controllers/routeController.js` | `NO (Unmounted)` | V1 inter-city corridor CRUD operations. Uses defunct `Fleet_Manager` / `Dispatcher` authorization. |
| `server/routes/attendanceRoutes.js`| `server/controllers/attendanceController.js`| `NO (Unmounted)` | V1 driver punch-clock and timesheet verification endpoints. |
| `server/routes/payrollRoutes.js` | `server/controllers/payrollController.js` | `NO (Unmounted)` | V1 automated driver payroll calculation and payslip generation. Uses defunct `Accountant` authorization. |

---

### 3.11 Server: Services & Utilities

| File | Module | Status | Core Purpose |
| :--- | :--- | :--- | :--- |
| `server/services/mappingService.js` | Service | `ACTIVE` | Computes driving distance and estimated transit time using OpenRouteService Directions API with Haversine fallback. |
| `server/services/pricingService.js` | Service | `ACTIVE` | Calculates total shipment fares based on distance, weight tiers, priority multipliers, and hazardous material surcharges. |
| `server/services/smartMatchService.js` | Service | `ACTIVE` | Geo-matches orders to active drivers in the pickup city/province, broadcasts trip offers, and atomically locks orders upon driver acceptance. |
| `server/utils/codeGenerators.js` | Utility | `ACTIVE` | Formats sequential human-readable identifiers (`ORD-YYYYMM-XXXX`, `DSP-XXXX-XXXX`, `PAY-YYYYMM-XXXX`). |
| `server/utils/expiryJob.js` | Background Task | `ACTIVE` | Node-cron scheduled task checking every 30 minutes for orders in `Pending-Driver-Consent` older than 72 hours and expiring them. |
| `server/utils/jwtHelper.js` | Security | `ACTIVE` | Generates standardized signed JSON Web Tokens encoding user ID and role with a 7-day expiration. |
| `server/utils/seedData.js` | Database Seed | `ACTIVE` | Automatically seeds demo accounts on cold boot (`admin@fleetcore.local`, `driver@fleetcore.local`, `client@fleetcore.local`). |

---

## 4. Optimization & Redundancy Audit

### 4.1 Tier 1: Immediate Safe Deletion Candidates (Zero Operational Impact)
These files are completely disconnected, unreferenced, or represent stale build/backup artifacts. Deleting them will not break any running flow.

| File Path | Size / Lines | Reason for Deletion |
| :--- | :--- | :--- |
| `client/src/pages.zip.zip` | 40.6 KB | Backup ZIP file accidentally committed into the source directory. |
| `package-lock.json` (Root) | 121 Bytes | Orphaned root lockfile without a root `package.json`. |
| `client/src/components/ui/BentoGrid.jsx` | 13 Lines | Unused UI wrapper; `ClientDashboard.jsx` implements its own inline bento cards. |
| `client/src/components/ui/DataTable.jsx` | 148 Lines | Generic data table wrapper never referenced anywhere in client. |
| `client/src/routes/ProtectedRoute.jsx` | 18 Lines | Duplicate of the inline `ProtectedRoute` defined directly in `AppRoutes.jsx`. |
| `server/test-api.js` | 65 Lines | Outdated integration test script querying non-existent endpoints and users. |

---

### 4.2 Tier 2: Redundant Component Implementations (Bypassed by Inlined Pages)
These components were built to be reusable, but the active pages re-implemented their functionality inline. They can be deleted or refactored to restore DRY principles.

| File Path | Referenced In | Why It Is Redundant |
| :--- | :--- | :--- |
| `client/src/components/ui/DriverConsentCard.jsx` | Zero files | `DriverConsent.jsx` implements its own comprehensive `TripCard` component with action handlers. |
| `client/src/components/ui/FareEstimatePanel.jsx` | Zero files | Contains a broken import (`estimateFare` from `orderSlice`), and `PlaceOrder.jsx` handles calculation on server submission. |
| `client/src/components/ui/OrderTrackingTimeline.jsx`| Zero files | `ClientDashboard.jsx` renders checkpoints directly within its own inline tracking accordion. |
| `client/src/components/ui/PakistanLocationDropdown.jsx`| Zero files | `PlaceOrder.jsx` and `ClientRegister.jsx` each hardcode their own copies of the Pakistan location dictionary. |

---

### 4.3 Tier 3: V1 Legacy Files (Decoupled Enterprise Fleet Modules)
These files represent the previous internal fleet management architecture. If the product direction is strictly the V2 On-Demand B2B model, all files in this tier can be archived or deleted. If vehicle registry or driver payroll is to be reintroduced to the Admin portal, these require significant updates to role authorization (`Admin` instead of `Fleet_Manager`/`Accountant`).

#### Client V1 Pages & Components
- `client/src/pages/VehiclesPage.jsx`
- `client/src/pages/DispatchesPage.jsx`
- `client/src/pages/RoutesPage.jsx`
- `client/src/pages/AttendancePage.jsx`
- `client/src/pages/PayrollPage.jsx`
- `client/src/components/layout/MainLayout.jsx`
- `client/src/components/layout/Navbar.jsx`
- `client/src/components/layout/Sidebar.jsx`
- `client/src/components/vehicles/VehicleModal.jsx`
- `client/src/components/dispatches/CreateDispatchModal.jsx`
- `client/src/components/dispatches/DispatchTimeline.jsx`
- `client/src/components/dispatches/UpdateDispatchStatusModal.jsx`
- `client/src/components/attendance/ClockInCard.jsx`
- `client/src/components/attendance/VerifyTimesheetModal.jsx`
- `client/src/components/payroll/GeneratePayrollModal.jsx`
- `client/src/components/payroll/PayslipModal.jsx`
- `client/src/components/routes/CreateRouteModal.jsx`
- `client/src/components/ui/Pagination.jsx`

#### Client V1 Redux Slices (Unmounted in `store.js`)
- `client/src/features/fleet/vehicleSlice.js`
- `client/src/features/dispatch/dispatchSlice.js`
- `client/src/features/routes/routeSlice.js`
- `client/src/features/attendance/attendanceSlice.js`
- `client/src/features/payroll/payrollSlice.js`

#### Server V1 Controllers & Routes (Unmounted in `server.js`)
- `server/controllers/vehicleController.js` & `server/routes/vehicleRoutes.js`
- `server/controllers/routeController.js` & `server/routes/routeRoutes.js`
- `server/controllers/attendanceController.js` & `server/routes/attendanceRoutes.js`
- `server/controllers/payrollController.js` & `server/routes/payrollRoutes.js`

#### Server V1 Models (Queried only by analytics)
- `server/models/Vehicle.js`
- `server/models/RouteMetric.js`
- `server/models/DriverAttendance.js`
- `server/models/Payroll.js`

---

## 5. Architectural Inconsistencies & Critical Bug Alerts

### 🚨 Critical Bug 1: Missing Redux Reducer in Store (`analyticsSlice`)
- **Location:** `client/src/pages/DashboardPage.jsx` (Line 6) and `client/src/store/store.js`
- **Issue:** `DashboardPage` dispatches `fetchFleetAnalytics()` and accesses `state.analytics`. However, `store.js` only registers `auth` and `orders`.
- **Consequence:** When an Admin logs into the system and navigates to `/dashboard`, `state.analytics` evaluates to `undefined`, causing property access exceptions or preventing dashboard KPI rendering.
- **Remedy:** Mount `analytics: analyticsReducer` in `client/src/store/store.js`.

### 🚨 Critical Bug 2: Missing Layout Shell for Admin Dashboard
- **Location:** `client/src/routes/AppRoutes.jsx` (Lines 93–98)
- **Issue:** Unlike the Client and Driver views which contain their own top bars and logout controls, `DashboardPage` was authored as a sub-view meant to reside inside `MainLayout`. In `AppRoutes.jsx`, `<DashboardPage />` is rendered directly.
- **Consequence:** The Admin dashboard renders without a top bar, without a sidebar, and without any button or control to log out.
- **Remedy:** Wrap `DashboardPage` with a dedicated Admin navigation bar or restore `MainLayout` with updated V2 role links.

### ⚠️ Code Duplication: Pakistan Geographic Hierarchy
- **Location:** 
  1. `server/data/pakistanLocations.js`
  2. `client/src/pages/client/PlaceOrder.jsx` (Lines 11–36)
  3. `client/src/pages/client/ClientRegister.jsx` (Lines 18–55)
- **Issue:** A 50-line location dictionary is copy-pasted across multiple client pages, completely ignoring both `client/src/features/locations/locationSlice.js` and the backend `/api/locations` API.
- **Remedy:** Either adopt `locationSlice` and `PakistanLocationDropdown.jsx` across both pages, or centralize the data into a single client-side utility file `client/src/utils/pakistanLocations.js` to eliminate maintenance drift.

---

## 6. End-to-End System Workflow (V2.0)

```mermaid
sequenceDiagram
    autonumber
    actor Client as B2B Client
    participant Web as Web Client (React)
    participant API as FleetCore API (Express)
    participant ORS as OpenRouteService / Haversine
    participant DB as MongoDB
    actor Driver as Driver / Rider

    Note over Client, DB: Phase 1: Onboarding & Authentication
    Client->>Web: Register corporate profile (NTN, address)
    Web->>API: POST /api/auth/register-client
    API->>DB: Store User (Role: Client, isVerified: false)
    API-->>Web: JWT Token + Profile

    Note over Client, DB: Phase 2: Order Creation & Fare Calculation
    Client->>Web: Fill order form (Pickup, Dropoff, Weight, Priority)
    Web->>API: POST /api/orders
    API->>ORS: Resolve road distance & estimated duration
    API->>DB: Fetch PricingConfig (weight tiers, hazardous surcharge)
    API->>DB: Insert Order (Status: 'Pending-Payment')
    API-->>Web: Order Details + Estimated Fare (PKR)
    Web->>Client: Display /client/fare-receipt

    Note over Client, DB: Phase 3: Payment & Smart Match Broadcasting
    Client->>Web: Confirm Payment transfer
    Web->>API: PATCH /api/orders/:id/confirm-payment
    API->>DB: Update Order (Status: 'Pending-Driver-Consent')
    API->>API: smartMatchService.broadcastToDrivers(orderId)
    API->>DB: Match drivers in pickup city/province; flag offers
    API-->>Web: Payment Confirmed

    Note over Driver, DB: Phase 4: Driver Consent & Dispatch Lock
    Driver->>Web: Open /driver/terminal
    Web->>API: GET /api/orders (filters pending offers)
    API-->>Web: Display Broadcast Trip Card
    Driver->>Web: Click "Accept Trip"
    Web->>API: PATCH /api/orders/:id/driver-response { response: 'Accepted' }
    API->>DB: Atomic Lock: Order status -> 'Driver-Accepted'
    API->>DB: Assign Driver ID; Decline offer for other drivers
    API-->>Web: Trip Confirmed

    Note over Driver, DB: Phase 5: Transit & Fulfillment
    Driver->>Web: Mark 'Picked Up' / 'In Transit'
    Web->>API: PATCH /api/orders/:id/status
    API->>DB: Append Checkpoint Log with timestamp & GPS/City
    Driver->>Web: Mark 'Delivered'
    Web->>API: PATCH /api/orders/:id/status { status: 'Delivered' }
    API->>DB: Order marked 'Delivered' (Payment: 'Paid')
    API-->>Web: Delivery Complete
```

---

## 7. Recommended Action Plan for Architecture Optimization

1. **Sprint 1: Housekeeping & Critical Bug Fixes**
   - Delete `client/src/pages.zip.zip` and root `package-lock.json`.
   - Mount `analyticsReducer` in `client/src/store/store.js` to fix the Admin Dashboard runtime error.
   - Remove duplicate `client/src/routes/ProtectedRoute.jsx` and standardize on a single route guard.

2. **Sprint 2: UI & Component Standardization**
   - Provide an Admin layout shell for `DashboardPage.jsx` with a logout mechanism.
   - Resolve location duplication by utilizing either `/api/locations` or a single shared constant across `PlaceOrder.jsx` and `ClientRegister.jsx`.
   - Remove dead UI components (`BentoGrid.jsx`, `DataTable.jsx`, `FareEstimatePanel.jsx`, `DriverConsentCard.jsx`, `OrderTrackingTimeline.jsx`).

3. **Sprint 3: V1 Legacy Code Retirement**
   - If internal vehicle fleet and manual payroll tracking are no longer in scope for V2, remove the V1 pages (`VehiclesPage`, `DispatchesPage`, `RoutesPage`, `AttendancePage`, `PayrollPage`), their sub-components, their unused Redux slices, and the unmounted server routes/controllers.
   - Update `server/test-api.js` to test the actual V2.0 workflow (Order placement, smart match, and driver response).
