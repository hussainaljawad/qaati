export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-header h-28 animate-pulse" />
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-[var(--radius-tile)] bg-paper-2"
            />
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-[var(--radius-card)] bg-paper-2"
          />
        ))}
      </div>
    </div>
  );
}
