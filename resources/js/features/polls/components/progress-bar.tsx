export function ProgressBar({ value }: { value: number }) {
    return (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}
