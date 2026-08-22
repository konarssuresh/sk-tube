import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { PageContainer } from "@/components/shared/page-container";
import { VideoSearchPage } from "@/features/discovery/components/video-search-page";

export const metadata = {
  title: "Video Search — SKTube",
};

export default async function VideoSearchRoute() {
  await requireCurrentUser();

  return (
    <PageContainer>
      <VideoSearchPage />
    </PageContainer>
  );
}
