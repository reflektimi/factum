import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/Table';
import { Printer, Download, CreditCard } from 'lucide-react';
import type { Invoice, Setting } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function PublicShow() {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<(Invoice & { customer: { name: string; contact_info?: { email?: string; address?: string } } }) | null>(null);
    const [settings, setSettings] = useState<Setting | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/api/invoices/${id}/public`);
                // The backend returns { invoice, settings } thanks to our render logic
                setInvoice(response.data.invoice);
                setSettings(response.data.settings);
            } catch (error) {
                console.error('Failed to fetch public invoice data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading || !invoice) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-500 animate-pulse font-medium">Validating invoice reference...</div>
            </div>
        );
    }

    const items = (Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items as unknown as string || '[]')) as InvoiceItem[];
    const primaryColor = settings?.primary_color || '#3b82f6';

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'unpaid': return 'danger';
            case 'overdue': return 'danger';
            case 'sent': return 'primary';
            case 'draft': return 'secondary';
            default: return 'soft';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <Head title={`Invoice #${invoice.number}`} />

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center sm:px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg">
                            {settings?.company_name?.[0] || 'F'}
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900">{settings?.company_name || 'Finances'}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="soft" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>Print</Button>
                        <Button variant="primary" icon={<Download className="w-4 h-4" />}>PDF</Button>
                    </div>
                </div>

                <Card className="border-none shadow-premium-soft overflow-hidden">
                    <div className="h-2 w-full" style={{ backgroundColor: primaryColor }}></div>
                    <CardContent className="p-0">
                        <div className="p-8 md:p-12 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                <div>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-bold text-slate-900 text-base">{settings?.company_name || 'Financial Services Inc.'}</p>
                                        <p className="text-slate-500 whitespace-pre-line leading-relaxed max-w-xs">{settings?.address}</p>
                                    </div>
                                </div>
                                <div className="text-left md:text-right space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shadow-inner">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No.</span>
                                        <span className="text-lg font-bold text-slate-900 px-2">#{invoice.number}</span>
                                    </div>
                                    <div className="pt-2">
                                        <Badge variant={getStatusVariant(invoice.status)} className="uppercase tracking-[0.2em] text-[10px] py-1.5 px-4 font-black">
                                            {invoice.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 border-y border-slate-50/80">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bill To</h4>
                                    <div className="space-y-2 pl-4 border-l-2 border-primary-100">
                                        <p className="text-xl font-black text-slate-900 leading-tight">{invoice.customer?.name}</p>
                                        <p className="text-sm text-slate-500">{invoice.customer?.contact_info?.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 md:text-right">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Invoice Info</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-slate-900">Issued: {formatDate(invoice.date)}</p>
                                        <p className="text-sm font-bold text-red-600">Due: {formatDate(invoice.due_date)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                                <Table>
                                    <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="py-5 text-slate-900 font-black text-[10px] uppercase tracking-widest pl-6">Description</TableHead>
                                            <TableHead className="py-5 text-slate-900 font-black text-[10px] uppercase tracking-widest" align="right">Qty</TableHead>
                                            <TableHead className="py-5 text-slate-900 font-black text-[10px] uppercase tracking-widest" align="right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-slate-50/30 border-slate-50">
                                                <TableCell className="py-6 pl-6 font-bold text-slate-900">{item.description}</TableCell>
                                                <TableCell className="py-6 text-slate-500 font-bold" align="right">{item.quantity}</TableCell>
                                                <TableCell className="py-6 pr-6 text-slate-900 font-black font-mono text-sm" align="right">{formatCurrency(item.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex flex-col md:flex-row gap-12 justify-between items-end pt-8">
                                <div className="w-full max-w-[280px]">
                                    <Button variant="primary" fullWidth size="lg" icon={<CreditCard className="w-5 h-5" />} className="shadow-lg shadow-primary-200">
                                        Pay Securely Now
                                    </Button>
                                </div>
                                <div className="w-full max-w-sm space-y-4 bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-100/50 text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Amount Due</span>
                                    <span className="text-4xl font-black text-slate-900 font-mono tracking-tighter" style={{ color: primaryColor }}>
                                        {formatCurrency(invoice.total_amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-slate-100/80">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Instructions</h4>
                                <div className="bg-slate-50/80 rounded-3xl p-6 text-[11px] text-slate-500 font-bold whitespace-pre-line leading-relaxed shadow-inner border border-slate-100/50">
                                    {settings?.bank_details || 'Please contact binary-ops for settlement details.'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Secured by Finance-SaaS Architecture</p>
                </div>
            </div>
        </div>
    );
}
