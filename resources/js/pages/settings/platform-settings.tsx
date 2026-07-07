import { Form, Head } from '@inertiajs/react';
import { CreditCard, Mail, Save, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import Heading from '@/components/shared/heading';
import InputError from '@/components/shared/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit, update } from '@/routes/platform-settings';

type PlatformSettings = {
    paystack: {
        payment_url: string;
        public_key_configured: boolean;
        secret_key_configured: boolean;
        webhook_secret_configured: boolean;
    };
    mail: {
        mailer: string;
        host: string | null;
        port: number | null;
        scheme: string | null;
        username: string | null;
        password_configured: boolean;
        from_address: string;
        from_name: string;
    };
};

export default function PlatformSettingsPage({
    settings,
    can,
}: {
    settings: PlatformSettings;
    can: { update: boolean };
}) {
    return (
        <>
            <Head title="Platform settings" />

            <div className="space-y-5">
                <Heading
                    variant="small"
                    title="Platform settings"
                    description="Manage Paystack checkout and SMTP delivery credentials."
                />

                <Form
                    {...update.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-5"
                >
                    {({ processing, errors, recentlySuccessful }) => (
                        <>
                            <section className="app-panel-muted space-y-5 p-4">
                                <PanelHeader
                                    icon={<CreditCard className="size-4" />}
                                    title="Paystack"
                                    description="Checkout initialization and webhook verification."
                                />

                                <div className="grid gap-4">
                                    <SecretField
                                        id="paystack_public_key"
                                        name="paystack[public_key]"
                                        label="Public key"
                                        configured={
                                            settings.paystack
                                                .public_key_configured
                                        }
                                        error={errors['paystack.public_key']}
                                        disabled={!can.update}
                                    />
                                    <SecretField
                                        id="paystack_secret_key"
                                        name="paystack[secret_key]"
                                        label="Secret key"
                                        configured={
                                            settings.paystack
                                                .secret_key_configured
                                        }
                                        error={errors['paystack.secret_key']}
                                        disabled={!can.update}
                                    />
                                    <SecretField
                                        id="paystack_webhook_secret"
                                        name="paystack[webhook_secret]"
                                        label="Webhook secret"
                                        configured={
                                            settings.paystack
                                                .webhook_secret_configured
                                        }
                                        error={
                                            errors['paystack.webhook_secret']
                                        }
                                        disabled={!can.update}
                                    />
                                    <div className="grid gap-2">
                                        <Label htmlFor="paystack_payment_url">
                                            Payment API URL
                                        </Label>
                                        <Input
                                            id="paystack_payment_url"
                                            name="paystack[payment_url]"
                                            type="url"
                                            defaultValue={
                                                settings.paystack.payment_url
                                            }
                                            disabled={!can.update}
                                        />
                                        <InputError
                                            message={
                                                errors['paystack.payment_url']
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="app-panel-muted space-y-5 p-4">
                                <PanelHeader
                                    icon={<Mail className="size-4" />}
                                    title="SMTP mail"
                                    description="Outbound system notification delivery."
                                />

                                <input
                                    type="hidden"
                                    name="mail[mailer]"
                                    value="smtp"
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="mail_host">
                                            SMTP host
                                        </Label>
                                        <Input
                                            id="mail_host"
                                            name="mail[host]"
                                            defaultValue={
                                                settings.mail.host ?? ''
                                            }
                                            disabled={!can.update}
                                        />
                                        <InputError
                                            message={errors['mail.host']}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="mail_port">
                                            SMTP port
                                        </Label>
                                        <Input
                                            id="mail_port"
                                            name="mail[port]"
                                            type="number"
                                            min="1"
                                            max="65535"
                                            defaultValue={
                                                settings.mail.port ?? ''
                                            }
                                            disabled={!can.update}
                                        />
                                        <InputError
                                            message={errors['mail.port']}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="mail_scheme">
                                            Encryption
                                        </Label>
                                        <select
                                            id="mail_scheme"
                                            name="mail[scheme]"
                                            defaultValue={
                                                settings.mail.scheme ?? ''
                                            }
                                            disabled={!can.update}
                                            className="h-9 rounded-md border border-input bg-input/20 px-3 text-sm transition outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                                        >
                                            <option value="">None</option>
                                            <option value="tls">TLS</option>
                                            <option value="ssl">SSL</option>
                                        </select>
                                        <InputError
                                            message={errors['mail.scheme']}
                                        />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="mail_username">
                                            SMTP username
                                        </Label>
                                        <Input
                                            id="mail_username"
                                            name="mail[username]"
                                            defaultValue={
                                                settings.mail.username ?? ''
                                            }
                                            disabled={!can.update}
                                        />
                                        <InputError
                                            message={errors['mail.username']}
                                        />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <SecretField
                                            id="mail_password"
                                            name="mail[password]"
                                            label="SMTP password"
                                            configured={
                                                settings.mail
                                                    .password_configured
                                            }
                                            error={errors['mail.password']}
                                            disabled={!can.update}
                                        />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="mail_from_address">
                                            From address
                                        </Label>
                                        <Input
                                            id="mail_from_address"
                                            name="mail[from_address]"
                                            type="email"
                                            defaultValue={
                                                settings.mail.from_address
                                            }
                                            disabled={!can.update}
                                        />
                                        <InputError
                                            message={
                                                errors['mail.from_address']
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="mail_from_name">
                                            From name
                                        </Label>
                                        <Input
                                            id="mail_from_name"
                                            name="mail[from_name]"
                                            defaultValue={
                                                settings.mail.from_name
                                            }
                                            disabled={!can.update}
                                        />
                                        <InputError
                                            message={errors['mail.from_name']}
                                        />
                                    </div>
                                </div>
                            </section>

                            {can.update && (
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        disabled={processing}
                                        className="theme-primary-action"
                                    >
                                        <Save className="size-4" />
                                        {processing
                                            ? 'Saving settings'
                                            : 'Save settings'}
                                    </Button>
                                    {recentlySuccessful && (
                                        <span className="text-app-green flex items-center gap-2 text-sm font-medium">
                                            <ShieldCheck className="size-4" />
                                            Settings saved
                                        </span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

function PanelHeader({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <span className="theme-ink-soft grid size-8 place-items-center rounded-full text-app-red">
                        {icon}
                    </span>
                    <h2 className="text-base font-black text-app-ink">
                        {title}
                    </h2>
                </div>
                <p className="app-muted mt-2 text-xs leading-5">
                    {description}
                </p>
            </div>
        </div>
    );
}

function SecretField({
    id,
    name,
    label,
    configured,
    error,
    disabled,
}: {
    id: string;
    name: string;
    label: string;
    configured: boolean;
    error?: string;
    disabled: boolean;
}) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={id}>{label}</Label>
                <Badge variant={configured ? 'secondary' : 'outline'}>
                    {configured ? 'Configured' : 'Not set'}
                </Badge>
            </div>
            <Input
                id={id}
                name={name}
                type="password"
                placeholder="Leave blank to keep current value"
                autoComplete="new-password"
                disabled={disabled}
            />
            <InputError message={error} />
        </div>
    );
}

PlatformSettingsPage.layout = {
    breadcrumbs: [
        {
            title: 'Platform settings',
            href: edit(),
        },
    ],
};
