"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logoutUser } from "@/features/auth/api";
import { authKeys } from "@/features/auth/query-keys";

export function useLogoutMutation() {
  const router = useRouter();

  const mutation = useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: logoutUser,
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });

  return {
    logout: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
}
