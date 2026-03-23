import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EducatorNav } from "./educator-nav";

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "educator" && role !== "admin") redirect("/");

  return (
    <div className="flex min-h-dvh">
      <EducatorNav />
      <main id="main-content" className="flex-1 md:pl-[220px] px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
