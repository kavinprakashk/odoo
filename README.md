# TransitOps — Intelligent Fleet Command Center

TransitOps is a full-stack, Next.js-powered command center designed for modern logistics operations. It enforces complex business rules natively and provides managers with real-time operational costs, utilisation, and fleet ROI analytics.

## Role-Specific Workspaces & Strict RBAC
TransitOps contains 4 distinct workspaces, sharing a single database and operational truth. Security is strictly enforced server-side.

1. **Fleet Manager** (`manager@transitops.com`)
   - Dashboard: **Fleet Health & Analytics**
   - Full visibility of fleet health, costs, ROI, and maintenance.
   - Permissions: Manage Vehicles, Drivers, Maintenance, view Expenses.

2. **Dispatcher** (`dispatcher@transitops.com`)
   - Dashboard: **Dispatch Command Center**
   - Main KPIs: Available Vehicles, Dispatch-Ready Drivers, Draft/Active Trips, Blockers.
   - Permissions: Create, dispatch, complete, and cancel trips. No vehicle registration, maintenance editing, or financial adjustments allowed.

3. **Safety Officer** (`safety@transitops.com`)
   - Dashboard: **Driver Compliance & Safety**
   - Main KPIs: Valid/Expired Licences, Suspended Drivers, Compliance Alert Queue.
   - Permissions: Manage driver compliance, licences, safety scores, and status. No financial or vehicle registration access allowed.

4. **Financial Analyst** (`finance@transitops.com`)
   - Dashboard: **Fleet Financial Intelligence**
   - Main KPIs: Operational Costs, Fuel, Maintenance, Revenue, ROI, Cost/km.
   - Permissions: Add/view fuel and expense logs, export CSV reports. Read-only view for vehicles, drivers, trips, and maintenance.

**Password** for all demo accounts: `password`

---

## Technologies Used
- Next.js 15 (App Router, Server Actions)
- TypeScript
- Tailwind CSS & Lucide Icons (Dark Mode Default)
- Prisma ORM + SQLite (for local portability)
- CSV Generation API route

## Quick Start (Local Setup)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database** (Creates SQLite DB in `prisma/dev.db`)
   ```bash
   npx prisma db push
   ```

3. **Generate Client & Seed Demo Data**
   ```bash
   npx prisma generate
   npx tsx prisma/seed.ts
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the application.
