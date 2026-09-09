import { Form } from '@inertiajs/react';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type ConfirmActionDialogProps = {
    trigger: ReactNode;
    title: string;
    description: ReactNode;
    form: Pick<ComponentProps<typeof Form>, 'action' | 'method'>;
    confirmLabel: string;
    variant?: ComponentProps<typeof Button>['variant'];
    children?: ReactNode;
};

export function ConfirmActionDialog({
    trigger,
    title,
    description,
    form,
    confirmLabel,
    variant = 'destructive',
    children,
}: ConfirmActionDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>

                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ processing }) => (
                        <>
                            {children}

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button variant={variant} disabled={processing}>
                                    {confirmLabel}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
