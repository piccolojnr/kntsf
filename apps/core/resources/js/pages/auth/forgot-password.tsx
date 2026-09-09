// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import TextLink from '@/components/shared/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="border-app-green/30 bg-app-green/10 mb-5 rounded-lg border px-4 py-3 text-sm leading-6 text-app-ink">
                    {status}
                </div>
            )}

            <div className="space-y-5">
                <Form {...email.form()} className="space-y-5">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                    className="h-11 rounded-md bg-app-surface"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="flex items-center justify-start">
                                <Button
                                    className="h-11 w-full rounded-md bg-app-ink px-5 text-sm font-semibold text-app-surface hover:bg-app-red"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="rounded-lg border border-app-border bg-app-surface-muted px-4 py-3 text-center text-xs leading-5 text-app-muted">
                    <span>Or, return to</span>
                    <span> </span>
                    <TextLink href={login()}>log in</TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
