import AppLogoIcon from '@/components/app/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <AppLogoIcon className="size-5 fill-current text-sidebar-primary-foreground" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm leading-tight font-black">
                    Knutsford SRC
                </span>
                <span className="truncate text-[0.68rem] leading-tight font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55">
                    Permit verification
                </span>
            </div>
        </>
    );
}
