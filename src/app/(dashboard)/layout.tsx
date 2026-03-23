import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SocketProvider } from "@/components/providers/socket-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const role = user?.role;
  const userId = user?.id as string | undefined;

  return (
    <SocketProvider userId={userId}>
      <div className="flex min-h-dvh">
        <AppSidebar userRole={role} />
        <div className="flex flex-1 flex-col md:pl-[220px]">
          <TopBar />
          <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}
