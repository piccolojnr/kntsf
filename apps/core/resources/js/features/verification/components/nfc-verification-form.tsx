import { Form } from '@inertiajs/react';
import { Wifi } from 'lucide-react';
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
import { nfc } from '@/routes/verification';

export function NfcVerificationForm() {
    return (
        <Card className="gap-0 py-0">
            <CardHeader className="py-4">
                <CardTitle>NFC UID</CardTitle>
                <CardDescription>
                    Test NFC verification from the dashboard before mobile support.
                </CardDescription>
            </CardHeader>
            <CardContent className="border-t py-4">
                <Form
                    {...nfc.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="uid">NFC UID</Label>
                                <Input
                                    id="uid"
                                    name="uid"
                                    maxLength={100}
                                    placeholder="04:A1:B2:C3:D4"
                                    required
                                />
                                <InputError message={errors.uid} />
                            </div>

                            <Button disabled={processing}>
                                <Wifi />
                                Verify NFC
                            </Button>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
