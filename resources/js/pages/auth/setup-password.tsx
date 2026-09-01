import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/shared/input-error';
import PasswordInput from '@/components/shared/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/account/setup-password';

type Props = {
    token: string;
    email: string;
};

export default function SetupPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Set password" />

            <Form
                {...store.form(token)}
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                readOnly
                                className="h-11 rounded-md bg-app-surface-muted"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="h-11 rounded-md bg-app-surface"
                                autoFocus
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="h-11 rounded-md bg-app-surface"
                                placeholder="Confirm password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 h-11 w-full rounded-md bg-app-ink px-5 text-sm font-semibold text-app-surface hover:bg-app-red"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Set password
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

SetupPassword.layout = {
    title: 'Set password',
    description: 'Choose a password for your student account',
};
