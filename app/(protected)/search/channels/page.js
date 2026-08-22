import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { PageContainer } from "@/components/shared/page-container";
import { ChannelSearchPage } from "@/features/discovery/components/channel-search-page";

export const metadata = {
  title: "Channel Search — SKTube",
};

export default async function ChannelSearchRoute() {
  await requireCurrentUser();

  return (
    <PageContainer>
      <ChannelSearchPage />
    </PageContainer>
  );
}
