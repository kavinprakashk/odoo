# TransitOps Demo Script (Role-Specific Workspace Walkthrough)

This script perfectly demonstrates the intelligence, business logic, and strict RBAC compliance of TransitOps. It proves that TransitOps functions as four enterprise-grade workspaces in one.

---

### Step 1: Safety & Compliance (Safety Officer - 1:00)
1. **Login** with `safety@transitops.com` / `password`.
2. Observe the **Driver Compliance & Safety** dashboard:
   - Note the **Compliance Alerts Queue** at the bottom.
   - Note the alert for **Sarah Smith** having an expired licence.
3. Click **Resolve** next to Sarah Smith's alert (or navigate to Drivers and click View on Sarah).
4. Update the **Expiry Date** to a date 2 years in the future, set her status to **Available**, and click **Save Changes**.
5. Return to the dashboard (click Dashboard in sidebar). Observe that the Expired Licences count drops, and Sarah's alert is resolved.
6. Try visiting a forbidden route manually in the browser bar: `/expenses` or `/maintenance`. 
   - Observe that TransitOps redirects you back to the safety dashboard with a clear **Security Alert** banner stating "Access denied to [page] page."

### Step 2: Financial Logging & Intelligence (Financial Analyst - 1:00)
1. **Sign Out** and **Login** with `finance@transitops.com` / `password`.
2. Observe the **Fleet Financial Intelligence** dashboard:
   - Review live calculations for Operational Cost, Fuel Cost, Fleet ROI, and Cost per Kilometre.
   - Note the vehicle cost contribution grid and high-cost maintenance list.
3. Click **Log Expense / Fuel**:
   - Select **Fuel Log**.
   - Select Vehicle `VAN-05`.
   - Fuel Consumed: `12` L.
   - Total Cost: `$18`.
   - Click **Save Record**.
4. Observe that the Operational Cost and Fuel Cost on the dashboard immediately increase.
5. Note that the sidebar contains all routes but they are read-only: try viewing vehicles or drivers. The "Register/Save" buttons are hidden. Try accessing `/trips/new` manually -> Redirected with a Security Alert banner.

### Step 3: Smart Dispatch Operations (Dispatcher - 1:30)
1. **Sign Out** and **Login** with `dispatcher@transitops.com` / `password`.
2. Observe the **Dispatch Command Center** dashboard:
   - Note the counts for Available Vehicles and Dispatch-Ready Drivers.
3. Click **Create Trip & Dispatch**:
   - Source: `Depot B`
   - Destination: `Client site C`
   - Cargo Weight: `450` kg
   - Distance: `60` km
4. Try assigning Vehicle `TRK-11` (which is In Shop). Click **Dispatch Now** -> *Error: Vehicle is In Shop and cannot be assigned.*
5. Change Vehicle to `VAN-05` and select Driver `Alex Johnson`. Click **Dispatch Now**.
6. Note the trip status is now `Dispatched`.
7. Go to **Trips & Dispatch**, click **Manage** on the dispatched trip.
8. Click **Complete Trip**:
   - Fuel Consumed: `10` L
   - Generated Revenue: `$300`
   - Click **Confirm Completion**.
9. The vehicle and driver are automatically returned to `Available` status.

### Step 4: Full Overview (Fleet Manager - 0:30)
1. **Sign Out** and **Login** with `manager@transitops.com` / `password`.
2. Observe the premium **Fleet Health & Analytics** overview. 
3. Observe that the Operational Cost reflects the exact expenses and fuel logs registered by the Finance Analyst and Dispatcher.
4. Click **Export Trips CSV** to show downloadable compliance reporting.

### Step 5: Maintenance Logging & Prevention (Fleet Manager & Dispatcher - 1:00)
1. **While logged in as Fleet Manager**, navigate to **Maintenance** in the sidebar.
2. Click **Log Maintenance**:
   - Assign Vehicle: `VAN-05`
   - Issue: `Routine Oil Change`
   - Service Provider: `QuickFix Auto`
   - Cost: `$120.00`
   - Click **Submit Maintenance**.
3. Go to **Vehicles** in the sidebar, observe that `VAN-05` status has transitioned to `In Shop`.
4. **Sign Out** and **Login** with `dispatcher@transitops.com` / `password`.
5. Go to **Trips & Dispatch**, click **Create Trip & Dispatch**:
   - Select vehicle dropdown; observe that `VAN-05` is no longer available for assignment as it is `In Shop`.
6. **Sign Out** and **Login** with `finance@transitops.com` / `password`.
7. Observe that the **Maintenance Cost** card has increased by `$120.00` and the vehicle contribution grid for `VAN-05` has updated accordingly.

