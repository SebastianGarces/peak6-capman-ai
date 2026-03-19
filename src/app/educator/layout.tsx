import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EducatorNav } from "./educator-nav";

export default async function EducatorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (role !== "educator" && role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex h-screen">
      <aside
        className="flex h-full w-56 flex-col border-r border-[hsl(220,30%,20%)] bg-[hsl(230,45%,9%)]"
      >
        <div className="flex h-14 items-center border-b border-[hsl(220,30%,20%)] px-4">
          <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            MTSS Dashboard
          </span>
        </div>
        <EducatorNav />
      </aside>
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
