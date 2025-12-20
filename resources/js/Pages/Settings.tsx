import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Card, { CardContent, CardFooter } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Textarea from '@/Components/ui/Textarea';
import PageHeader from '@/Components/ui/PageHeader';
import { Save, Upload, Building2, Palette, Info, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { Setting } from '@/types/models';
import { FormEventHandler, useState, useEffect } from 'react';
import clsx from 'clsx';

interface SettingsProps {
    settings: Setting;
}

export default function Settings({ settings }: SettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: settings.company_name || '',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        bank_details: settings.bank_details || '',
        primary_color: settings.primary_color || '#3b82f6',
        logo: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_path);

    useEffect(() => {
        if (data.logo) {
            const objectUrl = URL.createObjectURL(data.logo);
            setLogoPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [data.logo]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="System Configuration" />

            <PageHeader 
                title="Settings"
                subtitle="Configure company branding, contact details, and platform defaults"
            />

            <div className="max-w-4xl space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Branding Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-bold px-1">
                            <Palette className="w-5 h-5 text-primary-600" />
                            <h3>Branding & Identity</h3>
                        </div>
                        
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Logo Upload */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Corporate Logo
                                            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                        </label>
                                        <div className="flex items-start gap-6">
                                            <div className={clsx(
                                                "w-24 h-24 rounded-2xl border-2 border-slate-100 p-2 bg-slate-50 flex items-center justify-center overflow-hidden transition-all shadow-inner",
                                                logoPreview ? "bg-white border-primary-100" : "bg-slate-50"
                                            )}>
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                                ) : (
                                                    <Building2 className="w-8 h-8 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <label className="flex flex-col items-center justify-center h-24 w-full px-4 py-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group">
                                                    <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-primary-500 group-hover:scale-110 transition-all" />
                                                    <span className="text-xs font-bold text-slate-500 group-hover:text-primary-700 leading-tight text-center">
                                                        {data.logo ? data.logo.name : 'Click to upload PNG or SVG'}
                                                    </span>
                                                    <input 
                                                        type='file' 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                                                    />
                                                </label>
                                                <p className="text-[10px] text-slate-400 font-medium">Recommended: 400x400px, max 2MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Primary Color */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Brand Color
                                            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                        </label>
                                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-6 border border-slate-100 shadow-inner">
                                            <div className="relative group">
                                                <input 
                                                    type="color" 
                                                    value={data.primary_color}
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                    className="h-14 w-14 rounded-xl border-4 border-white shadow-md cursor-pointer appearance-none bg-transparent overflow-hidden"
                                                />
                                                <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-slate-200 group-hover:ring-primary-400 transition-all"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">{data.primary_color}</div>
                                                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                                                    This color will be applied to buttons and invoice highlights.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Company Details Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-bold px-1">
                            <Building2 className="w-5 h-5 text-primary-600" />
                            <h3>Company Information</h3>
                        </div>

                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-6 space-y-6">
                                <Input
                                    label="Official Business Name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    error={errors.company_name}
                                    icon={<Building2 className="w-4 h-4" />}
                                    placeholder="e.g. Acme Financial Services Ltd."
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Corporate Email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        icon={<Mail className="w-4 h-4" />}
                                        placeholder="billing@acme.com"
                                        required
                                    />
                                    <Input
                                        label="Business Phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        error={errors.phone}
                                        icon={<Phone className="w-4 h-4" />}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <Input
                                    label="Registered Office Address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    error={errors.address}
                                    icon={<MapPin className="w-4 h-4" />}
                                    placeholder="123 Finance Plaza, Suite 100, Capital City"
                                />
                                
                                <Textarea
                                    label="Bank Details & Invoice Footer"
                                    value={data.bank_details}
                                    onChange={(e) => setData('bank_details', e.target.value)}
                                    error={errors.bank_details}
                                    placeholder="IBAN: DE12..., SWIFT: ..., VAT ID: ..., Registered at Capital Court..."
                                    className="min-h-[120px]"
                                />
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 p-6 flex justify-end border-t border-slate-100">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    icon={<Save className="w-5 h-5" />}
                                    className="px-8 shadow-lg shadow-primary-100"
                                >
                                    Commit Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </section>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
