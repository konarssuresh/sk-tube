import { cn } from "@/lib/utils";

export function NewBadge({ className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-accent",
        className,
      )}
    >
      New
    </span>
  );
}
