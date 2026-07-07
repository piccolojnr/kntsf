import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/settings/appearance-tabs';
import Heading from '@/components/shared/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Choose how the dashboard should render on this device."
                />
                <div className="app-panel-muted p-5">
                    <p className="app-kicker">Theme mode</p>
                    <div className="mt-3">
                        <AppearanceTabs />
                    </div>
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
