import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/shared/heading';
import { Button } from '@/components/ui/button';
import { ElectionForm } from '@/features/elections/components/election-form';
import type {
    AcademicPeriodOption,
    Election,
} from '@/features/elections/types';
import { edit, index, show } from '@/routes/elections';

export default function EditElection({
    election,
    academicPeriods,
}: {
    election: Election;
    academicPeriods: AcademicPeriodOption[];
}) {
    return (
        <>
            <Head title={`Edit ${election.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex justify-between gap-4">
                    <Heading title="Edit election" description={election.title} />
                    <Button asChild variant="outline">
                        <Link href={show(election.id)}>
                            <ArrowLeft />
                            Back
                        </Link>
                    </Button>
                </div>
                <ElectionForm
                    election={election}
                    academicPeriods={academicPeriods}
                />
            </div>
        </>
    );
}

EditElection.layout = {
    breadcrumbs: [
        { title: 'Elections', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
