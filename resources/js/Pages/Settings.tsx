import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { Save, Upload } from 'lucide-react';
import { Setting } from '@/types/models';
import { FormEventHandler, useState, useEffect } from 'react';

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
            onSuccess: () => {
                // Determine logic if needed, usually flash message handles it
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                    Settings
                </h2>
            }
        >
            <Head title="Settings" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    <form onSubmit={handleSubmit}>
                        {/* Branding */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Branding & Layout</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                                        <div className="flex items-center gap-4">
                                            {logoPreview ? (
                                                <div className="w-20 h-20 rounded-lg border border-gray-200 p-1 bg-white">
                                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                 <div className="w-20 h-20 rounded-lg border border-gray-200 p-1 bg-gray-50 flex items-center justify-center text-gray-400 text-xs text-center">
                                                    No Logo
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors">
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500">
                                                        {data.logo ? data.logo.name : 'Upload new logo'}
                                                    </span>
                                                    <input 
                                                        type='file' 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={(e) => setData('logo', e.target.files ? e.target.files[0] : null)}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Primary Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="color" 
                                                value={data.primary_color}
                                                onChange={(e) => setData('primary_color', e.target.value)}
                                                className="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <span className="text-gray-600 font-mono">{data.primary_color}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Used for buttons, headers, and highlights on invoices.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Company Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Company Name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    error={errors.company_name}
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        required
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        error={errors.phone}
                                    />
                                </div>

                                <Input
                                    label="Address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    error={errors.address}
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Details / Footer Text</label>
                                    <textarea
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        rows={3}
                                        value={data.bank_details}
                                        onChange={(e) => setData('bank_details', e.target.value)}
                                        placeholder="IBAN: DE12..., Bank Name: ..., Tax ID: ..."
                                    ></textarea>
                                    {errors.bank_details && <p className="mt-1 text-sm text-red-600">{errors.bank_details}</p>}
                                </div>

                            </CardContent>
                            <CardFooter className="flex justify-end border-t pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    icon={<Save className="w-5 h-5" />}
                                >
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
