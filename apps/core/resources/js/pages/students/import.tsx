import { Form, Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FileUp,
    TriangleAlert,
    UploadCloud,
    Users,
    X,
} from 'lucide-react';
import {   useRef, useState } from 'react';
import type {ChangeEvent, DragEvent} from 'react';
import Heading from '@/components/shared/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { index } from '@/routes/students';
import {
    preview as previewRoute,
    show,
    store,
    template,
} from '@/routes/students/import';

type ImportStudent = {
    student_number: string;
    name: string;
    email: string | null;
    phone: string | null;
    course: string | null;
    level: string | null;
};

type PreviewRow = {
    row: number;
    action: 'create' | 'update';
    match_by: string | null;
    student: ImportStudent;
};

type PreviewPayload = {
    token: string;
    valid: PreviewRow[];
    errors: { row: number; messages: string[] }[];
    summary: {
        total: number;
        valid: number;
        failed: number;
        creates: number;
        updates: number;
    };
};

type ImportResult = {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
} | null;

export default function StudentImportPage({
    preview,
    result,
}: {
    preview?: PreviewPayload;
    result?: ImportResult;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) =>
        setSelectedFile(event.target.files?.[0] ?? null);

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files[0];

        if (!file || !fileInputRef.current) {
            return;
        }

        const transfer = new DataTransfer();
        transfer.items.add(file);
        fileInputRef.current.files = transfer.files;
        setSelectedFile(file);
    };

    const clearFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        setSelectedFile(null);
    };

    return (
        <>
            <Head title="Import students" />

            <div className="app-page flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between md:p-6">
                    <Heading
                        title="Import students"
                        description="Upload a spreadsheet, review row validation, then confirm the student records to create or update."
                    />

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <a href={template.url()}>
                                <Download />
                                Template
                            </a>
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href={index()}>
                                <Users />
                                Directory
                            </Link>
                        </Button>
                    </div>
                </div>

                {result && (
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                        <CheckCircle2 className="size-4" />
                        <AlertTitle>Import completed</AlertTitle>
                        <AlertDescription>
                            Created {result.created}, updated {result.updated},
                            skipped {result.skipped}, failed {result.failed}.
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="app-panel gap-0 overflow-hidden py-0">
                    <CardHeader className="py-4">
                        <CardTitle>Upload spreadsheet</CardTitle>
                        <CardDescription>
                            Drop your completed template below. Every row is
                            checked before anything is imported.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5 border-t border-app-border py-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
                        <Form
                            {...previewRoute.form()}
                            encType="multipart/form-data"
                        >
                            {({ errors, processing }) => (
                                <div className="grid gap-4">
                                    <label
                                        htmlFor="student-import-file"
                                        onDragEnter={(event) => {
                                            event.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragOver={(event) =>
                                            event.preventDefault()
                                        }
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                        className={`flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors focus-within:ring-2 focus-within:ring-ring ${isDragging ? 'border-primary bg-primary/5' : 'border-app-border bg-app-surface-muted hover:border-primary/60 hover:bg-primary/5'}`}
                                    >
                                        <span className="flex size-14 items-center justify-center rounded-lg border border-app-border bg-app-surface text-primary shadow-sm">
                                            {selectedFile ? (
                                                <FileSpreadsheet className="size-7" />
                                            ) : (
                                                <UploadCloud className="size-7" />
                                            )}
                                        </span>
                                        <span className="grid gap-1">
                                            <strong>
                                                {selectedFile?.name ??
                                                    'Drag and drop your spreadsheet here'}
                                            </strong>
                                            <span className="text-sm text-app-muted">
                                                {selectedFile
                                                    ? `${Math.max(1, Math.round(selectedFile.size / 1024))} KB selected`
                                                    : 'or click to browse your files'}
                                            </span>
                                        </span>
                                        <span className="text-xs text-app-muted">
                                            XLSX, XLS, CSV, or TXT. Maximum 5 MB
                                        </span>
                                    </label>
                                    <Input
                                        ref={fileInputRef}
                                        id="student-import-file"
                                        type="file"
                                        name="file"
                                        accept=".xlsx,.xls,.csv,.txt"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                    />
                                    {errors.file && (
                                        <p className="text-sm font-medium text-destructive">
                                            {errors.file}
                                        </p>
                                    )}
                                    <div className="flex gap-2 sm:justify-end">
                                        {selectedFile && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={clearFile}
                                            >
                                                <X /> Remove
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing || !selectedFile
                                            }
                                            className="theme-primary-action"
                                        >
                                            <FileUp />
                                            {processing
                                                ? 'Checking rows...'
                                                : 'Preview spreadsheet'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Form>
                        <div className="grid content-start gap-4 rounded-lg border border-app-border bg-app-surface-muted p-4">
                            <div className="grid gap-1">
                                <p className="font-semibold">
                                    Prepare your file
                                </p>
                                <p className="text-sm text-app-muted">
                                    Start with the template to keep column names
                                    consistent.
                                </p>
                            </div>
                            <ol className="grid gap-2 text-sm text-app-muted">
                                <li>1. Complete the template.</li>
                                <li>2. Keep one student per row.</li>
                                <li>3. Preview, review, and confirm.</li>
                            </ol>
                            <p className="rounded-md border border-app-border bg-app-surface p-3 text-xs leading-5 text-app-muted">
                                Student numbers may be text or whole numbers.
                                Levels accept 100-400 and labels such as "Level
                                400".
                            </p>
                            <Button variant="outline" asChild>
                                <a href={template.url()}>
                                    <Download /> Download template
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {preview && (
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
                        <Card className="app-panel gap-0 overflow-hidden py-0">
                            <CardHeader className="py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle>Preview</CardTitle>
                                        <CardDescription>
                                            Valid rows are ready to import.
                                            Errors must be fixed in the source
                                            file and uploaded again.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">
                                        {preview.summary.valid} valid rows
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="border-t border-app-border p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-app-surface-muted text-left text-xs tracking-[0.1em] text-app-muted uppercase">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Row
                                                </th>
                                                <th className="px-4 py-3">
                                                    Action
                                                </th>
                                                <th className="px-4 py-3">
                                                    Student number
                                                </th>
                                                <th className="px-4 py-3">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3">
                                                    Course
                                                </th>
                                                <th className="px-4 py-3">
                                                    Level
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.valid.map((row) => (
                                                <tr
                                                    key={row.row}
                                                    className="border-t border-app-border"
                                                >
                                                    <td className="px-4 py-3">
                                                        {row.row}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={
                                                                row.action ===
                                                                'create'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {row.action}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold">
                                                        {
                                                            row.student
                                                                .student_number
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {row.student.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {row.student.email}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {row.student.course}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {row.student.level}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid content-start gap-5">
                            <Card className="app-panel py-0">
                                <CardHeader className="py-4">
                                    <CardTitle>Summary</CardTitle>
                                    <CardDescription>
                                        Review before committing records.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3 border-t border-app-border py-4">
                                    <SummaryRow
                                        label="Rows"
                                        value={preview.summary.total}
                                    />
                                    <SummaryRow
                                        label="Creates"
                                        value={preview.summary.creates}
                                    />
                                    <SummaryRow
                                        label="Updates"
                                        value={preview.summary.updates}
                                    />
                                    <SummaryRow
                                        label="Errors"
                                        value={preview.summary.failed}
                                    />

                                    <Form {...store.form()}>
                                        {({ processing }) => (
                                            <>
                                                <input
                                                    type="hidden"
                                                    name="token"
                                                    value={preview.token}
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        preview.summary
                                                            .valid === 0
                                                    }
                                                    className="theme-primary-action mt-2 w-full"
                                                >
                                                    <CheckCircle2 />
                                                    {processing
                                                        ? 'Importing...'
                                                        : 'Confirm import'}
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>

                            {preview.errors.length > 0 && (
                                <Alert variant="destructive">
                                    <TriangleAlert className="size-4" />
                                    <AlertTitle>Rows need attention</AlertTitle>
                                    <AlertDescription>
                                        <div className="mt-3 grid gap-3">
                                            {preview.errors.map((error) => (
                                                <div key={error.row}>
                                                    <p className="font-semibold">
                                                        Row {error.row}
                                                    </p>
                                                    <ul className="list-disc pl-5">
                                                        {error.messages.map(
                                                            (message) => (
                                                                <li
                                                                    key={
                                                                        message
                                                                    }
                                                                >
                                                                    {message}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-md border border-app-border bg-app-surface-muted px-3 py-2">
            <span className="text-sm font-medium text-app-muted">{label}</span>
            <span className="text-lg font-black tabular-nums">{value}</span>
        </div>
    );
}

StudentImportPage.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: index(),
        },
        {
            title: 'Import',
            href: show(),
        },
    ],
};
