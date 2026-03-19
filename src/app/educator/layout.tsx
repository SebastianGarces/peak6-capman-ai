import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const educatorNav = [
  { href: "/educator", label: "Overview" },
  { href: "/educator/students", label: "Students" },
  { href: "/educator/interventions", label: "Interventions" },
  { href: "/educator/analytics", label: "Analytics" },
];

export default async function EducatorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (role !== "educator" && role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex h-screen">
      <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-lg font-bold text-amber-500">MTSS Dashboard</span>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {educatorNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </aside>
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
