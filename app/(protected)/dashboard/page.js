import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { PageContainer } from "@/components/shared/page-container";
import { LogoutButton } from "@/features/auth/components/logout-button";

export const metadata = {
  title: "Dashboard — SKTube",
};

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-accent">
            Your library
          </p>
          <h1 className="mt-1 text-[clamp(30px,4vw,43px)] font-bold tracking-[-0.05em]">
            Welcome, {user.name}
          </h1>
          <p className="mt-2 text-muted">
            Your saved channels will appear here in a later phase.
          </p>
        </div>
        <LogoutButton />
      </div>
    </PageContainer>
  );
}
