import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { PageContainer } from "@/components/shared/page-container";
import { LogoutButton } from "@/features/auth/components/logout-button";

export const metadata = {
  title: "Channel — SKTube",
};

export default async function ChannelPage({ params }) {
  const user = await requireCurrentUser();
  const { channelId } = await params;

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-accent">
            Channel
          </p>
          <h1 className="mt-1 text-[clamp(30px,4vw,43px)] font-bold tracking-[-0.05em]">
            Channel {channelId}
          </h1>
          <p className="mt-2 text-muted">
            Signed in as {user.name}. Video browsing arrives in a later phase.
          </p>
        </div>
        <LogoutButton />
      </div>
    </PageContainer>
  );
}
