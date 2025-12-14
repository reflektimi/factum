import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { formatDate } from '@/utils/format';
import { Plus, FileBarChart } from 'lucide-react';
import { PaginatedData, Report } from '@/types/models';

interface ReportsProps {
    reports: PaginatedData<Report>;
}

export default function Reports({ reports }: ReportsProps) {
    const generateReport = (type: string) => {
        router.post(route('reports.store'), {
            type,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                    Reports
                </h2>
            }
        >
            <Head title="Reports" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Generate Reports Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card hoverable onClick={() => generateReport('income')}>
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="p-4 bg-green-100 rounded-full mb-4">
                                    <FileBarChart className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Income Report</h3>
                                <p className="text-sm text-gray-500 mt-2">Generate detailed income analysis</p>
                            </CardContent>
                        </Card>

                        <Card hoverable onClick={() => generateReport('outstanding')}>
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="p-4 bg-red-100 rounded-full mb-4">
                                    <FileBarChart className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Outstanding Invoices</h3>
                                <p className="text-sm text-gray-500 mt-2">View unpaid and overdue invoices</p>
                            </CardContent>
                        </Card>

                        <Card hoverable onClick={() => generateReport('cash_flow')}>
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="p-4 bg-blue-100 rounded-full mb-4">
                                    <FileBarChart className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Cash Flow</h3>
                                <p className="text-sm text-gray-500 mt-2">Analyze cash inflows and outflows</p>
                            </CardContent>
                        </Card>

                        <Card hoverable onClick={() => generateReport('expenses')}>
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="p-4 bg-purple-100 rounded-full mb-4">
                                    <FileBarChart className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Expense Report</h3>
                                <p className="text-sm text-gray-500 mt-2">Breakdown of expenses by category</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Reports Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Generated Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Generated By
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reports.data.length > 0 ? (
                                            reports.data.map((report) => (
                                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                                                        {report.title}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge variant="default" className="bg-gray-100 text-gray-600">
                                                            {report.type.toUpperCase()}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {formatDate(report.generated_at, 'long')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {report.generated_by_user?.name || 'System'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('reports.show', report.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                                    No reports generated yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
