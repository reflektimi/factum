import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import PageHeader from '@/Components/ui/PageHeader';
import { ArrowLeft, Save, Users, Mail, Phone, MapPin, DollarSign, Building2, Tag, ShieldCheck, Activity } from 'lucide-react';
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
        <AuthenticatedLayout>
            <Head title={`Modify ${account.name} - Administrative Registry`} />

            <PageHeader 
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('accounts.index')}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <span>Modify Profile</span>
                            <span className="text-slate-400 font-mono text-lg font-medium">#{account.id}</span>
                        </div>
                    </div>
                }
                subtitle={`Adjusting administrative parameters for ${account.name} within the central ledger`}
            />

            <div className="mt-8 pb-20">
                <form onSubmit={submit} className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity Foundation</span>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Entity/Client Name"
                                        placeholder="Full legal name of the entity..."
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                        icon={<Users className="w-4 h-4" />}
                                        className="h-10"
                                        required
                                    />
                                    <Select
                                        label="Account Classification"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value as 'customer' | 'supplier')}
                                        error={errors.type}
                                        icon={<Tag className="w-4 h-4 text-slate-400" />}
                                        className="h-10"
                                    >
                                        <option value="customer">Client / Customer</option>
                                        <option value="supplier">Vendor / Supplier</option>
                                    </Select>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-slate-50">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        Communication Channels
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            type="email"
                                            label="Digital Correspondence"
                                            placeholder="primary@entity.com"
                                            value={data.contact_info.email}
                                            onChange={(e) => setData('contact_info', { ...data.contact_info, email: e.target.value })}
                                            error={errors['contact_info.email']}
                                            icon={<Mail className="w-4 h-4" />}
                                            className="h-10"
                                        />
                                        <Input
                                            type="tel"
                                            label="Telephonic Link"
                                            placeholder="+1 (555) 000-0000"
                                            value={data.contact_info.phone}
                                            onChange={(e) => setData('contact_info', { ...data.contact_info, phone: e.target.value })}
                                            error={errors['contact_info.phone']}
                                            icon={<Phone className="w-4 h-4" />}
                                            className="h-10"
                                        />
                                    </div>
                                    
                                    <Input
                                        label="Physical Jurisdiction"
                                        placeholder="Principal place of business..."
                                        value={data.contact_info.address}
                                        onChange={(e) => setData('contact_info', { ...data.contact_info, address: e.target.value })}
                                        error={errors['contact_info.address']}
                                        icon={<MapPin className="w-4 h-4" />}
                                        className="h-10"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <DollarSign className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fiscal Calibration</span>
                            </div>
                            <CardContent className="p-6">
                                <div className="max-w-md">
                                    <Input
                                        type="number"
                                        label="Current Settlement Balance"
                                        placeholder="0.00"
                                        value={data.balance}
                                        onChange={(e) => setData('balance', e.target.value)}
                                        error={errors.balance}
                                        step="0.01"
                                        icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                                        className="h-10"
                                    />
                                    <p className="mt-3 text-[11px] text-slate-400 font-medium leading-relaxed">
                                        Adjust correctly to synchronize with external bank statements or physical ledgers.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <Card className="border-none shadow-premium-soft overflow-hidden bg-white">
                             <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <Activity className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Record Metadata</span>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative ID</span>
                                        <span className="text-sm font-bold text-slate-900 font-mono">ACC-{String(account.id).padStart(5, '0')}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Modified</span>
                                        <span className="text-sm font-medium text-slate-600 italic">Recently updated</span>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400/80" />
                                        Encryption Level: Industrial
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                variant="primary"
                                loading={processing}
                                className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                icon={<Save className="w-4 h-4" />}
                            >
                                Commit Adjustments
                            </Button>
                            <Link href={route('accounts.index')} className="w-full">
                                <Button variant="soft" type="button" className="w-full h-11 text-xs font-bold uppercase tracking-widest">
                                    Revert Changes
                                </Button>
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
