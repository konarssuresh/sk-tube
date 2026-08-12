import { AuthBrand } from "@/features/auth/components/auth-brand";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign in — SKTube",
};

export default function LoginPage() {
  return (
    <AuthLayout
      visual={
        <>
          <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-accent">
            Your own watchlist
          </p>
          <h2 className="my-[13px] max-w-[420px] text-[clamp(33px,5vw,61px)] font-bold leading-[0.98] tracking-[-0.06em]">
            Keep the creators. Skip the clutter.
          </h2>
          <p className="max-w-[420px] leading-relaxed text-[#ccc1c8]">
            Save the channels you care about and browse their current long-form
            uploads without building another feed.
          </p>
          <div className="mt-[42px] flex gap-[11px]">
            <div className="w-[116px] rounded-[14px] border border-white/10 bg-white/8 p-[10px]">
              <div className="h-14 rounded-lg bg-gradient-to-br from-[#fe9d63] to-[#773f6a]" />
              <span className="mt-[9px] block text-[10px] font-bold">
                Fireship
              </span>
            </div>
            <div className="w-[116px] rounded-[14px] border border-white/10 bg-white/8 p-[10px]">
              <div className="h-14 rounded-lg bg-gradient-to-br from-[#9ed6d7] to-[#225f7b]" />
              <span className="mt-[9px] block text-[10px] font-bold">
                The Primeagen
              </span>
            </div>
            <div className="w-[116px] rounded-[14px] border border-white/10 bg-white/8 p-[10px]">
              <div className="h-14 rounded-lg bg-gradient-to-br from-[#e9d18d] to-[#7a4c45]" />
              <span className="mt-[9px] block text-[10px] font-bold">
                Marques Brownlee
              </span>
            </div>
          </div>
        </>
      }
    >
      <AuthBrand />
      <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-accent">
        Welcome back
      </p>
      <h1 className="mb-2 mt-0 text-[clamp(29px,4vw,37px)] font-bold leading-[1.1] tracking-[-0.04em]">
        Your channels, in one calm place.
      </h1>
      <p className="mb-[31px] leading-relaxed text-muted">
        Sign in to browse the latest long-form uploads from the creators you
        follow.
      </p>
      <LoginForm />
    </AuthLayout>
  );
}
