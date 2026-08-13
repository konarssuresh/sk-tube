import { cn } from "@/lib/utils";

export function FieldError({ message, className, ...props }) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn("text-[13px] text-[#ffb1b6]", className)} {...props}>
      {message}
    </p>
  );
}
