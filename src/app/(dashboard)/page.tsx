import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";

export default async function DashboardHome() {
  const session = await auth();
  const name = session?.user?.name || "Trader";

  return (
    <div>
      <PageHeader title={`Welcome back, ${name}!`} description="Your options trading training dashboard" />
    </div>
  );
}
