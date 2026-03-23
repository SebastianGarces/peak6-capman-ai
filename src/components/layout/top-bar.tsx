import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userStreaks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GamificationBar } from "./gamification-bar";
import { UserMenu } from "./user-menu";

export async function TopBar() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = (session.user as any).id;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-border bg-bg/80 backdrop-blur-md px-6">
      <GamificationBar
        xp={user.xp}
        level={user.level}
        currentStreak={streak?.currentStreak ?? 0}
      />
      <UserMenu name={user.name} email={user.email} />
    </header>
  );
}
