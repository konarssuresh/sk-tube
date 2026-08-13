import { cn } from "@/lib/utils";

export function VideoCardSkeleton({ className }) {
  return (
    <article aria-hidden="true" className={cn(className)}>
      <div className="aspect-video animate-shimmer rounded-xl" />
      <div className="space-y-2 pt-2.5">
        <div className="h-4 w-full animate-shimmer rounded-md" />
        <div className="h-4 w-4/5 animate-shimmer rounded-md" />
        <div className="h-3.5 w-2/5 animate-shimmer rounded-md" />
      </div>
    </article>
  );
}
