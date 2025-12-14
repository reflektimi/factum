import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { ArrowLeft, Save } from 'lucide-react';
import { Account } from '@/types/models';

interface EditProps {
    account: Account;
}

export default function Edit({ account }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: account.name,
        type: account.type,
        contact_info: {
            email: account.contact_info?.email || '',
            phone: account.contact_info?.phone || '',
            address: account.contact_info?.address || ''
        },
        balance: account.balance.toString()
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('accounts.update', account.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                        Edit Account: {account.name}
                    </h2>
                    <Link href={route('accounts.index')}>
                        <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
                            Back to Accounts
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${account.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Account Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Account Name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                        required
                                    />
                                    <Select
                                        label="Account Type"
                                        value={data.type}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('type', e.target.value as 'customer' | 'supplier')}
                                        error={errors.type}
                                        options={[
                                            { value: 'customer', label: 'Customer' },
                                            { value: 'supplier', label: 'Supplier' }
                                        ]}
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-medium text-slate-900">Contact Information</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            type="email"
                                            label="Email"
                                            value={data.contact_info.email}
                                            onChange={(e) => setData('contact_info', { ...data.contact_info, email: e.target.value })}
                                            error={errors['contact_info.email']}
                                        />
                                        <Input
                                            type="tel"
                                            label="Phone"
                                            value={data.contact_info.phone}
                                            onChange={(e) => setData('contact_info', { ...data.contact_info, phone: e.target.value })}
                                            error={errors['contact_info.phone']}
                                        />
                                    </div>
                                    
                                    <Input
                                        label="Address"
                                        value={data.contact_info.address}
                                        onChange={(e) => setData('contact_info', { ...data.contact_info, address: e.target.value })}
                                        error={errors['contact_info.address']}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <Input
                                        type="number"
                                        label="Current Balance"
                                        value={data.balance}
                                        onChange={(e) => setData('balance', e.target.value)}
                                        error={errors.balance}
                                        step="0.01"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3 bg-slate-50/50">
                                <Link href={route('accounts.index')}>
                                    <Button variant="secondary" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button variant="primary" loading={processing} icon={<Save className="w-4 h-4"/>}>
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
