# Technical Documentation

## 1. System Architecture

**Finances SaaS** is built using a monolithic architecture that leverages the power of Laravel for the backend and React (via Inertia.js) for the frontend. This approach eliminates the complexity of managing a separate API and frontend application while providing a modern Single Page Application (SPA) experience.

### Core Components
- **Backend Framework**: Laravel 10.x (PHP 8.2)
- **Frontend Library**: React 18
- **Bridge**: Inertia.js (connects Laravel routing/controllers to React views)
- **Database**: PostgreSQL (Production/Neon), SQLite (Local)
- **Cache/Queue**: Redis (Upstash)
- **Styling**: Tailwind CSS

### Directory Structure
- **`app/Models`**: Eloquent models representing database tables (`Invoice`, `Payment`, `Account`, etc.).
- **`app/Http/Controllers`**: Handles business logic and returns Inertia responses.
- **`resources/js/Pages`**: React components representing full pages (routed via Laravel).
- **`resources/js/Components`**: Reusable UI components (Buttons, Cards, Inputs).
- **`routes/web.php`**: Defines all application routes.

---

## 2. Database Schema

The application uses a relational database structure. Key relationships include:

- **Users**: Admin and staff access.
- **Accounts**: Customers and Suppliers.
    - Has many `Invoices`, `Quotes`, `CreditNotes`.
- **Invoices**:
    - Belongs to `Account` (Customer).
    - Has many `LineItems`.
    - Has many `Payments`.
- **RecurringInvoices**:
    - Stores templates for generating invoices automatically.
- **Expenses**:
    - Tracks outgoing modifications.
- **ActivityLogs**:
    - Polymorphic relationship tracking actions on all models.

---

## 3. Key Services

### Authentication
Uses standard Laravel cookie-based session authentication. Inertia shares the authenticated user state via the `HandleInertiaRequests` middleware.

### PDF Generation
Invoices and Quotes can be exported to PDF. This is handled by a dedicated controller action that generates a Blade view and converts it to PDF.

### Activity Logging
A custom `LogsActivity` trait allows any model to track `created`, `updated`, `deleted`, and `viewed` events. This data is displayed in the "Activity Feed" on detail pages.

---

## 4. Deployment Architecture

### **Database (Neon)**
- A serverless PostgreSQL instance.
- **Connection**: `pgsql` driver in Laravel.
- **Configuration**: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

### **Cache & Queue (Upstash)**
- A serverless Redis instance.
- **Connection**: `predis` or `phpredis`.
- **Configuration**: `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_PORT`.

### **Application Server (Render)**
- Hosts the Laravel application (Nginx + PHP-FPM).
- Runs `php artisan serve` is NOT for production. Use Nginx/Apache.
- **Build Command**: `composer install --no-dev && npm install && npm run build`
- **Start Command**: `php artisan migrate --force && php-fpm` (custom script recommended).

### **Frontend Assets**
- Compiled by Vite.
- In production, `npm run build` generates static assets in `public/build`.
- These are served by Laravel's `asset()` helper.

---

## 5. Security Measures

- **CSRF Protection**: Standard Laravel double-submit cookie pattern (handled automatically by Axios/Inertia).
- **Authorization**: Laravel Policies (`InvoicePolicy`, etc.) ensure users can only access authorized data.
- **Validation**: Strict server-side validation using Form Requests.
- **Sanitization**: Inputs are sanitized to prevent XSS (escaped by React by default).
