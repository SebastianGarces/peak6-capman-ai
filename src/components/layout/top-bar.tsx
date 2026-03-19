import { auth } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export async function TopBar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        {/* XP bar placeholder */}
        <div className="h-2 w-32 rounded-full bg-muted" />
        {/* Level badge placeholder */}
        <div className="h-6 w-16 rounded bg-muted" />
        {/* Streak placeholder */}
        <div className="h-6 w-12 rounded bg-muted" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">{user?.name || "User"}</span>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            Logout
          </Button>
        </form>
      </div>
    </header>
  );
}
