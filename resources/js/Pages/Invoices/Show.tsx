import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import StatusBadge from '@/Components/ui/StatusBadge';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Invoice, Setting, PageProps } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';

interface ShowProps {
    invoice: Invoice;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function Show({ invoice }: ShowProps) {
    const { settings } = usePage<PageProps>().props;
    
    // Parse items if they are JSON string
    const items = (Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items as unknown as string || '[]')) as InvoiceItem[];

    const primaryColor = settings?.primary_color || '#0F172A';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('invoices.index')} className="text-slate-500 hover:text-slate-700 print:hidden">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                            Invoice {invoice.number}
                        </h2>
                        <StatusBadge status={invoice.status} className="ml-2" />
                    </div>
                    <div className="flex gap-3 print:hidden">
                        <Button variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                            Print
                        </Button>
                        <Button variant="primary" icon={<Download className="w-4 h-4" />}>
                            Download PDF
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Invoice ${invoice.number}`} />

            <div className="py-8 print:py-0">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 print:max-w-none print:px-0">
                    <Card className="print:shadow-none print:border-none">
                        <CardContent className="p-8 space-y-8">
                            {/* Header */}
                            <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                                <div>
                                    {settings?.logo_path ? (
                                        <img src={settings.logo_path} alt="Company Logo" className="h-16 object-contain mb-4" />
                                    ) : (
                                        <h1 className="text-2xl font-bold text-slate-900" style={{ color: primaryColor }}>INVOICE</h1>
                                    )}
                                    <p className="text-slate-500 mt-1">#{invoice.number}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-semibold text-slate-900">{settings?.company_name || 'My Company'}</h3>
                                    {settings?.address && <p className="text-slate-500 text-sm whitespace-pre-line">{settings.address}</p>}
                                    {settings?.email && <p className="text-slate-500 text-sm">{settings.email}</p>}
                                    {settings?.phone && <p className="text-slate-500 text-sm">{settings.phone}</p>}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Bill To</h4>
                                    <p className="font-semibold text-slate-900">{invoice.customer?.name}</p>
                                    <p className="text-slate-600 text-sm">{invoice.customer?.contact_info?.email}</p>
                                    <p className="text-slate-600 text-sm">{invoice.customer?.contact_info?.address}</p>
                                </div>
                                <div className="text-right">
                                    <div className="space-y-2">
                                        <div className="flex justify-between md:justify-end md:gap-8">
                                            <span className="text-slate-500">Invoice Date:</span>
                                            <span className="font-medium text-slate-900">{formatDate(invoice.date)}</span>
                                        </div>
                                        <div className="flex justify-between md:justify-end md:gap-8">
                                            <span className="text-slate-500">Due Date:</span>
                                            <span className="font-medium text-slate-900">{formatDate(invoice.due_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mt-8">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="py-3 font-medium text-slate-500 text-sm" style={{ color: primaryColor }}>Description</th>
                                            <th className="py-3 font-medium text-slate-500 text-sm text-right" style={{ color: primaryColor }}>Quantity</th>
                                            <th className="py-3 font-medium text-slate-500 text-sm text-right" style={{ color: primaryColor }}>Price</th>
                                            <th className="py-3 font-medium text-slate-500 text-sm text-right" style={{ color: primaryColor }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-4 text-slate-900">{item.description}</td>
                                                <td className="py-4 text-slate-600 text-right">{item.quantity}</td>
                                                <td className="py-4 text-slate-600 text-right">{formatCurrency(item.price)}</td>
                                                <td className="py-4 font-medium text-slate-900 text-right">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-slate-100 pt-8 flex justify-end">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(invoice.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Tax (0%)</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-3" style={{ color: primaryColor }}>
                                        <span>Total</span>
                                        <span>{formatCurrency(invoice.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Bank Details */}
                            {settings?.bank_details && (
                                <div className="mt-12 pt-8 border-t border-slate-100 text-sm text-slate-500 text-center whitespace-pre-line">
                                    {settings.bank_details}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
