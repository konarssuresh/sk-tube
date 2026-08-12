import { AuthBrand } from "@/features/auth/components/auth-brand";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata = {
  title: "Create account — SKTube",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      visual={
        <>
          <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-accent">
            A personal library
          </p>
          <h2 className="my-[13px] max-w-[420px] text-[clamp(33px,5vw,61px)] font-bold leading-[0.98] tracking-[-0.06em]">
            One list. Only your channels.
          </h2>
          <p className="max-w-[420px] leading-relaxed text-[#ccc1c8]">
            SKTube starts intentionally: add a channel, browse its newest
            videos, and open what interests you on YouTube.
          </p>
        </>
      }
    >
      <AuthBrand />
      <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-accent">
        Create your library
      </p>
      <h1 className="mb-2 mt-0 text-[clamp(29px,4vw,37px)] font-bold leading-[1.1] tracking-[-0.04em]">
        Start with the channels you love.
      </h1>
      <p className="mb-[31px] leading-relaxed text-muted">
        Create an account first. You can link Google later using the same email
        address.
      </p>
      <RegisterForm />
    </AuthLayout>
  );
}
