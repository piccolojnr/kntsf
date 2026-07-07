import { Form } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { permitCode } from '@/routes/verification';

export function PermitCodeVerificationForm() {
    return (
        <Card className="app-panel gap-0 overflow-hidden py-0 transition duration-300 hover:-translate-y-0.5">
            <CardHeader className="py-4">
                <CardTitle>Permit code</CardTitle>
                <CardDescription>
                    Check a submitted code without storing it in plaintext.
                </CardDescription>
            </CardHeader>
            <CardContent className="border-t border-app-border py-4">
                <Form
                    {...permitCode.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="permit_code">Permit code</Label>
                                <Input
                                    id="permit_code"
                                    name="permit_code"
                                    maxLength={100}
                                    placeholder="Enter permit code"
                                    required
                                    className="h-11 rounded-xl border-app-border bg-app-surface"
                                />
                                <InputError message={errors.permit_code} />
                            </div>

                            <Button disabled={processing}>
                                <ShieldCheck />
                                Verify code
                            </Button>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
