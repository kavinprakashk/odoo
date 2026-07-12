# TransitOps Feature Backlog & Strategy Roadmap

This roadmap details high-value features designed to extend the current TransitOps system. These recommendations preserve the integrity of the existing authentication, Prisma schemas, dispatch logic, role structures, and primary routes while maximizing business intelligence and visual demonstration value.

---

## 1. Safe Quick Wins (Under 15 Minutes)
These features require **no database migrations or schema alterations**, introduce zero structural risks, and are immediately displayable in a hackathon presentation.

### A. Cost-per-Kilometre KPI Card
* **Feature Name:** Cost-per-Kilometre KPI Card
* **Business Value:** Provides the Fleet Manager with immediate feedback on the efficiency of the vehicle ledger, showing the exact resource expense rate per unit of distance.
* **User Roles Affected:** Fleet Manager
* **Requires Database/Schema Changes:** No (computed on-the-fly using `operationalCost / totalDistance`).
* **Estimated Implementation Effort:** 5 minutes
* **Risk Level:** Extremely Low
* **Exact Existing Module It Extends:** [page.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/app/%28dashboard%29/page.tsx#L80) (Fleet Manager dashboard view).

### B. High-Risk Driver Compliance Warnings
* **Feature Name:** High-Risk Driver Compliance Warnings
* **Business Value:** Automatically highlights drivers with low safety scores (< 80) or licences expiring in less than 30 days in a distinct red/amber visual warning state on the drivers index list.
* **User Roles Affected:** Safety Officer, Dispatcher
* **Requires Database/Schema Changes:** No
* **Estimated Implementation Effort:** 10 minutes
* **Risk Level:** Low
* **Exact Existing Module It Extends:** [drivers/page.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/app/%28dashboard%29/drivers/page.tsx) (Drivers list table).

### C. Live Sidebar Navigation Metrics Badges
* **Feature Name:** Live Sidebar Navigation Metrics Badges
* **Business Value:** Adds visual counts in the sidebar showing active dispatches, open maintenance tickets, and compliance exceptions, giving users live, contextual information from any page.
* **User Roles Affected:** All Roles
* **Requires Database/Schema Changes:** No
* **Estimated Implementation Effort:** 10 minutes
* **Risk Level:** Low
* **Exact Existing Module It Extends:** [Sidebar.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/components/layout/Sidebar.tsx) (Navigation loop).

### D. "Log Maintenance" Deep-Link from Vehicle Profile
* **Feature Name:** "Log Maintenance" Deep-Link from Vehicle Profile
* **Business Value:** Allows Fleet Managers viewing a specific vehicle's profile page to click a direct button that pre-selects that vehicle on the log maintenance page, reducing clicks.
* **User Roles Affected:** Fleet Manager
* **Requires Database/Schema Changes:** No (transfers state via URL parameter `?vehicleId=xxx`).
* **Estimated Implementation Effort:** 10 minutes
* **Risk Level:** Extremely Low
* **Exact Existing Module It Extends:** `src/app/(dashboard)/vehicles/[id]/page.tsx` and [MaintenanceForm.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/app/%28dashboard%29/maintenance/new/MaintenanceForm.tsx).

### E. Status & Type Filters for Dispatches
* **Feature Name:** Status & Type Filters for Dispatches
* **Business Value:** Allows dispatchers to filter the main dispatches table by trip status (`Draft`, `Dispatched`, `Completed`, `Cancelled`) and cargo weight classes.
* **User Roles Affected:** Dispatcher, Fleet Manager
* **Requires Database/Schema Changes:** No
* **Estimated Implementation Effort:** 15 minutes
* **Risk Level:** Low
* **Exact Existing Module It Extends:** `src/app/(dashboard)/trips/page.tsx` (Trips page list view).

---

## 2. High-Impact Enhancements (30–90 Minutes)
These features involve intermediate complexity, such as minor database schema additions or complex logic extensions.

### A. Integrated SVG Fuel & Cost Analytics Chart
* **Feature Name:** Integrated SVG Fuel & Cost Analytics Chart
* **Business Value:** Offers a visual breakdown of vehicle performance using standard SVG graphics to showcase cost trends per region and vehicle type, dramatically improving visual appeal.
* **User Roles Affected:** Fleet Manager, Financial Analyst
* **Requires Database/Schema Changes:** No
* **Estimated Implementation Effort:** 45 minutes
* **Risk Level:** Low
* **Exact Existing Module It Extends:** [page.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/app/%28dashboard%29/page.tsx) (Analyst & Manager dashboard views).

### B. Trip Proof of Delivery (PoD) Notes
* **Feature Name:** Trip Proof of Delivery (PoD) Notes
* **Business Value:** Extends the trip completion screen to allow dispatchers to type proof-of-delivery notes, receipt logs, or receiver signature details.
* **User Roles Affected:** Dispatcher
* **Requires Database/Schema Changes:** Yes (adds optional `podNotes String?` field to `Trip` model in schema).
* **Estimated Implementation Effort:** 60 minutes
* **Risk Level:** Medium (requires running database migration)
* **Exact Existing Module It Extends:** [TripDetailClient.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/app/%28dashboard%29/trips/%5Bid%5D/TripDetailClient.tsx) and its complete server action.

### C. Driver Compliance Expiry Timeline & Notifications
* **Feature Name:** Driver Compliance Expiry Timeline & Notifications
* **Business Value:** Gives the Safety Officer an interactive timeline showing license expiration calendars, ordering actions from most urgent to least urgent.
* **User Roles Affected:** Safety Officer
* **Requires Database/Schema Changes:** No
* **Estimated Implementation Effort:** 35 minutes
* **Risk Level:** Low
* **Exact Existing Module It Extends:** [page.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/app/%28dashboard%29/page.tsx#L270) (Safety Officer workspace view).

### D. Advanced Financial Ledger Export (CSV/JSON)
* **Feature Name:** Advanced Financial Ledger Export (CSV/JSON)
* **Business Value:** Allows Financial Analysts to export an itemized CSV containing all combined expenses, fuel costs, and maintenance invoices grouped by operating region for accounting systems.
* **User Roles Affected:** Financial Analyst, Fleet Manager
* **Requires Database/Schema Changes:** No
* **Estimated Implementation Effort:** 40 minutes
* **Risk Level:** Low
* **Exact Existing Module It Extends:** `src/app/api/export/route.ts` (Export API handler).

---

## 3. Post-Hackathon Enterprise Features (Roadmap Roadmap)
Strategic features requiring deep integrations, external APIs, or custom workflows.

### A. Automated Route Optimization & Multi-Stop Dispatch
* **Feature Name:** Automated Route Optimization & Multi-Stop Dispatch
* **Business Value:** Uses mapping APIs to auto-sequence stops and allocate the closest available vehicle to minimize fuel costs.
* **User Roles Affected:** Dispatcher
* **Requires Database/Schema Changes:** Yes (Multi-stop stops and coordinates tables).
* **Estimated Implementation Effort:** 4 - 6 days
* **Risk Level:** Medium
* **Exact Existing Module It Extends:** [TripForm.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/app/%28dashboard%29/trips/new/TripForm.tsx) (Trip Dispatch form).

### B. Machine Learning Predictive Maintenance
* **Feature Name:** Machine Learning Predictive Maintenance
* **Business Value:** Analyzes odometer data and historical repair patterns to forecast breakdowns, triggering alerts *before* critical failure occurs.
* **User Roles Affected:** Fleet Manager
* **Requires Database/Schema Changes:** Yes (Telemetry logging parameters).
* **Estimated Implementation Effort:** 2 - 3 weeks
* **Risk Level:** High
* **Exact Existing Module It Extends:** [page.tsx](file:///c:/Users/NexGen%20Tech/Desktop/odoo/src/app/%28dashboard%29/page.tsx) and maintenance list.

---

## Strategic Recommendation

For the next immediate development cycle, **we strongly recommend building the SVG Fuel & Cost Analytics Chart next**. Charts provide the highest visual impact per unit of effort, helping judges instantly comprehend the core business logic of TransitOps. Conversely, **avoid any multi-stop route dispatching or complex telemetry integrations before submission**. These features introduce high risks of database migration failures, rely on external map API keys that may fail during presentations, and offer low comparative incremental score value relative to the effort required to implement them.
