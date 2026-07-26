# database-analysis
Sales DBS is a role-based sales database management system built with Node.js, Express, and SQL Server. It lets Admin, Sales, and Viewer users manage e-commerce data — Person, Category, Products, Customers, Roles, Staff, Sales, and Invoice — through a single dashboard with search, add, and delete functionality.
# Sales DBS

A role-based sales database management system for an e-commerce business, covering Person, Category, Products, Customers, Roles, Staff, Sales, and Invoice records.

## Features

- Role-based login: **Admin** (full access), **Sales** (limited to Sales/Invoice), **Viewer** (read-only)
- Sidebar navigation across all 8 database tables
- Live dashboard stats (total records, current table, table count)
- Search/filter records in the current table
- Add and delete records through the UI (edit is a placeholder for now)
- Toast notifications for success/error feedback

## Tech Stack

| Layer    | Technology                          |
|----------|--------------------------------------|
| Frontend | HTML, CSS, JavaScript (`index.html`, `style.css`, `script.js`) |
| Backend  | Node.js + Express (`server.js`)     |
| Database | Microsoft SQL Server (`EcommerceApp.sql`) |
| DB Driver| `mssql` with `msnodesqlv8` (Windows Authentication) |

## Project Structure

```
sales-dbs/
├── index.html          # Frontend UI (login screen + dashboard)
├── style.css            # Styling
├── script.js            # Frontend logic, table rendering, API calls
├── server.js             # Express server + all API routes
├── EcommerceApp.sql      # Database schema, stored procedures, sample data
├── package.json          # Node dependencies
└── README.md
```

## Database Schema

`EcommerceApp.sql` creates the `EcommerceApp` database with:

- **Person** — PersonID, Name, Age, Gender, Contact
- **Category** — CategoryID, CategoryName
- **Products** — ProductID, ProductName, CategoryID (FK), Price, Stock, ManufactureDate, WarrantyExpiry
- **Customers** — CustomerID, PersonID (FK)
- **Roles** — RoleID, RoleName, RoleDescription
- **Staff** — StaffID, RoleID (FK), PersonID (FK)
- **Sales** — SaleID, ProductID (FK), CustomerID (FK), StaffID (FK), Quantity, SaleDate, TotalAmount
- **Invoice** — InvoiceID, SaleID (FK), InvoiceDate, PaymentMethod

It also includes stored procedures (`AddPerson`, `AddCategory`, `AddProduct`, etc.) and sample data for testing.

## Setup Instructions

1. **Install SQL Server**
   Make sure SQL Server (e.g. SQL Server Express) is installed and running locally.

2. **Create the database**
   Open SQL Server Management Studio (SSMS), open `EcommerceApp.sql`, and run it. This creates the `EcommerceApp` database, all 8 tables, the stored procedures, and inserts sample data.

3. **Update the server config**
   In `server.js`, change the `server` value inside `dbConfig` to match your own SQL Server instance name:
   ```js
   const dbConfig = {
     server: 'YOUR-PC-NAME\\SQLEXPRESS',
     database: 'EcommerceApp',
     ...
   };
   ```
   You can find your instance name in SSMS's "Connect to Server" dialog.

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   You should see:
   ```
   ✅ Connected to SQL Server
   🚀 Server running on http://localhost:3000
   ```

6. **Open the app**
   Visit `http://localhost:3000` in your browser and pick a role (Admin, Sales, or Viewer) to log in.

## API Reference

Every table follows the same 3 routes:

| Method | Route              | Description                  |
|--------|--------------------|-------------------------------|
| GET    | `/api/TableName`      | Get all rows from a table     |
| POST   | `/api/TableName`      | Add a new row (JSON body)     |
| DELETE | `/api/TableName/:id`  | Delete a row by its ID        |

Example for Products:
- `GET /api/Products`
- `POST /api/Products` with body `{ "ProductID": 4, "ProductName": "Mouse", "CategoryID": 1, "Price": 15.99, "Stock": 30, "ManufactureDate": "2024-05-01", "WarrantyExpiry": "2025-05-01" }`
- `DELETE /api/Products/4`

## Roles & Permissions

| Role   | Read | Create | Update | Delete                          |
|--------|------|--------|--------|----------------------------------|
| Admin  | ✅   | ✅     | ✅ (UI placeholder) | ✅ (any table)     |
| Sales  | ✅   | ✅ (Sales/Invoice only) | ❌ | ✅ (Sales/Invoice only) |
| Viewer | ✅   | ❌     | ❌     | ❌                                |

## Next Steps

- Implement the "Edit" feature (currently a placeholder toast).
- Add real authentication (the current login is role selection only, no password check at the app level).
- Add input validation on both frontend and backend (e.g. required fields, valid dates).
- Enforce role permissions on the backend too, not just in the UI.
