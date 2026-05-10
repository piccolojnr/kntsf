import { Head } from '@inertiajs/react';
import {
    CreditCard,
    IdCard,
    ShieldCheck,
    Users,
    Wifi,
} from 'lucide-react';
import Heading from '@/components/shared/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index } from '@/routes/reports';

type ReportGroups = Record<string, Record<string, number>>;

const reportMeta = {
    students: {
        title: 'Students',
        description: 'Account and profile coverage.',
        icon: Users,
    },
    permits: {
        title: 'Permits',
        description: 'Current permit lifecycle totals.',
        icon: IdCard,
    },
    nfc_cards: {
        title: 'NFC Cards',
        description: 'Assigned card lifecycle status.',
        icon: Wifi,
    },
    payments: {
        title: 'Payments',
        description: 'Manual payment status totals.',
        icon: CreditCard,
    },
    verification: {
        title: 'Verification',
        description: 'Manual verification activity.',
        icon: ShieldCheck,
    },
};

export default function ReportsIndex({ reports }: { reports: ReportGroups }) {
    return (
        <>
            <Head title="Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Reports"
                    description="Lightweight operational counts from students, permits, NFC cards, payments, and verification."
                />

                <div className="grid gap-4 xl:grid-cols-2">
                    {Object.entries(reports).map(([key, values]) => {
                        const meta = reportMeta[key as keyof typeof reportMeta];
                        const Icon = meta?.icon ?? ShieldCheck;

                        return (
                            <Card key={key}>
                                <CardHeader className="space-y-3">
                                    <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                                        <Icon className="size-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <CardTitle>
                                            {meta?.title ?? titleCase(key)}
                                        </CardTitle>
                                        <CardDescription>
                                            {meta?.description ??
                                                'Operational report counts.'}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {Object.entries(values).map(
                                            ([label, value]) => (
                                                <div
                                                    key={label}
                                                    className="rounded-md border p-3"
                                                >
                                                    <p className="text-xs text-muted-foreground">
                                                        {titleCase(label)}
                                                    </p>
                                                    <p className="mt-1 text-2xl font-semibold">
                                                        {value}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

function titleCase(value: string) {
    return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: index(),
        },
    ],
};
