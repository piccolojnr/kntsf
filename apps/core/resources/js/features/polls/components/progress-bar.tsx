export function ProgressBar({ value }: { value: number }) {
    return (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-app-surface-muted">
            <div
                className="h-full rounded-full bg-app-teal dark:bg-app-brass"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}
