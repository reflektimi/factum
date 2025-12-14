import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import StatusBadge from '@/Components/ui/StatusBadge';
import { ArrowLeft, Printer, FileCheck, Edit2 } from 'lucide-react';
import { Quote, Setting, PageProps } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';

interface ShowProps {
    quote: Quote;
}

interface QuoteItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function Show({ quote }: ShowProps) {
    const { settings } = usePage<PageProps & { settings: Setting }>().props;
    const items = (Array.isArray(quote.items) ? quote.items : JSON.parse(quote.items as unknown as string || '[]')) as QuoteItem[];
    const primaryColor = settings?.primary_color || '#0F172A';

    const handleConvert = () => {
        if (confirm('Are you sure you want to convert this quote to an invoice?')) {
            router.post(route('quotes.convert', quote.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('quotes.index')} className="text-slate-500 hover:text-slate-700 print:hidden">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                            Quote {quote.number}
                        </h2>
                        <StatusBadge status={quote.status} className="ml-2" />
                    </div>
                    <div className="flex gap-3 print:hidden">
                         <Link href={route('quotes.edit', quote.id)}>
                            <Button variant="secondary" icon={<Edit2 className="w-4 h-4" />}>
                                Edit
                            </Button>
                        </Link>
                        <Button variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                            Print
                        </Button>
                        {quote.status !== 'converted' && (
                            <Button variant="primary" icon={<FileCheck className="w-4 h-4" />} onClick={handleConvert}>
                                Convert to Invoice
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Quote ${quote.number}`} />

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
                                        <h1 className="text-2xl font-bold text-slate-900" style={{ color: primaryColor }}>QUOTE</h1>
                                    )}
                                    <p className="text-slate-500 mt-1">#{quote.number}</p>
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
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Prepared For</h4>
                                    <p className="font-semibold text-slate-900">{quote.customer?.name}</p>
                                    <p className="text-slate-600 text-sm">{quote.customer?.contact_info?.email}</p>
                                    <p className="text-slate-600 text-sm">{quote.customer?.contact_info?.address}</p>
                                </div>
                                <div className="text-right">
                                    <div className="space-y-2">
                                        <div className="flex justify-between md:justify-end md:gap-8">
                                            <span className="text-slate-500">Date:</span>
                                            <span className="font-medium text-slate-900">{formatDate(quote.date)}</span>
                                        </div>
                                        <div className="flex justify-between md:justify-end md:gap-8">
                                            <span className="text-slate-500">Valid Until:</span>
                                            <span className="font-medium text-slate-900">{formatDate(quote.expiry_date)}</span>
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
                                        <span>{formatCurrency(quote.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-3" style={{ color: primaryColor }}>
                                        <span>Total</span>
                                        <span>{formatCurrency(quote.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notes */}
                            {quote.notes && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h4 className="text-sm font-medium text-slate-900 mb-2" style={{ color: primaryColor }}>Notes</h4>
                                    <p className="text-slate-600 text-sm">{quote.notes}</p>
                                </div>
                            )}

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
