import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/shared/heading';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit, update } from '@/routes/permit-settings';

type PermitSettings = {
    default_amount: number;
    currency: string;
    default_validity_days: number;
    permit_requests_enabled: boolean;
};

export default function PermitSettingsPage({
    settings,
    can,
}: {
    settings: PermitSettings;
    can: { update: boolean };
}) {
    return (
        <>
            <Head title="Permit settings" />

            <div className="space-y-5">
                <Heading
                    variant="small"
                    title="Permit settings"
                    description="Configure default permit values before permit issuance is built."
                />

                <Form
                    {...update.form()}
                    options={{ preserveScroll: true }}
                    className="app-panel-muted space-y-5 p-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="default_amount">
                                    Default amount
                                </Label>
                                <Input
                                    id="default_amount"
                                    name="default_amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={settings.default_amount}
                                    disabled={!can.update}
                                />
                                <InputError message={errors.default_amount} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    name="currency"
                                    maxLength={3}
                                    defaultValue={settings.currency}
                                    disabled={!can.update}
                                />
                                <InputError message={errors.currency} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="default_validity_days">
                                    Default validity days
                                </Label>
                                <Input
                                    id="default_validity_days"
                                    name="default_validity_days"
                                    type="number"
                                    min="1"
                                    max="3650"
                                    defaultValue={
                                        settings.default_validity_days
                                    }
                                    disabled={!can.update}
                                />
                                <InputError
                                    message={errors.default_validity_days}
                                />
                            </div>

                            <div className="rounded-[1rem] border border-app-border bg-app-surface p-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="hidden"
                                        name="permit_requests_enabled"
                                        value="0"
                                    />
                                    <Checkbox
                                        id="permit_requests_enabled"
                                        name="permit_requests_enabled"
                                        value="1"
                                        defaultChecked={
                                            settings.permit_requests_enabled
                                        }
                                        disabled={!can.update}
                                    />
                                    <div>
                                        <Label htmlFor="permit_requests_enabled">
                                            Permit requests enabled
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            This prepares a switch for future
                                            permit request workflows.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <InputError
                                message={errors.permit_requests_enabled}
                            />

                            {can.update && (
                                <Button
                                    disabled={processing}
                                    className="theme-primary-action"
                                >
                                    Save settings
                                </Button>
                            )}
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

PermitSettingsPage.layout = {
    breadcrumbs: [
        {
            title: 'Permit settings',
            href: edit(),
        },
    ],
};
