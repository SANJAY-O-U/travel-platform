// ============================================================
// SkeletonCard — Loading Placeholder
// ============================================================
export function HotelCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-dark-card border border-dark-border">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-md" />
          <div className="skeleton h-5 w-16 rounded-md" />
          <div className="skeleton h-5 w-12 rounded-md" />
        </div>
        <div className="skeleton h-px w-full" />
        <div className="flex justify-between">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FlightCardSkeleton() {
  return (
    <div className="rounded-2xl bg-dark-card border border-dark-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>
        <div className="skeleton h-7 w-20 rounded-xl" />
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
        <div className="skeleton h-px flex-1" />
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-px flex-1" />
        <div className="space-y-1">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function PackageCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-dark-card border border-dark-border">
      <div className="skeleton h-48" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-7 w-24 rounded-xl" />
          <div className="skeleton h-8 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-dark-card border border-dark-border">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
      <div className="skeleton h-3 w-4/6 rounded" />
    </div>
  );
}

export default HotelCardSkeleton;