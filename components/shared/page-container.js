import { cn } from "@/lib/utils";

export function PageContainer({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1200px] px-5 py-12 pb-[82px] sm:px-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
