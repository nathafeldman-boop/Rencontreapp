import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <Card className="overflow-hidden border-primary/30">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="size-32 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-28 rounded-full" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}
