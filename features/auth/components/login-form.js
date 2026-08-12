"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginSchema } from "@/features/auth/schemas";
import { FormError } from "@/components/shared/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLoginMutation } from "@/features/auth/hooks/use-login-mutation";

export function LoginForm() {
  const { formError, submit, isPending } = useLoginMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
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
        <Label htmlFor="login-email">Email address</Label>
        <Input
          id="login-email"
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
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-[13px] text-[#ffb1b6]">{errors.password.message}</p>
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
          {isPending ? "Signing in..." : "Sign in →"}
        </Button>
      </div>

      <p className="mt-[25px] text-center text-sm text-muted">
        New to SKTube?{" "}
        <Link href="/register" className="font-bold text-white">
          Create an account
        </Link>
      </p>
    </form>
  );
}
