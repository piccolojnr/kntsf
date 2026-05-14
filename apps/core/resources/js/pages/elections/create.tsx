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
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex justify-between gap-4">
                    <Heading
                        title="Create election"
                        description="Create an election and define its positions."
                    />
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
