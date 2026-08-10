import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "grid min-h-[340px] place-items-center rounded-[var(--radius-lg)] border border-dashed border-[#393946] bg-linear-to-br from-white/[0.025] to-transparent text-center",
        className,
      )}
      {...props}
    >
      <div className="max-w-[390px] px-9 py-9">
        {icon ? (
          <div
            className="mx-auto mb-5 grid size-[58px] place-items-center rounded-[18px] bg-[#2a1c25] text-[#ff9ea4]"
            aria-hidden="true"
          >
            {icon}
          </div>
        ) : null}
        {title ? (
          <h2 className="text-[23px] leading-tight font-semibold tracking-[-0.03em]">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        ) : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
