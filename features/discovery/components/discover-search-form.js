import { Button } from "@/components/ui/button";
import { DiscoverSearchInput } from "@/features/discovery/components/discover-search-input";
import { cn } from "@/lib/utils";

export function DiscoverSearchForm({
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  isSearching = false,
  className,
}) {
  const isSubmitDisabled = isSearching || !value.trim();

  return (
    <form
      onSubmit={onSubmit}
      className={cn("flex max-w-[640px] flex-col gap-3 sm:flex-row sm:items-start", className)}
    >
      <DiscoverSearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        className="max-w-none flex-1"
      />
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        className="shrink-0 sm:min-w-[108px]"
      >
        {isSearching ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
