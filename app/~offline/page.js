import { WifiOff } from "lucide-react";

import { OfflineRetryAction } from "@/components/shared/offline-retry-action";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";

export const metadata = {
  title: "Offline — SKTube",
};

export default function OfflinePage() {
  return (
    <PageContainer className="flex flex-1 flex-col justify-center py-12">
      <EmptyState
        icon={<WifiOff className="size-7" />}
        title="You’re offline"
        description="SKTube needs a connection to load your channels and videos. Check your network, then try again."
        action={<OfflineRetryAction />}
      />
    </PageContainer>
  );
}
