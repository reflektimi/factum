/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    const safeAmount = Number(amount);
    if (isNaN(safeAmount) || amount === null || amount === undefined) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(0);
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(safeAmount);
};

/**
 * Format date values
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'long') {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(dateObj);
    }
    
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(dateObj);
};

/**
 * Format numbers with commas
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        // Invoice / Payment
        paid: 'bg-green-100 text-green-700 border-green-200',
        completed: 'bg-green-100 text-green-700 border-green-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        overdue: 'bg-red-100 text-red-700 border-red-200',
        
        // Quote / Credit Note
        draft: 'bg-slate-100 text-slate-700 border-slate-200',
        sent: 'bg-blue-100 text-blue-700 border-blue-200',
        accepted: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        converted: 'bg-purple-100 text-purple-700 border-purple-200',
        refunded: 'bg-orange-100 text-orange-700 border-orange-200',

        // Recurring
        active: 'bg-green-100 text-green-700 border-green-200',
        paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        ended: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
};

/**
 * Calculate days until due
 */
export const getDaysUntilDue = (dueDate: string | Date): number => {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Truncate text
 */
export const truncate = (text: string, length: number = 50): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${random}`;
};
