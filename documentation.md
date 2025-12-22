# Factum SaaS - System Reference Manual

## 1. Executive Summary
**Factum** is a comprehensive financial management SaaS platform designed for small to medium businesses. It streamlines invoicing, expense tracking, and financial forecasting using a modern, monolithic architecture (Laravel + React). It features a unique **Financial Intelligence Engine** that automatically detects anomalies and trends in ledger data.

---

## 2. Core Modules & Features

### 💰 Invoicing & Receivables
- **Standard Invoices**: Create, edit, and send professional invoices to clients. Supports multi-currency and tax calculations.
- **Recurring Invoices**: Set up automated billing schedules (Daily, Weekly, Monthly, Yearly). The system automatically generates and emails invoices on the due date.
- **Quotes/Estimates**: Create proposals that can be converted into Invoices with a single click upon acceptance.
- **Credit Notes**: Issue refunds or credit balances to customers, maintaining accurate accounting records.
- **PDF Generation**: Native PDF export for all documents (Invoices, Quotes, Credit Notes).

### 💸 Expenses & Payables
- **Expense Tracking**: Log business expenses with categorization (e.g., Office Supplies, Services).
- **Vendor Management**: Track payments to suppliers and manage vendor profiles.
- **Receipt Attachments**: (Planned) Upload and store digital receipts.

### 👥 CRM (Accounts)
- **Customer Profiles**: Detailed records of clients including billing details, currency preference, and contact info.
- **Supplier Profiles**: Manage vendor details and payment terms.
- **Activity Feed**: Audit trail of all interactions (Invoice Sent, Viewed, Paid) per account.

### 📊 Reports & Analytics
- **Cash Flow Forecast**: Predictive modeling of future cash position based on due invoices and recurring expenses.
- **Financial Reports**: Generate P&L (Profit & Loss), Expense Breakdowns, and Revenue Reports.
- **Dashboard**: Real-time overview of:
    - Total Revenue & Outstanding Invoices.
    - Cash Flow Scenarios (Optimistic, Pessimistic, Realistic).
    - **Financial Insights** (See Section 3).

### ⚙️ Settings & Configuration
- **Tax Configuration**: Define global tax rules (e.g., VAT, GST) and default rates.
- **User Profile**: Manage account details and security settings.
- **Company Settings**: Configure company details, logo, and address for documents.

---

## 3. 🧠 Financial Intelligence Service (AI)

Factum includes a built-in **Financial Intelligence Service** that acts as a virtual CFO. Instead of static reports, it actively scans the ledger for patterns.

**Capabilities:**
1.  **Anomaly Detection**:
    - **Expense Spikes**: Flags months where expenses exceed the norm by >20%.
    - **Unusual Transactions**: Identifies individual transactions that are statistical outliers (>3 std dev).
    - **Duplicate Payments**: Detects potential double-payments to vendors.
2.  **Risk Management**:
    - **Revenue Drop**: Alerts if MRR (Monthly Recurring Revenue) drops by >15%.
    - **Missing Invoices**: Scans sequences (e.g., `INV-001`, `INV-003`) to detect missing or deleted records.
    - **Cash Flow Warning**: Triggers alerts if Outstanding Debt > 2x Monthly Revenue.
3.  **Trend Analysis**:
    - **Burn Rate**: Monitors increasing monthly spend trends.
    - **Margin Erosion**: Alerts if profit margins are shrinking despite revenue growth.

**Automation**:
- This analysis runs **hourly** via the Laravel Scheduler.
- Insights are automatically displayed on the user's Dashboard grid (Top 8 most critical).

---

## 4. Technical Architecture

### Stack
- **Backend**: Laravel 10.x (PHP 8.2+) / Octane (RoadRunner) for high performance.
- **Frontend**: React 18 (TypeScript) via Inertia.js.
- **Database**: PostgreSQL 15+ (Production: Neon).
- **Cache/Queue**: Redis (Production: Upstash).
- **Styling**: Tailwind CSS.

### Key Directories
- `app/Services/FinancialIntelligenceService.php`: Core logic for data analysis.
- `app/Console/Commands/GenerateFinancialInsights.php`: Artisan command for analysis trigger.
- `database/seeders/FinancialInsightSeeder.php`: Generates *real* data patterns (anomalies) for demo purposes.

---

## 5. Deployment & Infrastructure

The application is deployed on **Render** (Web Service + Cron Job).

### Render Configuration (`render.yaml`)
1.  **Web Service (`factum-api`)**:
    - Runs the application using **Laravel Octane** (RoadRunner) for sub-millisecond response times.
    - Command: `php artisan octane:start --server=roadrunner --host=0.0.0.0 --port=10000`.
2.  **Cron Job (`factum-scheduler`)**:
    - Runs `php artisan schedule:run` every minute (`* * * * *`).
    - Ensures the `insights:generate` command runs hourly to refresh dashboard analytics.

### Environment Variables
Production requires the following keys:
- `DB_CONNECTION`: `pgsql`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: Neon Credentials.
- `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_PORT`: Upstash Credentials.
- `OCTANE_SERVER`: `roadrunner`.

---

## 6. Local Development Guide

1.  **Setup**:
    ```bash
    composer install
    npm install
    cp .env.example .env
    php artisan key:generate
    ```
2.  **Database**:
    ```bash
    # Ensure SQLite file exists or Postgres is running
    touch database/database.sqlite
    php artisan migrate:fresh --seed
    ```
    *Note: The seeder plants dynamic anomalies to demonstrate the AI features.*

3.  **Run**:
    ```bash
    npm run dev    # Terminal 1 (Frontend)
    php artisan serve # Terminal 2 (Backend)
    ```

4.  **Run Scheduler Locally**:
    ```bash
    php artisan schedule:work
    ```

---

_Documentation updated automatically by Antigravity._
