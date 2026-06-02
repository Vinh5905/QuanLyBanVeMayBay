# Frontend Implementation Plan: Airline Ticket Booking System

## Project Overview
* **Product:** Airline Ticket Booking Management System.
* **Target Users:** Admin, Staff, Agents, Customers.
* **Goal:** Digitize and automate flight scheduling, ticket booking, baggage management, check-in, and revenue reporting.

## Core Features
* **Role-Based Access Control (RBAC):** Distinct UI/permissions for Admin, Staff, Agent, and User.
* **Flight Management:** Create/edit flight schedules, transit stops, capacities, and base pricing.
* **Search & Booking:** Flight lookup, seat reservation (hold), and direct ticket purchase.
* **Ticket Management:** Lookup, upgrade class, change flights, or cancel tickets with dynamic fee calculations.
* **Baggage Management:** Purchase baggage packages (pre-booked vs. counter), validate weight/item limits.
* **Payment Processing:** Invoice generation, tax calculation, and payment status tracking.
* **Online Check-in:** Seat assignment and boarding pass generation (time-restricted).
* **Reporting:** Monthly/yearly revenue analytics separated by ticket sales and baggage fees.
* **System Settings:** Admin dashboard to dynamically adjust business rules (fees, time limits, capacities).

## User Flows
* **Customer Booking Flow:** Search flights -> Select flight & class -> Enter passenger details -> Add baggage (optional) -> Reserve/Pay -> View E-Ticket.
* **Online Check-in Flow:** Enter ticket code -> Verify payment status -> Assign seat -> Generate printable Boarding Pass.
* **Ticket Modification Flow (Staff/Agent):** Lookup ticket -> Select action (Upgrade/Change/Cancel) -> Calculate fee/refund -> Process payment -> Update status.
* **Flight Scheduling Flow (Admin/Staff):** Input flight details -> Add intermediate stops (max 2) -> Set capacities -> Validate rules -> Publish.

## Pages / Screens
* **Public / Customer Portal:**
    * Homepage / Flight Search
    * Search Results / Flight Selection
    * Booking Wizard (Passenger details & Baggage selection)
    * Checkout / Payment Gateway
    * Booking Confirmation / E-Ticket View
    * Online Check-in (Boarding Pass generator)
    * User Profile & Booking History
* **Staff / Agent Portal:**
    * Dashboard (Quick actions & stats)
    * Flight Schedule Management Table
    * Point of Sale (POS) Ticket Reservation
    * Ticket Management (Lookup, Modify, Cancel)
    * Baggage Counter (Add extra baggage, split oversized items)
    * Invoice / Payment Processing
* **Admin Portal:**
    * User & Role Management
    * Revenue Reports (Monthly/Yearly tables & charts)
    * System Settings (Form to configure dynamic business parameters)

## UI / UX Requirements
* **Print-Optimized Layouts:** CSS `@media print` required for Thermal Receipts (Invoices), E-Tickets, and Boarding Passes.
* **Data Export:** UI buttons to export Revenue Reports to Excel/PDF.
* **Real-time Form Validation:** Instant feedback (e.g., max 15 baggage items, max 32kg/item, invalid dates).
* **Fast Data Entry:** Autofill customer info upon entering ID (CCCD) or Phone Number.
* **Responsive Data:** Forms and pricing tables must adapt dynamically when Admin changes global rules (e.g., new fees, new ticket classes).

## Technical Notes (Frontend-relevant)
* **State Management:** Requires robust state handling for the multi-step booking wizard (Search -> Passenger -> Baggage -> Payment).
* **Date/Time Handling:** Strict enforcement of time windows using precise date math (e.g., Check-in opens 24h and closes 1h before departure; reservations expire if unpaid 1 day before flight).
* **Dynamic Configuration:** Validation limits (e.g., max transit time 20 mins) and pricing multipliers (e.g., Class 1 = 105% base price) MUST be fetched via API, not hardcoded.
* **Conditional UI:** Components, navigation links, and action buttons must be conditionally rendered based on the user's role.
* **Data Visualization:** Charting library needed for Admin monthly and yearly revenue reports.
