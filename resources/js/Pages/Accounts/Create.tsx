import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'customer',
        contact_info: {
            email: '',
            phone: '',
            address: ''
        },
        balance: '0'
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('accounts.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('accounts.index')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        Create Account
                    </h2>
                </div>
            }
        >
            <Head title="Create Account" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left Column - 70% */}
                            <div className="col-span-12 lg:col-span-8 space-y-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-base font-semibold">Account Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Account Name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                error={errors.name}
                                                className="rounded-md"
                                                required
                                            />
                                            <Select
                                                label="Account Type"
                                                value={data.type}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('type', e.target.value as 'customer' | 'supplier')}
                                                error={errors.type}
                                                className="rounded-md"
                                                options={[
                                                    { value: 'customer', label: 'Customer' },
                                                    { value: 'supplier', label: 'Supplier' }
                                                ]}
                                            />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-100">
                                            <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    type="email"
                                                    label="Email"
                                                    value={data.contact_info.email}
                                                    onChange={(e) => setData('contact_info', { ...data.contact_info, email: e.target.value })}
                                                    error={errors['contact_info.email']}
                                                    className="rounded-md"
                                                />
                                                <Input
                                                    type="tel"
                                                    label="Phone"
                                                    value={data.contact_info.phone}
                                                    onChange={(e) => setData('contact_info', { ...data.contact_info, phone: e.target.value })}
                                                    error={errors['contact_info.phone']}
                                                    className="rounded-md"
                                                />
                                            </div>
                                            
                                            <Input
                                                label="Address"
                                                value={data.contact_info.address}
                                                onChange={(e) => setData('contact_info', { ...data.contact_info, address: e.target.value })}
                                                error={errors['contact_info.address']}
                                                className="rounded-md"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <Input
                                                type="number"
                                                label="Initial Balance"
                                                value={data.balance}
                                                onChange={(e) => setData('balance', e.target.value)}
                                                error={errors.balance}
                                                step="0.01"
                                                className="rounded-md"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Set an initial starting balance if applicable (e.g., opening balance).
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - 30% - Sticky Actions */}
                            <div className="col-span-12 lg:col-span-4 relative">
                                <div className="lg:sticky lg:top-6 space-y-6">
                                    <Card className="border-t-4 border-t-indigo-500">
                                        <CardHeader className="pb-3 border-b border-gray-100">
                                            <CardTitle className="text-base font-semibold">Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-6">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                loading={processing}
                                                className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                                icon={<Save className="w-5 h-5" />}
                                            >
                                                Create Account
                                            </Button>
                                             <Link href={route('accounts.index')} className="block">
                                                <Button variant="secondary" type="button" className="w-full">
                                                    Cancel
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
