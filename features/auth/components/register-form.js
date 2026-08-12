"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { registerSchema } from "@/features/auth/schemas";
import { FormError } from "@/components/shared/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRegisterMutation } from "@/features/auth/hooks/use-register-mutation";

export function RegisterForm() {
  const { formError, submit, isPending } = useRegisterMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  return (
    <form
      className="space-y-0"
      onSubmit={handleSubmit((data) => submit(data, setError))}
      noValidate
    >
      <div className="mb-[17px] grid gap-2">
        <Label htmlFor="register-name">Your name</Label>
        <Input
          id="register-name"
          type="text"
          autoComplete="name"
          placeholder="Suresh Konar"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-[13px] text-[#ffb1b6]">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="mb-[17px] grid gap-2">
        <Label htmlFor="register-email">Email address</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-[13px] text-[#ffb1b6]">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="mb-[17px] grid gap-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-[13px] text-[#ffb1b6]">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {formError ? <FormError className="mb-4" message={formError} /> : null}

      <div className="mt-[25px] grid gap-3">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting || isPending}
        >
          {isPending ? "Creating account..." : "Create account →"}
        </Button>
      </div>

      <p className="mt-[25px] text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-white">
          Sign in
        </Link>
      </p>
    </form>
  );
}
