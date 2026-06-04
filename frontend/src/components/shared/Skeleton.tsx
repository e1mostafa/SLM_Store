import { cn } from '@/lib/utils';

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('skeleton rounded-md', className)} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-full mt-1" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BannerSkeleton() {
  return <Skeleton className="w-full h-64 md:h-96 rounded-lg" />;
}

export function OrderSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="flex gap-3">
        <Skeleton className="h-16 w-16 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
