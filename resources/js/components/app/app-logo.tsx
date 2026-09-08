import AppLogoIcon from '@/components/app/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-sidebar-border bg-sidebar-primary shadow-sm group-data-[collapsible=icon]:size-8">
                <AppLogoIcon className="size-full object-cover" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm leading-tight font-black">
                    Knutsford SRC
                </span>
                <span className="truncate text-[0.68rem] leading-tight font-semibold tracking-[0.14em] text-sidebar-foreground/55 uppercase">
                    Permit verification
                </span>
            </div>
        </>
    );
}
