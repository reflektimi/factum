// Invoice statuses
export const INVOICE_STATUSES = ['pending', 'paid', 'overdue'] as const;
export type InvoiceStatus = typeof INVOICE_STATUSES[number];

// Payment statuses
export const PAYMENT_STATUSES = ['pending', 'completed'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

// Payment methods
export const PAYMENT_METHODS = [
    'Bank Transfer',
    'Credit Card',
    'Debit Card',
    'PayPal',
    'Cash',
    'Check',
] as const;

// Account types
export const ACCOUNT_TYPES = ['customer', 'supplier'] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

// Report types
export const REPORT_TYPES = ['income', 'expenses', 'cash_flow', 'outstanding'] as const;
export type ReportType = typeof REPORT_TYPES[number];

// User roles
export const USER_ROLES = ['admin', 'accountant', 'manager'] as const;
export type UserRole = typeof USER_ROLES[number];

// Currency options
export const CURRENCIES = ['USD', 'EUR', 'GBP'] as const;
export type Currency = typeof CURRENCIES[number];

// Chart colors
export const CHART_COLORS = {
    primary: '#1e3a8a',
    accent: '#22c55e',
    gold: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#a855f7',
    pink: '#ec4899',
};

// Navigation items
export const NAV_ITEMS = [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'Invoices', href: '/invoices', icon: 'FileText' },
    { name: 'Payments', href: '/payments', icon: 'CreditCard' },
    { name: 'Accounts', href: '/accounts', icon: 'Users' },
    { name: 'Reports', href: '/reports', icon: 'BarChart3' },
];

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
    { name: 'Invoices', href: '/admin/invoices', icon: 'FileText' },
    { name: 'Payments', href: '/admin/payments', icon: 'CreditCard' },
    { name: 'Accounts', href: '/admin/accounts', icon: 'Users' },
    { name: 'Reports', href: '/admin/reports', icon: 'BarChart3' },
    { name: 'Users', href: '/admin/users', icon: 'UserCog' },
    { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
];
