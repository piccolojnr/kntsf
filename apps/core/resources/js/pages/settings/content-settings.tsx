import { Form, Head } from '@inertiajs/react';
import { Megaphone, MessageSquare, Save, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import Heading from '@/components/shared/heading';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit, update } from '@/routes/content-settings';

type ContentSettings = {
    allow_public_news: boolean;
    allow_public_events: boolean;
    allow_public_documents: boolean;
    homepage_featured_limit: number;
    enable_comments: boolean;
};

export default function ContentSettingsPage({
    settings,
    can,
}: {
    settings: ContentSettings;
    can: { update: boolean };
}) {
    return (
        <>
            <Head title="Content settings" />

            <div className="space-y-5">
                <Heading
                    variant="small"
                    title="Content settings"
                    description="Control which public content sections are visible and how much recent content appears on the public homepage."
                />

                <Form
                    {...update.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-5"
                >
                    {({ processing, errors, recentlySuccessful }) => (
                        <>
                            <section className="app-panel-muted space-y-4 p-4">
                                <PanelHeader
                                    icon={<Megaphone className="size-4" />}
                                    title="Public sections"
                                    description="These switches control the public website and public API visibility for each content area."
                                />

                                <div className="grid gap-3">
                                    <ToggleRow
                                        id="allow_public_news"
                                        name="allow_public_news"
                                        label="Allow public announcements"
                                        description="Show published public announcements on the public portal."
                                        defaultChecked={
                                            settings.allow_public_news
                                        }
                                        disabled={!can.update}
                                    />
                                    <InputError
                                        message={errors.allow_public_news}
                                    />

                                    <ToggleRow
                                        id="allow_public_events"
                                        name="allow_public_events"
                                        label="Allow public events"
                                        description="Show published public events and calendar entries."
                                        defaultChecked={
                                            settings.allow_public_events
                                        }
                                        disabled={!can.update}
                                    />
                                    <InputError
                                        message={errors.allow_public_events}
                                    />

                                    <ToggleRow
                                        id="allow_public_documents"
                                        name="allow_public_documents"
                                        label="Allow public documents"
                                        description="Show published public documents and downloadable files."
                                        defaultChecked={
                                            settings.allow_public_documents
                                        }
                                        disabled={!can.update}
                                    />
                                    <InputError
                                        message={errors.allow_public_documents}
                                    />
                                </div>
                            </section>

                            <section className="app-panel-muted space-y-4 p-4">
                                <PanelHeader
                                    icon={<Sparkles className="size-4" />}
                                    title="Homepage display"
                                    description="Featured records are shown first, then recent published records fill the remaining slots."
                                />

                                <div className="grid gap-2">
                                    <Label htmlFor="homepage_featured_limit">
                                        Homepage content limit
                                    </Label>
                                    <Input
                                        id="homepage_featured_limit"
                                        name="homepage_featured_limit"
                                        type="number"
                                        min="1"
                                        max="24"
                                        defaultValue={
                                            settings.homepage_featured_limit
                                        }
                                        disabled={!can.update}
                                    />
                                    <InputError
                                        message={
                                            errors.homepage_featured_limit
                                        }
                                    />
                                </div>
                            </section>

                            <section className="app-panel-muted space-y-4 p-4">
                                <PanelHeader
                                    icon={<MessageSquare className="size-4" />}
                                    title="Engagement"
                                    description="Reserved for public discussion features when comments are added."
                                />

                                <ToggleRow
                                    id="enable_comments"
                                    name="enable_comments"
                                    label="Enable comments"
                                    description="Keep this off until public comments are implemented."
                                    defaultChecked={settings.enable_comments}
                                    disabled={!can.update}
                                />
                                <InputError message={errors.enable_comments} />
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
                                        <span className="text-app-green text-sm font-medium">
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
        <div className="flex items-start gap-3">
            <span className="theme-ink-soft grid size-8 place-items-center rounded-full text-app-red">
                {icon}
            </span>
            <div>
                <h2 className="text-base font-black text-app-ink">{title}</h2>
                <p className="app-muted mt-1 text-xs leading-5">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ToggleRow({
    id,
    name,
    label,
    description,
    defaultChecked,
    disabled,
}: {
    id: string;
    name: string;
    label: string;
    description: string;
    defaultChecked: boolean;
    disabled: boolean;
}) {
    return (
        <div className="rounded-[1rem] border border-app-border bg-app-surface p-4">
            <div className="flex items-start gap-3">
                <input type="hidden" name={name} value="0" />
                <Checkbox
                    id={id}
                    name={name}
                    value="1"
                    defaultChecked={defaultChecked}
                    disabled={disabled}
                    className="mt-1"
                />
                <div>
                    <Label htmlFor={id}>{label}</Label>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

ContentSettingsPage.layout = {
    breadcrumbs: [
        {
            title: 'Content settings',
            href: edit(),
        },
    ],
};
