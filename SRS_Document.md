# Software Requirements Specification (SRS)

## Logistics & Supply Chain Management System

---

| **Document Information** | |
|---|---|
| **Project Title** | Logistics & Supply Chain Management System |
| **Version** | 1.0 |
| **Date** | September 23, 2026 |
| **Development Methodology** | Agile (Scrum) |
| **Semester** | Fall 2026 |

---

## Table of Contents

1. [Project Title / Idea](#1-project-title--idea)
2. [Project Modules](#2-project-modules)
3. [Functional Requirements (User Stories)](#3-functional-requirements-user-stories)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [User Roles & Permissions](#7-user-roles--permissions)
8. [Agile/Scrum Development Plan](#8-agilescrum-development-plan)
9. [Product Backlog](#9-product-backlog)
10. [Risk Assessment](#10-risk-assessment)

---

## 1. Project Title / Idea

### 1.1 Project Title

**Logistics & Supply Chain Management System**

### 1.2 Problem Statement

Modern logistics and transportation companies face critical operational challenges in managing their fleet of vehicles, coordinating dispatch operations, tracking driver attendance and work hours, processing payroll, and optimizing delivery routes. These operations are typically handled through disconnected spreadsheets, manual paperwork, and fragmented tools — leading to inefficiencies, errors in payroll calculations, missed delivery deadlines, underutilization of fleet assets, and a lack of real-time visibility into operations.

There is a pressing need for a **centralized, web-based platform** that consolidates all core logistics operations into a single, role-based system that provides real-time insights, automates manual processes, and enables data-driven decision-making.

### 1.3 Proposed Solution

The **Logistics & Supply Chain Management System** is a full-stack web application that provides an integrated platform for managing end-to-end logistics operations. The system enables fleet managers, dispatchers, drivers, and accountants to collaboratively manage vehicles, plan and track shipment dispatches, record driver attendance with clock-in/clock-out functionality, generate and process payroll based on actual timesheets, define and optimize delivery route corridors, and view real-time analytics dashboards — all from a single unified interface.

### 1.4 Intended Users

| **User Role** | **Description** |
|---|---|
| **Fleet Manager** | Senior operations manager with full administrative access. Manages vehicles, staff, routes, and has oversight of all modules. Can approve payroll, verify attendance, and view analytics. |
| **Dispatcher** | Operations coordinator responsible for creating and managing shipment dispatches, assigning drivers and vehicles to routes, and updating dispatch statuses in real-time. |
| **Driver** | Field staff member who operates vehicles. Can view assigned dispatches, clock in/out for shifts, view personal attendance history, and access own payslips. |
| **Accountant** | Financial staff responsible for generating payroll records from attendance timesheets, approving/rejecting payslips, processing payments, and managing deductions and allowances. |

### 1.5 Scope

The system covers the following operational domains:
- **Fleet Management** — Vehicle registration, status tracking, maintenance scheduling, and driver assignment.
- **Dispatch & Shipment Tracking** — Trip planning, cargo manifesting, real-time status updates with checkpoint timeline.
- **Driver Attendance & Timesheet Management** — Digital clock-in/clock-out, shift tracking, overtime calculation, and timesheet verification.
- **Payroll Processing** — Automated payslip generation from attendance data, allowances, deductions, tax withholding, and payment status management.
- **Route Corridor Management** — Route definition with waypoints, distance/duration estimation, fuel consumption modeling, and carbon footprint calculation.
- **Analytics & Reporting Dashboard** — Fleet utilization KPIs, dispatch metrics, operating cost trends, and visual charts.

---

## 2. Project Modules

The system is organized into **seven (7) major modules**, each representing a distinct functional area of the software product:

### Module 1: Authentication & User Management
- User registration with role assignment (Fleet Manager, Dispatcher, Driver, Accountant)
- Secure login with JWT (JSON Web Token) authentication
- Role-Based Access Control (RBAC) — restrict features based on user roles
- User profile management (personal info, license number, hourly rate, shift type, address)
- Staff directory listing with role and status filters
- Staff status management (Active, On Duty, Off Duty, On Leave, Suspended)

### Module 2: Fleet / Vehicle Management
- Register new vehicles into the fleet (plate number, VIN, make, model, year, type)
- Support for multiple vehicle types: Cargo Van, Semi-Truck, Flatbed, Refrigerated Truck, Electric Delivery Van, Box Truck
- Track vehicle operational status: Available, In Transit, Under Maintenance, Out of Service
- Record vehicle specifications: payload capacity (kg), volume capacity (m³), fuel type, odometer reading
- Assign/unassign drivers to vehicles
- Maintenance tracking: last service date, next service odometer threshold
- Search and filter fleet by status, type, fuel type, or keyword
- Edit and delete vehicle records

### Module 3: Dispatch & Shipment Management
- Create new dispatch trips with auto-generated dispatch numbers
- Assign vehicle, driver, and route corridor to each dispatch
- Cargo manifesting: description, weight (kg), and capacity validation against vehicle payload limit
- Priority levels: Standard, Express, Urgent, Hazardous/Critical
- Real-time dispatch status lifecycle: Draft → Assigned → Dispatched → En Route → At Checkpoint → Delivered
- Checkpoint timeline logging with location, notes, and timestamps
- Incident reporting on active dispatches
- Automatic vehicle status update on dispatch creation (In Transit) and delivery (Available)
- Automatic odometer update upon delivery based on route distance
- Expense tracking: fuel and toll expenses per dispatch
- Search, filter, and sort dispatches by status, priority, driver, or vehicle
- Cancel and delete dispatch records

### Module 4: Driver Attendance & Timesheet Management
- Digital clock-in to start a shift (prevents duplicate active sessions)
- Digital clock-out to end a shift
- Automatic calculation of total hours worked, regular hours (up to 8 hrs), and overtime hours
- Shift type categorization: Morning, Evening, Night, Long-Haul
- Attendance status tracking: Present, Late, Half Day, Absent, On Leave
- Driver status auto-update on clock-in (On Duty) and clock-out (Off Duty)
- Timesheet verification/approval by Fleet Manager or Accountant with ability to adjust hours
- View today's attendance status and active session
- Filter attendance logs by driver, status, shift type, or date range
- Role-based visibility: Drivers see only their own records; Managers see all

### Module 5: Payroll Processing
- Automated payroll generation for a specified pay period (start date → end date)
- Payroll calculated from actual attendance timesheet data (regular hours × hourly rate + overtime × 1.5× rate)
- Configurable allowances: Fuel Allowance, Meal Allowance, Hazard Bonus, Performance Bonus
- Configurable deductions: Tax Withholding (15%), Health Insurance, 401(k) Retirement (4%), Other Deductions
- Gross pay and net pay computation
- Payslip lifecycle: Draft → Approved → Paid
- Payment method options: Direct Deposit, Wire Transfer, Check
- Bulk payroll generation for all active drivers or individual driver
- View detailed payslip breakdown (earnings, allowances, deductions)
- Approve/reject payslips and mark as paid with payment date
- Delete draft payroll records
- Role-based visibility: Drivers see only their own payslips

### Module 6: Route Corridor Management
- Define route corridors with unique route codes (auto-generated from origin/destination hubs)
- Specify origin hub, destination hub, and intermediate waypoints with estimated stop durations
- Record estimated distance (km) and duration (hours)
- Automatic fuel consumption estimation (30L diesel per 100km commercial freight standard)
- Automatic carbon footprint calculation (2.68 kg CO₂ per liter of diesel)
- Route status management: Active, Optimized, Archived
- Toll expense tracking per route
- Search routes by code, name, or hub locations
- Update route metrics and delete route records

### Module 7: Analytics & Reporting Dashboard
- Fleet utilization rate KPI (percentage of vehicles currently in transit)
- Vehicle status distribution breakdown (Available, In Transit, Maintenance, Out of Service)
- Vehicle type composition chart
- Dispatch performance metrics: total, active, delivered, and incident counts
- Driver workforce metrics: total drivers, on-duty, off-duty
- Financial summary: total fuel expenses, toll expenses, payroll expenses, total operating cost
- Monthly operating cost trend visualization (fuel, tolls, payroll over time)
- Recent active dispatches feed
- Interactive charts and visual dashboards (Recharts)

---

## 3. Functional Requirements (User Stories)

### 3.1 Authentication & User Management

| **ID** | **User Story** | **Priority** |
|---|---|---|
| US-01 | As a **new employee**, I want to **register an account** with my name, email, password, and role, so that I can access the system based on my job function. | High |
| US-02 | As a **registered user**, I want to **log in** with my email and password, so that I can securely access the system and receive an authentication token. | High |
| US-03 | As a **logged-in user**, I want to **view my profile** information (name, email, role, phone, license number, hourly rate, shift type), so that I can verify my account details. | Medium |
| US-04 | As a **Fleet Manager**, I want to **view a list of all staff members** filtered by role and status, so that I can manage my workforce. | High |
| US-05 | As a **Fleet Manager**, I want to **update a staff member's status** (Active, On Duty, Off Duty, On Leave, Suspended), hourly rate, and shift type, so that I can keep records up to date. | Medium |
| US-06 | As the **system**, I want to **prevent deactivated accounts** from logging in, so that security is maintained. | High |

### 3.2 Fleet / Vehicle Management

| **ID** | **User Story** | **Priority** |
|---|---|---|
| US-07 | As a **Fleet Manager**, I want to **register a new vehicle** into the fleet by entering plate number, VIN, make, model, year, type, capacity, and fuel type, so that the vehicle is tracked in the system. | High |
| US-08 | As a **Fleet Manager**, I want the system to **prevent duplicate vehicle registrations** (by plate number), so that fleet records remain accurate. | High |
| US-09 | As a **Fleet Manager or Dispatcher**, I want to **view all vehicles** in the fleet with the ability to search and filter by status, type, and fuel type, so that I can quickly find available assets. | High |
| US-10 | As a **Fleet Manager**, I want to **view detailed information** of a single vehicle including its assigned driver, odometer reading, and service history, so that I can make informed decisions. | Medium |
| US-11 | As a **Fleet Manager or Dispatcher**, I want to **update vehicle specifications** (capacity, odometer, hub location, notes), so that records reflect the current state. | Medium |
| US-12 | As a **Fleet Manager or Dispatcher**, I want to **change a vehicle's operational status** (Available, In Transit, Under Maintenance, Out of Service), so that fleet availability is accurately tracked. | High |
| US-13 | As a **Fleet Manager or Dispatcher**, I want to **assign or unassign a driver** to/from a vehicle, so that driver-vehicle pairings are maintained. | Medium |
| US-14 | As a **Fleet Manager**, I want to **delete a vehicle** from the fleet records, so that decommissioned vehicles are removed. | Low |
| US-15 | As a **Fleet Manager**, I want the system to **automatically update maintenance records** (last service date, next service odometer) when a vehicle returns from maintenance, so that preventive maintenance is tracked. | Medium |

### 3.3 Dispatch & Shipment Management

| **ID** | **User Story** | **Priority** |
|---|---|---|
| US-16 | As a **Dispatcher**, I want to **create a new dispatch trip** by selecting a vehicle, driver, route, and entering cargo details (description, weight, priority), so that a shipment is planned and assigned. | High |
| US-17 | As a **Dispatcher**, I want the system to **auto-generate unique dispatch numbers**, so that each trip has a traceable identifier. | High |
| US-18 | As a **Dispatcher**, I want the system to **validate cargo weight** against the assigned vehicle's payload capacity, so that overloading is prevented. | High |
| US-19 | As a **Dispatcher**, I want to **set departure time and scheduled arrival** (or have it auto-calculated from route duration), so that delivery timelines are established. | Medium |
| US-20 | As a **Dispatcher or Driver**, I want to **update the dispatch status** through its lifecycle (Assigned → Dispatched → En Route → At Checkpoint → Delivered), so that shipment progress is tracked in real-time. | High |
| US-21 | As a **Dispatcher or Driver**, I want to **record checkpoints** with location, notes, and timestamp during a trip, so that a timeline of the shipment journey is maintained. | High |
| US-22 | As a **Driver**, I want to **report an incident** on my active dispatch with incident notes and location, so that management is alerted immediately. | High |
| US-23 | As the **system**, I want to **automatically set the vehicle status to "In Transit"** when a dispatch is created, and **back to "Available" when delivered**, so that fleet availability is always current. | High |
| US-24 | As the **system**, I want to **update the vehicle's odometer** by the route distance upon delivery, so that mileage records are accurate. | Medium |
| US-25 | As a **Dispatcher**, I want to **search and filter dispatches** by status, priority, driver, vehicle, or keyword, so that I can quickly locate specific trips. | Medium |
| US-26 | As a **Driver**, I want to **view only my assigned dispatches**, so that I see only the trips relevant to me. | High |
| US-27 | As a **Fleet Manager**, I want to **delete dispatch records**, so that erroneous or test entries can be removed. | Low |

### 3.4 Driver Attendance & Timesheet Management

| **ID** | **User Story** | **Priority** |
|---|---|---|
| US-28 | As a **Driver**, I want to **clock in** to start my shift and record the shift type, so that my work hours begin tracking. | High |
| US-29 | As a **Driver**, I want to **clock out** to end my shift, so that my total hours worked are calculated automatically. | High |
| US-30 | As the **system**, I want to **prevent duplicate clock-ins** if a driver already has an active session, so that attendance records are accurate. | High |
| US-31 | As the **system**, I want to **automatically calculate regular hours (up to 8 hrs) and overtime hours (beyond 8 hrs)** upon clock-out, so that payroll data is precise. | High |
| US-32 | As the **system**, I want to **update the driver's status to "On Duty" at clock-in and "Off Duty" at clock-out**, so that driver availability is reflected in real-time. | Medium |
| US-33 | As a **Driver**, I want to **view my today's attendance status** and check if I am currently clocked in, so that I know my current shift state. | Medium |
| US-34 | As a **Fleet Manager or Accountant**, I want to **view all attendance logs** filtered by driver, status, shift type, or date range, so that I can review timesheets. | High |
| US-35 | As a **Fleet Manager or Accountant**, I want to **verify/approve attendance records** and adjust regular or overtime hours if needed, so that timesheet accuracy is ensured before payroll processing. | High |
| US-36 | As a **Driver**, I want to **view only my own attendance history**, so that my data privacy is maintained. | Medium |

### 3.5 Payroll Processing

| **ID** | **User Story** | **Priority** |
|---|---|---|
| US-37 | As an **Accountant**, I want to **generate payroll records** for a specified pay period (start date to end date) based on actual attendance timesheets, so that pay is calculated accurately. | High |
| US-38 | As the **system**, I want to **compute regular pay** (regular hours × hourly rate) and **overtime pay** (overtime hours × 1.5 × hourly rate), so that compensation follows labor standards. | High |
| US-39 | As an **Accountant**, I want to **configure allowances** (fuel, meal, hazard bonus, performance bonus) for payroll, so that total earnings reflect all compensation components. | Medium |
| US-40 | As the **system**, I want to **apply standard deductions** (tax withholding at 15%, health insurance, 401k retirement at 4%) and compute gross pay and net pay, so that payslips are complete and compliant. | High |
| US-41 | As an **Accountant**, I want to **generate payroll in bulk** for all active drivers or for an individual driver, so that both batch and individual processing is supported. | Medium |
| US-42 | As an **Accountant or Fleet Manager**, I want to **view all payroll records** filtered by payment status (Draft, Approved, Paid) and staff member, so that I can track payroll processing progress. | High |
| US-43 | As an **Accountant or Fleet Manager**, I want to **view a detailed payslip** with full breakdown of earnings, allowances, deductions, gross pay, and net pay, so that I can audit each record. | High |
| US-44 | As an **Accountant or Fleet Manager**, I want to **approve or reject a payslip** and update the payment method, so that the payment workflow is followed. | High |
| US-45 | As an **Accountant**, I want to **mark a payslip as "Paid"** with the payment date recorded, so that disbursement is tracked. | Medium |
| US-46 | As a **Driver**, I want to **view only my own payslips**, so that my financial information is private. | High |
| US-47 | As an **Accountant or Fleet Manager**, I want to **delete draft payroll records**, so that incorrect entries can be removed before approval. | Low |

### 3.6 Route Corridor Management

| **ID** | **User Story** | **Priority** |
|---|---|---|
| US-48 | As a **Fleet Manager or Dispatcher**, I want to **create a new route corridor** with origin hub, destination hub, waypoints, estimated distance, and duration, so that route options are defined for dispatches. | High |
| US-49 | As the **system**, I want to **auto-generate a unique route code** from the origin and destination hub names, so that routes have standardized identifiers. | Medium |
| US-50 | As the **system**, I want to **automatically estimate fuel consumption** (30L per 100km) and **carbon footprint** (2.68 kg CO₂ per liter) when a route is created, so that environmental impact is tracked. | Medium |
| US-51 | As a **Fleet Manager or Dispatcher**, I want to **view all route corridors** with search and filter by status (Active, Optimized, Archived), so that I can find suitable routes for dispatches. | High |
| US-52 | As a **Fleet Manager or Dispatcher**, I want to **update route metrics** (actual distance, actual duration, toll expenses, waypoints), so that route data improves over time with real operational data. | Medium |
| US-53 | As a **Fleet Manager**, I want to **delete a route corridor**, so that unused or obsolete routes are removed from the system. | Low |

### 3.7 Analytics & Reporting Dashboard

| **ID** | **User Story** | **Priority** |
|---|---|---|
| US-54 | As a **Fleet Manager**, I want to **view the fleet utilization rate** (percentage of vehicles in transit), so that I can assess asset usage. | High |
| US-55 | As a **Fleet Manager**, I want to **see a breakdown of vehicle statuses** (Available, In Transit, Maintenance, Out of Service) on a visual chart, so that fleet health is visible at a glance. | High |
| US-56 | As a **Fleet Manager**, I want to **see the vehicle type composition** of my fleet, so that I understand the diversity of assets. | Medium |
| US-57 | As a **Fleet Manager or Dispatcher**, I want to **view dispatch performance metrics** (total, active, delivered, incident count), so that operational performance is measured. | High |
| US-58 | As a **Fleet Manager**, I want to **view driver workforce metrics** (total drivers, on-duty, off-duty), so that staffing levels are monitored. | Medium |
| US-59 | As a **Fleet Manager or Accountant**, I want to **view a financial summary** showing total fuel expenses, toll expenses, payroll expenses, and total operating costs, so that budget health is monitored. | High |
| US-60 | As a **Fleet Manager**, I want to **see monthly operating cost trends** (fuel, tolls, payroll) over time on a chart, so that I can identify spending patterns. | Medium |
| US-61 | As a **Fleet Manager**, I want to **view the 5 most recent active dispatches** on the dashboard, so that I have instant visibility into current operations. | Medium |

---

## 4. Non-Functional Requirements

| **ID** | **Requirement** | **Description** |
|---|---|---|
| NFR-01 | **Security** | All API endpoints (except login/register) are protected with JWT authentication. Passwords are hashed using bcryptjs with a salt factor of 10. |
| NFR-02 | **Authorization** | Role-Based Access Control (RBAC) restricts API access based on user roles. Unauthorized access returns HTTP 403 Forbidden. |
| NFR-03 | **Performance** | API responses should complete within 2 seconds under normal load. Database queries use indexes on frequently queried fields. |
| NFR-04 | **Scalability** | The system uses a modular client-server architecture with separated concerns, allowing independent scaling of frontend and backend services. |
| NFR-05 | **Usability** | The frontend provides a responsive, modern UI with dark mode support, intuitive navigation, and accessible components. |
| NFR-06 | **Reliability** | Input validation on both client and server side. Centralized error handling middleware with meaningful error messages. |
| NFR-07 | **Maintainability** | Codebase follows MVC pattern on the server and Redux/feature-based organization on the client. Swagger API documentation is auto-generated. |
| NFR-08 | **Compatibility** | The web application is compatible with all modern browsers (Chrome, Firefox, Edge, Safari). |
| NFR-09 | **Data Integrity** | Mongoose schema validations enforce data types, required fields, enums, min/max constraints, and unique indexes. |
| NFR-10 | **API Documentation** | Interactive Swagger UI documentation available at `/api-docs` for all REST API endpoints. |

---

## 5. Technology Stack

| **Layer** | **Technology** | **Purpose** |
|---|---|---|
| **Frontend Framework** | React 18 | Component-based UI library |
| **Build Tool** | Vite 6 | Fast development server & bundler |
| **State Management** | Redux Toolkit 2 | Centralized application state with async thunks |
| **Routing** | React Router DOM 6 | Client-side navigation & protected routes |
| **Styling** | Tailwind CSS 3 | Utility-first CSS framework |
| **Charts** | Recharts 2 | Data visualization (bar, pie, line charts) |
| **Icons** | Lucide React | Modern icon library |
| **HTTP Client** | Axios | API request handling with interceptors |
| **Date Formatting** | date-fns | Date manipulation & formatting |
| **Backend Framework** | Express.js 4 | REST API server |
| **Runtime** | Node.js | Server-side JavaScript runtime |
| **Database** | MongoDB (Mongoose 8) | NoSQL document database with ODM |
| **Authentication** | JSON Web Tokens (JWT) | Stateless token-based auth |
| **Password Hashing** | bcryptjs | Secure password encryption |
| **API Security** | Helmet, CORS, Express Rate Limit | HTTP security headers, cross-origin policy, rate limiting |
| **Logging** | Morgan | HTTP request logging |
| **API Documentation** | Swagger (swagger-jsdoc + swagger-ui-express) | Interactive API explorer |
| **Dev Server** | Nodemon | Auto-restart on file changes |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                    │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────────────┐  │
│  │  Pages   │ │Components│ │  Redux    │ │  Services (Axios) │  │
│  │          │ │   (UI)   │ │  Store    │ │   → API Calls     │  │
│  └──────────┘ └──────────┘ └───────────┘ └───────────────────┘  │
│                              ▼                                  │
│                    React Router (Protected Routes)              │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP / REST (JSON)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js + Node.js)                │
│  ┌────────────┐ ┌────────────────┐ ┌────────────────────────┐   │
│  │ Middleware │ │   Controllers  │ │      Routes            │   │
│  │ (Auth,     │ │ (Business      │ │ /api/auth              │   │
│  │  RBAC,     │ │  Logic)        │ │ /api/vehicles          │   │
│  │  Error)    │ │                │ │ /api/dispatches        │   │
│  └────────────┘ └────────────────┘ │ /api/attendance        │   │
│                                    │ /api/payroll           │   │
│  ┌────────────────┐                │ /api/routes            │   │
│  │  Mongoose ODM  │                │ /api/analytics         │   │
│  │  (Models/      │                └────────────────────────┘   │
│  │   Schemas)     │                                             │
│  └───────┬────────┘                                             │
└──────────┼──────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│   MongoDB Database      │
│  ┌───────────────────┐  │
│  │ Users             │  │
│  │ Vehicles          │  │
│  │ DispatchLogs      │  │
│  │ DriverAttendances │  │
│  │ Payrolls          │  │
│  │ RouteMetrics      │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## 7. User Roles & Permissions

| **Feature / Action** | **Fleet Manager** | **Dispatcher** | **Driver** | **Accountant** |
|---|:---:|:---:|:---:|:---:|
| Register accounts | ✅ | ❌ | ❌ | ❌ |
| View staff list | ✅ | ✅ | ❌ | ✅ |
| Update staff status | ✅ | ❌ | ❌ | ❌ |
| Register vehicles | ✅ | ❌ | ❌ | ❌ |
| View all vehicles | ✅ | ✅ | ✅ | ❌ |
| Update vehicle details | ✅ | ✅ | ❌ | ❌ |
| Assign drivers to vehicles | ✅ | ✅ | ❌ | ❌ |
| Delete vehicles | ✅ | ❌ | ❌ | ❌ |
| Create dispatches | ✅ | ✅ | ❌ | ❌ |
| View all dispatches | ✅ | ✅ | Own only | ❌ |
| Update dispatch status | ✅ | ✅ | ✅ | ❌ |
| Report incidents | ✅ | ✅ | ✅ | ❌ |
| Delete dispatches | ✅ | ❌ | ❌ | ❌ |
| Clock in / Clock out | ✅ | ❌ | ✅ | ❌ |
| View all attendance logs | ✅ | ❌ | Own only | ✅ |
| Verify/approve timesheets | ✅ | ❌ | ❌ | ✅ |
| Generate payroll | ✅ | ❌ | ❌ | ✅ |
| View all payroll records | ✅ | ❌ | Own only | ✅ |
| Approve/pay payslips | ✅ | ❌ | ❌ | ✅ |
| Delete payroll drafts | ✅ | ❌ | ❌ | ✅ |
| Create routes | ✅ | ✅ | ❌ | ❌ |
| View all routes | ✅ | ✅ | ✅ | ❌ |
| Update/delete routes | ✅ | ✅ | ❌ | ❌ |
| View analytics dashboard | ✅ | ✅ | ✅ | ✅ |

---

## 8. Agile/Scrum Development Plan

### 8.1 Development Methodology

The project follows the **Agile Scrum** framework with:
- **Sprint Duration:** 2 weeks per sprint
- **Total Sprints:** 7 sprints (14 weeks / 1 semester)
- **Sprint Ceremonies:** Sprint Planning, Daily Standups, Sprint Review, Sprint Retrospective
- **Artifacts:** Product Backlog, Sprint Backlog, Working Increment

### 8.2 Sprint Schedule & Deliverables

---

#### 🟢 Sprint 1 (Weeks 1–2): Project Foundation & Authentication

**Sprint Goal:** Set up the project infrastructure and implement the authentication module so that users can register and log in.

| **Task** | **User Stories** |
|---|---|
| Initialize React + Vite frontend project | — |
| Initialize Express.js backend with MongoDB connection | — |
| Set up project folder structure (MVC pattern) | — |
| Implement User model with password hashing | US-01, US-06 |
| Build registration and login API endpoints | US-01, US-02 |
| Implement JWT token generation & auth middleware | US-02 |
| Build Login and Registration pages (frontend) | US-01, US-02 |
| Set up Redux store with auth slice | US-02 |
| Implement protected routes & navigation layout | US-03 |

**Sprint Deliverable:** Working user registration, login, and authenticated navigation shell.

---

#### 🟢 Sprint 2 (Weeks 3–4): Fleet / Vehicle Management

**Sprint Goal:** Implement the full vehicle management module so that fleet managers can register, view, update, and manage the vehicle fleet.

| **Task** | **User Stories** |
|---|---|
| Create Vehicle model with validations | US-07, US-08 |
| Build Vehicle CRUD API endpoints | US-07, US-09, US-10, US-11, US-14 |
| Implement vehicle status update & driver assignment APIs | US-12, US-13, US-15 |
| Implement RBAC middleware for role-based access | US-07 |
| Build Vehicles page with data table, search, and filters | US-09 |
| Build Vehicle registration/edit modal component | US-07, US-11 |
| Integrate Redux vehicle slice with API | US-09 |
| Build staff directory listing page | US-04, US-05 |

**Sprint Deliverable:** Fully functional fleet management with CRUD operations, filtering, and role-based access.

---

#### 🟢 Sprint 3 (Weeks 5–6): Route Corridor Management

**Sprint Goal:** Implement route management so that dispatchers can define delivery corridors with distance, duration, waypoints, and environmental impact metrics.

| **Task** | **User Stories** |
|---|---|
| Create RouteMetric model with waypoints sub-schema | US-48 |
| Build Route CRUD API endpoints | US-48, US-51, US-52, US-53 |
| Implement auto route code generation | US-49 |
| Implement fuel consumption & carbon footprint calculation | US-50 |
| Build Routes page with data table and filters | US-51 |
| Build Create/Edit Route modal component | US-48, US-52 |
| Integrate Redux route slice with API | US-51 |

**Sprint Deliverable:** Fully functional route management with automatic environmental impact calculations.

---

#### 🟢 Sprint 4 (Weeks 7–8): Dispatch & Shipment Management

**Sprint Goal:** Implement the dispatch module so that dispatchers can create trips, assign resources, and track shipment lifecycle with real-time status updates.

| **Task** | **User Stories** |
|---|---|
| Create DispatchLog model with checkpoint sub-schema | US-16, US-17 |
| Build dispatch CRUD API endpoints | US-16, US-25, US-26, US-27 |
| Implement dispatch status update with checkpoint logging | US-20, US-21 |
| Implement cargo weight validation against vehicle capacity | US-18 |
| Implement auto dispatch number generation | US-17 |
| Build scheduled arrival auto-calculation | US-19 |
| Implement incident reporting API | US-22 |
| Implement automatic vehicle/driver status updates | US-23, US-24 |
| Build Dispatches page with timeline view | US-20, US-21 |
| Build Create Dispatch & Update Status modals | US-16, US-20 |
| Integrate Redux dispatch slice with API | US-25 |

**Sprint Deliverable:** End-to-end dispatch lifecycle management with checkpoint timeline and incident reporting.

---

#### 🟢 Sprint 5 (Weeks 9–10): Driver Attendance & Timesheet Management

**Sprint Goal:** Implement the attendance module so that drivers can clock in/out, and managers can review and verify timesheets.

| **Task** | **User Stories** |
|---|---|
| Create DriverAttendance model with auto-calculations | US-28, US-29, US-31 |
| Build clock-in and clock-out API endpoints | US-28, US-29, US-30 |
| Build attendance listing API with filters | US-34, US-36 |
| Build today's attendance status API | US-33 |
| Build timesheet verification API | US-35 |
| Implement driver status auto-update on clock events | US-32 |
| Build Attendance page with clock-in/out card | US-28, US-29, US-33 |
| Build attendance log table with filters | US-34 |
| Build timesheet verification modal | US-35 |
| Integrate Redux attendance slice with API | US-34 |

**Sprint Deliverable:** Complete digital attendance system with clock-in/out, automatic hour calculations, and manager verification workflow.

---

#### 🟢 Sprint 6 (Weeks 11–12): Payroll Processing

**Sprint Goal:** Implement the payroll module so that accountants can generate payslips from attendance data and process payments.

| **Task** | **User Stories** |
|---|---|
| Create Payroll model with allowances/deductions sub-schemas | US-37, US-40 |
| Build payroll generation API (batch & individual) | US-37, US-38, US-41 |
| Implement allowances and deductions configuration | US-39, US-40 |
| Build payroll listing and detail APIs | US-42, US-43, US-46 |
| Build payroll status update API (approve/pay) | US-44, US-45 |
| Build delete payroll API | US-47 |
| Build Payroll page with payslip table | US-42 |
| Build Generate Payroll modal component | US-37, US-39, US-41 |
| Build detailed Payslip modal with breakdown view | US-43 |
| Integrate Redux payroll slice with API | US-42 |

**Sprint Deliverable:** Fully automated payroll processing pipeline from attendance data to paid payslips.

---

#### 🟢 Sprint 7 (Weeks 13–14): Analytics Dashboard, Polish & Final Demo

**Sprint Goal:** Build the analytics dashboard, integrate Swagger documentation, polish the UI across all modules, fix bugs, and prepare for final demo.

| **Task** | **User Stories** |
|---|---|
| Build analytics aggregation API with KPIs | US-54, US-55, US-56, US-57, US-58, US-59, US-60, US-61 |
| Build Dashboard page with KPI stat cards | US-54, US-57, US-58 |
| Implement interactive charts (vehicle status, type composition, cost trends) | US-55, US-56, US-60 |
| Implement recent dispatches feed | US-61 |
| Build financial summary section | US-59 |
| Set up Swagger API documentation | NFR-10 |
| Implement health check endpoint | — |
| Auto-seed database with realistic demo data | — |
| Cross-browser testing and bug fixes | NFR-08 |
| UI/UX polish, dark mode, and responsive design improvements | NFR-05 |
| Final Sprint Review & Demonstration | — |

**Sprint Deliverable:** Complete system with analytics dashboard, API documentation, and production-ready polish.

---

### 8.3 Sprint Ceremonies Schedule

| **Ceremony** | **When** | **Duration** | **Purpose** |
|---|---|---|---|
| Sprint Planning | Day 1 of each sprint | 1–2 hours | Select user stories from Product Backlog, define Sprint Backlog |
| Daily Standup | Every working day | 15 minutes | Progress updates, blockers, plan for the day |
| Sprint Review | Last day of each sprint | 1 hour | Demo working increment to stakeholders, collect feedback |
| Sprint Retrospective | After Sprint Review | 30–45 minutes | Reflect on process improvements, what went well, what to change |

---

## 9. Product Backlog

The complete Product Backlog consists of **61 user stories** (US-01 through US-61) organized by priority:

### High Priority (Must Have) — 32 Stories
US-01, US-02, US-04, US-06, US-07, US-08, US-09, US-12, US-16, US-17, US-18, US-20, US-21, US-22, US-23, US-26, US-28, US-29, US-30, US-31, US-34, US-35, US-37, US-38, US-40, US-42, US-43, US-44, US-46, US-48, US-51, US-54, US-55, US-57, US-59

### Medium Priority (Should Have) — 22 Stories
US-03, US-05, US-10, US-11, US-13, US-15, US-19, US-24, US-25, US-32, US-33, US-36, US-39, US-41, US-45, US-49, US-50, US-52, US-56, US-58, US-60, US-61

### Low Priority (Could Have) — 7 Stories
US-14, US-27, US-47, US-53

---

## 10. Risk Assessment

| **Risk** | **Impact** | **Probability** | **Mitigation Strategy** |
|---|---|---|---|
| Scope creep due to additional feature requests | High | High | Strictly maintain prioritized Product Backlog; defer new features to later sprints |
| MongoDB connection/configuration issues | Medium | Medium | Use `mongodb-memory-server` for development/testing; maintain `.env.example` with documented configuration |
| Integration challenges between frontend and backend | Medium | Medium | Define API contracts early using Swagger; build and test APIs before frontend integration |
| Team member unavailability | High | Low | Document all code thoroughly; use Git for version control; follow pair programming when possible |
| Payroll calculation accuracy | High | Medium | Write unit tests for payroll computation logic; validate against manual calculations; peer review |
| Security vulnerabilities (auth bypass, injection) | High | Low | Use Helmet for HTTP security; validate all inputs with Mongoose schemas; hash passwords with bcrypt; use parameterized queries |
| Performance degradation with large datasets | Medium | Low | Add database indexes on frequently queried fields (status, driver, date); implement pagination in future sprints |

---

*This document serves as the foundational Software Requirements Specification for the Logistics & Supply Chain Management System. It will be updated iteratively throughout the semester as the project evolves through Agile sprints.*
