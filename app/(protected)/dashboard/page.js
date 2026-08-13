import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { PageContainer } from "@/components/shared/page-container";
import { ChannelDashboard } from "@/features/channels/components/channel-dashboard";

export const metadata = {
  title: "Dashboard — SKTube",
};

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <PageContainer>
      <ChannelDashboard userName={user.name} />
    </PageContainer>
  );
}
