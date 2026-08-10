import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end",
        className,
      )}
      {...props}
    >
      <div>
        {eyebrow ? (
          <p className="text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h1 className="mt-1 text-[clamp(30px,4vw,43px)] leading-none font-semibold tracking-[-0.05em]">
            {title}
          </h1>
        ) : null}
        {description ? (
          <p className="mt-2 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
    </div>
  );
}
