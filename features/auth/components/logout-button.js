"use client";

import { useLogoutMutation } from "@/features/auth/hooks/use-logout-mutation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const { logout, isPending } = useLogoutMutation();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={logout}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Log out"}
    </Button>
  );
}
