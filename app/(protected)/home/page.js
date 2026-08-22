import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { HomePage } from "@/features/feed/components/home-page";
import { PageContainer } from "@/components/shared/page-container";

export default async function HomeRoute() {
  const user = await requireCurrentUser();

  return (
    <PageContainer>
      <HomePage userName={user.name} />
    </PageContainer>
  );
}
