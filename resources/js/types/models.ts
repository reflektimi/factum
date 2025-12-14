import { InvoiceStatus, PaymentStatus, AccountType, ReportType, UserRole } from '@/utils/constants';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Account {
    id: number;
    name: string;
    type: AccountType;
    contact_info: {
        email?: string;
        phone?: string;
        address?: string;
    } | null;
    balance: number;
    transactions?: any[] | null;
    created_at: string;
    updated_at: string;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Invoice {
    id: number;
    number: string;
    customer_id: number;
    customer?: Account;
    date: string;
    due_date: string;
    items: InvoiceItem[];
    total_amount: number;
    status: InvoiceStatus;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: number;
    invoice_id: number;
    invoice?: Invoice;
    customer_id: number;
    customer?: Account;
    amount: number;
    payment_method: string;
    date: string;
    status: PaymentStatus;
    created_at: string;
    updated_at: string;
}

export interface Report {
    id: number;
    title: string;
    type: ReportType;
    data: any;
    generated_at: string;
    generated_by: number;
    generated_by_user?: User;
    created_at: string;
    updated_at: string;
}

export interface Quote {
    id: number;
    number: string;
    customer_id: number;
    customer?: Account;
    date: string;
    expiry_date: string;
    items: InvoiceItem[];
    total_amount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    merchant: string | null;
    receipt_path: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreditNote {
    id: number;
    number: string;
    customer_id: number;
    customer?: Account;
    invoice_id?: number | null;
    invoice?: Invoice;
    date: string;
    amount: number;
    status: 'draft' | 'sent' | 'refunded';
    items: InvoiceItem[] | string;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface RecurringInvoice {
    id: number;
    profile_name: string;
    customer_id: number;
    customer?: Account;
    interval: 'monthly' | 'quarterly' | 'yearly';
    start_date: string;
    next_run_date: string | null;
    last_run_date: string | null;
    status: 'active' | 'paused' | 'ended';
    items: InvoiceItem[] | string;
    total_amount: number;
    auto_send: boolean;
    created_at: string;
    updated_at: string;
}

export interface Setting {
    id: number;
    company_name: string;
    address: string | null;
    phone: string | null;
    email: string;
    logo_path: string | null;
    primary_color: string | null;
    bank_details: string | null;
    tax_rules: { name: string; rate: number }[] | null;
    currencies: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> {
    auth: {
        user: User;
    };
    settings?: Setting;
    flash?: {
        message?: string;
        success?: string;
        error?: string;
    };
    data?: T;
    [key: string]: unknown;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
