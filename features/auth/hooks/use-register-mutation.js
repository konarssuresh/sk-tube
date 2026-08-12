"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { registerUser } from "@/features/auth/api";
import { authKeys } from "@/features/auth/query-keys";

import { applyAuthMutationError } from "./apply-auth-mutation-error";

export function useRegisterMutation() {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationKey: authKeys.register(),
    mutationFn: registerUser,
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
  });

  function submit(data, setError) {
    setFormError("");

    mutation.mutate(data, {
      onError: (error) => {
        setFormError(applyAuthMutationError(error, setError));
      },
    });
  }

  return {
    formError,
    submit,
    isPending: mutation.isPending,
  };
}
