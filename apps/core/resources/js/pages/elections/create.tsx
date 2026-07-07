import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { ElectionForm } from '@/features/elections/components/election-form';
import type { AcademicPeriodOption } from '@/features/elections/types';
import { create, index } from '@/routes/elections';

export default function CreateElection({
    academicPeriods,
}: {
    academicPeriods: AcademicPeriodOption[];
}) {
    return (
        <>
            <Head title="Create election" />
            <div className="app-page admin-page-reveal flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="app-kicker">Election setup</p>
                        <Heading
                            title="Create election"
                            description="Create the election details first. Positions and candidates are added in the setup workspace after saving."
                        />
                    </div>
                    <Button asChild variant="outline">
                        <Link href={index()}>
                            <ArrowLeft />
                            Back
                        </Link>
                    </Button>
                </div>
                <ElectionForm academicPeriods={academicPeriods} />
            </div>
        </>
    );
}

CreateElection.layout = {
    breadcrumbs: [
        { title: 'Elections', href: index() },
        { title: 'Create', href: create() },
    ],
};
