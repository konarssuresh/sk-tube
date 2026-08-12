import Link from "next/link";

import { Button } from "@/components/ui/button";

export function GoogleLoginButton() {
  return (
    <>
      <div className="my-[22px] flex items-center gap-[13px] text-xs text-subtle">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or continue with
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/api/auth/google">
          <span aria-hidden="true">G</span>
          Continue with Google
        </Link>
      </Button>
    </>
  );
}
