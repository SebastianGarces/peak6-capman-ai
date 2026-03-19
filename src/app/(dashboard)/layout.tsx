import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { PageTransition } from "@/components/providers/page-transition";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main id="main-content" className="flex-1 overflow-y-auto p-6 lg:p-8">
          <PageTransition>
            <div className="mx-auto max-w-7xl">{children}</div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
