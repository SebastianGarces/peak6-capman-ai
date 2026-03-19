import { auth } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { db } from "@/lib/db";
import { users, userStreaks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateLevel, getLevelName } from "@/lib/game/levels";
import { GamificationBar } from "@/components/layout/gamification-bar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export async function TopBar() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  let xp = 0;
  let level = 1;
  let streak = 0;
  let levelName = "Recruit";
  const userName = session?.user?.name || "User";

  if (userId) {
    const [user] = await db
      .select({ xp: users.xp, level: users.level })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user) {
      xp = user.xp;
      level = calculateLevel(xp);
      levelName = getLevelName(level);
    }

    const [streakRow] = await db
      .select({ currentStreak: userStreaks.currentStreak })
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);

    if (streakRow) {
      streak = streakRow.currentStreak;
    }
  }

  const initials = userName.charAt(0).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-card/80 backdrop-blur-sm px-4">
      <GamificationBar xp={xp} level={level} streak={streak} levelName={levelName} />
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/[0.04] transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <Link href="/profile" className="w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <form action={logout} className="w-full">
                <button type="submit" className="w-full text-left">
                  Logout
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
