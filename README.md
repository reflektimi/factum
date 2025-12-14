# Finances SaaS

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![PHP](https://img.shields.io/badge/php-8.2+-purple.svg) ![Laravel](https://img.shields.io/badge/laravel-10.x-red.svg) ![React](https://img.shields.io/badge/react-18.x-cyan.svg) ![Tailwind](https://img.shields.io/badge/tailwind-3.x-38bdf8.svg)

> A comprehensive, modern finance management platform with invoicing, recurring payments, and dashboard analytics.

**Finances SaaS** is a full-stack web application designed to streamline financial operations for small businesses and freelancers. Built with performance and user experience in mind, it offers a seamless interface for managing clients, tracking expenses, generating professional invoices, and monitoring financial health through interactive dashboards.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Application Routes](#application-routes)
- [Contributing](#contributing)
- [License](#license)
- [Roadmap](#roadmap)

## Features

- **🔐 Robust Authentication**: Secure user registration, login, and profile management.
- **📊 Interactive Dashboard**: Real-time overview of income, expenses, and cash flow visualization.
- **🧾 Invoice Management**: Create, edit, and track statuses of professional invoices.
- **🔄 Recurring Billing**: Automate invoicing with flexible recurring intervals (weekly, monthly, yearly).
- **💳 Payment Tracking**: Log partial or full payments against invoices.
- **📝 Quote System**: Generate estimates/quotes and convert them directly to invoices.
- **👥 Client Management**: Store and manage customer and supplier details (CRM).
- **📉 Expense Tracking**: Categorize and monitor business expenses.
- **📨 Credit Notes**: Handle refunds and cancellations efficiently.
- **🔍 Global Search**: Quickly find documents, contacts, or settings from anywhere in the app.
- **🎨 Custom Branding**: Personalized document layouts with logo, color, and footer customization.

## Tech Stack

**Backend**
- **Laravel 10.x**: Robust PHP framework for secure and scalable API delivery.
- **SQLite**: Lightweight, serverless configuration for development (easily swappable for MySQL/PostgreSQL in production).
- **Inertia.js**: The glue connecting the Laravel backend directly to the React frontend.

**Frontend**
- **React 18**: Component-based library for building dynamic user interfaces.
- **Typescript**: For type-safe code and better developer experience.
- **Tailwind CSS**: Utility-first framework for rapid, responsive styling.
- **Lucide React**: Beautiful, consistent icon set.

## Installation

Follow these steps to set up the project locally for development.

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js & NPM

### Setup Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/L0t1/finances-saas.git
    cd finances-saas
    ```

2.  **Install PHP Dependencies**
    ```bash
    composer install
    ```

3.  **Install Node Dependencies**
    ```bash
    npm install
    ```

4.  **Environment Configuration**
    Copy the example env file and configure your settings.
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    *Note: By default, the app is configured for SQLite. Ensure your `DB_CONNECTION` is set to `sqlite` or configure your preferred database.*

5.  **Database Migration & Seeding**
    Create the sqlite file (if using SQLite) and run migrations.
    ```bash
    touch database/database.sqlite
    php artisan migrate --seed
    ```
    *(The `--seed` flag populates the database with test users and dummy data).*

6.  **Run Development Servers**
    Open two terminals:

    *Terminal 1 (Laravel Server)*
    ```bash
    php artisan serve
    ```

    *Terminal 2 (Vite Server)*
    ```bash
    npm run dev
    ```

7.  **Access the App**
    Open your browser and navigate to `http://127.0.0.1:8000`.

## Usage

Once logged in, you can navigate using the sidebar to access distinct modules.

### Dashboard
Get a quick snapshot of your business performance.
![Dashboard Placeholder](public/screenshots/dashboard.png)

### Invoicing
Navigate to **Invoices** -> **New Invoice** to start billing.
1. Select a customer.
2. Add line items.
3. Save as Draft or Mark as Sent.

### Recurring Profiles
Set up automated billing cycles in the **Recurring Invoices** section.

## Application Routes

Since this application operates as a monolithic SPA using **Inertia.js**, most routes render views rather than returning raw JSON. However, these are the primary resource endpoints available:

| Resource | Methods | Description |
| :--- | :--- | :--- |
| `/dashboard` | `GET` | Main analytics overview |
| `/invoices` | `GET`, `POST`, `PUT`, `DELETE` | Invoice management CRUD |
| `/quotes` | `GET`, `POST`, `PUT`, `DELETE` | Quote/Estimate management CRUD |
| `/quotes/{id}/convert` | `POST` | Convert a quote to an invoice |
| `/recurring-invoices` | `GET`, `POST`, `PUT`, `DELETE` | Recurring profile management |
| `/payments` | `GET`, `POST`, `PUT`, `DELETE` | Payment logging and tracking |
| `/credit-notes` | `GET`, `POST`, `PUT`, `DELETE` | Credit note management |
| `/accounts` | `GET`, `POST`, `PUT`, `DELETE` | Customer/Supplier management |
| `/settings` | `GET`, `POST` | App configuration and branding |

## Contributing

Contributions are welcome! If you'd like to improve Finances SaaS, please follow these steps:

1.  **Fork** the repository.
2.  Create a **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'feat: Add AmazingFeature'`).
    *   *Please use Conventional Commits (feat, fix, chore, etc.)*.
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

### Coding Standards
- **PHP**: Follow PSR-12 coding standards.
- **React**: Functional components with Hooks.
- **Styling**: Use utility classes (Tailwind) over custom CSS whenever possible.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Roadmap

- [ ] ⏳ Time Tracking Module
- [ ] 📦 Inventory Management
- [ ] 🌍 Multi-currency Support
- [ ] 📧 SMTP and Email Integration

## Contact

Project Link: [https://github.com/L0t1/finances-saas](https://github.com/L0t1/finances-saas)

---
*Built with ❤️ by L0t1*
