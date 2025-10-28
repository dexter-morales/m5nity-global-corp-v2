import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Image, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CompanySetting {
    id: number;
    company_name: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    tax_id?: string;
    logo_path?: string;
    receipt_header?: string;
    receipt_footer?: string;
}

interface Props {
    settings: CompanySetting;
}

export default function CompanySettings({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: settings.company_name,
        address: settings.address || '',
        city: settings.city || '',
        state: settings.state || '',
        zip_code: settings.zip_code || '',
        country: settings.country || '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
        tax_id: settings.tax_id || '',
        logo: null as File | null,
        receipt_header: settings.receipt_header || '',
        receipt_footer: settings.receipt_footer || '',
        _method: 'PUT',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.logo_path ? `/storage/${settings.logo_path}` : null,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/superadmin/settings/company');
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        router.delete('/superadmin/settings/company/logo', {
            onSuccess: () => {
                setLogoPreview(null);
                setData('logo', null);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Superadmin', href: '/superadmin' },
                {
                    title: 'Company Settings',
                    href: '/superadmin/settings/company',
                },
            ]}
        >
            <Head title="Company Settings" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Company Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your company information used in receipts and
                        printables
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Company details displayed on receipts and
                                documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">
                                    Company Name *
                                </Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) =>
                                        setData('company_name', e.target.value)
                                    }
                                    required
                                />
                                {errors.company_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    rows={2}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) =>
                                            setData('city', e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">
                                        State/Province
                                    </Label>
                                    <Input
                                        id="state"
                                        value={data.state}
                                        onChange={(e) =>
                                            setData('state', e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zip_code">ZIP Code</Label>
                                    <Input
                                        id="zip_code"
                                        value={data.zip_code}
                                        onChange={(e) =>
                                            setData('zip_code', e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) =>
                                            setData('country', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={data.website}
                                        onChange={(e) =>
                                            setData('website', e.target.value)
                                        }
                                    />
                                    {errors.website && (
                                        <p className="text-sm text-destructive">
                                            {errors.website}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tax_id">
                                        Tax ID / Business Number
                                    </Label>
                                    <Input
                                        id="tax_id"
                                        value={data.tax_id}
                                        onChange={(e) =>
                                            setData('tax_id', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="h-5 w-5" />
                                Company Logo
                            </CardTitle>
                            <CardDescription>
                                Upload your company logo for receipts and
                                documents (max 2MB)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {logoPreview && (
                                <div className="flex items-center gap-4">
                                    <img
                                        src={logoPreview}
                                        alt="Company Logo"
                                        className="h-24 w-24 rounded border object-contain"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleRemoveLogo}
                                        disabled={processing}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove Logo
                                    </Button>
                                </div>
                            )}
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                            />
                            {errors.logo && (
                                <p className="text-sm text-destructive">
                                    {errors.logo}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Receipt Customization</CardTitle>
                            <CardDescription>
                                Custom text to appear on receipts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="receipt_header">
                                    Receipt Header
                                </Label>
                                <Textarea
                                    id="receipt_header"
                                    value={data.receipt_header}
                                    onChange={(e) =>
                                        setData(
                                            'receipt_header',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                    placeholder="Thank you for your business!"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="receipt_footer">
                                    Receipt Footer
                                </Label>
                                <Textarea
                                    id="receipt_footer"
                                    value={data.receipt_footer}
                                    onChange={(e) =>
                                        setData(
                                            'receipt_footer',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                    placeholder="Please keep this receipt for your records."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
